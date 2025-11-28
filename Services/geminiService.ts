import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { SongStructure, Emotion } from "../types";

// Schema definition for the Gemini API response
const songSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative title for the song based on the poem" },
    emotion: { type: Type.STRING, enum: ["joy", "sadness", "love", "epic", "mystical"] },
    scale: { type: Type.STRING, description: "The musical scale or Dastgah (e.g., Mahur, Homayoun, C Minor)" },
    tempo: { type: Type.INTEGER, description: "BPM of the track" },
    timeSignature: { type: Type.STRING, description: "Time signature (e.g., 6/8, 4/4)" },
    instruments: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of instruments used (mix of Persian and Western)"
    },
    mainMelody: { 
      type: Type.STRING, 
      description: "A text representation of the main melody motif notes (at least 16 notes), e.g., 'C4 D4 Eb4 F4 G4...'" 
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Section name (Intro, Verse, Chorus, etc.)" },
          bars: { type: Type.INTEGER },
          chords: { type: Type.ARRAY, items: { type: Type.STRING } },
          instruments: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Instruments active in this section" },
          description: { type: Type.STRING, description: "Short description of the musical vibe" }
        },
        required: ["name", "bars", "chords", "instruments", "description"]
      }
    },
    productionNotes: {
      type: Type.OBJECT,
      properties: {
        mixing: { type: Type.STRING },
        vocals: { type: Type.STRING },
        effects: { type: Type.STRING },
        mastering: { type: Type.STRING }
      },
      required: ["mixing", "vocals", "effects", "mastering"]
    },
    analysis: {
      type: Type.OBJECT,
      properties: {
        theme: { type: Type.STRING, description: "The underlying theme (e.g., Sufism, Heroism)" },
        rhythmPattern: { type: Type.STRING, description: "The rhythmic cycle or vibe" },
        meter: { type: Type.STRING, description: "The specific Poetic Meter (Aruz) e.g., 'Fa'elatun...'" },
        imagery: { type: Type.STRING, description: "Key imagery elements found in the poem" },
        keywords: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key lexical terms extracted from the poem" }
      },
      required: ["theme", "rhythmPattern", "meter", "imagery", "keywords"]
    }
  },
  required: ["title", "emotion", "scale", "tempo", "timeSignature", "instruments", "mainMelody", "sections", "productionNotes", "analysis"]
};

