# Privacy Policy for MathMind AI

This document outlines the data handling and privacy practices for the MathMind AI application.

## Data Collection and Usage

We collect the following information to provide and improve our service:

1.  **User Questions**: The mathematical questions you ask are sent to our AI backend for processing to generate a solution.
2.  **User Feedback**: We store the feedback you provide on solutions (ratings and text) to improve the accuracy and helpfulness of our AI agent. This data is used to identify incorrect solutions and refine the knowledge base.

## Personally Identifiable Information (PII)

We take your privacy seriously. An automated PII redaction guardrail is in place to scan all incoming questions for common PII patterns (e.g., email addresses, phone numbers).

-   If PII is detected, it is replaced with a placeholder (e.g., `[REDACTED_EMAIL]`) before being processed by the AI model or stored in our logs.
-   The original, unredacted query is **not** stored.

## Data Retention

-   **Request Logs**: Anonymized and redacted request data is retained for a period of 30 days for monitoring, debugging, and system performance analysis.
-   **User Feedback**: Feedback data is retained indefinitely to continuously train and improve the system. This data is decoupled from any specific user identity.

## Third-Party Services

This application uses Google's Generative AI models (Gemini) to process questions and generate solutions. Your redacted questions are sent to Google's services for this purpose. Please refer to Google's privacy policy for more information on how they handle data.

## Contact

If you have any questions about our privacy practices, please contact us.
