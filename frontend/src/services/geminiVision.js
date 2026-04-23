import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const DISEASE_DETECTION_PROMPT = `
You are an expert agricultural scientist specializing in crop diseases
in Maharashtra, India. Analyze this crop leaf image carefully.

Respond ONLY in this exact JSON format with no extra text, no markdown,
no code blocks, just pure JSON:

{
  "disease_name": "exact disease name in English",
  "marathi_name": "disease name in Marathi script",
  "confidence": 85,
  "severity": "High",
  "is_healthy": false,
  "description": "Brief description in 1-2 sentences",
  "description_marathi": "Same in Marathi script",
  "organic_treatment": "Organic treatment in 1-2 sentences",
  "organic_marathi": "Same in Marathi script",
  "chemical_treatment": "Chemical treatment with product name and dosage",
  "chemical_marathi": "Same in Marathi script",
  "immediate_action": "One urgent action the farmer must take today",
  "immediate_action_marathi": "Same in Marathi script"
}

Rules:
- severity must be exactly: "High", "Medium", "Low", or "None"
- confidence is a number 0-100
- All Marathi text must be Devanagari script
`;

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Parse the retry delay from a Gemini API error message.
 * Returns milliseconds to wait, or null if not found.
 * The error message contains e.g. "retryDelay":"16s"
 */
const parseRetryDelay = (errMessage) => {
  try {
    // Try to extract retryDelay from the JSON in the error message
    const match = errMessage.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);
    if (match) {
      const seconds = Math.ceil(parseFloat(match[1]));
      return (seconds + 2) * 1000; // add 2s buffer
    }
  } catch (_) {}
  return null;
};

/**
 * Analyze crop disease image using Gemini 2.5 Flash.
 *
 * Error handling:
 *  - 503 (high demand): retry with exponential backoff (5s, 10s, 15s, 20s, 25s)
 *  - 429 (rate limit):  read the retryDelay from the error and wait exactly that long,
 *                       then retry (up to 3 times). Only throw QUOTA_EXCEEDED if the
 *                       daily limit is truly exhausted (no retryDelay in the error).
 *
 * @param {File}     imageFile
 * @param {Function} onStatus  optional (msg: string) => void
 */
export const analyzeCropDisease = async (imageFile, onStatus = null) => {
  if (!API_KEY) throw new Error('Gemini API key is not configured.');

  const MODEL = 'gemini-2.5-flash';
  const MAX_ATTEMPTS = 6;

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  let attempt503 = 0;
  let attempt429 = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      onStatus?.(attempt === 1
        ? 'Scanning with Gemini 2.5 Flash...'
        : `Retrying... (attempt ${attempt})`);

      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type || 'image/jpeg';

      const result = await model.generateContent([
        DISEASE_DETECTION_PROMPT,
        { inlineData: { data: base64Image, mimeType } }
      ]);

      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON_PARSE_ERROR');

      const p = JSON.parse(jsonMatch[0]);
      return {
        name: p.disease_name,
        marathi: p.marathi_name || p.disease_name,
        confidence: Math.min(100, Math.max(0, Number(p.confidence))),
        severity: p.severity,
        is_healthy: p.is_healthy || false,
        description: p.description || '',
        description_marathi: p.description_marathi || '',
        organic_treatment: p.organic_treatment || '',
        organic_marathi: p.organic_marathi || '',
        chemical_treatment: p.chemical_treatment || '',
        chemical_marathi: p.chemical_marathi || '',
        immediate_action: p.immediate_action || '',
        immediate_action_marathi: p.immediate_action_marathi || ''
      };

    } catch (err) {
      const msg = err.message || '';
      console.warn(`Attempt ${attempt} failed:`, msg.slice(0, 120));

      // ── 429: Rate limit ────────────────────────────────────────────
      if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        attempt429++;
        const waitMs = parseRetryDelay(msg);

        if (waitMs && attempt429 <= 3) {
          // The API told us exactly how long to wait — respect it
          const waitSec = Math.ceil(waitMs / 1000);
          onStatus?.(`Rate limited. Waiting ${waitSec}s then auto-retrying...`);
          await delay(waitMs);
          continue;
        }

        // No retry delay in the error = truly exhausted daily quota
        throw new Error('QUOTA_EXCEEDED');
      }

      // ── 503: Server busy ───────────────────────────────────────────
      if (msg.includes('503')) {
        attempt503++;
        if (attempt503 <= 5) {
          const wait503 = attempt503 * 5000; // 5s, 10s, 15s, 20s, 25s
          const waitSec = attempt503 * 5;
          onStatus?.(`Server busy, retrying in ${waitSec}s... (${attempt503}/5)`);
          await delay(wait503);
          continue;
        }
        throw new Error('SERVICE_UNAVAILABLE');
      }

      // ── JSON parse issue ───────────────────────────────────────────
      if (msg === 'JSON_PARSE_ERROR') throw err;

      // ── Other errors ───────────────────────────────────────────────
      throw err;
    }
  }

  throw new Error('SERVICE_UNAVAILABLE');
};
