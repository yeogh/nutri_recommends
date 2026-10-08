import { executeMcpTool } from '../MCP/nutribalanceClient.ts';

export async function handleNutribalanceRequest(body) {
  const tool = typeof body?.tool === 'string' ? body.tool : 'generate_meal_plan';
  const args = typeof body?.args === 'object' && body?.args !== null ? body.args : {};

  return executeMcpTool({
    server: 'nutribalance',
    tool,
    args,
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }
  const result = await handleNutribalanceRequest(req.body || {});
  return res.status(result.status).json(result.body);
}
