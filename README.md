# cto-tanstack-convex

## Run locally

```bash
npm install
npm run dev
```

This starts the Vite app (port 3000), the **API server** (port 3001 for `/api/generate`), and Convex. The "Generate" button needs the API server; if you only run `npm run dev:web`, you'll get connection refused when generating copy.