export const generateSongFromPoem = async (poem: string): Promise<SongStructure> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
      You are an Advanced AI Music Architect (PhD Level) specialized in Persian Literature and Music Theory. 
      Your mission is to perform a deep multi-layer analysis of the input Persian poem and generate a mathematically and artistically perfect musical structure.

      ### PHASE 1: 5-LAYER POETRY ANALYSIS
      1. **Lexical Analysis**: Normalize text, extract key semantic terms (Keywords).
      2. **Emotion Analysis**: Classify into 'joy' (Shadi), 'sadness' (Gham), 'love' (Eshgh), 'epic' (Hemaseh), or 'mystical' (Erfan).
         - **Detection Logic**: Act as a scoring function. You MUST classify the emotion as 'mystical' if the text contains spiritual keywords such as 'عرفان' (Mysticism), 'سماع' (Sama), 'حق' (Truth/God), 'نور' (Light), 'جان' (Soul), 'ملکوت' (Kingdom), or 'حیرت' (Awe).
      3. **Rhythm & Meter**: Identify the exact Aruz meter (e.g., Hazaj, Ramal) and the rhythmic pulse.
      4. **Theme Analysis**: Determine the layer (Mystical, Lyrical, Social, Heroic, Reflective).
      5. **Semantic Structure**: Extract imagery, metaphors, and the dominant semantic field.

      ### PHASE 2: MUSIC GENERATION ENGINE
      You must strictly adhere to the following mappings based on the detected emotion:

      **A. Joy (Shadi)**
      - **Scale**: Major Scales (C Major, G Major) or Dastgah-e Mahur.
      - **Instruments**: Piano, Electric Guitar, Drums, Synthesizer, Bass.
      - **Tempo**: Exactly 120 BPM.
      - **Chords**: I-IV-V-I or I-V-vi-IV.

      **B. Sadness (Gham)**
      - **Scale**: Minor Scales (A Minor) or Dastgah-e Dashti, Afshari, Homayoun.
      - **Instruments**: Santur, Ney, Tar, Tonbak, Kamancheh.
      - **Tempo**: Exactly 70 BPM.
      - **Chords**: i-iv-v-i or vi-IV-I-V.

      **C. Love (Eshgh)**
      - **Scale**: Modal/Major or Dastgah-e Segah, Bayat-e Esfahan.
      - **Instruments**: Fusion (Santur, Piano, Violin, Drums, Bass).
      - **Tempo**: Exactly 90 BPM.
      - **Chords**: I-vi-IV-V or IV-I-V-vi.

      **D. Epic (Hemaseh)**
      - **Scale**: Minor/Phrygian or Dastgah-e Chahargah.
      - **Instruments**: Orchestral (Violin Section, Cello, French Horn, Trumpet, Timpani, Zarb-e Zurkhaneh).
      - **Tempo**: Exactly 110 BPM.
      - **Chords**: i-III-VII-i (Power/Heroic progressions).

      **E. Mystical (Erfan)**
      - **Scale**: Dastgah-e Nava, Bayat-e Esfahan, or Shoor.
      - **Instruments**: Sufi Ensemble (Tanboor, Setar, Daf, Ney).
      - **Tempo**: 80-100 BPM (Trance-like/Zekr).
      - **Chords**: Drone-based, Modal vamps, Sus chords.

      ### PHASE 3: COMPOSITION & STRUCTURE
      - **Main Melody**: Generate a sequence of at least 16 notes that fits the scale and emotion (e.g., "C4 D4 Eb4...").
      - **Structure**: Create a full song structure: Intro (4 bars), Verse (8 bars), Chorus (8 bars), Bridge (4 bars), Outro (4 bars).
      - **Engineering**: Provide professional production notes for Mixing, Vocals (based on Aruz weight), Effects (e.g., Reverb types), and Mastering.

      Return the result as a strict JSON object matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: poem,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: songSchema,
        temperature: 0.7
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SongStructure;
    } else {
      throw new Error("No data returned from Gemini");
    }
  } catch (error) {
    console.error("Error generating song:", error);
    throw error;
  }
};

export const generatePerformanceAudio = async (poem: string, emotion: Emotion): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Use Gemini 2.5 Flash TTS model which is reliable for Audio generation via REST
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: {
        parts: [
          { text: `Acting as a professional Persian vocalist and composer, recite the following poem with a strong melodic and rhythmic cadence appropriate for a song.
          
          Parameters:
          - Emotion: ${emotion}
          - Language: Persian (Farsi)
          - Style: Musical Recitation / Chant (Declamatory)
          
          Style Guide:
          - ${Emotion.JOY}: Upbeat, rhythmic, energetic tone.
          - ${Emotion.SADNESS}: Slow, melancholic, drawn-out vowels (Tahrir-like).
          - ${Emotion.LOVE}: Soft, romantic, whispery and expressive.
          - ${Emotion.EPIC}: Strong, booming, heroic delivery (Shahnameh style).
          - ${Emotion.MYSTICAL}: Meditative, trance-like, rhythmic Zekr style chanting.

          Lyrics:
          """
          ${poem}
          """
          
          Instructions:
          - Perform this as a musical chant or song-like recitation.
          - Emphasize the rhythm and rhyme of the poetry.` }
        ]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' },
          },
        },
      }
    });

    // Extract base64 audio
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!audioData) {
      throw new Error("No audio data generated");
    }

    return audioData;
  } catch (error) {
    console.error("Error generating song audio:", error);
    throw error;
  }
};
