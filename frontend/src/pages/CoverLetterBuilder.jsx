import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Loader2, 
  Download,
  Eye,
  FileText,
  Building,
  User as UserIcon,
  Globe,
  Palette,
  Layout,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';
import html2pdf from 'html2pdf.js';

const TEMPLATES = [
  { id: 'classic', name: 'Classic', description: 'Traditional serif style', image: 'https://picsum.photos/seed/cl-classic/400/600' },
  { id: 'modern', name: 'Modern', description: 'Clean sans-serif design', image: 'https://picsum.photos/seed/cl-modern/400/600' },
  { id: 'ms-blue-grey', name: 'MS Blue Grey', description: 'Inspired by Microsoft Word', image: 'https://picsum.photos/seed/cl-ms-blue/400/600' },
  { id: 'ms-modern', name: 'MS Modern', description: 'Clean Microsoft style', image: 'https://picsum.photos/seed/cl-ms-mod/400/600' },
  { id: 'ms-simple', name: 'MS Simple', description: 'Basic Microsoft layout', image: 'https://picsum.photos/seed/cl-ms-simple/400/600' },
  { id: 'ms-professional', name: 'MS Professional', description: 'Traditional MS Word', image: 'https://picsum.photos/seed/cl-ms-prof/400/600' },
];

const ACCENT_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#059669', // Green
  '#dc2626', // Red
  '#d97706', // Amber
  '#0f172a', // Slate
  '#db2777', // Pink
];

