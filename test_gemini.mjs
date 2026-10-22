import { createProvider } from './providers/gemini.mjs';
import { loadEnv } from './lib/env.mjs';
loadEnv('./.env');

const p = createProvider({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash-image',
});

try {
  console.log('Testing provider with model:', p.model);
  const res = await p.generate({
    prompt: 'A minimalist sculptural liquid metal fluid ribbon on pitch black background, 9:16 portrait',
  });
  console.log('Success! Image buffer size:', res.buffer.length);
} catch (err) {
  console.error('Provider error:', err.message);
}
