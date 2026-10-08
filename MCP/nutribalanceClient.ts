export interface McpToolRequest {
  server: 'nutribalance';
  tool: string;
  args: Record<string, unknown>;
}

export interface McpToolResponse {
  ok: boolean;
  source: string;
  data?: unknown;
  error?: string;
}

/**
 * All MCP calls happen inside MCP/ on the server side only.
 * Before any external fetch, checks that SMITHERY_API_KEY exists and is non-empty.
 * If missing, returns a 503 status structure without calling the upstream service.
 * After any fetch, checks response.ok before reading the body.
 */
export async function executeMcpTool(req: McpToolRequest): Promise<{ status: number; body: McpToolResponse }> {
  const apiKey = process.env.SMITHERY_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return {
      status: 503,
      body: {
        ok: false,
        source: req.server,
        error: 'Service Unavailable: SMITHERY_API_KEY environment variable is missing or empty. Configure it on the server to enable live MCP requests.',
      },
    };
  }

  const baseUrl = process.env.NUTRIBALANCE_MCP_URL || 'https://mcp.smithery.ai/ghyeogh';

  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: req.tool,
          arguments: req.args,
        },
      }),
    });

    if (!response.ok) {
      return {
        status: response.status,
        body: {
          ok: false,
          source: req.server,
          error: `Upstream MCP service returned HTTP ${response.status} (${response.statusText})`,
        },
      };
    }

    const data = await response.json();
    return {
      status: 200,
      body: {
        ok: true,
        source: req.server,
        data,
      },
    };
  } catch (err) {
    return {
      status: 502,
      body: {
        ok: false,
        source: req.server,
        error: err instanceof Error ? err.message : 'Failed to reach upstream MCP server',
      },
    };
  }
}
