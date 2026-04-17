import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import * as pdfjsLib from 'pdfjs-dist';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Rocket, 
  Target, 
  TrendingUp, 
  Zap, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  Search,
  X,
  Eye,
  Sparkles,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const BASIC_PROMPT = `
You are an expert ATS (Applicant Tracking System). 
Your objective is to evaluate the provided resume and provide a comprehensive analysis of its quality, structure, and content.

Please output the results structured clearly into the following sections:
1. Overall Score: [A score out of 100 based on professional standards]
2. Key Strengths: [List the strongest points of the resume]
3. Areas for Improvement: [Identify weaknesses or missing standard sections]
4. Formatting Feedback: [Comment on readability, font usage, and layout]
5. Recommended Keywords: [Suggest industry-standard keywords that should be included based on the profile]

Resume Text: {text}
`;

const JOB_MATCH_PROMPT = `
You are an expert ATS (Applicant Tracking System) with a deep understanding of technical domains. 
Your objective is to assess the provided resume against the given job description.

Please output the results structured clearly into the following sections:
1. Percentage Match: [Calculate the exact percentage match between the resume and the job description]
2. Missing Keywords: [List important keywords or skills from the job description that are missing in the resume]
3. Job-Specific Evaluation: [How well does the candidate's experience align with the specific responsibilities of this role?]
4. Recommendations: [Specific steps to tailor this resume for this particular job]

Resume Text: {text}
Job Description: {jd}
`;

export default function ATSAnalyzer({ user }) {
  const [mode, setMode] = useState('job-match');
  const [jd, setJd] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef(null);

  const extractTextFromPdf = async (file) => {
    try {
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
      if (!text.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be an image-based PDF or encrypted.");
      }
      return text;
    } catch (err) {
      console.error("PDF Extraction Error:", err);
      throw new Error(`Failed to read PDF: ${err.message || 'Unknown error'}`);
    }
  };

  const handleAnalyze = async () => {
    if (mode === 'job-match' && !jd.trim()) {
      setError("Please paste the Job Description to proceed.");
      return;
    }
    if (!file) {
      setError("Please upload your Resume to proceed.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let resumeText = extractedText;
      
      if (!resumeText) {
        resumeText = await extractTextFromPdf(file);
        setExtractedText(resumeText);
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = mode === 'job-match' 
        ? JOB_MATCH_PROMPT.replace('{text}', resumeText).replace('{jd}', jd)
        : BASIC_PROMPT.replace('{text}', resumeText);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      if (!response.text) {
        throw new Error("The AI returned an empty response. Please try again.");
      }
      
      setResult(response.text);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "An unexpected error occurred during analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError("Only PDF files are supported.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setExtractedText(null);
      setResult(null);

      // Automatically extract text for preview
      setIsExtracting(true);
      try {
        const text = await extractTextFromPdf(selectedFile);
        setExtractedText(text);
        setShowPreviewModal(true); // Automatically show modal for verification
      } catch (err) {
        setError(err.message);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-4">
          <Sparkles size={16} />
          <span>AI Powered Analysis</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">ProPath ATS Analyzer</h1>
        <p className="text-slate-600">Optimize your resume for applicant tracking systems using Google's Gemini AI.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setMode('job-match')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                mode === 'job-match' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Job Match Analysis
            </button>
            <button
              onClick={() => setMode('basic')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                mode === 'basic' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Basic Resume Review
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'job-match' && (
              <motion.div
                key="job-match"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <label className="block text-sm font-semibold text-slate-700">
                  Paste the Job Description Here
                </label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  placeholder="Paste the job requirements, skills, and responsibilities here..."
                  className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none bg-white shadow-sm"
                />
              </motion.div>
            )}
            {mode === 'basic' && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8 rounded-2xl bg-blue-50 border border-blue-100 text-center"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <FileText className="text-blue-600" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Basic Resume Review</h3>
                <p className="text-slate-600 text-sm">
                  We'll analyze your resume's overall quality, formatting, and content without comparing it to a specific job.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Upload Your Resume (PDF Format)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all",
                file ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 bg-white"
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                accept=".pdf"
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                  file ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                )}>
                  {file ? <FileText size={24} /> : <Upload size={24} />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {file ? file.name : "Click to upload resume"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : "PDF format only"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                  {file.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {isExtracting ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={14} className="animate-spin" />
                    Extracting...
                  </div>
                ) : extractedText ? (
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                  >
                    <Eye size={14} />
                    Preview Text
                  </button>
                ) : null}
                <button
                  onClick={() => {
                    setFile(null);
                    setExtractedText(null);
                    setResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={20} />
                Analyze Resume
              </>
            )}
          </button>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3"
              >
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="mt-8">
            <AdSense variant="horizontal" />
          </div>
        </div>

        <div className="relative lg:sticky lg:top-24 h-fit">
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="bg-blue-600 p-6 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CheckCircle2 size={24} />
                  ATS Evaluation Results
                </h3>
                <p className="text-blue-100 text-sm mt-1">Analysis Complete!</p>
              </div>
              <div className="p-6 prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {result}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
                alt="Career Path"
                className="w-full h-full object-cover aspect-[4/5]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-8">
                <p className="text-white text-xl font-bold mb-2">Optimize your career path</p>
                <p className="text-slate-200 text-sm">Get real-time insights into your resume's performance.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-3xl max-h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Verify Extracted Text</h3>
                  <p className="text-sm text-slate-500">Please verify and correct the text extracted from your resume for better accuracy.</p>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <textarea
                  value={extractedText || ''}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="w-full h-full min-h-[400px] p-6 rounded-xl border border-slate-200 shadow-sm font-sans text-sm text-slate-700 leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                  placeholder="Extracted text will appear here..."
                />
              </div>
              <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-2 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleAnalyze();
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Zap size={16} />
                  Confirm & Analyze
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
