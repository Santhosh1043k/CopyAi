// API Route for AI copy generation
// Uses standard Web Request/Response APIs (compatible with Vite dev server)

interface RequestBody {
  product: string;
  description: string;
  icp: string;
  pain: string;
  tone: string;
  cta: string;
}

interface GenerateResponse {
  hero: string;
  sub: string;
  cta: string;
  problem: string;
  features: string[];
  footer_cta: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: RequestBody = await request.json();
    const { product, icp, pain, tone, cta } = body;

    // Build the prompt
    const prompt = `### Input
Product: ${product}
Customer: ${icp}
Pain: ${pain}
Tone: ${tone}

### Response
Hero:`;

    // Call Hugging Face Inference API
    const hfToken = process.env.HF_TOKEN;

    if (!hfToken) {
      return Response.json(
        { error: "HF_TOKEN not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Santhoshk86/landing-page-copywriter",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.3,
            repetition_penalty: 1.3,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Hugging Face API error:", response.status, await response.text());
      return Response.json(
        { error: "Generation failed" },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    // The model returns an array with the generated text
    const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;
    
    if (!generatedText) {
      return Response.json(
        { error: "Generation failed" },
        { status: 500 }
      );
    }

    // Parse the response - extract fields from the generated text
    const result = parseGeneratedResponse(generatedText, cta);

    return Response.json(result);
  } catch (error) {
    console.error("API route error:", error);
    return Response.json(
      { error: "Generation failed" },
      { status: 500 }
    );
  }
}

function parseGeneratedResponse(text: string, fallbackCta: string): GenerateResponse {
  // Try to extract sections from the generated text
  const lines = text.split("\n").filter((line: string) => line.trim());
  
  let hero = "";
  let sub = "";
  let cta = fallbackCta || "Try Free";
  let problem = "";
  let features: string[] = [];
  let footer_cta = "";

  // Simple parsing - look for common patterns
  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();
    
    if (lowerLine.startsWith("hero:") || lowerLine.startsWith("headline:")) {
      hero = line.replace(/^(hero:|headline:)\s*/i, "").trim();
    } else if (lowerLine.startsWith("sub:") || lowerLine.startsWith("subheadline:") || lowerLine.startsWith("subtitle:")) {
      sub = line.replace(/^(sub:|subheadline:|subtitle:)\s*/i, "").trim();
    } else if (lowerLine.startsWith("cta:") || lowerLine.startsWith("button:") || lowerLine.startsWith("call to action:")) {
      cta = line.replace(/^(cta:|button:|call to action:)\s*/i, "").trim();
    } else if (lowerLine.startsWith("problem:") || lowerLine.startsWith("pain:") || lowerLine.startsWith("issue:")) {
      problem = line.replace(/^(problem:|pain:|issue:)\s*/i, "").trim();
    } else if (lowerLine.startsWith("feature:") || lowerLine.startsWith("features:")) {
      const featureText = line.replace(/^(feature:|features:)\s*/i, "").trim();
      if (featureText) {
        features.push(featureText);
      }
    } else if (lowerLine.startsWith("footer:") || lowerLine.startsWith("footer cta:")) {
      footer_cta = line.replace(/^(footer:|footer cta:)\s*/i, "").trim();
    }
  }

  // If parsing didn't work well, create fallback content
  if (!hero && lines.length > 0) {
    hero = lines[0]?.replace(/^#+\s*/, "").trim() || "Your headline here";
  }
  
  if (!sub && lines.length > 1) {
    sub = lines[1]?.replace(/^#+\s*/, "").trim() || "Your subheadline here";
  }

  // If no features found, create some defaults
  if (features.length === 0) {
    features = [
      "Feature 1: Solve your biggest challenge",
      "Feature 2: Built for speed and efficiency",
      "Feature 3: Trusted by thousands of users",
    ];
  }

  // If no footer CTA, generate one
  if (!footer_cta) {
    footer_cta = `Ready to get started? ${cta} today!`;
  }

  // If no problem section, create one
  if (!problem) {
    problem = "We understand the challenges you're facing. Our solution is designed to help you overcome them quickly and effectively.";
  }

  return {
    hero,
    sub,
    cta,
    problem,
    features,
    footer_cta,
  };
}
