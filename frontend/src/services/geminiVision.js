import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Convert image file to base64 for Gemini API
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Remove the data:image/jpeg;base64, prefix
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// The prompt sent to Gemini Vision for disease detection
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
- is_healthy must be true or false
- If the leaf looks healthy, set is_healthy to true, severity to "None",
  disease_name to "Healthy Crop", marathi_name to "निरोगी पीक"
- If the image is not a crop leaf, set disease_name to "Invalid Image"
  and is_healthy to false
- All Marathi text must be in Devanagari script
- Keep all descriptions simple enough for a farmer with basic education
- Focus on diseases common in Maharashtra: tomato, cotton, soybean,
  wheat, sugarcane, onion, groundnut, jowar, bajra
`;

// Main function to analyze crop image using Gemini Vision
export const analyzeCropDisease = async (imageFile) => {
  if (!API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    const mimeType = imageFile.type || 'image/jpeg';

    // Build the request with image and prompt
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType
      }
    };

    // Send to Gemini Vision API
    const result = await model.generateContent([
      DISEASE_DETECTION_PROMPT,
      imagePart
    ]);

    const responseText = result.response.text();

    // Clean response in case Gemini adds any markdown
    const cleanedResponse = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Parse the JSON response
    const parsed = JSON.parse(cleanedResponse);

    // Validate required fields exist
    if (!parsed.disease_name || !parsed.severity || parsed.confidence === undefined) {
      throw new Error('Invalid response format from Gemini API');
    }

    // Return normalized result object
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
    // Handle specific error types
    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in .env');
    }
    if (error.message?.includes('JSON')) {
      throw new Error('Unexpected response from AI. Please try again with a clearer photo.');
    }
    if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    }
    throw error;
  }
};
