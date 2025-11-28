import React, { useState, useRef, useEffect } from 'react';
import { SongStructure, Emotion } from '../types';
import { PlayIcon, PauseIcon, SparklesIcon, MusicNoteIcon } from './Icons';
import StructureVisualizer from './StructureVisualizer';

interface SongCardProps {
  song: SongStructure;
  audioBase64: string | null;
}

const emotionColors = {
  [Emotion.JOY]: "from-yellow-500 to-orange-500",
  [Emotion.SADNESS]: "from-blue-600 to-indigo-800",
  [Emotion.LOVE]: "from-pink-500 to-rose-600",
  [Emotion.EPIC]: "from-red-600 to-slate-900",
  [Emotion.MYSTICAL]: "from-emerald-500 to-teal-700",
};

// --- Audio Decoding Utilities ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  try {
      const bufferCopy = data.buffer.slice(0); 
      return await ctx.decodeAudioData(bufferCopy);
  } catch (e) {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

      for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
      }
      return buffer;
  }
}

// --- WAV Encoding Utility ---
const writeWavHeader = (samples: Float32Array, sampleRate: number) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    const floatTo16BitPCM = (output: DataView, offset: number, input: Float32Array) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    floatTo16BitPCM(view, 44, samples);
    return view;
};

const SongCard: React.FC<SongCardProps> = ({ song, audioBase64 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);

  const gradient = emotionColors[song.emotion as Emotion] || "from-indigo-500 to-purple-600";

  // Initialize Audio Context and Decode
  useEffect(() => {
    if (!audioBase64) return;

    const initAudio = async () => {
      try {
        const Ctx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new Ctx({ sampleRate: 24000 }); // Gemini Audio uses 24kHz usually
        audioContextRef.current = ctx;

        const bytes = decodeBase64(audioBase64);
        const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
        setAudioBuffer(buffer);
        setIsAudioReady(true);
      } catch (e) {
        console.error("Audio decoding failed", e);
      }
    };

    initAudio();

    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, [audioBase64]);

  const togglePlayback = () => {
    if (!audioContextRef.current || !audioBuffer) return;

    if (isPlaying) {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
    } else {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => setIsPlaying(false);
        
        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
    }
  };

  const downloadAudio = () => {
      if (!audioBuffer) return;
      
      const channelData = audioBuffer.getChannelData(0); // Mono
      const wavView = writeWavHeader(channelData, audioBuffer.sampleRate);
      const blob = new Blob([wavView], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${song.title.replace(/\s+/g, '_')}_barbat_ai_song.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );

  return (
    <div className="w-full animate-fade-in space-y-6">
      {/* Header Card */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-8 shadow-2xl`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 rounded-full text-white backdrop-blur-md shadow-sm">
                    {song.emotion}
                </span>
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/10 rounded-full text-white backdrop-blur-md border border-white/20">
                    {song.scale}
                </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 font-poetic leading-tight">{song.title}</h2>
            <p className="text-white/90 text-sm md:text-base max-w-xl italic">
              "{song.analysis.theme}"
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
             <div className="text-right bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                <p className="text-white/70 text-[10px] uppercase tracking-widest">Tempo</p>
                <p className="text-white font-mono text-xl leading-none">{song.tempo} <span className="text-sm">BPM</span></p>
             </div>
             <div className="text-right bg-black/20 p-2 rounded-lg backdrop-blur-sm">
                <p className="text-white/70 text-[10px] uppercase tracking-widest">Time Sig</p>
                <p className="text-white font-mono text-xl leading-none">{song.timeSignature}</p>
             </div>
          </div>
        </div>

        {/* Playback Control */}
        <div className="relative z-10 mt-8 flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                  onClick={togglePlayback}
                  disabled={!isAudioReady}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-colors shadow-lg active:scale-95
                      ${!isAudioReady 
                          ? 'bg-white/50 text-slate-500 cursor-not-allowed' 
                          : 'bg-white text-slate-900 hover:bg-slate-100'}`}
              >
                  {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                  {isPlaying ? "Pause" : (isAudioReady ? "Play Song" : "Composing Audio...")}
              </button>

              {isAudioReady && (
                <button 
                  onClick={downloadAudio}
                  className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors backdrop-blur-sm"
                  title="Download Song (WAV)"
                >
                  <DownloadIcon className="w-5 h-5" />
                </button>
              )}
            </div>
            
             {/* Melody Strip */}
            <div className="flex-1 w-full md:w-auto overflow-hidden bg-black/20 rounded-lg p-2 backdrop-blur-sm border border-white/10">
                <p className="text-[10px] text-white/60 uppercase tracking-widest mb-1">Generated Motif</p>
                <p className="text-white font-mono text-xs whitespace-nowrap overflow-x-auto">
                    {song.mainMelody}
                </p>
            </div>
        </div>
      </div>

      {/* Visualizer */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
             <MusicNoteIcon className="w-5 h-5 text-indigo-400" />
             <h3 className="text-lg font-semibold">Composition Structure</h3>
          </div>
          <StructureVisualizer 
            sections={song.sections} 
            isPlaying={isPlaying} 
            tempo={song.tempo} 
            onComplete={() => setIsPlaying(false)} 
          />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Instruments */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Instrumentation</h3>
            <div className="flex flex-wrap gap-2">
                {song.instruments.map((inst, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-md text-sm border border-slate-700 hover:border-indigo-500/50 transition-colors">
                        {inst}
                    </span>
                ))}
            </div>
        </div>

        {/* Production Notes */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 border-b border-slate-700 pb-2">Engineering & Production</h3>
            <ul className="space-y-3 text-sm text-slate-400">
                <li className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-indigo-400 font-semibold">Mixing:</span>
                    <span>{song.productionNotes.mixing}</span>
                </li>
                <li className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-indigo-400 font-semibold">Vocals:</span>
                    <span>{song.productionNotes.vocals}</span>
                </li>
                <li className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-indigo-400 font-semibold">FX:</span>
                    <span>{song.productionNotes.effects}</span>
                </li>
                <li className="grid grid-cols-[80px_1fr] gap-2">
                    <span className="text-indigo-400 font-semibold">Mastering:</span>
                    <span>{song.productionNotes.mastering}</span>
                </li>
            </ul>
        </div>
      </div>
      
      {/* Deep Analysis */}
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2 border-b border-slate-700 pb-2">
            <SparklesIcon className="w-5 h-5 text-yellow-400" />
            5-Layer Poetic Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Layer 1: Keywords */}
             <div className="md:col-span-2">
               <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider font-bold">1. Lexical Analysis (Keywords)</p>
               <div className="flex flex-wrap gap-2">
                  {song.analysis.keywords?.map((k, i) => (
                      <span key={i} className="text-xs text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded border border-indigo-500/20">{k}</span>
                  ))}
               </div>
            </div>

            {/* Layer 3: Meter */}
            <div>
               <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">3. Metric Analysis (Aruz)</p>
               <p className="text-slate-200 font-medium font-poetic text-lg">
                 {song.analysis.meter}
               </p>
            </div>

            {/* Layer 3b: Rhythm */}
            <div>
               <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">Rhythmic Pattern</p>
               <p className="text-slate-200 font-medium">
                 {song.analysis.rhythmPattern}
               </p>
            </div>

            {/* Layer 4 & 5: Imagery & Theme */}
            <div className="md:col-span-2 bg-slate-800/50 p-4 rounded-lg">
               <div className="mb-3">
                   <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">4. Thematic Layer</p>
                   <p className="text-slate-300 text-sm">{song.analysis.theme}</p>
               </div>
               <div>
                   <p className="text-slate-500 text-xs mb-1 uppercase tracking-wider font-bold">5. Semantic Imagery</p>
                   <p className="text-slate-300 italic text-sm">
                     "{song.analysis.imagery}"
                   </p>
               </div>
            </div>
          </div>
      </div>

    </div>
  );
};

export default SongCard;