const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
} else {
  console.warn('⚠  GEMINI_API_KEY not set. AI classify will use fallback responses.');
}

/**
 * System prompt sent with every Gemini classify request.
 * Instructs the model to return strictly valid JSON matching the PRD schema.
 */
const CLASSIFY_SYSTEM_PROMPT = `You are an industrial waste classification expert for Nepal.
Analyse the provided image and return ONLY a valid JSON object with no markdown or extra text.

Return this exact structure:
{
  "material_type": "string (e.g. Hardwood offcuts)",
  "category_code": "string (use: wood_biomass | plastic_hdpe | metal_ferrous | metal_nonferrous | textile_wool | concrete_rubble | brick_dust | paper_cardboard | glass_cullet | organic_food | other)",
  "estimated_purity_pct": number (0-100),
  "condition": "Clean | Contaminated | Mixed",
  "price_range_npr": { "min": number, "max": number },
  "buyer_industries": ["array of 3 industry types in Nepal context"],
  "listing_title_suggestion": "string (short, in English and Nepali if possible)"
}`;

module.exports = { model, CLASSIFY_SYSTEM_PROMPT };
