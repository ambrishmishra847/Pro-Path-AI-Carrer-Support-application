import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  PieChart,
  Target,
  Wand2,
  Globe,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
];

export default function SalaryInsights({ user }) {
  const [loading, setLoading] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [yearsOfExperience, setYearsOfExperience] = useState('5');
  const [results, setResults] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `
        Provide realistic salary data and negotiation tips for the following:
        Job Title: ${jobTitle}
        Location: ${location}
        Currency: ${selectedCurrency.code}
        Experience Level: ${experienceLevel}
        Years of Experience: ${yearsOfExperience}

        Return ONLY a JSON response with this structure:
        {
          "median": number,
          "range": [min, max],
          "percentile": number (e.g. 75),
          "marketTrend": "up" | "stable" | "down",
          "confidence": "Low" | "Medium" | "High",
          "factors": {
            "companySize": string,
            "industry": string,
            "experience": string
          },
          "negotiationTips": [string, string, string, string, string],
          "sampleScript": string
        }
        
        Note:
        - CRITICAL: All numerical values for "median" and "range" MUST be in ${selectedCurrency.code} currency, NOT USD.
        - Provide numbers that reflect the actual local market values in ${location} for ${yearsOfExperience} years of experience.
        - For example, if the currency is INR, the numbers should be in the range of lakhs/crores (e.g., 2000000), not USD equivalents like 25000.
        - The "sampleScript" MUST be a detailed negotiation coach script specifically tailored for someone with ${yearsOfExperience} years of experience in this role/location.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsedData = JSON.parse(response.text.replace(/```json|```/g, ''));
      setResults(parsedData);
    } catch (err) {
      console.error("Salary Insights Fetch Error:", err);
      setError("Failed to fetch accurate salary data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            {selectedCurrency.code === 'USD' ? <DollarSign size={24} /> : <div className="text-xl font-bold">{selectedCurrency.symbol}</div>}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Salary Insights & Negotiation</h1>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm md:text-base">Get real-time market data and AI-powered negotiation strategies based on your location and experience.</p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Globe size={16} className="text-slate-400" />
            <select 
              value={selectedCurrency.code}
              onChange={(e) => {
                setSelectedCurrency(CURRENCIES.find(c => c.code === e.target.value));
                setResults(null); // Clear results to avoid symbol/value mismatch
              }}
              className="text-sm font-semibold text-slate-700 bg-transparent border-none focus:ring-0 cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Experience Level</label>
                <select 
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                >
                  <option value="entry">Entry Level (Fresher)</option>
                  <option value="mid">Mid Level (Associate)</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Management</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(e.target.value)}
                  placeholder="Years"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button
              onClick={fetchInsights}
              disabled={loading || !jobTitle || !location}
              className="w-full py-4 bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-900/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Get Local Salary Insights
            </button>
          </div>

          <AnimatePresence mode="wait">
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Median Salary ({selectedCurrency.code})</p>
                      <h2 className="text-4xl font-black text-slate-900">{selectedCurrency.symbol}{results.median.toLocaleString()}</h2>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl border flex items-center gap-2 font-bold",
                      results.marketTrend === 'up' ? "bg-green-50 text-green-600 border-green-100" : 
                      results.marketTrend === 'down' ? "bg-red-50 text-red-600 border-red-100" :
                      "bg-blue-50 text-blue-600 border-blue-100"
                    )}>
                      {results.marketTrend === 'up' && <TrendingUp size={18} />}
                      <span className="capitalize">Market {results.marketTrend}</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-600 mb-2">
                        <span>{selectedCurrency.symbol}{results.range[0].toLocaleString()}</span>
                        <span>{selectedCurrency.symbol}{results.range[1].toLocaleString()}</span>
                      </div>
                      <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ left: '20%', right: '20%' }}
                        />
                        <div 
                          className="absolute top-0 w-1 h-full bg-slate-900 shadow-lg transition-all duration-1000"
                          style={{ left: '50%' }}
                        />
                      </div>
                      <p className="text-center text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Typical local range for this role</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Local Percentile</p>
                        <p className="text-xl font-bold text-slate-900">{results.percentile}th</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Data Confidence</p>
                        <p className="text-xl font-bold text-slate-900">{results.confidence}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Wand2 className="text-blue-600" size={20} />
                    AI Negotiation Strategy
                  </h3>
                  <div className="space-y-4">
                    {results.negotiationTips.map((tip, idx) => (
                      <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0 font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 size={18} />
              Local Market Factors
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Company Size</span>
                <span className="font-bold text-slate-900">{results?.factors?.companySize || 'Standard'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Primary Industry</span>
                <span className="font-bold text-slate-900">{results?.factors?.industry || 'General'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Expertise Level</span>
                <span className="font-bold text-slate-900">{results?.factors?.experience || 'Professional'}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t">
                <span className="text-slate-600">Location Cost Index</span>
                <span className="font-bold text-slate-900">{location || 'Global'}</span>
              </div>
            </div>
          </div>

          <AdSense variant="square" />

          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl shadow-green-900/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Target size={18} />
              Negotiation Coach
            </h3>
            <p className="text-sm opacity-90 leading-relaxed mb-4 italic">
              {results?.sampleScript || `"I am very excited about the opportunity to join the team. Based on my research of the market rate for this role in ${location || 'this region'} and the specific value I bring, I was expecting a base salary in the range of..."`}
            </p>
            <button 
              onClick={() => {
                if (results?.sampleScript) {
                  navigator.clipboard.writeText(results.sampleScript);
                  alert("Negotiation script copied to clipboard!");
                }
              }}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-all"
            >
              Copy Local Script
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
