export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const hasMcpKey = Boolean(process.env.SMITHERY_API_KEY && process.env.SMITHERY_API_KEY.trim() !== '');
  const mcpUrl = process.env.NUTRIBALANCE_MCP_URL || 'https://mcp.smithery.ai/ghyeogh';

  return res.status(200).json({
    ok: true,
    status: 'healthy',
    service: 'nutri-recommends-api',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      nutribalance: '/api/nutribalance',
    },
    mcp: {
      provider: 'nutribalance-mcp',
      url: mcpUrl,
      configured: hasMcpKey,
    },
  });
}
