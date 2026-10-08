import { GoogleGenAI, Type } from '@google/genai';

export async function handleGeminiRequest(body = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 503,
      body: {
        ok: false,
        source: 'gemini',
        error:
          'Service Unavailable: GEMINI_API_KEY environment variable is missing or empty on the server.',
      },
    };
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const action = typeof body.action === 'string' ? body.action : 'analyze_plan';
  const prompt =
    typeof body.prompt === 'string' && body.prompt.trim() !== ''
      ? body.prompt
      : 'Provide concise household nutrition and allergy coordination advice for a 7-day family dinner plan.';

  try {
    if (action === 'generate_weekly_plan') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an expert family dietitian and chef. Given the household members profiles, NutriBalance nutrient needs, dietary mode, allergies, and preferred cuisine, identify the 7 best dinner recipes for Monday through Sunday. Each day must explicitly name which household member(s) it is tailored for and why it meets their nutrient needs.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    name: { type: Type.STRING },
                    prepTimeMinutes: { type: Type.INTEGER },
                    nutrientHighlight: { type: Type.STRING },
                    recommendedForMember: { type: Type.STRING },
                    memberNutrientReason: { type: Type.STRING },
                    calories: { type: Type.INTEGER },
                    protein: { type: Type.INTEGER },
                    carbs: { type: Type.INTEGER },
                    fat: { type: Type.INTEGER },
                    ingredients: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          quantity: { type: Type.INTEGER },
                          unit: { type: Type.STRING },
                        },
                        required: ['name', 'quantity', 'unit'],
                      },
                    },
                    steps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'day',
                    'name',
                    'prepTimeMinutes',
                    'nutrientHighlight',
                    'recommendedForMember',
                    'memberNutrientReason',
                    'calories',
                    'protein',
                    'carbs',
                    'fat',
                    'ingredients',
                    'steps',
                  ],
                },
              },
            },
            required: ['meals'],
          },
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        status: 200,
        body: {
          ok: true,
          source: 'gemini',
          model: 'gemini-3.8-flash',
          meals: Array.isArray(parsed?.meals) ? parsed.meals : [],
        },
      };
    }

    if (action === 'generate_meal') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are a certified family nutritionist and culinary planner. Return a single dinner recipe tailored to the household dietary mode and allergy constraints.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              prepTimeMinutes: { type: Type.INTEGER },
              nutrientHighlight: { type: Type.STRING },
              calories: { type: Type.INTEGER },
              protein: { type: Type.INTEGER },
              carbs: { type: Type.INTEGER },
              fat: { type: Type.INTEGER },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'name',
              'prepTimeMinutes',
              'nutrientHighlight',
              'calories',
              'protein',
              'carbs',
              'fat',
              'steps',
            ],
          },
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      return {
        status: 200,
        body: {
          ok: true,
          source: 'gemini',
          model: 'gemini-3.8-flash',
          meal: parsed,
        },
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a concise family dietitian assistant. Provide 3 short, actionable bullet points (under 90 words total) optimizing macros, allergy safety, or cooking prep.',
      },
    });

    return {
      status: 200,
      body: {
        ok: true,
        source: 'gemini',
        model: 'gemini-3.8-flash',
        text: response.text || '',
      },
    };
  } catch (err) {
    return {
      status: 502,
      body: {
        ok: false,
        source: 'gemini',
        error: err instanceof Error ? err.message : 'Gemini API request failed',
      },
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const result = await handleGeminiRequest(req.body || {});
  return res.status(result.status).json(result.body);
}
