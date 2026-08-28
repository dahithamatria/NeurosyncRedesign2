// Thin abstraction over "whatever AI provider you configure".
// NOTE: the current redesigned frontend has no Simplify/Summarize button —
// its accessibility features (bionic reading, simplification, etc.) are
// done locally, per-tier, inside the chrome-extension-basic/plus/smart
// folders using rule-based logic, not this backend. This service exists so
// that if/when the frontend adds an AI-powered simplify or summarize
// feature, there's a ready endpoint to call rather than a frontend calling
// a third-party API directly (which would leak the API key to the browser).
//
// No API key is hard-coded. If AI_API_KEY / AI_MODEL are not set, both
// functions fall back to a clearly-labeled no-op so the app still runs.

const hasProvider = Boolean(process.env.AI_API_KEY);

async function callProvider(prompt) {
  // Swap this out for a real provider call, e.g.:
  //
  // const res = await fetch('https://api.anthropic.com/v1/messages', {
  //   method: 'POST',
  //   headers: {
  //     'x-api-key': process.env.AI_API_KEY,
  //     'anthropic-version': '2023-06-01',
  //     'content-type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: process.env.AI_MODEL || 'claude-sonnet-4-6',
  //     max_tokens: 1024,
  //     messages: [{ role: 'user', content: prompt }],
  //   }),
  // });
  // const data = await res.json();
  // return data.content?.[0]?.text ?? '';

  throw new Error('No AI provider implemented for the configured AI_MODEL yet.');
}

async function simplify(text, level = 'plus') {
  if (!hasProvider) {
    return {
      simplified: text,
      note: 'AI_API_KEY is not set — returning the original text unchanged (dev fallback).',
    };
  }
  const prompt = `Rewrite the following text at a "${level}" simplification level for a reader with dyslexia:\n\n${text}`;
  const simplified = await callProvider(prompt);
  return { simplified, note: null };
}

async function summarize(text) {
  if (!hasProvider) {
    const firstSentence = text.split(/(?<=[.!?])\s/)[0] || text;
    return {
      summary: firstSentence,
      keyPoints: [],
      note: 'AI_API_KEY is not set — returning a naive first-sentence summary (dev fallback).',
    };
  }
  const prompt = `Summarize the following text in 2-3 sentences and list 3 key points:\n\n${text}`;
  const summary = await callProvider(prompt);
  return { summary, keyPoints: [], note: null };
}

module.exports = { simplify, summarize, hasProvider };
