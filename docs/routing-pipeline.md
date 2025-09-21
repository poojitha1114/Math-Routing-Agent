# MathMind AI Routing Pipeline

## Overview
This document describes the routing pipeline for the Agentic-RAG Math Routing Agent. The pipeline ensures that every math question is processed efficiently, securely, and with human-in-the-loop feedback.

---

## 1. Input Guardrails (AI Gateway)
- **PII Redaction:** All incoming questions are scanned for personally identifiable information and redacted before further processing.
- **Profanity/Content Filtering:** Questions are checked for inappropriate content and blocked if necessary.

---

## 2. Routing Logic
- **Step 1: Knowledge Base Search (VectorDB)**
  - The system first queries the knowledge base (VectorDB, e.g., Qdrant/Weaviate) for relevant math problems.
  - If a match is found, a step-by-step solution is retrieved and presented.
- **Step 2: Web Search (MCP Integration)**
  - If no KB match, the system performs a web search using Tavily/Exa/Serper, formatted via MCP.
  - Extracts and summarizes step-by-step solutions from search results.
  - Ensures only validated, math-related content is used.
- **Step 3: Output Guardrails**
  - The generated solution is verified for mathematical correctness.
  - Output is checked for privacy and relevance before being shown to the user.

---

## 3. Human-in-the-Loop Feedback
- **Feedback Form:** Users can rate and comment on solutions.
- **Refinement Agent:** Feedback is used to refine future responses (DSPy integration recommended).
- **Self-Learning:** The system adapts based on aggregate feedback, improving solution quality over time.

---

## 4. Benchmarking (Bonus)
- **JEE Bench Script:** The pipeline can be benchmarked against the JEE dataset to measure accuracy and efficiency.

---

## Diagram
A flowchart will be included in the final proposal and demo video.

---

## Next Steps
- Integrate Qdrant/Weaviate for KB search.
- Modularize AI Gateway guardrails.
- Add DSPy feedback agent.
- Finalize benchmarking and documentation.
