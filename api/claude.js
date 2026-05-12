export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key no configurada en Vercel' });
  }

  const { agentId, messages, max_tokens, model, system } = req.body;

  try {
    let endpoint, body, headers;

    if (agentId) {
      // Llamada a un Agente específico de Anthropic
      endpoint = `https://api.anthropic.com/v1/agents/${agentId}/completions`;
      body = { messages, max_tokens: max_tokens || 1024 };
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'agents-2025-01-01'
      };
    } else {
      // Llamada estándar a la API de mensajes
      endpoint = 'https://api.anthropic.com/v1/messages';
      body = { model: model || 'claude-haiku-4-5-20251001', messages, max_tokens: max_tokens || 2048, system };
      headers = {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
