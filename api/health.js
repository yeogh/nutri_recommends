export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const hasMcpKey = Boolean(process.env.SMITHERY_API_KEY && process.env.SMITHERY_API_KEY.trim() !== '');
  const hasSpoonacularKey = Boolean(
    process.env.SPOONACULAR_API_KEY && process.env.SPOONACULAR_API_KEY.trim() !== ''
  );
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
  );
  const mcpUrl = process.env.NUTRIBALANCE_MCP_URL || 'https://mcp.smithery.ai/ghyeogh';

  return res.status(200).json({
    ok: true,
    status: 'healthy',
    service: 'nutri-recommends-api',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      nutribalance: '/api/nutribalance',
      spoonacular: '/api/spoonacular',
      gemini: '/api/gemini',
    },
    integrations: {
      mcp: {
        provider: 'nutribalance-mcp',
        url: mcpUrl,
        configured: hasMcpKey,
      },
      spoonacular: {
        endpoint: 'https://api.spoonacular.com/recipes/complexSearch',
        configured: hasSpoonacularKey,
      },
      gemini: {
        model: 'gemini-3.8-flash',
        configured: hasGeminiKey,
      },
    },
  });
}
