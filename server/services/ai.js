/**
 * AI service — replaces base44.integrations.Core.InvokeLLM()
 * Uses Anthropic Claude API.
 */

const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * @param {string} prompt
 * @param {object|null} response_json_schema  — when provided, response is parsed as JSON
 * @returns {object|string}
 */
async function invokeLLM({ prompt, response_json_schema = null }) {
  const systemPrompt = response_json_schema
    ? 'You are a helpful fitness assistant. Always respond with valid JSON matching the schema provided. Do not include markdown code fences.'
    : 'You are a helpful fitness assistant.';

  const message = await client.messages.create({
    model: process.env.AI_MODEL || 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].text.trim();

  if (response_json_schema) {
    // Strip potential markdown fences
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(clean);
  }

  return text;
}

module.exports = { invokeLLM };
