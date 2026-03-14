# cto-tanstack-convex

## Run locally

```bash
npm install
npm run dev
```

This single command starts:
- **Vite dev server** (frontend) on port 3000
- **Express API server** on port 3001; Vite proxies `/api/*` to it automatically

To also run Convex: in a second terminal run `npm run dev:convex`.

### Environment Setup

Copy `.env.huggingface.example` to `.env.local` and add your Hugging Face token:

```bash
cp .env.huggingface.example .env.local
# Edit .env.local and add your HF_TOKEN
```

Required environment variables:
- `HF_TOKEN` - Your Hugging Face API token (get one at https://huggingface.co/settings/tokens)

### Architecture

- **Frontend**: TanStack Start / React app on `http://localhost:3000`
- **API**: Express server on port 3001; Vite proxies `/api/*` to it in development
- **Production**: Set `VITE_API_URL` to your deployed API origin (e.g. Railway) so the frontend calls the correct host
