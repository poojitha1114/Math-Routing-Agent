# MathMind AI

![MathMind AI Logo](https://raw.githubusercontent.com/your-username/your-repo/main/public/logo.svg) <!-- Replace with your actual logo path if you have one -->

**MathMind AI** is an intelligent, step-by-step math problem solver designed to demystify mathematics. It uses a powerful Retrieval-Augmented Generation (RAG) architecture to provide accurate, context-aware solutions by leveraging both a pre-existing knowledge base and real-time web search.

---

## ✨ Features

- **Step-by-Step Solutions:** Breaks down complex problems into easy-to-understand steps.
- **RAG-Powered Accuracy:** Combines knowledge base retrieval with web search for reliable answers.
- **Math Expression Verification:** Internal tool to validate mathematical solutions.
- **Modern & Responsive UI:** Built with Next.js, Tailwind CSS, and `shadcn/ui`.
- **Extensible AI Core:** Powered by Google Genkit for easy AI flow orchestration.
- **Self-Contained Embedding Service:** FastAPI microservice for generating text embeddings.

---

## 🏗️ Architecture Overview

The application has a modular architecture designed for scalability:

1. **Frontend (Next.js/React):** Captures user input and displays step-by-step solutions.
2. **BFF (Next.js Server Actions):** Handles API requests, rate-limits, and orchestrates AI core calls.
3. **AI Orchestration Core (Genkit):** Determines solution strategy:
    - **KB Route:** Retrieves verified solutions from the vector knowledge base.
    - **LLM Route:** Uses an LLM (like Google Gemini) augmented with web search to generate new solutions.
4. **AI Tools & Services:**
    - **Web Search Tool:** Fetches real-time information.
    - **Embedding Service:** Converts text into vector embeddings (FastAPI).
    - **Math Verifier:** Validates mathematical expressions.

---

## 🛠️ Tech Stack

- **Frontend Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Framework:** [Genkit](https://firebase.google.com/docs/genkit)
- **AI Model:** [Google Gemini](https://ai.google.dev/)
- **Microservice:** [Python](https://www.python.org/) with [FastAPI](https://fastapi.tiangolo.com/)
- **Vector Embeddings:** [Sentence-Transformers](https://www.sbert.net/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) v18+
- [Python](https://www.python.org/downloads/) v3.9+
- `pnpm` (or `npm` / `yarn`)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

#### 2. Set Up Environment Variables

# Copy the example environment file to create your own local .env file
cp .env.example .env.local

# Open .env.local and fill in the required values:
# GOOGLE_API_KEY="Your Google AI API Key"
# TAVILY_API_KEY="Your Tavily Web Search API Key"
# EMBEDDING_SERVICE_URL="http://127.0.0.1:8000"

### 3. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies for the embedding service
pip install -r src/ai/tools/requirements.txt

### # Install Node.js dependencies
pnpm install

# Install Python dependencies for the embedding service
pip install -r src/ai/tools/requirements.txt

### 4. Run the Embedding Service
```bash
# Start the FastAPI embedding service
uvicorn src.ai.tools.embed_service:app --host 0.0.0.0 --port 8000
Keep this terminal running. This service is required for the AI core to function.

### 5. Run the Main Application
# In a new terminal, start the Next.js development server
pnpm dev
