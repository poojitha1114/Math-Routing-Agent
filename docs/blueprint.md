# **App Name**: MathMind AI

## Core Features:

- Question Routing & Guardrails: Route user questions. Employ input guardrails (e.g., Profanity check, PII Redaction) via an AI Gateway to ensure privacy and appropriateness, and output guardrails (e.g., response relevance, hallucination check) to ensure accuracy and safety before interacting with the core system.
- Knowledge Base Retrieval: Search a vector database of math problems and solutions; retrieve step-by-step solutions for known questions. We will use Qdrant to build the vectorDB. Dataset of math problems will be extracted from existing course material. Includes tool for assessing relevancy of matches.
- Web Search & MCP Integration: If no solution exists in the knowledge base, initiate a web search to find solutions and related educational resources. Use the Model Context Protocol (MCP) to format search queries and process responses, extracting only validated step-by-step mathematical solutions. This serves as a tool for detecting the quality of information and prevents the usage of irrelevant and incorrect responses.
- Step-by-Step Solution Display: Display the solution in a clear, step-by-step format that's easy to understand, breaking down complex equations into smaller, digestible parts.
- Human-in-the-Loop Feedback: Implement a feedback mechanism for users to rate the usefulness and accuracy of solutions, so the responses can be refined accordingly. Gather explicit user feedback and use it to refine the RAG's responses and/or re-route future similar queries, based on aggregate user preferences.
- Solution Feedback Refinement: Analyze user feedback, and automatically refine the solution if required by re-phrasing specific sections, or even completely regenerate it, guided by the given input.
- JEE Benchmark (Bonus): Benchmark system performance against the JEE (Joint Entrance Examination) dataset, providing a detailed analysis of the agent's accuracy and efficiency in solving JEE-level math problems.

## Style Guidelines:

- Primary color: Deep Blue (#3F51B5) to convey intelligence and trustworthiness.
- Background color: Light Grey (#F0F2F5), almost white, to ensure readability and reduce eye strain during prolonged study.
- Accent color: Vibrant Orange (#FF9800) to highlight key steps and interactive elements.
- Body font: 'PT Sans', sans-serif, to make for pleasant and accessible reading.
- Headline font: 'Space Grotesk', sans-serif, to create a modern and scientific feel; it provides great contrast with the body text, if set at larger sizes and heavier weights.
- Use clean, minimalist icons to represent different mathematical topics and functionalities.
- Implement a clear, linear layout to guide users through the problem-solving process, with clearly defined sections for the question, solution steps, and feedback options.