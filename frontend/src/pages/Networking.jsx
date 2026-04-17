import React, { useState } from 'react';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { Mail, Send, Copy, CheckCircle2, Loader2, Sparkles, User as UserIcon, Briefcase, Link as LinkIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function Networking({ user }) {
  const [recipientName, setRecipientName] = useState('');
  const [recipientRole, setRecipientRole] = useState('Recruiter');
  const [company, setCompany] = useState('');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState('Professional');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMessage = async () => {
    if (!recipientName || !company || !context) {
      alert("Please fill in the recipient name, company, and context.");
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `
        Write a cold outreach/networking email or LinkedIn message.
        My Name: ${user.displayName}
        Recipient Name: ${recipientName}
        Recipient Role: ${recipientRole}
        Target Company: ${company}
        Context/Job Description: ${context}
        Tone: ${tone}

        The message should be concise, engaging, and personalized. Do not include placeholders like [Your Name], use the provided names. Include a clear call to action (e.g., a brief chat). Return ONLY the message content.
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setGeneratedMessage(response.text || '');
      setCopied(false);
    } catch (error) {
      console.error("Failed to generate message:", error);
      alert("Failed to generate message. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-12 text-center">
        <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Mail size={32} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Networking Message Generator</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Create personalized, high-converting outreach messages for recruiters, hiring managers, and alumni in seconds.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="text-teal-600" />
            Recipient Details
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
              <select
                value={recipientRole}
                onChange={(e) => setRecipientRole(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Recruiter">Recruiter</option>
                <option value="Hiring Manager">Hiring Manager</option>
                <option value="Alumni">Alumni</option>
                <option value="Industry Peer">Industry Peer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Target Company</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, Stripe"
                className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Context / Job Description</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste the job description, or explain why you are reaching out (e.g. 'Saw your post about the Frontend role...')"
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Tone</label>
            <div className="flex gap-2">
              {['Professional', 'Casual', 'Enthusiastic'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tone === t ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'} border`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateMessage}
            disabled={isGenerating}
            className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200 disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isGenerating ? 'Drafting Message...' : 'Generate Message'}
          </button>
        </div>

        {/* Output Area */}
        <div className="bg-slate-900 rounded-2xl p-6 flex flex-col h-full min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Send className="text-teal-400" />
              Generated Message
            </h2>
            {generatedMessage && (
              <button
                onClick={handleCopy}
                className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
              >
                {copied ? <CheckCircle2 size={16} className="text-teal-400" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          {generatedMessage ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 bg-slate-800 rounded-xl p-5 text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-700 overflow-y-auto"
            >
              {generatedMessage}
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center">
              <Mail size={48} className="mb-4 opacity-50" />
              <p>Fill out the details and click generate to draft your personalized networking message.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
