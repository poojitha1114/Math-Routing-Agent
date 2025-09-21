'use server';
/**
 * @fileOverview A tool to verify mathematical expressions.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {create, all} from 'mathjs';

const math = create(all);

const MathVerifierInputSchema = z.object({
  expression: z
    .string()
    .describe('The mathematical expression to evaluate, e.g., "x=6" or "5+2".'),
  expectedResult: z
    .number()
    .describe('The expected numeric result of the expression.'),
});

/**
 * Verifies a mathematical expression against an expected numeric result.
 * Supports simple equations and direct calculations.
 */
export const verifyMath = ai.defineTool(
  {
    name: 'verifyMath',
    description: 'Verifies a mathematical solution.',
    inputSchema: MathVerifierInputSchema,
    outputSchema: z.boolean(),
  },
  async ({expression, expectedResult}) => {
    console.log(
      `[Verifier] Verifying expression "${expression}" against expected result ${expectedResult}`
    );
    try {
      // Handle simple equations like 'x = 6'
      if (expression.includes('=')) {
        const parts = expression.split('=').map(p => p.trim());
        const scope: {[key: string]: number} = {};

        // A simple solver for 'var = value'
        if (parts.length === 2 && /^[a-zA-Z]+$/.test(parts[0])) {
          scope[parts[0]] = expectedResult;
          const evaluated = math.evaluate(parts[1], scope);
          // For an expression like 'x = 6', parts[1] is '6', so we check if 6 equals the expected result.
          // This also handles cases like 'y = 10/2' where expected is 5.
          return math.abs(evaluated - expectedResult) < 1e-9;
        } else {
            // More complex equation, use evaluate
             const evaluated = math.evaluate(expression);
             return evaluated === true; // e.g., for "5+2=7"
        }
      }

      // Handle direct expressions like '2+2'
      const actual = math.evaluate(expression);
      // Use a tolerance for floating point comparisons
      return math.abs(actual - expectedResult) < 1e-9;
    } catch (e) {
      console.error(
        `[Verifier] Error evaluating expression "${expression}":`,
        e
      );
      // If evaluation fails, it's not verified.
      return false;
    }
  }
);
