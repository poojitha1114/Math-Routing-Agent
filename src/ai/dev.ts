import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-web-search-results.ts';
import '@/ai/flows/refine-solution-based-on-feedback.ts';
import '@/ai/tools/kb-search.ts';
import '@/ai/tools/pii-redaction.ts';
import '@/ai/tools/math-verifier.ts';
