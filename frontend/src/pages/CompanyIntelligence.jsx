import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Building2, 
  Globe, 
  Target, 
  TrendingUp, 
  Users, 
  Zap, 
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Info,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from '../lib/utils';
import anime from 'animejs';

export default function CompanyIntelligence({ user }) {
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [intelligence, setIntelligence] = useState(null);
  const [error, setError] = useState(null);
  const cardRef = useRef(null);

  const fetchIntelligence = async () => {
    if (!companyName.trim()) return;
    setLoading(true);
    setError(null);
    setIntelligence(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Research and provide comprehensive intelligence for the company: "${companyName}". 
      Focus on information relevant to a job seeker.
      
      Provide a structured JSON response with:
      - companyOverview: { mission, industry, size, headquarters }
      - recentNews: array of { title, date, impact }
      - techStack: array of strings
      - interviewVibe: { difficulty, focusAreas, typicalQuestions }
      - cultureInsights: array of strings
      - keyLeadership: array of { name, role }
      
      Use Google Search grounding to ensure the information is current.
      Return ONLY the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        tools: [{ googleSearch: {} }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              companyOverview: {
                type: Type.OBJECT,
                properties: {
                  mission: { type: Type.STRING },
                  industry: { type: Type.STRING },
                  size: { type: Type.STRING },
                  headquarters: { type: Type.STRING }
                }
              },
              recentNews: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    date: { type: Type.STRING },
                    impact: { type: Type.STRING }
                  }
                }
              },
              techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
              interviewVibe: {
                type: Type.OBJECT,
                properties: {
                  difficulty: { type: Type.STRING },
                  focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  typicalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              cultureInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyLeadership: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      setIntelligence(data);
      
      // Animate card entrance
      setTimeout(() => {
        anime({
          targets: '.intel-card',
          translateY: [20, 0],
          opacity: [0, 1],
          delay: anime.stagger(100),
          easing: 'easeOutExpo',
          duration: 800
        });
      }, 100);

    } catch (err) {
      console.error("Intelligence fetch failed:", err);
      setError("Failed to gather intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <button 
            onClick={() => navigate('/')}
            className="mb-6 p-2 hover:bg-white rounded-xl transition-all flex items-center gap-2 text-slate-600 font-semibold"
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
              <Building2 size={28} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Company Intelligence</h1>
              <p className="text-slate-600">Get real-time insights and "cheat sheets" for any company using AI.</p>
            </div>
          </div>
        </header>

        <section className="max-w-3xl mx-auto mb-12">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <Search className="text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={24} />
            </div>
            <input 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchIntelligence()}
              placeholder="Enter company name (e.g. Google, NVIDIA, Stripe)..."
              className="w-full pl-16 pr-32 py-6 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl shadow-indigo-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-xl font-medium"
            />
            <button
              onClick={fetchIntelligence}
              disabled={loading || !companyName.trim()}
              className="absolute right-3 top-3 bottom-3 px-8 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
              Research
            </button>
          </div>
          {error && <p className="mt-4 text-center text-red-500 font-medium">{error}</p>}
        </section>

        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 animate-pulse" size={32} />
              </div>
              <h2 className="mt-8 text-2xl font-black text-slate-900">Gathering Intelligence...</h2>
              <p className="text-slate-500 mt-2">Gemini is scanning recent news, tech stacks, and interview data.</p>
            </motion.div>
          )}

          {intelligence && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column: Overview & Culture */}
              <div className="space-y-8">
                <div className="intel-card bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                      <Globe size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Overview</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Mission</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{intelligence.companyOverview.mission}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Industry</p>
                        <p className="text-sm font-bold text-slate-900">{intelligence.companyOverview.industry}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Size</p>
                        <p className="text-sm font-bold text-slate-900">{intelligence.companyOverview.size}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Headquarters</p>
                      <p className="text-sm font-bold text-slate-900">{intelligence.companyOverview.headquarters}</p>
                    </div>
                  </div>
                </div>

                <div className="intel-card bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/10 text-white rounded-xl flex items-center justify-center">
                      <Users size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Culture Insights</h3>
                  </div>
                  <ul className="space-y-4">
                    {intelligence.cultureInsights.map((insight, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-400">
                        <ShieldCheck className="text-indigo-400 shrink-0" size={18} />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Middle Column: News & Leadership */}
              <div className="space-y-8">
                <div className="intel-card bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Recent News</h3>
                  </div>
                  <div className="space-y-6">
                    {intelligence.recentNews.map((news, i) => (
                      <div key={i} className="group cursor-default">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{news.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap ml-2">{news.date}</span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{news.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="intel-card bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <Briefcase size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Key Leadership</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {intelligence.keyLeadership.map((leader, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{leader.name}</p>
                          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{leader.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Tech & Interview */}
              <div className="space-y-8">
                <div className="intel-card bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Zap size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Tech Stack</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {intelligence.techStack.map((tech, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-100">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="intel-card bg-indigo-600 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center">
                        <Target size={20} />
                      </div>
                      <h3 className="text-xl font-bold">Interview Vibe</h3>
                    </div>
                    
                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Difficulty Level</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black">{intelligence.interviewVibe.difficulty}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <div key={s} className={cn("w-1.5 h-4 rounded-full", s <= 4 ? "bg-white" : "bg-white/30")} />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Focus Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {intelligence.interviewVibe.focusAreas.map((area, i) => (
                            <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-bold">{area}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-2">Typical Questions</p>
                        <ul className="space-y-3">
                          {intelligence.interviewVibe.typicalQuestions.map((q, i) => (
                            <li key={i} className="text-xs text-indigo-50 flex gap-2">
                              <span className="text-indigo-300 font-bold">Q:</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <Sparkles className="absolute top-4 right-4 text-white/10" size={120} />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {!intelligence && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-40">
            <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
              <Info size={48} />
            </div>
            <h2 className="text-xl font-bold text-slate-400">Ready to research?</h2>
            <p className="text-slate-400 max-w-xs mt-2">Enter a company name above to generate your personalized interview cheat sheet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
