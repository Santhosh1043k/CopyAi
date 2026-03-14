import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const app = express();

// CORS middleware - allows cross-origin requests from the frontend
// In production, you may want to restrict this to your frontend domain
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || false 
    : '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.API_PORT || 3001;
const HF_TOKEN = process.env.HF_TOKEN;
const HF_MODEL = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

function templateFallback(body) {
  const product = body.product ?? 'Product';
  const description = body.description ?? '';
  const icp = body.icp ?? 'customers';
  const pain = body.pain ?? 'challenges';
  const tone = body.tone || 'direct';
  const cta = body.cta || 'Try Free';
  const toneMap = {
    bold: {
      hero: `${product}: Crush your ${icp.toLowerCase()} struggles`,
      sub: `Stop letting ${pain.toLowerCase()} hold you back.`,
      problem: `You're tired of ${pain.toLowerCase()}. ${product} was built for people like you.`,
      features: [`Crush ${pain.toLowerCase()} in minutes`, `Built for ${icp.toLowerCase()}`, `Industry-leading performance`, `24/7 support`],
      footer_cta: `Ready to crush your future? Get started now.`,
    },
    friendly: {
      hero: `Love building for ${icp.toLowerCase()}? So do we!`,
      sub: `${description} We'll help you every step of the way!`,
      problem: `We know what it's like when ${pain.toLowerCase()} gets in the way. That's why we created ${product}.`,
      features: [`Easy-to-use features`, `Friendly support`, `Perfect for ${icp.toLowerCase()}`, `Loved by thousands`],
      footer_cta: `Join thousands of happy users. We'd love to have you!`,
    },
    direct: {
      hero: `The ${product} that gets your ${pain.toLowerCase()} problem`,
      sub: `${description} Built specifically for ${icp.toLowerCase()}.`,
      problem: `${pain} is costing you time. ${product} is the answer.`,
      features: [`Fast setup — under 5 minutes`, `Built for ${icp.toLowerCase()}`, `No complicated tutorials`, `Results from day one`],
      footer_cta: `Ready to solve ${pain.toLowerCase()}? Get started now.`,
    },
    calm: {
      hero: `Find peace in solving your ${icp.toLowerCase()} challenges`,
      sub: `${description} We've got you covered.`,
      problem: `Sometimes ${pain.toLowerCase()} can feel overwhelming. ${product} was designed for clarity.`,
      features: [`Simple, intuitive design`, `Reliable performance`, `Stress-free experience`, `Support when you need it`],
      footer_cta: `Take a moment. Let us help you find a better way.`,
    },
  };
  const t = toneMap[tone] || toneMap.direct;
  return { hero: t.hero, sub: t.sub, cta, problem: t.problem, features: t.features, footer_cta: t.footer_cta };
}

async function generateWithHF(body) {
  if (!HF_TOKEN) return null;
  const prompt = `You are a marketing copywriter. Generate landing page copy as a single JSON object with exactly these keys (use double quotes, no trailing commas): "hero", "sub", "cta", "problem", "features" (array of 4 strings), "footer_cta". Product: ${body.product}. Description: ${body.description}. Target: ${body.icp}. Pain: ${body.pain}. Tone: ${body.tone || 'direct'}. CTA text: ${body.cta || 'Try Free'}. Reply with only the JSON, no other text.`;
  const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HF_TOKEN}`,
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 600, return_full_text: false, temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn('HF API error:', res.status, err);
    return null;
  }
  const data = await res.json();
  const text =
    Array.isArray(data) && data[0]?.generated_text
      ? data[0].generated_text
      : data?.generated_text ?? (typeof data === 'string' ? data : null);
  if (!text) return null;
  const raw = text.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1').trim();
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.product && !body.description) {
      return res.status(400).json({ error: 'Missing product or description' });
    }
    const generated = await generateWithHF(body);
    const result =
      generated && typeof generated.hero === 'string'
        ? {
            hero: generated.hero,
            sub: generated.sub ?? 'Your subheadline here',
            cta: generated.cta ?? body.cta ?? 'Try Free',
            problem: generated.problem ?? 'Problem description here',
            features: Array.isArray(generated.features) ? generated.features : ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
            footer_cta: generated.footer_cta ?? 'Ready to get started?',
          }
        : templateFallback(body);
    res.json(result);
  } catch (err) {
    console.error('/api/generate error:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
});
