import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Convert image file to base64 for Gemini API
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  "description": "Brief description of the disease in 1-2 sentences",
  "description_marathi": "Same description in Marathi script",
  "organic_treatment": "Organic treatment advice in 1-2 sentences",
  "organic_marathi": "Same organic treatment in Marathi script",
  "chemical_treatment": "Chemical treatment with product name and dosage",
  "chemical_marathi": "Same chemical treatment in Marathi script",
  "immediate_action": "One urgent action the farmer must take today",
  "immediate_action_marathi": "Same urgent action in Marathi script"
}

Rules:
- severity must be exactly one of: "High", "Medium", "Low", "None"
- confidence must be a number between 0 and 100
- All Marathi text must be Devanagari script
`;

/**
 * Main function to analyze crop image using Gemini Vision
 * Includes automatic retry for 503 errors (Service Unavailable)
 */
export const analyzeCropDisease = async (imageFile, retryCount = 0) => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }

  const modelName = 'gemini-2.5-flash';

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    const base64Image = await fileToBase64(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([
      DISEASE_DETECTION_PROMPT,
      imagePart
    ]);

    const responseText = result.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON_PARSE_ERROR');
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      name: parsed.disease_name,
      marathi: parsed.marathi_name || parsed.disease_name,
      confidence: Math.min(100, Math.max(0, Number(parsed.confidence))),
      severity: parsed.severity,
      is_healthy: parsed.is_healthy || false,
      description: parsed.description || '',
      description_marathi: parsed.description_marathi || '',
      organic_treatment: parsed.organic_treatment || '',
      organic_marathi: parsed.organic_marathi || '',
      chemical_treatment: parsed.chemical_treatment || '',
      chemical_marathi: parsed.chemical_marathi || '',
      immediate_action: parsed.immediate_action || '',
      immediate_action_marathi: parsed.immediate_action_marathi || ''
    };

  } catch (error) {
    console.error(`Gemini Attempt ${retryCount + 1} Failed:`, error);

    // Automatic retry for 503 (Service Unavailable) up to 2 times
    if (error.message?.includes('503') && retryCount < 2) {
      console.log('Retrying in 2 seconds due to 503 error...');
      await new Promise(r => setTimeout(r, 2000));
      return analyzeCropDisease(imageFile, retryCount + 1);
    }

    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error('QUOTA_EXCEEDED');
    }
    if (error.message?.includes('404')) {
      throw new Error('MODEL_NOT_FOUND');
    }
    throw error;
  }
};
