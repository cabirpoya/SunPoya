export enum Emotion {
  JOY = 'joy',
  SADNESS = 'sadness',
  LOVE = 'love',
  EPIC = 'epic',
  MYSTICAL = 'mystical'
}

export interface SongSection {
  name: string;
  bars: number;
  chords: string[];
  instruments: string[];
  description: string;
}

export interface SongStructure {
  title: string;
  emotion: Emotion;
  scale: string; // e.g., "Homayoun", "Mahur", "C Major"
  tempo: number;
  timeSignature: string;
  instruments: string[];
  mainMelody: string; // Representation of the main motif notes
  sections: SongSection[];
  productionNotes: {
    mixing: string;
    vocals: string;
    effects: string;
    mastering: string;
  };
  analysis: {
    theme: string;
    rhythmPattern: string;
    meter: string;
    imagery: string;
    keywords: string[]; // Lexical analysis results
  };
}