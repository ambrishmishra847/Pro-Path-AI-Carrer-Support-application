import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Code,
  Sparkles,
  Loader2,
  Download,
  Palette,
  Eye,
  FileText,
  Layout,
  Upload,
  CheckCircle2,
  AlertCircle,
  Settings,
  Languages,
  Award,
  BookOpen,
  FolderGit2,
  ChevronDown,
  X,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  GripVertical,
  Image as ImageIcon,
  Camera,
  Bot,
  Send,
  MessageSquare,
  Wand2,
  Copy,
  Monitor,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';
import html2pdf from 'html2pdf.js';
import { QRCodeCanvas } from 'qrcode.react';
import { SECTION_TYPES, TEMPLATES } from '../constants';
import ResumePreviewSection from '../components/ResumePreviewSection';
import { generatePortfolioHtml } from '../lib/portfolio-template';
import PdfUploadModal from '../components/PdfUploadModal';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function ResumeBuilder({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [view, setView] = useState('editor');
  const [portfolioTemplate, setPortfolioTemplate] = useState('modern');
  const [portfolioAccentColor, setPortfolioAccentColor] = useState('#2563eb');
  const [isGeneratingPortfolio, setIsGeneratingPortfolio] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const chatEndRef = useRef(null);
  
  const [resume, setResume] = useState({
    uid: user.id,
    name: 'Untitled Resume',
    sections: [
      { id: 'experience', title: 'Work Experience', type: 'experience', items: [] },
      { id: 'education', title: 'Education', type: 'education', items: [] },
      { id: 'skills', title: 'Skills', type: 'skills', content: '' }
    ],
    lastUpdated: new Date().toISOString(),
    templateId: 'modern',
    accentColor: '#2563eb',
    showPhoto: false
  });

  const handleTranslate = async () => {
    const lang = prompt('Enter target language (e.g. Spanish, French, German):');
    if (!lang) return;
    
    setSaving(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const promptText = `Translate the following resume data into ${lang}. Keep the same JSON structure. Return ONLY the JSON.
      Resume Data: ${JSON.stringify(resume)}`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptText,
      });
      
      const translatedData = JSON.parse(response.text.replace(/```json|```/g, ''));
      
      setResume(translatedData);
      alert(`Resume translated to ${lang}!`);
    } catch (err) {
      console.error("Translation failed:", err);
      alert('Translation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!id) {
      alert('Please save the resume first before duplicating.');
      return;
    }
    setSaving(true);
    try {
      const duplicatedResume = {
        ...resume,
        name: `${resume.name} (Copy)`,
        _id: undefined,
        lastUpdated: new Date().toISOString()
      };
      const res = await api.resumes.create(duplicatedResume);
      navigate(`/builder/${res._id}`);
      alert('Resume duplicated for A/B testing!');
    } catch (err) {
      console.error("Duplication failed:", err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (id) {
      const fetchResume = async () => {
        try {
          const data = await api.resumes.get(id);
          if (data) {
            setResume({
              ...data,
              sections: Array.isArray(data.sections) ? data.sections : []
            });
          }
        } catch (err) {
          console.error("Fetch failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchResume();
    }
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id) {
        await api.resumes.update(id, resume);
      } else {
        const newResume = await api.resumes.create(resume);
        navigate(`/builder/${newResume._id}`, { replace: true });
      }
      alert('Resume saved successfully!');
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => {
    setResume(prev => ({ ...prev, [field]: value }));
  };

  const updateSection = (index, updates) => {
    const newSections = [...resume.sections];
    newSections[index] = { ...newSections[index], ...updates };
    setResume(prev => ({ ...prev, sections: newSections }));
  };

  const addSection = (type) => {
    const sectionConfig = SECTION_TYPES.find(s => s.type === type);
    if (!sectionConfig) return;

    const newSection = {
      id: `${type}-${Date.now()}`,
      title: sectionConfig.title,
      type: type,
      items: type === 'skills' || type === 'languages' ? undefined : [],
      content: type === 'skills' || type === 'languages' ? '' : undefined
    };

    setResume(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setShowAddSection(false);
  };

  const removeSection = (index) => {
    const newSections = [...resume.sections];
    newSections.splice(index, 1);
    setResume(prev => ({ ...prev, sections: newSections }));
  };

  const addSectionItem = (sectionIndex) => {
    const newSections = [...resume.sections];
    const section = newSections[sectionIndex];
    
    let newItem = {};
    switch (section.type) {
      case 'experience':
        newItem = { title: '', company: '', period: '', description: '' };
        break;
      case 'education':
        newItem = { degree: '', school: '', year: '' };
        break;
      case 'projects':
        newItem = { name: '', link: '', description: '' };
        break;
      case 'awards':
      case 'certifications':
        newItem = { title: '', issuer: '', year: '' };
        break;
      default:
        newItem = { title: '', content: '' };
    }
    
    section.items = [...(section.items || []), newItem];
    setResume(prev => ({ ...prev, sections: newSections }));
  };

  const updateSectionItem = (sectionIndex, itemIndex, updates) => {
    const newSections = [...resume.sections];
    const section = newSections[sectionIndex];
    if (section.items) {
      section.items[itemIndex] = { ...section.items[itemIndex], ...updates };
      setResume(prev => ({ ...prev, sections: newSections }));
    }
  };

  const removeSectionItem = (sectionIndex, itemIndex) => {
    const newSections = [...resume.sections];
    const section = newSections[sectionIndex];
    if (section.items) {
      section.items.splice(itemIndex, 1);
      setResume(prev => ({ ...prev, sections: newSections }));
    }
  };

  const handleDownloadPortfolio = () => {
    setIsGeneratingPortfolio(true);
    setTimeout(() => {
      const html = generatePortfolioHtml(resume, user, portfolioAccentColor);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resume.firstName || 'Resume'}_${resume.lastName || ''}_Portfolio.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGeneratingPortfolio(false);
    }, 1500);
  };

  const handleDownload = () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `${resume.name}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const generateSummary = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Write a professional resume summary for a ${resume.title || 'professional'}. My skills include: ${resume.sections.find(s => s.type === 'skills')?.content || ''}. Keep it 2-3 sentences.`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      if (response.text) updateField('summary', response.text);
    } catch (err) {
      console.error("Summary generation failed:", err);
    }
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiChat = async () => {
    if (!aiInput.trim()) return;
    const userMsg = aiInput;
    setAiInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);

    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const systemInstruction = "You are a professional resume expert and career coach. Help the user build a high-quality resume. You have access to their current resume data. Provide specific, actionable advice. If they ask to rewrite a section, provide the improved text.";
      const context = `Current Resume Data: ${JSON.stringify(resume)}`;
      
      const chat = ai.models.generateContent({
        model: "gemini-3-flash-preview",
        systemInstruction,
        contents: chatMessages.map(m => ({ role: m.role === 'model' ? 'model' : 'user', parts: [{ text: m.text }] })).concat([{ role: 'user', parts: [{ text: `${context}\n\nUser Request: ${userMsg}` }] }])
      });
      
      const response = await chat;
      
      if (response.text) {
        setChatMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (err) {
      console.error("AI Chat failed:", err);
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const enhanceSectionItem = async (sIdx, iIdx, field) => {
    const item = resume.sections[sIdx].items?.[iIdx];
    if (!item || !item[field]) return;

    setIsAiThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `Rewrite the following ${field} for a resume to be more professional and impact-oriented. Use action verbs and quantify achievements if possible. Keep it concise.\n\nOriginal: ${item[field]}`;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      if (response.text) {
        updateSectionItem(sIdx, iIdx, { [field]: response.text });
      }
    } catch (err) {
      console.error("Enhance failed:", err);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handlePdfParsed = (data) => {
    // If it's a new resume object (from save), we might want to navigate to it
    // but usually in builder we just want to load the data into the current editor
    if (data._id) {
       navigate(`/builder/${data._id}`);
       return;
    }

    setResume(prev => ({
      ...prev,
      ...data,
      uid: user.id,
      lastUpdated: new Date().toISOString()
    }));
    alert('Resume data imported to editor!');
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <PdfUploadModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
        onParsed={handlePdfParsed}
        userId={user.id}
      />
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-4 py-3">
        <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 rounded-lg transition-all shrink-0">
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col flex-1 min-w-0">
              <input
                value={resume.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 text-lg w-full truncate"
              />
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">ProPath Editor</span>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-2 shrink-0"
            >
              <Upload size={18} />
              Import PDF
            </button>
            <button
              onClick={() => setView(view === 'portfolio' ? 'editor' : 'portfolio')}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0",
                view === 'portfolio' ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
              )}
              title="Generate Portfolio Website"
            >
              <Globe size={18} />
              Portfolio
            </button>
            <button
              onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0",
                view === 'preview' ? "bg-blue-100 text-blue-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {view === 'editor' ? <Eye size={18} /> : <FileText size={18} />}
              {view === 'editor' ? 'Preview' : 'Edit'}
            </button>
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={cn(
                "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 shrink-0",
                showAiAssistant ? "bg-purple-100 text-purple-600" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Bot size={18} />
              AI Assistant
            </button>
            <button
              onClick={handleTranslate}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 shrink-0"
              title="Translate Resume"
            >
              <Languages size={18} />
              Translate
            </button>
            <button
              onClick={() => setShowQrCode(!showQrCode)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 shrink-0"
              title="Share QR Code"
            >
              <Globe size={18} />
              QR Share
            </button>
            <button
              onClick={handleDuplicate}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-2 shrink-0"
              title="Duplicate for A/B Testing"
            >
              <Copy size={18} />
              A/B Test
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 shrink-0"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save
            </button>
            {view === 'preview' && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shrink-0"
              >
                <Download size={18} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
      {/* AI Assistant Sidebar */}
      <AnimatePresence>
        {showAiAssistant && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="fixed right-0 top-16 bottom-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50">
              <div className="flex items-center gap-2">
                <Bot className="text-purple-600" size={20} />
                <span className="font-bold text-slate-900">Resume AI</span>
              </div>
              <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="text-purple-600" size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">How can I help you?</p>
                  <p className="text-xs text-slate-500">Ask me to rewrite sections, suggest skills, or review your resume.</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-700 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-slate-100">
              <div className="relative">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                  placeholder="Ask AI..."
                  className="w-full p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  onClick={handleAiChat}
                  disabled={isAiThinking || !aiInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQrCode && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center relative"
            >
              <button 
                onClick={() => setShowQrCode(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                <Globe className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Resume</h2>
              <p className="text-slate-500 text-sm mb-8">Recruiters can scan this code to view your interactive digital resume.</p>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 inline-block mb-8">
                <QRCodeCanvas 
                  value={id ? `${window.location.origin}/preview/${id}` : "https://propath.me/demo"} 
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) {
                      const url = canvas.toDataURL("image/png");
                      const link = document.createElement('a');
                      link.download = 'resume-qr.png';
                      link.href = url;
                      link.click();
                    }
                  }}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
                >
                  Download QR Code
                </button>
                <button
                  onClick={() => setShowQrCode(false)}
                  className="w-full py-3 text-slate-500 font-bold hover:text-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Portfolio Generator View */}
          {view === 'portfolio' && (
            <div className="flex-1">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-indigo-50/50">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Portfolio Website Generator</h2>
                      <p className="text-slate-500 text-sm">Convert your resume into a professional, responsive portfolio website.</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layout size={16} />
                        Choose Portfolio Template
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {['modern', 'minimal', 'creative', 'dark'].map(t => (
                          <button
                            key={t}
                            onClick={() => setPortfolioTemplate(t)}
                            className={cn(
                              "p-4 rounded-2xl border-2 transition-all text-center group relative overflow-hidden",
                              portfolioTemplate === t 
                                ? "border-indigo-600 bg-indigo-50/50" 
                                : "border-slate-100 hover:border-slate-200"
                            )}
                          >
                            <div className={cn(
                              "aspect-video rounded-xl mb-3 bg-slate-100 group-hover:bg-slate-200 transition-all flex items-center justify-center relative overflow-hidden",
                              portfolioTemplate === t && "bg-indigo-100"
                            )}>
                              <Monitor size={24} className={portfolioTemplate === t ? "text-indigo-600" : "text-slate-400"} />
                              {portfolioTemplate === t && (
                                <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center">
                                  <CheckCircle2 className="text-indigo-600" size={32} />
                                </div>
                              )}
                            </div>
                            <span className={cn(
                              "text-sm font-bold capitalize",
                              portfolioTemplate === t ? "text-indigo-600" : "text-slate-600"
                            )}>{t}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Palette size={16} />
                        Portfolio Accent Color
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626', '#0f172a'].map(color => (
                          <button
                            key={color}
                            onClick={() => setPortfolioAccentColor(color)}
                            className={cn(
                              "w-10 h-10 rounded-full border-4 transition-all",
                              portfolioAccentColor === color ? "border-slate-900 scale-110" : "border-transparent hover:scale-105"
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={handleDownloadPortfolio}
                        disabled={isGeneratingPortfolio}
                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/20"
                      >
                        {isGeneratingPortfolio ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Generating Portfolio...
                          </>
                        ) : (
                          <>
                            <Download size={20} />
                            Generate & Download HTML
                          </>
                        )}
                      </button>
                      <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">
                        Generates a single-file responsive HTML portfolio
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Eye size={16} />
                      Live Preview
                    </h3>
                    <div className="aspect-[4/3] bg-slate-900 rounded-3xl border-8 border-slate-800 shadow-2xl overflow-hidden relative group">
                      <div className="absolute inset-0 bg-white overflow-y-auto custom-scrollbar p-4 scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none">
                        <div className="space-y-8">
                          <header className="flex justify-between items-center py-4 border-b">
                            <div className="font-bold text-2xl" style={{ color: portfolioAccentColor }}>{resume.firstName}</div>
                            <div className="flex gap-4 text-slate-400">
                              <div className="w-12 h-2 bg-slate-200 rounded" />
                              <div className="w-12 h-2 bg-slate-200 rounded" />
                              <div className="w-12 h-2 bg-slate-200 rounded" />
                            </div>
                          </header>
                          <section className="py-20 text-center space-y-4">
                            <div className="w-32 h-32 bg-slate-100 rounded-full mx-auto" />
                            <h1 className="text-6xl font-bold">I'm {resume.firstName} {resume.lastName}</h1>
                            <p className="text-2xl text-slate-500">{resume.title}</p>
                            <div className="w-48 h-12 rounded-full mx-auto" style={{ backgroundColor: portfolioAccentColor }} />
                          </section>
                          <section className="grid grid-cols-3 gap-8">
                            <div className="h-40 bg-slate-50 rounded-3xl" />
                            <div className="h-40 bg-slate-50 rounded-3xl" />
                            <div className="h-40 bg-slate-50 rounded-3xl" />
                          </section>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                        <div className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl shadow-2xl flex items-center gap-2">
                          <Smartphone size={18} />
                          Responsive Preview
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-8">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Smartphone size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Monitor size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Desktop</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Editor View */}
          {view === 'editor' && (
            <>
              <div className="w-full lg:w-80 space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Layout size={14} />
                      Template
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {TEMPLATES.map(t => (
                        <button
                          key={t.id}
                          onClick={() => updateField('templateId', t.id)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-xl border-2 transition-all text-left",
                            resume.templateId === t.id ? "border-blue-600 bg-blue-50" : "border-transparent hover:bg-slate-50"
                          )}
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            <img src={t.image} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-sm font-bold truncate", resume.templateId === t.id ? "text-blue-700" : "text-slate-700")}>{t.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{t.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Palette size={14} />
                      Accent Color
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626', '#0f172a'].map(color => (
                        <button
                          key={color}
                          onClick={() => updateField('accentColor', color)}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            resume.accentColor === color ? "border-slate-900 scale-110" : "border-transparent hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setShowAddSection(true)}
                      className="w-full py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Add Section
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Settings size={14} />
                    Settings
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Show Profile Photo</span>
                      <div 
                        onClick={() => updateField('showPhoto', !resume.showPhoto)}
                        className={cn(
                          "w-10 h-5 rounded-full transition-all relative",
                          resume.showPhoto ? "bg-blue-600" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                          resume.showPhoto ? "right-1" : "left-1"
                        )} />
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {/* Personal Info */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
                      <p className="text-slate-500 text-sm">Basic details for your resume header.</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {resume.showPhoto && (
                      <div className="md:col-span-2 flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm">
                            {resume.photo ? (
                              <img src={resume.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon size={32} />
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => photoInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all"
                          >
                            <Camera size={16} />
                          </button>
                          <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 mb-1">Profile Photo</p>
                          <p className="text-xs text-slate-500 mb-3">Upload a professional headshot for your resume.</p>
                          {resume.photo && (
                            <button onClick={() => updateField('photo', null)} className="text-xs font-bold text-red-500 hover:text-red-600">
                              Remove Photo
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Title</label>
                      <input
                        value={resume.title || ''}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g. Senior Software Engineer"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</label>
                      <input
                        value={resume.email || ''}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="john@example.com"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                      <input
                        value={resume.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</label>
                      <input
                        value={resume.location || ''}
                        onChange={(e) => updateField('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Professional Summary</label>
                        <button
                          onClick={generateSummary}
                          className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        >
                          <Sparkles size={12} />
                          AI Generate
                        </button>
                      </div>
                      <textarea
                        value={resume.summary || ''}
                        onChange={(e) => updateField('summary', e.target.value)}
                        placeholder="Briefly describe your professional background and key achievements..."
                        rows={4}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
                {/* Dynamic Sections */}
                <Reorder.Group axis="y" values={resume.sections} onReorder={(newSections) => updateField('sections', newSections)} className="space-y-6">
                  {resume.sections.map((section, sIdx) => (
                    <Reorder.Item key={section.id} value={section}>
                      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm group/section relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover/section:opacity-100 transition-all cursor-grab active:cursor-grabbing p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <GripVertical size={16} className="text-slate-400" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-2xl flex items-center justify-center">
                              {SECTION_TYPES.find(s => s.type === section.type)?.icon || <Layout size={24} />}
                            </div>
                            <div>
                              <input
                                value={section.title}
                                onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                                className="text-xl font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                              />
                              <p className="text-slate-500 text-sm capitalize">{section.type} Section</p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeSection(sIdx)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>

                        {section.type === 'skills' || section.type === 'languages' ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                              {section.type === 'skills' ? 'Skills (comma separated)' : 'Languages (comma separated)'}
                            </label>
                            <textarea
                              value={section.content || ''}
                              onChange={(e) => updateSection(sIdx, { content: e.target.value })}
                              placeholder={section.type === 'skills' ? "React, Node.js, TypeScript, UI Design..." : "English (Native), Spanish (Fluent)..."}
                              rows={3}
                              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            />
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {section.items?.map((item, iIdx) => (
                              <div key={iIdx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group/item">
                                <button
                                  onClick={() => removeSectionItem(sIdx, iIdx)}
                                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 opacity-0 group-item/section:opacity-100 transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>

                                <div className="grid md:grid-cols-2 gap-4">
                                  {section.type === 'experience' && (
                                    <>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Job Title</label>
                                        <input
                                          value={item.title || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { title: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Company</label>
                                        <input
                                          value={item.company || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { company: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Period</label>
                                        <input
                                          value={item.period || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { period: e.target.value })}
                                          placeholder="e.g. Jan 2020 - Present"
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="md:col-span-2 space-y-2">
                                        <div className="flex justify-between">
                                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Description</label>
                                          <button 
                                            onClick={() => enhanceSectionItem(sIdx, iIdx, 'description')}
                                            className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                          >
                                            <Wand2 size={10} />
                                            AI Enhance
                                          </button>
                                        </div>
                                        <textarea
                                          value={item.description || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { description: e.target.value })}
                                          rows={3}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm resize-none"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {section.type === 'education' && (
                                    <>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Degree / Field of Study</label>
                                        <input
                                          value={item.degree || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { degree: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">School / University</label>
                                        <input
                                          value={item.school || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { school: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Year</label>
                                        <input
                                          value={item.year || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { year: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {section.type === 'projects' && (
                                    <>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Project Name</label>
                                        <input
                                          value={item.name || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { name: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Link</label>
                                        <input
                                          value={item.link || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { link: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Description</label>
                                        <textarea
                                          value={item.description || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { description: e.target.value })}
                                          rows={2}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm resize-none"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {(section.type === 'awards' || section.type === 'certifications') && (
                                    <>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Title</label>
                                        <input
                                          value={item.title || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { title: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Issuer</label>
                                        <input
                                          value={item.issuer || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { issuer: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Year</label>
                                        <input
                                          value={item.year || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { year: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                    </>
                                  )}

                                  {section.type === 'custom' && (
                                    <>
                                      <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Title</label>
                                        <input
                                          value={item.title || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { title: e.target.value })}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                                        />
                                      </div>
                                      <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Content</label>
                                        <textarea
                                          value={item.content || ''}
                                          onChange={(e) => updateSectionItem(sIdx, iIdx, { content: e.target.value })}
                                          rows={3}
                                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm resize-none"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                            <button
                              onClick={() => addSectionItem(sIdx)}
                              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                            >
                              <Plus size={18} />
                              Add Item
                            </button>
                          </div>
                        )}
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </>
          )}
          {/* Preview View */}
          {view === 'preview' && (
            <div className="flex-1">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden min-h-[1056px] relative group">
                <div id="resume-preview-content" className="p-12 bg-white">
                  {/* Modern Template */}
                  {resume.templateId === 'modern' && (
                    <div className="space-y-8">
                      <header className="flex justify-between items-start border-b-2 pb-8" style={{ borderColor: resume.accentColor }}>
                        <div className="flex gap-6 items-center">
                          {resume.showPhoto && resume.photo && (
                            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                              <img src={resume.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">{user.displayName}</h1>
                            <p className="text-xl font-bold opacity-60" style={{ color: resume.accentColor }}>{resume.title}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1 text-sm text-slate-500 font-medium">
                          {resume.email && <p className="flex items-center justify-end gap-2">{resume.email} <Mail size={14} /></p>}
                          {resume.phone && <p className="flex items-center justify-end gap-2">{resume.phone} <Phone size={14} /></p>}
                          {resume.location && <p className="flex items-center justify-end gap-2">{resume.location} <MapPin size={14} /></p>}
                          <div className="flex justify-end gap-3 mt-2">
                            {resume.linkedin && <Linkedin size={16} className="text-slate-400" />}
                            {resume.github && <Github size={16} className="text-slate-400" />}
                            {resume.website && <Globe size={16} className="text-slate-400" />}
                          </div>
                        </div>
                      </header>
                      <div className="space-y-8">
                        {resume.summary && (
                          <section>
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-3" style={{ color: resume.accentColor }}>About Me</h2>
                            <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Minimal Template */}
                  {resume.templateId === 'minimal' && (
                    <div className="max-w-2xl mx-auto space-y-10">
                      <header className="text-center space-y-4">
                        <h1 className="text-5xl font-light tracking-tighter text-slate-900">{user.displayName}</h1>
                        <p className="text-lg text-slate-500 font-medium uppercase tracking-widest">{resume.title}</p>
                        <div className="flex justify-center gap-6 text-sm text-slate-400">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      <div className="space-y-10">
                        {resume.summary && (
                          <section className="text-center italic text-slate-600 leading-relaxed text-lg">
                            "{resume.summary}"
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} minimal />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Classic Template */}
                  {resume.templateId === 'classic' && (
                    <div className="space-y-6 font-serif">
                      <header className="text-center border-b-2 border-slate-900 pb-6">
                        <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight">{user.displayName}</h1>
                        <div className="flex justify-center gap-4 text-sm text-slate-600">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      {resume.summary && (
                        <section>
                          <h2 className="text-sm font-bold uppercase border-b mb-2">Professional Profile</h2>
                          <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                        </section>
                      )}
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor="#000" classic />
                      ))}
                    </div>
                  )}

                  {/* Sidebar Template */}
                  {resume.templateId === 'sidebar' && (
                    <div className="flex gap-8">
                      <div className="w-1/3 space-y-8">
                        <div className="p-6 rounded-2xl text-white" style={{ backgroundColor: resume.accentColor }}>
                          {resume.showPhoto && resume.photo && (
                            <div className="w-24 h-24 rounded-xl overflow-hidden mb-6 border-2 border-white/20">
                              <img src={resume.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <h1 className="text-2xl font-bold mb-1">{user.displayName}</h1>
                          <p className="text-sm opacity-80 mb-6">{resume.title}</p>
                          <div className="space-y-3 text-xs">
                            {resume.email && <p className="flex items-center gap-2"><Mail size={12} /> {resume.email}</p>}
                            {resume.phone && <p className="flex items-center gap-2"><Phone size={12} /> {resume.phone}</p>}
                            {resume.location && <p className="flex items-center gap-2"><MapPin size={12} /> {resume.location}</p>}
                            {resume.linkedin && <p className="flex items-center gap-2"><Linkedin size={12} /> {resume.linkedin}</p>}
                            {resume.github && <p className="flex items-center gap-2"><Github size={12} /> {resume.github}</p>}
                          </div>
                        </div>
                        {resume.sections.filter(s => s.type === 'skills' || s.type === 'languages').map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} sidebar />
                        ))}
                      </div>
                      <div className="flex-1 space-y-8">
                        {resume.summary && (
                          <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-3" style={{ color: resume.accentColor }}>About Me</h2>
                            <p className="text-slate-700 leading-relaxed text-sm">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.filter(s => s.type !== 'skills' && s.type !== 'languages').map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional Template */}
                  {resume.templateId === 'professional' && (
                    <div className="space-y-8">
                      <header className="flex justify-between items-end border-b-4 pb-6" style={{ borderColor: resume.accentColor }}>
                        <div className="flex gap-6 items-end">
                          {resume.showPhoto && resume.photo && (
                            <div className="w-28 h-28 rounded-lg overflow-hidden shrink-0 border-4" style={{ borderColor: resume.accentColor }}>
                              <img src={resume.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div>
                            <h1 className="text-5xl font-black tracking-tighter mb-2" style={{ color: resume.accentColor }}>{user.displayName}</h1>
                            <p className="text-2xl font-bold text-slate-700">{resume.title}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1 text-sm font-bold text-slate-500">
                          {resume.email && <p>{resume.email}</p>}
                          {resume.phone && <p>{resume.phone}</p>}
                          {resume.location && <p>{resume.location}</p>}
                          <div className="flex justify-end gap-3 mt-2">
                            {resume.linkedin && <Linkedin size={16} />}
                            {resume.github && <Github size={16} />}
                            {resume.website && <Globe size={16} />}
                          </div>
                        </div>
                      </header>
                      <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-8">
                          {resume.summary && (
                            <section>
                              <h2 className="text-xl font-black uppercase mb-4 border-l-4 pl-4" style={{ borderColor: resume.accentColor }}>Profile</h2>
                              <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                            </section>
                          )}
                          {resume.sections.filter(s => s.type === 'experience' || s.type === 'projects').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                        <div className="space-y-8">
                          {resume.sections.filter(s => s.type !== 'experience' && s.type !== 'projects').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Compact Template */}
                  {resume.templateId === 'compact' && (
                    <div className="text-[11px] space-y-4">
                      <header className="flex justify-between items-center border-b pb-2">
                        <div className="flex items-center gap-3">
                          {resume.showPhoto && resume.photo && (
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                              <img src={resume.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <h1 className="text-2xl font-bold">{user.displayName}</h1>
                        </div>
                        <div className="flex gap-3 text-slate-500">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {resume.sections.map(section => (
                          <div key={section.id} className={cn(section.type === 'experience' && "col-span-2")}>
                            <ResumePreviewSection section={section} accentColor={resume.accentColor} compact />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Elegant Template */}
                  {resume.templateId === 'elegant' && (
                    <div className="font-serif space-y-10">
                      <header className="text-center space-y-4 border-b-2 pb-8" style={{ borderColor: resume.accentColor }}>
                        {resume.showPhoto && resume.photo && (
                          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border border-slate-200 p-1">
                            <img src={resume.photo} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <h1 className="text-5xl font-light tracking-[0.2em] uppercase" style={{ color: resume.accentColor }}>{user.displayName}</h1>
                        <p className="text-lg tracking-[0.3em] uppercase text-slate-500">{resume.title}</p>
                        <div className="flex justify-center gap-6 text-sm italic text-slate-600">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                        <div className="flex justify-center gap-4 text-slate-400">
                          {resume.linkedin && <Linkedin size={16} />}
                          {resume.github && <Github size={16} />}
                          {resume.website && <Globe size={16} />}
                        </div>
                      </header>
                      <div className="space-y-10">
                        {resume.summary && (
                          <section className="max-w-2xl mx-auto text-center italic text-slate-700 leading-relaxed text-lg">
                            {resume.summary}
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} classic />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Executive Template */}
                  {resume.templateId === 'executive' && (
                    <div className="space-y-8">
                      <header className="text-center border-b-4 pb-6" style={{ borderColor: resume.accentColor }}>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2" style={{ color: resume.accentColor }}>{user.displayName}</h1>
                        <div className="flex flex-wrap justify-center gap-4 text-sm font-bold text-slate-600 uppercase tracking-widest">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      {resume.summary && (
                        <section>
                          <h2 className="text-lg font-bold uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Executive Summary</h2>
                          <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                        </section>
                      )}
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                      ))}
                    </div>
                  )}

                  {/* Technical Template */}
                  {resume.templateId === 'technical' && (
                    <div className="space-y-6 font-mono text-sm">
                      <header className="border-l-8 pl-6 py-2" style={{ borderColor: resume.accentColor }}>
                        <h1 className="text-3xl font-bold mb-1">{user.displayName}</h1>
                        <p className="text-slate-600">{resume.title}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.linkedin && <span>{resume.linkedin}</span>}
                          {resume.github && <span>{resume.github}</span>}
                        </div>
                      </header>
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                      ))}
                    </div>
                  )}

                  {/* Corporate Template */}
                  {resume.templateId === 'corporate' && (
                    <div className="space-y-6">
                      <header className="border-b-2 pb-4 flex justify-between items-end">
                        <div>
                          <h1 className="text-3xl font-bold text-slate-900">{user.displayName}</h1>
                          <p className="text-lg text-slate-600">{resume.title}</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                          <p>{resume.email}</p>
                          <p>{resume.phone}</p>
                          <p>{resume.location}</p>
                        </div>
                      </header>
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                      ))}
                    </div>
                  )}

                  {/* Startup Template */}
                  {resume.templateId === 'startup' && (
                    <div className="space-y-8">
                      <header className="flex items-center gap-6">
                        {resume.photo && resume.showPhoto && (
                          <img src={resume.photo} className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-50" />
                        )}
                        <div>
                          <h1 className="text-4xl font-black italic tracking-tight">{user.displayName}</h1>
                          <p className="text-xl font-bold opacity-70" style={{ color: resume.accentColor }}>{resume.title}</p>
                          <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
                            <span>{resume.email}</span>
                            <span>{resume.location}</span>
                          </div>
                        </div>
                      </header>
                      <div className="grid grid-cols-3 gap-8">
                        <div className="col-span-2 space-y-8">
                          {resume.sections.filter(s => s.type === 'experience' || s.type === 'projects').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                        <div className="space-y-8">
                          {resume.sections.filter(s => s.type !== 'experience' && s.type !== 'projects').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Academic Template */}
                  {resume.templateId === 'academic' && (
                    <div className="space-y-6 font-serif">
                      <header className="text-center border-b pb-4">
                        <h1 className="text-3xl font-bold mb-2 uppercase tracking-wide">{user.displayName}</h1>
                        <div className="text-sm italic text-slate-600">
                          {resume.location} • {resume.email} • {resume.phone}
                        </div>
                      </header>
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} classic />
                      ))}
                    </div>
                  )}

                  {/* Functional Template */}
                  {resume.templateId === 'functional' && (
                    <div className="space-y-8">
                      <header className="bg-slate-900 text-white p-8 rounded-xl">
                        <h1 className="text-4xl font-bold mb-2">{user.displayName}</h1>
                        <p className="text-xl opacity-80 mb-4">{resume.title}</p>
                        <div className="flex flex-wrap gap-4 text-sm opacity-60">
                          <span>{resume.email}</span>
                          <span>{resume.phone}</span>
                          <span>{resume.location}</span>
                        </div>
                      </header>
                      <div className="grid grid-cols-1 gap-8">
                        {resume.sections.sort((a, b) => (a.type === 'skills' ? -1 : 1)).map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hybrid Template */}
                  {resume.templateId === 'hybrid' && (
                    <div className="space-y-6">
                      <header className="flex justify-between items-start">
                        <div>
                          <h1 className="text-4xl font-black tracking-tighter" style={{ color: resume.accentColor }}>{user.displayName}</h1>
                          <p className="text-xl font-bold text-slate-600">{resume.title}</p>
                        </div>
                        <div className="text-right text-sm font-bold text-slate-400">
                          <p>{resume.email}</p>
                          <p>{resume.phone}</p>
                          <p>{resume.location}</p>
                        </div>
                      </header>
                      <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-4 space-y-6">
                          {resume.sections.filter(s => s.type === 'skills' || s.type === 'languages' || s.type === 'awards').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                        <div className="col-span-8 space-y-8">
                          {resume.sections.filter(s => s.type !== 'skills' && s.type !== 'languages' && s.type !== 'awards').map(section => (
                            <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MS Blue Grey Template */}
                  {resume.templateId === 'ms-blue-grey' && (
                    <div className="space-y-6 text-[13px] leading-relaxed">
                      <header className="bg-slate-700 text-white p-8 -mx-12 -mt-12 mb-8 flex justify-between items-center">
                        <div>
                          <h1 className="text-4xl font-bold mb-1 uppercase tracking-tight">{user.displayName}</h1>
                          <p className="text-xl opacity-90 font-medium">{resume.title}</p>
                        </div>
                        <div className="text-right space-y-1 text-sm opacity-80">
                          {resume.email && <p>{resume.email}</p>}
                          {resume.phone && <p>{resume.phone}</p>}
                          {resume.location && <p>{resume.location}</p>}
                        </div>
                      </header>
                      <div className="space-y-8">
                        {resume.summary && (
                          <section>
                            <h2 className="text-lg font-bold text-slate-700 uppercase border-b-2 border-slate-200 pb-1 mb-3">Professional Summary</h2>
                            <p className="text-slate-600">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor="#334155" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MS Modern Template */}
                  {resume.templateId === 'ms-modern' && (
                    <div className="space-y-8 text-sm">
                      <header className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
                        <div>
                          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{user.displayName}</h1>
                          <p className="text-2xl font-bold text-slate-500">{resume.title}</p>
                        </div>
                        <div className="text-right space-y-1 font-bold text-slate-600">
                          {resume.email && <p>{resume.email}</p>}
                          {resume.phone && <p>{resume.phone}</p>}
                          {resume.location && <p>{resume.location}</p>}
                        </div>
                      </header>
                      <div className="space-y-10">
                        {resume.summary && (
                          <section>
                            <h2 className="text-xl font-black text-slate-900 uppercase mb-4">Profile</h2>
                            <p className="text-slate-700 leading-relaxed text-lg">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor="#0f172a" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MS Simple Template */}
                  {resume.templateId === 'ms-simple' && (
                    <div className="space-y-6 text-sm font-sans">
                      <header className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{user.displayName}</h1>
                        <div className="flex gap-4 text-slate-500 text-xs font-medium">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      <div className="space-y-6">
                        {resume.summary && (
                          <section>
                            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b mb-3 pb-1">Objective</h2>
                            <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor="#000" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MS Professional Template */}
                  {resume.templateId === 'ms-professional' && (
                    <div className="space-y-8 text-sm">
                      <header className="text-center border-t-8 pt-8" style={{ borderColor: resume.accentColor }}>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">{user.displayName}</h1>
                        <p className="text-lg text-slate-500 mb-4">{resume.title}</p>
                        <div className="flex justify-center gap-4 text-slate-400 font-medium">
                          {resume.email && <span>{resume.email}</span>}
                          {resume.phone && <span>{resume.phone}</span>}
                          {resume.location && <span>{resume.location}</span>}
                        </div>
                      </header>
                      <div className="space-y-8">
                        {resume.summary && (
                          <section>
                            <h2 className="text-lg font-bold text-slate-900 border-b-2 mb-4 pb-1" style={{ borderColor: resume.accentColor }}>Summary</h2>
                            <p className="text-slate-700 leading-relaxed">{resume.summary}</p>
                          </section>
                        )}
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Midnight Template */}
                  {resume.templateId === 'minimalist-dark' && (
                    <div className="bg-slate-900 text-white p-12 -m-12 min-h-[1056px] space-y-12">
                      <header className="space-y-4">
                        <h1 className="text-6xl font-black tracking-tighter">{user.displayName}</h1>
                        <p className="text-2xl font-light opacity-60 tracking-widest uppercase">{resume.title}</p>
                        <div className="flex gap-6 text-sm font-bold tracking-widest opacity-40 uppercase">
                          <span>{resume.email}</span>
                          <span>{resume.phone}</span>
                          <span>{resume.location}</span>
                        </div>
                      </header>
                      <div className="grid grid-cols-2 gap-16">
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor="#fff" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Oceanic Template */}
                  {resume.templateId === 'bold-blue' && (
                    <div className="space-y-0 -m-12 min-h-[1056px] flex flex-col">
                      <header className="bg-blue-600 text-white p-16 space-y-4">
                        <h1 className="text-5xl font-black uppercase tracking-tighter">{user.displayName}</h1>
                        <p className="text-2xl font-bold opacity-80">{resume.title}</p>
                        <div className="flex gap-8 text-sm font-bold pt-4">
                          <span className="flex items-center gap-2"><Mail size={16}/> {resume.email}</span>
                          <span className="flex items-center gap-2"><Phone size={16}/> {resume.phone}</span>
                          <span className="flex items-center gap-2"><MapPin size={16}/> {resume.location}</span>
                        </div>
                      </header>
                      <div className="p-16 flex-1 bg-white space-y-12">
                        {resume.sections.map(section => (
                          <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Journal Template */}
                  {resume.templateId === 'clean-serif' && (
                    <div className="font-serif space-y-10 p-4">
                      <header className="text-center space-y-4 border-b-2 border-double pb-8">
                        <h1 className="text-5xl font-bold tracking-tight">{user.displayName}</h1>
                        <p className="text-xl italic text-slate-500">{resume.title}</p>
                        <div className="flex justify-center gap-6 text-sm font-sans uppercase tracking-widest text-slate-400">
                          <span>{resume.email}</span>
                          <span>{resume.phone}</span>
                          <span>{resume.location}</span>
                        </div>
                      </header>
                      {resume.sections.map(section => (
                        <ResumePreviewSection key={section.id} section={section} accentColor={resume.accentColor} classic />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Add Section Modal */}
          <AnimatePresence>
            {showAddSection && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Add New Section</h2>
                      <p className="text-slate-500 text-sm">Choose a section type to add to your resume.</p>
                    </div>
                    <button onClick={() => setShowAddSection(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {SECTION_TYPES.map(type => (
                      <button
                        key={type.type}
                        onClick={() => addSection(type.type)}
                        disabled={resume.sections.some(s => s.type === type.type && type.type !== 'custom')}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all text-center group",
                          resume.sections.some(s => s.type === type.type && type.type !== 'custom')
                            ? "opacity-50 cursor-not-allowed border-slate-100 bg-slate-50"
                            : "border-slate-100 hover:border-blue-600 hover:bg-blue-50"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all",
                          resume.sections.some(s => s.type === type.type && type.type !== 'custom')
                            ? "bg-slate-200 text-slate-400"
                            : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                        )}>
                          {type.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{type.title}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setShowAddSection(false)}
                      className="px-6 py-2 text-slate-500 font-bold hover:text-slate-700 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
