import React, { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI } from "@google/genai";
import { Upload, X, Loader2, FileText, CheckCircle2, AlertCircle, Database, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfUploadModal({ isOpen, onClose, onParsed, userId }) {
  const [loading, setLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('AI is reading your resume...');
  const [file, setFile] = useState(null);
  const [step, setStep] = useState('upload'); // upload, choice, processing
  const fileInputRef = useRef(null);

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .filter((item) => 'str' in item)
        .map((item) => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStep('choice');
    }
  };

  const processFile = async (action) => {
    setLoading(true);
    setStep('processing');
    
    try {
      if (action === 'quick') {
        setProcessingMessage('Uploading your resume...');
        // Create a basic resume entry with the filename
        const newResume = await api.resumes.create({
          name: file.name.replace(/\.pdf$/i, ''),
          title: 'Imported PDF',
          uid: userId,
          lastUpdated: new Date().toISOString(),
          sections: [
            { id: 'experience', title: 'Work Experience', type: 'experience', items: [] },
            { id: 'education', title: 'Education', type: 'education', items: [] },
            { id: 'skills', title: 'Skills', type: 'skills', content: '' }
          ]
        });

        // Upload PDF file to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        const savedResume = await api.resumes.uploadFile(newResume._id, formData);
        
        alert('Resume uploaded successfully to dashboard!');
        if (onParsed) onParsed(savedResume);
        onClose();
        return;
      }

      setProcessingMessage('AI is reading your resume...');
      const text = await extractTextFromPdf(file);
      
      // AI Parsing
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const prompt = `
        Extract information from the following resume text and format it into a structured JSON object.
        The JSON should match this structure:
        {
          "name": "Resume Name",
          "title": "Professional Title",
          "email": "Email",
          "phone": "Phone",
          "location": "Location",
          "summary": "Professional Summary",
          "sections": [
            { "id": "experience", "title": "Work Experience", "type": "experience", "items": [{ "title": "", "company": "", "period": "", "description": "" }] },
            { "id": "education", "title": "Education", "type": "education", "items": [{ "degree": "", "school": "", "year": "" }] },
            { "id": "skills", "title": "Skills", "type": "skills", "content": "comma separated skills" },
            { "id": "projects", "title": "Projects", "type": "projects", "items": [{ "name": "", "link": "", "description": "" }] }
          ]
        }
        
        Resume Text:
        ${text}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const parsedData = JSON.parse(response.text.replace(/```json|```/g, ''));

      if (action === 'save') {
        // Create resume first
        const newResume = await api.resumes.create({
          ...parsedData,
          uid: userId,
          lastUpdated: new Date().toISOString()
        });

        // Upload PDF file to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        const savedResume = await api.resumes.uploadFile(newResume._id, formData);
        
        alert('Resume saved to storage and parsed successfully!');
        if (onParsed) onParsed(savedResume);
      } else {
        // Just return parsed data for builder
        if (onParsed) onParsed(parsedData);
      }
      onClose();
    } catch (err) {
      console.error("PDF Processing failed:", err);
      alert('Failed to process PDF. Please try again.');
      setStep('choice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Import Resume PDF</h2>
          <p className="text-slate-500 text-sm">Upload your existing resume to get started instantly.</p>
        </div>

        <div className="space-y-4">
          {step === 'upload' && (
            <div 
              onClick={() => fileInputRef.current.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 mb-4" size={48} />
              <p className="text-slate-600 font-bold">Click to upload or drag & drop</p>
              <p className="text-slate-400 text-xs mt-1">PDF files only (Max 5MB)</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf" 
                className="hidden" 
              />
            </div>
          )}

          {step === 'choice' && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-2">
                <p className="text-sm text-blue-800 font-medium flex items-center gap-2 truncate">
                  <CheckCircle2 size={16} className="shrink-0" />
                  {file?.name}
                </p>
              </div>

              <button
                onClick={() => processFile('quick')}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-left hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-200 shrink-0">
                  <Upload size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Quick Upload (Fast)</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Just storage • Instant</p>
                </div>
              </button>

              <button
                onClick={() => processFile('save')}
                className="w-full p-4 bg-white border-2 border-blue-600 rounded-2xl text-left hover:bg-blue-50 transition-all flex items-center gap-4 group shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-200 shrink-0">
                  <Database size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">AI Sync & Save</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Storage + AI Parsing • 15s</p>
                </div>
              </button>

              <button
                onClick={() => processFile('parse')}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl text-left hover:border-blue-200 hover:bg-blue-50 transition-all flex items-center gap-4 group"
              >
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 shrink-0">
                  <Layout size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Import to Builder</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">AI Parsing Only • 15s</p>
                </div>
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
              <p className="text-slate-900 font-bold">{processingMessage}</p>
              <p className="text-slate-500 text-sm mt-1">Please wait while we handle your document.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
