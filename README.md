# cto-tanstack-convex

## Run locally

```bash
npm install
npm run dev
```

This single command starts:
- **Vite dev server** (frontend) on port 3000
- **Express API server** on port 3001 for `/api/generate`
- **Convex** backend

The API server includes CORS headers for cross-origin requests from the frontend.

### Environment Setup

Copy `.env.huggingface.example` to `.env.local` and add your Hugging Face token:

```bash
cp .env.huggingface.example .env.local
# Edit .env.local and add your HF_TOKEN
```

Required environment variables:
- `HF_TOKEN` - Your Hugging Face API token (get one at https://huggingface.co/settings/tokens)

Optional environment variables:
- `HF_MODEL` - Hugging Face model to use (default: `mistralai/Mistral-7B-Instruct-v0.2`)
- `API_PORT` - Port for API server (default: 3001)

### Architecture

- Frontend runs on `http://localhost:3000`
- API requests to `/api/*` are proxied to Express server on port 3001
- The Express server handles AI generation via Hugging Face API with fallback templates
