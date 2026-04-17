import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Rocket, 
  Search, 
  TrendingUp,
  Brain,
  ChevronRight,
  Sparkles,
  FileText,
  Loader2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';
import PdfUploadModal from '../components/PdfUploadModal';

export default function SkillGapAnalysis({ user }) {
  const [loading, setLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await api.resumes.list();
        if (Array.isArray(data)) {
          setResumes(data);
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      }
    };
    fetchResumes();
  }, []);

  useEffect(() => {
    if (selectedResumeId) {
      const resume = resumes.find(r => r._id === selectedResumeId);
      if (resume) {
        const skills = resume.sections.find(s => s.type === 'skills')?.content || '';
        const experience = resume.sections.find(s => s.type === 'experience')?.items?.map((i) => `${i.title} at ${i.company}`).join(', ') || '';
        setResumeText(`${resume.summary}\n\nSkills: ${skills}\n\nExperience: ${experience}`);
      }
    }
  }, [selectedResumeId, resumes]);

  const analyze = async () => {
    setLoading(true);
    try {
      const prompt = `
        Analyze the skill gap between the following resume and job description.
        
        Resume:
        ${resumeText}
        
        Job Description:
        ${jobDescription}
        
        Provide the following in JSON format:
        1. matchScore: A number from 0 to 100.
        2. foundSkills: Array of skills found in both.
        3. missingSkills: Array of skills in JD but missing in resume.
        4. recommendations: Array of objects with { skill, resource, type } where type is 'Course' or 'Project'.
        
        Return ONLY the JSON.
      `;
      
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const parsedAnalysis = JSON.parse(response.text.replace(/```json|```/g, ''));
      setAnalysis(parsedAnalysis);
    } catch (err) {
      console.error("Analysis failed:", err);
      alert("Failed to analyze skill gaps. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePdfParsed = (data) => {
    if (data._id) {
      setResumes(prev => [data, ...prev]);
      setSelectedResumeId(data._id);
    } else {
      const skills = data.sections.find(s => s.type === 'skills')?.content || '';
      const summary = data.summary || '';
      const experience = data.sections.find(s => s.type === 'experience')?.items?.map((i) => `${i.title} at ${i.company}`).join(', ') || '';
      setResumeText(`${summary}\n\nSkills: ${skills}\n\nExperience: ${experience}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <PdfUploadModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
        onParsed={handlePdfParsed}
        userId={user.id}
      />
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Brain size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Skill Gap Analysis</h1>
        </div>
        <p className="text-slate-600">Identify missing skills for your target role and get personalized learning recommendations.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Select Saved Resume (Optional)</label>
                  <button 
                    onClick={() => setShowPdfModal(true)}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Upload size={14} />
                    Upload Resume PDF
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {resumes.map(resume => (
                    <button
                      key={resume._id}
                      onClick={() => setSelectedResumeId(resume._id)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all text-left flex items-center gap-3 group",
                        selectedResumeId === resume._id 
                          ? "border-purple-600 bg-purple-50" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        selectedResumeId === resume._id 
                          ? "bg-white" 
                          : resume.pdfUrl ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-400"
                      )}>
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-bold text-slate-900 text-sm truncate">{resume.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{resume.title}</p>
                      </div>
                      {selectedResumeId === resume._id && <CheckCircle2 className="text-purple-600 shrink-0" size={16} />}
                    </button>
                  ))}
                  {resumes.length === 0 && (
                    <div className="sm:col-span-2 p-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">No Resumes Found. Upload one above!</p>
                    </div>
                  )}
                </div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Or Paste Resume Content</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Target Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
                />
              </div>
              <button
                onClick={analyze}
                disabled={loading || !resumeText || !jobDescription}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20"
              >
                {loading ? <Zap className="animate-spin" size={20} /> : <Sparkles size={20} />}
                Analyze Skill Gaps
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Match Analysis</h3>
                      <p className="text-sm text-slate-500">Based on your current skills vs job requirements</p>
                    </div>
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="text-slate-100"
                          strokeDasharray="100, 100"
                          strokeWidth="3"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-600"
                          strokeDasharray={`${analysis.matchScore}, 100`}
                          strokeWidth="3"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-black text-slate-900">{analysis.matchScore}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={16} />
                        Skills You Have
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.foundSkills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-semibold border border-green-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertCircle className="text-amber-500" size={16} />
                        Missing Skills
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingSkills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold border border-amber-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <BookOpen className="text-blue-600" size={20} />
                    Personalized Learning Path
                  </h3>
                  <div className="space-y-4">
                    {analysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                            rec.type === 'Course' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                          )}>
                            {rec.type === 'Course' ? <BookOpen size={20} /> : <Rocket size={20} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">{rec.type} for {rec.skill}</p>
                            <p className="font-bold text-slate-900">{rec.resource}</p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-400 group-hover:text-blue-600 transition-all">
                          <ChevronRight size={20} />
                        </button>
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
              <TrendingUp size={18} />
              Market Demand
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Skills like <span className="font-bold text-slate-900">AWS</span> and <span className="font-bold text-slate-900">Docker</span> are currently in the top 5% of requirements for Software Engineer roles.
              </p>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800">Learning these could increase your salary potential by up to 15%.</p>
              </div>
            </div>
          </div>

          <AdSense variant="square" />

          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-purple-900/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Target size={18} />
              Career Goal
            </h3>
            <p className="text-sm opacity-90 leading-relaxed">
              You are 3 key skills away from being a 90% match for Senior-level roles. Focus on Cloud Architecture next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
