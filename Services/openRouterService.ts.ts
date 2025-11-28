export async function generateSongFromPoem(poem: string) {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) throw new Error("Missing OPENROUTER_API_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://cabirpoya.github.io/SunPoya/", 
      "X-Title": "SunPoya AI Music Generator"
    },
    body: JSON.stringify({
      model: "google/gemini-pro-1.5",   // رایگان
      messages: [
        { role: "system", content: "You generate musical compositions from poems." },
        { role: "user", content: `Generate music for this poem:\n${poem}` }
      ]
    })
  });

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "No output.";
}

export async function generatePerformanceAudio(lyrics: string) {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) throw new Error("Missing OPENROUTER_API_KEY");

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://cabirpoya.github.io/SunPoya/",
      "X-Title": "SunPoya AI Performance Synthesizer"
    },
    body: JSON.stringify({
      model: "google/gemini-pro-1.5",  
      messages: [
        { role: "system", content: "You convert musical instructions into audio descriptions." },
        { role: "user", content: `Create performance audio instructions for:\n${lyrics}` }
      ]
    })
  });

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || "No audio generated.";
}
