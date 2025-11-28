export async function generateSongFromPoem(poem: string) {
  console.warn("OFFLINE MODE: No real AI. Returning sample text.");
  
  return `
🎵 DEMO OUTPUT (NO AI)
Poem received:
"${poem}"

This is a demo composition generated offline.
  `;
}

export async function generatePerformanceAudio(poem: string) {
  console.warn("OFFLINE MODE: No real AI audio. Returning sample audio URL.");

  return "/demo-audio.mp3"; 
}
