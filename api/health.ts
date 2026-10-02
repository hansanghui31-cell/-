import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
  return res.status(200).json({
    status: 'ok',
    environment: 'vercel',
    hasGeminiKey: hasKey,
    timestamp: new Date().toISOString(),
  });
}
