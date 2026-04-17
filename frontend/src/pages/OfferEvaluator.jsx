import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { DollarSign, Plus, Trash2, Scale, Bot, Send, Loader2, CheckCircle2, AlertCircle, TrendingUp, Briefcase, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
];

export default function OfferEvaluator({ user }) {
  const [offers, setOffers] = useState([
    { id: '1', company: 'Tech Corp', role: 'Software Engineer', baseSalary: 120000, bonus: 15000, equity: 50000, pto: 20, benefits: 'Full Health, 401k Match' }
  ]);
  
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  
  const [chatMessages, setChatMessages] = useState([
    { role: 'model', text: "Hi! I'm your AI negotiation coach. Select an offer above, and let's practice your negotiation strategy. What are you hoping to ask for?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('1');
  const chatEndRef = useRef(null);

  const addOffer = () => {
    const newOffer = {
      id: Date.now().toString(),
      company: 'New Company',
      role: 'Role',
      baseSalary: 0,
      bonus: 0,
      equity: 0,
      pto: 0,
      benefits: ''
    };
    setOffers([...offers, newOffer]);
    if (offers.length === 0) setSelectedOfferId(newOffer.id);
  };

  const updateOffer = (id, field, value) => {
    setOffers(offers.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  const removeOffer = (id) => {
    const newOffers = offers.filter(o => o.id !== id);
    setOffers(newOffers);
    if (selectedOfferId === id && newOffers.length > 0) {
      setSelectedOfferId(newOffers[0].id);
    } else if (newOffers.length === 0) {
      setSelectedOfferId('');
    }
  };

  const calculateTotalComp = (offer) => {
    // Assuming equity is over 4 years for a rough annual estimate
    return offer.baseSalary + offer.bonus + (offer.equity / 4);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiThinking]);

  const handleSendMessage = async () => {
    if (!aiInput.trim()) return;

    const selectedOffer = offers.find(o => o.id === selectedOfferId);
    if (!selectedOffer) {
      alert("Please select an offer to negotiate first.");
      return;
    }

    const newUserMsg = { role: 'user', text: aiInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      const systemInstruction = `You are an expert technical recruiter role-playing a salary negotiation. 
          The candidate is negotiating this offer:
          Company: ${selectedOffer.company}
          Role: ${selectedOffer.role}
          Base: ${selectedCurrency.symbol}${selectedOffer.baseSalary}
          Bonus: ${selectedCurrency.symbol}${selectedOffer.bonus}
          Equity: ${selectedCurrency.symbol}${selectedOffer.equity}
          Currency: ${selectedCurrency.code}
          
          Respond as the recruiter. Be professional but realistic. Push back slightly if they ask for too much, but concede if they make good arguments. Keep responses concise (1-2 paragraphs).`;

      const history = chatMessages.filter(m => m.role !== 'model' || m.text !== "Hi! I'm your AI negotiation coach. Select an offer above, and let's practice your negotiation strategy. What are you hoping to ask for?");
      
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        systemInstruction,
        contents: history.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })).concat([{ role: 'user', parts: [{ text: newUserMsg.text }] }])
      });
      
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "I'm not sure how to respond to that." }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Let's try again." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="mb-12 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Scale size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Offer Evaluator & Negotiation</h1>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
          <p className="text-slate-600 max-w-2xl">
            Compare multiple job offers side-by-side and practice your negotiation strategy with our AI Recruiter.
          </p>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Globe size={16} className="text-slate-400" />
            <select 
              value={selectedCurrency.code}
              onChange={(e) => setSelectedCurrency(CURRENCIES.find(c => c.code === e.target.value))}
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
        {/* Offer Comparison Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="text-rose-600" />
              Compare Offers
            </h2>
            <button
              onClick={addOffer}
              className="px-4 py-2 bg-rose-50 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> Add Offer
            </button>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              <AnimatePresence>
                {offers.map((offer) => (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`w-80 bg-white rounded-2xl border-2 transition-all ${selectedOfferId === offer.id ? 'border-rose-500 shadow-lg shadow-rose-100' : 'border-slate-200 shadow-sm'}`}
                    onClick={() => setSelectedOfferId(offer.id)}
                  >
                    <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                      <div className="flex-1">
                        <input
                          value={offer.company}
                          onChange={(e) => updateOffer(offer.id, 'company', e.target.value)}
                          className="font-bold text-lg text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                          placeholder="Company Name"
                        />
                        <input
                          value={offer.role}
                          onChange={(e) => updateOffer(offer.id, 'role', e.target.value)}
                          className="text-sm text-slate-500 bg-transparent border-none focus:ring-0 p-0 w-full"
                          placeholder="Job Title"
                        />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); removeOffer(offer.id); }} className="text-slate-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Base Salary</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2 text-slate-400 font-medium">{selectedCurrency.symbol}</span>
                          <input
                            type="number"
                            value={offer.baseSalary || ''}
                            onChange={(e) => updateOffer(offer.id, 'baseSalary', Number(e.target.value))}
                            className="w-full p-2 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Sign-on / Bonus</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2 text-slate-400 font-medium">{selectedCurrency.symbol}</span>
                          <input
                            type="number"
                            value={offer.bonus || ''}
                            onChange={(e) => updateOffer(offer.id, 'bonus', Number(e.target.value))}
                            className="w-full p-2 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Equity (Total)</label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-2 text-slate-400 font-medium">{selectedCurrency.symbol}</span>
                          <input
                            type="number"
                            value={offer.equity || ''}
                            onChange={(e) => updateOffer(offer.id, 'equity', Number(e.target.value))}
                            className="w-full p-2 pl-10 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">PTO Days</label>
                          <input
                            type="number"
                            value={offer.pto || ''}
                            onChange={(e) => updateOffer(offer.id, 'pto', Number(e.target.value))}
                            className="w-full p-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Benefits Notes</label>
                        <textarea
                          value={offer.benefits}
                          onChange={(e) => updateOffer(offer.id, 'benefits', e.target.value)}
                          rows={2}
                          className="w-full p-2 mt-1 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none text-sm"
                          placeholder="401k, Health, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="p-5 bg-slate-50 rounded-b-xl border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">Est. Annual Total</span>
                        <span className="font-bold text-rose-600 text-lg">
                          {selectedCurrency.symbol}{calculateTotalComp(offer).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 text-right">*Assumes 4-year equity vest</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {offers.length === 0 && (
                <div className="w-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  <Briefcase size={48} className="mb-4 opacity-50" />
                  <p>Add an offer to start comparing.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Negotiation Simulator */}
        <div className="bg-slate-900 rounded-2xl flex flex-col h-[600px] border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-white">AI Recruiter</h3>
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Negotiation Simulator
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-rose-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiThinking && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-slate-800 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={isAiThinking || !aiInput.trim()}
                className="p-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Practicing for {offers.find(o => o.id === selectedOfferId)?.company || 'a company'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
