import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const app = express();

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
      hero: `The ${product} that solves your ${pain.toLowerCase()} problem`,
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

async function generateWithModel(body) {
  if (!HF_TOKEN) {
    console.log('HF: skipped (no HF_TOKEN) → using template');
    return null;
  }

  console.log('Calling Llama 3.1 8B via Novita...');

  try {
    const res = await fetch(
      'https://router.huggingface.co/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${HF_TOKEN}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-8B-Instruct:novita',
          messages: [
            {
              role: 'system',
              content: `You are an expert landing page copywriter for SaaS products.\nAlways respond using EXACTLY this format with no extra text:\nHero: [short punchy headline under 10 words]\nSub: [one sentence benefit-driven subheadline]\nCTA: [3-5 word button text]`,
            },
            {
              role: 'user',
              content: `Write landing page copy for:\nProduct: ${body.product}\nDescription: ${body.description}\nTarget customer: ${body.icp}\nPain point: ${body.pain}\nTone: ${body.tone || 'bold'}\nCTA goal: ${body.cta || 'try free'}`,
            },
          ],
          max_tokens: 150,
          temperature: 0.4,
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.warn('Model API error:', res.status, err, '→ using template');
      return null;
    }

    const data = await res.json();
    console.log('Model raw response:', JSON.stringify(data));

    const generatedText = data?.choices?.[0]?.message?.content || '';

    if (!generatedText) {
      console.warn('No generated text returned → using template');
      return null;
    }

    console.log('Generated text:', generatedText);

    const lines = generatedText.split('\n').filter((l) => l.trim() !== '');

    const hero =
      lines.find((l) => l.toLowerCase().startsWith('hero:'))
        ?.replace(/^hero:/i, '').trim() ||
      `Stop ${body.pain}.`;

    const sub =
      lines.find((l) => l.toLowerCase().startsWith('sub:'))
        ?.replace(/^sub:/i, '').trim() ||
      `Built for ${body.icp} who are done with ${body.pain}.`;

    const ctaText =
      lines.find((l) => l.toLowerCase().startsWith('cta:'))
        ?.replace(/^cta:/i, '').trim() ||
      body.cta ||
      'Try free today';

    return {
      hero,
      sub,
      cta: ctaText,
      problem: `You are a ${body.icp} tired of ${body.pain}. Every day it costs you time and money. ${body.product} was built to fix this.`,
      features: [
        `Solves ${body.pain} instantly`,
        `Built specifically for ${body.icp}`,
        `${body.description || 'Powerful and easy to use'}`,
        `Get started with ${ctaText} — no credit card needed`,
      ],
      footer_cta: `Ready to stop ${body.pain}? ${ctaText}`,
    };

  } catch (err) {
    console.warn('Model call failed:', err.message, '→ using template');
    return null;
  }
}

app.post('/api/generate', async (req, res) => {
  try {
    const body = req.body || {};
    console.log('POST /api/generate body:', JSON.stringify(body));

    if (Object.keys(body).length === 0) {
      console.warn('POST /api/generate: received empty body - check proxy/Content-Type');
    }

    if (!body.product && !body.description) {
      return res.status(400).json({ error: 'Missing product or description' });
    }

    const generated = await generateWithModel(body);
    const useModel = generated && typeof generated.hero === 'string';

    if (useModel) {
      console.log('Response: using AI model');
    } else {
      console.log('Response: using 4-tone template (tone:', body.tone || 'direct', ')');
    }

    const result = useModel ? generated : templateFallback(body);
    res.json(result);

  } catch (err) {
    console.error('/api/generate error:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
  console.log(`Model: meta-llama/Llama-3.1-8B-Instruct:novita`);
  console.log(`HF_TOKEN configured: ${HF_TOKEN ? 'YES' : 'NO — add it to .env.local'}`);
});
