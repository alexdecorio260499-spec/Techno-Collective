// Google Gemini / Imagen image provider. Only loaded when GEMINI_API_KEY is set.
// - gemini-*-image models: generateContent with text + up to 3 reference images, 9:16 output.
// - imagen-* models: predict endpoint, 9:16 output (no reference images).

import fs from 'node:fs/promises';
import path from 'node:path';

const API = 'https://generativelanguage.googleapis.com/v1beta/models';

export function createProvider({ apiKey, model }) {
  const isImagen = model.startsWith('imagen');

  async function call(endpoint, body) {
    const res = await fetch(`${API}/${model}:${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data.error?.message || `Provider HTTP ${res.status}`), { status: 502 });
    return data;
  }

  async function generate({ prompt, references = [] }) {
    if (isImagen) {
      const data = await call('predict', {
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '9:16', personGeneration: 'dont_allow' },
      });
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw Object.assign(new Error('Provider returned no image (possibly filtered)'), { status: 502 });
      return { buffer: Buffer.from(b64, 'base64'), ext: '.png' };
    }

    const parts = [];
    for (const ref of references.slice(0, 3)) {
      const ext = path.extname(ref).toLowerCase();
      parts.push({ inline_data: { mime_type: ext === '.png' ? 'image/png' : 'image/jpeg', data: (await fs.readFile(ref)).toString('base64') } });
    }
    const refNote = references.length
      ? 'The attached images are RUPTURE master artworks. Match their texture quality, lighting behaviour, black levels, colour restraint and grain, but create a completely new composition. Do not copy them.\n\n'
      : '';
    parts.push({ text: refNote + prompt });

    const data = await call('generateContent', {
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '9:16' } },
    });
    const img = data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data);
    const inline = img?.inlineData || img?.inline_data;
    if (!inline) throw Object.assign(new Error('Provider returned no image (possibly filtered)'), { status: 502 });
    const mime = inline.mimeType || inline.mime_type || 'image/png';
    return { buffer: Buffer.from(inline.data, 'base64'), ext: mime.includes('jpeg') ? '.jpg' : '.png' };
  }

  return { model, generate };
}
