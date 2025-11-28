// services/openrouterService.ts

export async function generateSongFromPoem(poem: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Missing OpenRouter API Key");
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI music composer. Generate beautiful song lyrics based on the poem." },
        { role: "user", content: poem }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function generatePerformanceAudio(poem: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.error("Missing OpenRouter API Key");
    return null;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-audio",
      messages: [
        { role: "system", content: "You are an AI vocalist. Generate a singing-style audio output." },
        { role: "user", content: poem }
      ]
    })
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}
