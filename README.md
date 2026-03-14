# cto-tanstack-convex

## Run locally

```bash
npm install
npm run dev
```

This single command starts:
- **Vite dev server** (frontend) on port 3000
- **API server** on port 3001 for `/api/generate` (using Vercel Functions logic)
- **Convex** backend

Alternatively, you can use `vercel dev` to more closely replicate the production environment:

```bash
vercel dev
```

### Environment Setup

Copy `.env.huggingface.example` to `.env.local` and add your Hugging Face token:

```bash
cp .env.huggingface.example .env.local
# Edit .env.local and add your HF_TOKEN
```

Required environment variables:
- `HF_TOKEN` - Your Hugging Face API token (get one at https://huggingface.co/settings/tokens)

### Architecture

- **Frontend**: TanStack Start / React app running on `http://localhost:3000`
- **Backend (API)**: Vercel Serverless Functions in the `api/` directory
- **Local Dev**: In development, Vite proxies `/api/*` requests to port 3001.
- **Production**: Vercel routes `/api/*` directly to the serverless functions.
