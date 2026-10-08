export async function handleSpoonacularSearch(params = {}) {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 503,
      body: {
        ok: false,
        source: 'spoonacular',
        error:
          'Service Unavailable: SPOONACULAR_API_KEY environment variable is missing or empty on the server.',
      },
    };
  }

  const query = typeof params.query === 'string' ? params.query : '';
  const diet = typeof params.diet === 'string' ? params.diet : '';
  const cuisine = typeof params.cuisine === 'string' ? params.cuisine : '';
  const intolerances = typeof params.intolerances === 'string' ? params.intolerances : '';
  const number = Number(params.number) || 4;

  const url = new URL('https://api.spoonacular.com/recipes/complexSearch');
  if (query) url.searchParams.set('query', query);
  if (cuisine && cuisine !== 'Any') {
    url.searchParams.set('cuisine', cuisine);
  }
  if (diet && diet !== 'standard') {
    const mappedDiet =
      diet === 'high-protein' ? 'ketogenic' : diet === 'keto' ? 'ketogenic' : diet;
    url.searchParams.set('diet', mappedDiet);
  }
  if (intolerances) url.searchParams.set('intolerances', intolerances);

  const nutrientParams = [
    'minCalories',
    'maxCalories',
    'minProtein',
    'maxProtein',
    'minCarbs',
    'maxCarbs',
    'minFat',
    'maxFat',
  ];
  for (const key of nutrientParams) {
    if (params[key] !== undefined && params[key] !== '') {
      url.searchParams.set(key, String(params[key]));
    }
  }

  url.searchParams.set('addRecipeNutrition', 'true');
  url.searchParams.set('addRecipeInformation', 'true');
  url.searchParams.set('fillIngredients', 'true');
  url.searchParams.set('number', String(number));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        status: response.status,
        body: {
          ok: false,
          source: 'spoonacular',
          error: `Upstream Spoonacular API returned HTTP ${response.status} (${response.statusText})`,
        },
      };
    }

    const data = await response.json();
    return {
      status: 200,
      body: {
        ok: true,
        source: 'spoonacular',
        endpoint: 'https://api.spoonacular.com/recipes/complexSearch',
        results: Array.isArray(data?.results) ? data.results : [],
      },
    };
  } catch (err) {
    return {
      status: 502,
      body: {
        ok: false,
        source: 'spoonacular',
        error: err instanceof Error ? err.message : 'Failed to fetch from Spoonacular API',
      },
    };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=300');
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const input = req.method === 'POST' ? req.body || {} : req.query || {};
  const result = await handleSpoonacularSearch(input);
  return res.status(result.status).json(result.body);
}
