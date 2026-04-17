/**
 * Generic LLM invocation from the frontend.
 * Replaces: base44.integrations.Core.InvokeLLM({ prompt, response_json_schema })
 */
const { invokeLLM } = require('../../services/ai');

module.exports = async (req, res) => {
  const { prompt, response_json_schema } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    const result = await invokeLLM({ prompt, response_json_schema });
    res.json(response_json_schema ? result : { result });
  } catch (err) {
    console.error('[invokeLLM] error:', err.message);
    res.status(500).json({ error: 'AI request failed', message: err.message });
  }
};
