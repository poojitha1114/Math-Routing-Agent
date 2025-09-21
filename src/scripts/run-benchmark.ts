/**
 * @fileOverview A script to benchmark the MathMind AI agent against a dataset.
 *
 * To run this script:
 * 1. Ensure the dev servers are running (`npm run dev` and `npm run genkit:dev`).
 * 2. Execute the script from your terminal: `npm run benchmark`
 *
 * This script will:
 * - Load a dataset of questions from `jee-advanced-sample.json`.
 * - Send each question to the `getInitialSolution` endpoint.
 * - (Placeholder) Verify the correctness of the answer.
 * - Log the results and save them to `benchmark-results.json`.
 */

import fs from 'fs/promises';
import path from 'path';

// This is a placeholder for the actual endpoint.
// In a real scenario, you might call your Next.js app's endpoint.
// For simplicity, we'll import and call the server action directly.
import { getInitialSolution } from '../app/actions';
import { verifyMath } from '../ai/tools/math-verifier';

const DATASET_PATH = path.join(__dirname, 'jee-advanced-sample.json');
const RESULTS_PATH = path.join(__dirname, 'benchmark-results.json');

interface BenchmarkEntry {
  id: string;
  question: string;
  expected_answer: string;
  expected_answer_numeric: number;
}

interface BenchmarkResult {
  id: string;
  question: string;
  generated_solution: string | null;
  is_correct: boolean | null;
  error?: string;
  timing_ms: number;
}

async function runBenchmark() {
  console.log('Starting MathMind AI Benchmark...');

  let dataset: BenchmarkEntry[];
  try {
    const fileContent = await fs.readFile(DATASET_PATH, 'utf-8');
    dataset = JSON.parse(fileContent);
  } catch (e) {
    console.error(`Failed to load dataset from ${DATASET_PATH}`, e);
    return;
  }

  const results: BenchmarkResult[] = [];
  let correctCount = 0;

  for (const entry of dataset) {
    console.log(`\nProcessing question ID: ${entry.id}`);
    const startTime = performance.now();
    let result: BenchmarkResult = {
      id: entry.id,
      question: entry.question,
      generated_solution: null,
      is_correct: null,
      timing_ms: 0,
    };

    try {
      const response = await getInitialSolution(entry.question);
      const endTime = performance.now();
      result.timing_ms = Math.round(endTime - startTime);

      if (response.error || !response.solution) {
        result.error = response.error || 'No solution generated.';
        console.error(`  [Error] ${result.error}`);
      } else {
        result.generated_solution = response.solution;
        
        // Simple verification: Check if the final numeric answer matches.
        // A more robust solution would involve parsing the "Final Answer" from the text
        // and comparing it more intelligently.
        try {
            const isCorrect = await verifyMath({
                expression: entry.expected_answer,
                expectedResult: entry.expected_answer_numeric,
            });
            result.is_correct = isCorrect;
            if (isCorrect) {
                correctCount++;
                console.log(`  [Result] ✅ Correct (${result.timing_ms}ms)`);
            } else {
                console.log(`  [Result] ❌ Incorrect (${result.timing_ms}ms)`);
            }
        } catch (e) {
            result.is_correct = false;
            console.log(`  [Result] ❌ Verification failed (${result.timing_ms}ms)`);
        }
      }
    } catch (e: any) {
      const endTime = performance.now();
      result.timing_ms = Math.round(endTime - startTime);
      result.error = e.message || 'An unknown error occurred.';
      console.error(`  [Fatal Error] ${result.error}`);
    }
    results.push(result);
  }

  const accuracy = (correctCount / dataset.length) * 100;
  console.log(`\nBenchmark Complete!`);
  console.log(`Total Questions: ${dataset.length}`);
  console.log(`Correct Answers: ${correctCount}`);
  console.log(`Accuracy: ${accuracy.toFixed(2)}%`);

  try {
    await fs.writeFile(RESULTS_PATH, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${RESULTS_PATH}`);
  } catch (e) {
    console.error('Failed to save benchmark results.', e);
  }
}

runBenchmark();
