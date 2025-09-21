'use server';
/**
 * @fileOverview A tool for redacting Personally Identifiable Information (PII).
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PIIRedactionOutputSchema = z.object({
  text: z.string().describe('The text with PII redacted.'),
  wasRedacted: z
    .boolean()
    .describe('Whether any PII was found and redacted.'),
});

// Basic regex for emails and phone numbers
const PII_PATTERNS = [
  {name: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g},
  {
    name: 'PHONE',
    regex:
      /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  },
];

/**
 * A simple PII redaction tool that scrubs emails and phone numbers from text.
 */
export const redactPII = ai.defineTool(
  {
    name: 'redactPII',
    description: 'Redacts PII like emails and phone numbers from input text.',
    inputSchema: z.string(),
    outputSchema: PIIRedactionOutputSchema,
  },
  async text => {
    let redactedText = text;
    let wasRedacted = false;

    PII_PATTERNS.forEach(pattern => {
      redactedText = redactedText.replace(pattern.regex, match => {
        wasRedacted = true;
        console.log(`[PII] Redacted ${pattern.name}: "${match}"`);
        return `[REDACTED_${pattern.name}]`;
      });
    });

    return {text: redactedText, wasRedacted};
  }
);
