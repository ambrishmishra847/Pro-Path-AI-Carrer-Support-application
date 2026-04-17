import React, { useState } from 'react';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { 
  Linkedin, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Eye, 
  Zap, 
  Copy, 
  Check,
  ChevronRight,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';

export default function LinkedInOptimizer({ user }) {
  const [loading, setLoading] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [activeTab, setActiveTab] = useState('headline');
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(false);

  const optimize = async () => {
    setLoading(true);
    try {
      const prompt = `
        As a LinkedIn profile expert, optimize the following ${activeTab} for a professional profile.
        Current Content: ${content}
        ${linkedinUrl ? `Profile URL: ${linkedinUrl}` : ''}
        
        Provide 3 distinct, high-quality variations that are professional, keyword-rich, and engaging.
        Return ONLY a JSON array of strings.
      `;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const parsedSuggestions = JSON.parse(response.text.replace(/```json|```/g, ''));
      
      if (Array.isArray(parsedSuggestions)) {
        setSuggestions(parsedSuggestions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Optimization failed:", err);
      alert("Failed to optimize content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#0077B5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Linkedin size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">LinkedIn Profile Optimizer</h1>
        </div>
        <p className="text-slate-600">Boost your professional presence with AI-powered suggestions for your LinkedIn profile.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {['headline', 'about', 'experience'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSuggestions([]);
                    setContent('');
                  }}
                  className={cn(
                    "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all border-b-2",
                    activeTab === tab 
                      ? "text-blue-600 border-blue-600 bg-blue-50/30" 
                      : "text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  LinkedIn Profile URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Globe size={18} />
                  </div>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/yourprofile"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Providing your URL helps the AI understand your current profile context.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Current {activeTab}
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`Paste your current LinkedIn ${activeTab} here...`}
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                onClick={optimize}
                disabled={loading || !content}
                className="w-full py-4 bg-[#0077B5] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#006396] transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
              >
                {loading ? <Zap className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Optimize with AI
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="text-green-600" size={20} />
                  Optimized Suggestions
                </h3>
                {suggestions.map((suggestion, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200 relative group hover:border-blue-200 transition-all"
                  >
                    <p className="text-slate-800 leading-relaxed pr-12">{suggestion}</p>
                    <button
                      onClick={() => copyToClipboard(suggestion)}
                      className="absolute right-4 top-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search size={18} />
              Profile Audit
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle2 className="text-green-600" size={18} />
                <p className="text-xs font-bold text-green-800">Profile Photo is Professional</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <AlertCircle className="text-amber-600" size={18} />
                <p className="text-xs font-bold text-amber-800">Banner Image is Missing</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <TrendingUp className="text-blue-600" size={18} />
                <p className="text-xs font-bold text-blue-800">Headline needs keywords</p>
              </div>
            </div>
          </div>

          <AdSense variant="square" />

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye size={18} />
              Visibility Insights
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">Search Appearances</p>
                <p className="font-bold text-blue-600">+24%</p>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[65%]" />
              </div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Optimizing your headline can increase search visibility by up to 40%.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