export default function CoverLetterBuilder({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('editor');
  const [letter, setLetter] = useState({
    userId: user.id,
    title: 'Untitled Cover Letter',
    recipientName: '',
    recipientTitle: '',
    companyName: '',
    content: '',
    templateId: 'classic',
    accentColor: '#2563eb',
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    if (id) {
      const fetchLetter = async () => {
        try {
          const data = await api.coverLetters.get(id);
          if (data) setLetter(data);
        } catch (err) {
          console.error("Fetch failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchLetter();
    }
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await api.coverLetters.update(id, letter);
      } else {
        const newLetter = await api.coverLetters.create(letter);
        navigate(`/cover-letter/${newLetter._id}`, { replace: true });
      }
      alert('Cover letter saved successfully!');
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setLetter(prev => ({ ...prev, [field]: value }));
  };

  const handleDownload = () => {
    const element = document.getElementById('letter-preview-content');
    if (!element) return;
    const opt = {
      margin: 0.5,
      filename: `${letter.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const generateContent = async () => {
    setLoading(true);
    try {
      const prompt = `Write a professional cover letter for a job application. 
      Recipient: ${letter.recipientName} (${letter.recipientTitle})
      Company: ${letter.companyName}
      Applicant: ${user.displayName}
      
      The letter should be professional, concise, and tailored to a modern workplace. 
      Include placeholders for specific skills if needed, but try to make it a solid draft.`;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      if (response.text) {
        updateField('content', response.text);
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert('Failed to generate content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
              <ArrowLeft size={20} />
            </button>
            <input
              value={letter.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 text-lg"
              placeholder="Untitled Cover Letter"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2"
            >
              {view === 'editor' ? <Eye size={18} /> : <FileText size={18} />}
              {view === 'editor' ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save
            </button>
            {view === 'preview' && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
              >
                <Download size={18} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Editor */}
          <div className={cn("flex-1 space-y-8", view === 'preview' && "hidden lg:block lg:max-w-md")}>
            {/* Template Selection */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Layout className="text-blue-600" size={20} />
                <h2 className="font-bold text-slate-900">Design & Layout</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Choose Template</label>
                  <div className="grid grid-cols-2 gap-3">
                    {TEMPLATES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => updateField('templateId', t.id)}
                        className={cn(
                          "group p-0 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                          letter.templateId === t.id 
                            ? "border-blue-600 bg-blue-50" 
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "aspect-[3/4] w-full relative overflow-hidden bg-slate-100",
                          letter.templateId === t.id && "ring-2 ring-blue-600 ring-inset"
                        )}>
                          {t.image ? (
                            <img 
                              src={t.image} 
                              alt={t.name} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col p-2 gap-1 opacity-40">
                              <div className="w-full h-2 bg-slate-400 rounded-full" />
                              <div className="w-2/3 h-1 bg-slate-300 rounded-full" />
                              <div className="mt-2 space-y-1">
                                <div className="w-full h-1 bg-slate-200 rounded-full" />
                                <div className="w-full h-1 bg-slate-200 rounded-full" />
                                <div className="w-3/4 h-1 bg-slate-200 rounded-full" />
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-bold uppercase tracking-wider">Preview Template</span>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="font-bold text-[11px] text-slate-900">{t.name}</p>
                          <p className="text-[9px] text-slate-500 leading-tight">{t.description}</p>
                        </div>
                        
                        {letter.templateId === t.id && (
                          <div className="absolute top-1 right-1 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Accent Color</label>
                  <div className="flex flex-wrap gap-3">
                    {ACCENT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => updateField('accentColor', color)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          letter.accentColor === color ? "border-slate-900 scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Building className="text-blue-600" size={20} />
                <h2 className="font-bold text-slate-900">Recipient Details</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Recipient Name</label>
                  <input
                    value={letter.recipientName || ''}
                    onChange={(e) => updateField('recipientName', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Recipient Title</label>
                  <input
                    value={letter.recipientTitle || ''}
                    onChange={(e) => updateField('recipientTitle', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Hiring Manager"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Company Name</label>
                  <input
                    value={letter.companyName || ''}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Tech Corp"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} />
                  <h2 className="font-bold text-slate-900">Letter Content</h2>
                </div>
                <button 
                  onClick={generateContent}
                  className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all"
                >
                  <Sparkles size={14} /> AI Generate Draft
                </button>
              </div>
              <textarea
                value={letter.content || ''}
                onChange={(e) => updateField('content', e.target.value)}
                rows={20}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none font-serif text-lg leading-relaxed"
                placeholder="Start writing your cover letter here..."
              />
            </section>

            <AdSense variant="horizontal" />
          </div>

          {/* Preview */}
          <div className={cn("flex-1", view === 'editor' && "hidden lg:block")}>
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden sticky top-32">
              <div id="letter-preview-content" className={cn(
                "p-16 min-h-[1056px] bg-white text-slate-900",
                (letter.templateId === 'classic' || letter.templateId === 'ms-professional') ? "font-serif" : "font-sans"
              )}>
                {/* Classic Template */}
                {letter.templateId === 'classic' && (
                  <>
                    <div className="mb-12">
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">{user.displayName}</h1>
                      <p className="text-slate-600">{user.email}</p>
                      <p className="text-slate-500 text-sm mt-4">{new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="mb-12">
                      {letter.recipientName && <p className="font-bold">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p>{letter.recipientTitle}</p>}
                      {letter.companyName && <p>{letter.companyName}</p>}
                    </div>

                    <div className="prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-800">
                        {letter.content || 'Your cover letter content will appear here...'}
                      </div>
                    </div>

                    <div className="mt-12">
                      <p>Sincerely,</p>
                      <p className="mt-8 font-bold">{user.displayName}</p>
                    </div>
                  </>
                )}

                {/* Modern Template */}
                {letter.templateId === 'modern' && (
                  <>
                    <header className="mb-12 border-b-4 pb-8" style={{ borderColor: letter.accentColor }}>
                      <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: letter.accentColor }}>{user.displayName}</h1>
                      <div className="flex gap-4 text-sm font-bold text-slate-500">
                        <span>{user.email}</span>
                        <span>{new Date().toLocaleDateString()}</span>
                      </div>
                    </header>

                    <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2">To:</p>
                      {letter.recipientName && <p className="font-bold text-lg">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p className="text-slate-600">{letter.recipientTitle}</p>}
                      {letter.companyName && <p className="text-slate-500">{letter.companyName}</p>}
                    </div>

                    <div className="whitespace-pre-wrap text-lg leading-relaxed text-slate-800 mb-12">
                      {letter.content || 'Your cover letter content will appear here...'}
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <p className="text-slate-500 mb-4">Best regards,</p>
                      <p className="text-xl font-bold" style={{ color: letter.accentColor }}>{user.displayName}</p>
                    </div>
                  </>
                )}

                {/* MS Blue Grey Template */}
                {letter.templateId === 'ms-blue-grey' && (
                  <div className="text-[13px] leading-relaxed">
                    <header className="bg-slate-700 text-white p-8 -mx-16 -mt-16 mb-12 flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold mb-1 uppercase tracking-tight">{user.displayName}</h1>
                        <p className="text-lg opacity-90 font-medium">{user.email}</p>
                      </div>
                      <div className="text-right opacity-80">
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </header>

                    <div className="mb-12">
                      {letter.recipientName && <p className="font-bold text-slate-700">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p className="text-slate-500">{letter.recipientTitle}</p>}
                      {letter.companyName && <p className="text-slate-500">{letter.companyName}</p>}
                    </div>

                    <div className="whitespace-pre-wrap text-slate-800 mb-12">
                      {letter.content || 'Your cover letter content will appear here...'}
                    </div>

                    <div className="mt-12">
                      <p>Sincerely,</p>
                      <p className="mt-6 font-bold text-slate-700">{user.displayName}</p>
                    </div>
                  </div>
                )}

                {/* MS Modern Template */}
                {letter.templateId === 'ms-modern' && (
                  <div className="text-sm">
                    <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-12">
                      <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{user.displayName}</h1>
                        <p className="text-lg font-bold text-slate-500">{user.email}</p>
                      </div>
                      <div className="text-right font-bold text-slate-600">
                        <p>{new Date().toLocaleDateString()}</p>
                      </div>
                    </header>

                    <div className="mb-12">
                      {letter.recipientName && <p className="font-black text-slate-900 uppercase text-xs mb-1">Recipient</p>}
                      {letter.recipientName && <p className="font-bold text-lg">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p className="text-slate-600">{letter.recipientTitle}</p>}
                      {letter.companyName && <p className="text-slate-500">{letter.companyName}</p>}
                    </div>

                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed text-lg mb-12">
                      {letter.content || 'Your cover letter content will appear here...'}
                    </div>

                    <div className="mt-12 pt-6 border-t-2 border-slate-100">
                      <p className="font-bold text-slate-900">Sincerely,</p>
                      <p className="mt-4 text-xl font-black text-slate-900">{user.displayName}</p>
                    </div>
                  </div>
                )}

                {/* MS Simple Template */}
                {letter.templateId === 'ms-simple' && (
                  <div className="text-sm font-sans">
                    <header className="mb-12">
                      <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.displayName}</h1>
                      <p className="text-slate-500 font-medium">{user.email}</p>
                      <p className="text-slate-400 text-xs mt-2">{new Date().toLocaleDateString()}</p>
                    </header>

                    <div className="mb-12">
                      {letter.recipientName && <p className="font-bold text-slate-900">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p className="text-slate-600">{letter.recipientTitle}</p>}
                      {letter.companyName && <p className="text-slate-500">{letter.companyName}</p>}
                    </div>

                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed mb-12">
                      {letter.content || 'Your cover letter content will appear here...'}
                    </div>

                    <div className="mt-12">
                      <p>Sincerely,</p>
                      <p className="mt-4 font-bold text-slate-900">{user.displayName}</p>
                    </div>
                  </div>
                )}

                {/* MS Professional Template */}
                {letter.templateId === 'ms-professional' && (
                  <div className="text-sm font-serif">
                    <header className="text-center border-t-8 pt-8 mb-12" style={{ borderColor: letter.accentColor }}>
                      <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.displayName}</h1>
                      <p className="text-slate-500 italic mb-2">{user.email}</p>
                      <p className="text-slate-400 text-xs">{new Date().toLocaleDateString()}</p>
                    </header>

                    <div className="mb-12">
                      {letter.recipientName && <p className="font-bold text-slate-900">{letter.recipientName}</p>}
                      {letter.recipientTitle && <p className="italic text-slate-600">{letter.recipientTitle}</p>}
                      {letter.companyName && <p className="text-slate-500">{letter.companyName}</p>}
                    </div>

                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed mb-12">
                      {letter.content || 'Your cover letter content will appear here...'}
                    </div>

                    <div className="mt-12 border-t pt-6">
                      <p>Sincerely,</p>
                      <p className="mt-6 font-bold text-slate-900">{user.displayName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
