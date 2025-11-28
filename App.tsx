import React, { useState } from 'react';
import { generateSongFromPoem, generatePerformanceAudio } from "./services/openrouterService";
import { SongStructure } from './types';
import SongCard from './components/SongCard';
import { SparklesIcon } from './components/Icons';

const samplePoems = [
  { 
    label: "✨ Mystical (Rumi - Molana)", 
    text: "ماییم و موج سودا شب تا به روز تنها\nخواهی بیا ببخشا خواهی برو جفا کن\nاز آتش حسرت بین دودی ز من برخاست\nتو نیز ندانم من خاکستری یا کن" 
  },
  { 
    label: "🌌 Divine (Rumi - Bi Hamgan)", 
    text: "بی همگان به سر شود بی‌تو به سر نمی‌شود\nداغ تو دارد این دلم جای دگر نمی‌شود\nدیده عقل مست تو چرخه چرخ پست تو\nگوش طرب به دست تو بی‌تو به سر نمی‌شود" 
  },
  { 
    label: "🕯️ Mystical Light (Rumi)", 
    text: "این خانه که پیوسته در او بانگ چغانه است\nاز خواجه بپرسید که این خانه چه خانه است\nاین صورت بت چیست اگر صورت آن نیست\nاین نور خدا چیست اگر کفر و مغانه است" 
  },
  { 
    label: "✨ Heavenly (Rumi - Malakoot)", 
    text: "من مرغ باغ ملکوتم نیم از عالم خاک\nچند روزی قفسی ساخته‌اند از بدنم\nای خوش آن روز که پرواز کنم تا بر دوست\nبه هوای سر کویش پر و بالی بزنم" 
  },
  { 
    label: "🌀 Cosmic Dance (Rumi - Atoms)", 
    text: "ای روز برآ که ذره‌ها رقص کنند\nآن کس که از او چرخ و هوا رقص کنند\nجان‌ها ز خوشی بی‌سر و پا رقص کنند\nدر گوش تو گویم که کجا رقص کنند" 
  },
  { 
    label: "🔮 The Sama (Rumi - Trance)", 
    text: "سماع راست که جان‌ها در او به رقص آیند\nدلی که بی‌خود و هوش است او چه داند چیست\nبیا که نور حقایق در این سماع پیداست\nببین که جان و جهان در سماع ما پیداست" 
  },
  { 
    label: "🕊️ Spiritual (Rumi - Pilgrimage)", 
    text: "ای قوم به حج رفته کجایید کجایید\nمعشوق همین جاست بیایید بیایید\nمعشوق تو همسایه و دیوار به دیوار\nدر بادیه سرگشته شما در چه هوایید" 
  },
  { 
    label: "🔥 Rebirth (Rumi - Morde Bodam)", 
    text: "مرده بدم زنده شدم گریه بدم خنده شدم\nدولت عشق آمد و من دولت پاینده شدم\nدیده سیر است مرا جان دلیر است مرا\nزهره شیر است مرا زهره تابنده شدم" 
  },
  { 
    label: "⚔️ Epic (Ferdowsi)", 
    text: "که گفتت برو دست رستم ببند\nنبندد مرا دست چرخ بلند\nاگر چرخ گردان کشد زین نشان\nبه گرز گرانش کنم ناتوان" 
  },
  { 
    label: "❤️ Love (Moshiri)", 
    text: "بی تو مهتاب شبی باز از آن کوچه گذشتم\nهمه تن چشم شدم خیره به دنبال تو گشتم\nشوق دیدار تو لبریز شد از جام وجودم\nشدم آن عاشق دیوانه که بودم" 
  }
];

const App: React.FC = () => {
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [song, setSong] = useState<SongStructure | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!poem.trim()) return;
    
    setLoading(true);
    setLoadingStep("Analyzing Structure...");
    setError(null);
    setSong(null);
    setAudioData(null);
    
    try {
      // Step 1: Analyze and Generate Structure
      const structureResult = await generateSongFromPoem(poem);
      console.log("Generated Song Structure:", structureResult); // Log structure for debugging/demo
      setSong(structureResult);

      // Step 2: Generate Audio based on the analyzed emotion
      setLoadingStep("Composing Song...");
      const audioResult = await generatePerformanceAudio(poem, structureResult.emotion);
      setAudioData(audioResult);

    } catch (err) {
      console.error(err);
      setError("Failed to generate composition. Please check your API key and try again.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-4 py-12">
        
        {/* Header */}
        <header className="text-center mb-16 animate-fade-in-down">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-full ring-1 ring-indigo-500/50">
                <SparklesIcon className="w-10 h-10 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 mb-4 tracking-tight">
            Barbat AI
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Transform Persian poetry into musical masterpieces using Generative AI. 
            Analyze emotion, rhythm, and structure to create the perfect Farsi song.
          </p>
        </header>

        {/* Input Section */}
        <section className="max-w-3xl mx-auto mb-16 relative z-10">
          <div className="bg-slate-800/50 p-1 rounded-2xl shadow-xl ring-1 ring-white/10 backdrop-blur-xl">
            <div className="bg-[#0f172a] rounded-xl p-6">
                <label className="block text-sm font-medium text-slate-400 mb-2">
                    Enter Persian Poem
                </label>
                <textarea
                    value={poem}
                    onChange={(e) => setPoem(e.target.value)}
                    placeholder="e.g. بوی جوی مولیان آید همی..."
                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 text-right text-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-poetic leading-loose transition-all"
                    dir="rtl"
                />
                
                {/* Sample Poems Buttons */}
                <div className="mt-3 flex flex-wrap gap-2 justify-end">
                    <span className="text-xs text-slate-500 self-center">Try a sample:</span>
                    {samplePoems.map((sample, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPoem(sample.text)}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-full border border-slate-700 transition-colors"
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex justify-between items-center border-t border-slate-800 pt-4">
                    <div className="text-xs text-slate-500">
                        Supports classical and modern Persian poetry.
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={loading || !poem.trim()}
                        className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-all duration-300 flex items-center gap-2
                            ${loading || !poem.trim() 
                                ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                                : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-95'
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {loadingStep}
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Compose Song
                            </>
                        )}
                    </button>
                </div>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
            <div className="max-w-3xl mx-auto mb-12 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-center animate-pulse">
                {error}
            </div>
        )}

        {/* Results Section */}
        {song && (
            <section className="animate-fade-in-up">
                <SongCard song={song} audioBase64={audioData} />
            </section>
        )}

        {/* Empty State / Decorative Background */}
        {!song && !loading && (
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
                <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]"></div>
            </div>
        )}

      </div>
    </div>
  );
};

export default App;