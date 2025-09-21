'use server';
import {getFirestore} from 'firebase-admin/firestore';
import {refineSolutionBasedOnFeedback} from '@/ai/flows/refine-solution-based-on-feedback';
import {
  summarizeWebSearchResults,
  SummarizeWebSearchResultsOutput,
} from '@/ai/flows/summarize-web-search-results';
import {initFirebase} from '@/lib/firebase-admin';

// In-memory store for rate limiting.
// In a production environment, use a distributed cache like Redis.
const requestCounts: Record<string, number[]> = {};
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

async function webSearch(
  query: string
): Promise<{url: string; text: string; chunk_id: string}[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn(
      '[Web Search] TAVILY_API_KEY is not set. Returning empty search results.'
    );
    return [];
  }

  try {
    console.log(`[Web Search] Performing search for: "${query}"`);
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `step-by-step solution for ${query}`,
        search_depth: 'basic',
        include_answer: false,
        max_results: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tavily API request failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Adapt the Tavily response to our expected MCP format
    return data.results.map(
      (
        result: {url: string; content: string},
        index: number
      ): {url: string; text: string; chunk_id: string} => ({
        url: result.url,
        text: result.content,
        chunk_id: `web-${index + 1}`,
      })
    );
  } catch (error) {
    console.error('[Web Search] Failed to fetch search results:', error);
    return [];
  }
}

export async function getInitialSolution(
  question: string
): Promise<{solution?: string; error?: string; isMathQuestion?: boolean}> {
  if (!question) {
    return {error: 'Please enter a question.'};
  }

  // Basic rate limiting (per IP - requires header access not available here, so using a fixed key)
  const userIdentifier = 'global'; // In a real app, use IP address or user ID
  const now = Date.now();
  const userRequests = (requestCounts[userIdentifier] || []).filter(
    timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS
  );

  if (userRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      error:
        'You have made too many requests. Please wait a moment and try again.',
      isMathQuestion: false,
    };
  }
  requestCounts[userIdentifier] = [...userRequests, now];

  try {
    const searchResults = await webSearch(question);

    const {
      stepByStepSolution,
      isMathQuestion,
      route_decision,
      kb_hit_ids,
      isVerified,
      confidence,
      provenance,
    }: SummarizeWebSearchResultsOutput = await summarizeWebSearchResults({
      query: question,
      searchResults: searchResults,
    });

    let result = stepByStepSolution;
    if (isMathQuestion) {
      result += `\n\n---\nRoute: ${route_decision} | Verified: ${
        isVerified ? '✅' : '❌'
      } | Confidence: ${confidence?.toFixed(2) ?? 'N/A'}`;
      if (route_decision === 'kb' && kb_hit_ids) {
        result += ` | KB Hits: ${kb_hit_ids.join(', ')}`;
      }
    }

    console.log(
      `[Result] Routing decision: ${route_decision}`,
      kb_hit_ids && kb_hit_ids.length > 0
        ? `KB Hits: ${kb_hit_ids.join(', ')}`
        : ''
    );
    return {solution: result, isMathQuestion};
  } catch (e) {
    console.error(e);
    return {error: 'Failed to generate a solution. Please try again.'};
  }
}

export async function getRefinedSolution(
  question: string,
  originalSolution: string,
  feedback: string
): Promise<{solution?: string; error?: string}> {
  if (!feedback) {
    return {error: 'Please provide some feedback.'};
  }

  try {
    const {refinedSolution} = await refineSolutionBasedOnFeedback({
      question,
      originalSolution,
      feedback,
    });
    return {solution: refinedSolution};
  } catch (e) {
    console.error(e);
    return {error: 'Failed to refine the solution. Please try again.'};
  }
}

export async function saveFeedback(
  question: string,
  solution: string,
  rating: 'good' | 'bad',
  feedbackText: string | null
): Promise<{success: boolean; error?: string}> {
  const feedbackData = {
    question,
    solution,
    rating,
    feedbackText,
    timestamp: new Date().toISOString(),
  };

  console.log(
    '[Feedback] Received feedback:',
    JSON.stringify(feedbackData, null, 2)
  );

  try {
    // To save to Firestore, you would uncomment the following lines:
    /*
    const app = initFirebase();
    const db = getFirestore(app);
    const feedbackCollection = db.collection('feedback');
    await feedbackCollection.add(feedbackData);
    console.log('[Feedback] Feedback successfully saved to Firestore.');
    */

    // This would then trigger a cloud function or batch process to aggregate feedback.
    // That process would look for highly-rated corrections, verify them,
    // and then update the Knowledge Base (e.g., your VectorDB and kb.json).

    return {success: true};
  } catch (error) {
    console.error('[Feedback] Failed to save feedback:', error);
    return {
      success: false,
      error: 'An error occurred while saving your feedback.',
    };
  }
}
