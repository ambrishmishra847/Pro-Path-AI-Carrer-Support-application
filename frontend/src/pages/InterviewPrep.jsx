import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { GoogleGenAI } from "@google/genai";
import { 
  Bot, 
  MessageSquare, 
  Wand2, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  History,
  Star,
  FileText,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';

export default function InterviewPrep({ user }) {
  const [loading, setLoading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [step, setStep] = useState('setup');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');

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

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const selectedResume = resumes.find(r => r._id === selectedResumeId);
      const resumeContext = selectedResume ? `Resume Context: ${JSON.stringify(selectedResume)}` : "No specific resume provided.";
      
      const prompt = `
        Generate 5 professional interview questions based on the following job description and resume context.
        The questions should be a mix of behavioral and technical.
        
        Job Description:
        ${jobDescription}
        
        ${resumeContext}
        
        Return ONLY a JSON array of strings.
      `;
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const parsedQuestions = JSON.parse(response.text.replace(/```json|```/g, ''));
      
      if (Array.isArray(parsedQuestions)) {
        setQuestions(parsedQuestions);
        setStep('practice');
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to generate questions:", err);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFeedback = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze the following interview responses and provide feedback.
        For each question and answer pair, provide a strength and an area for improvement.
        
        Questions and Answers:
        ${questions.map((q, i) => `Q: ${q}\nA: ${answers[i]}`).join('\n\n')}
        
        Return ONLY a JSON array of objects with this structure:
        [
          {
            "question": "...",
            "strength": "...",
            "improvement": "..."
          }
        ]
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const feedbackData = JSON.parse(response.text.replace(/```json|```/g, ''));
      setAiFeedback(feedbackData);
    } catch (err) {
      console.error("Failed to get feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const [aiFeedback, setAiFeedback] = useState([]);

  const handleNextQuestion = async () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = currentAnswer;
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('feedback');
      await getFeedback();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Bot size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">AI Interview Prep</h1>
        </div>
        <p className="text-slate-600">Practice your interview skills with AI-generated questions tailored to your target job.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {step === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Wand2 className="text-blue-600" size={20} />
                  Setup Your Practice Session
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Select Resume (for context)</label>
                    <div className="grid gap-3">
                      {resumes.map(resume => (
                        <button
                          key={resume._id}
                          onClick={() => setSelectedResumeId(resume._id)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group",
                            selectedResumeId === resume._id 
                              ? "border-blue-600 bg-blue-50" 
                              : "border-slate-100 hover:border-slate-200"
                          )}
                        >
                          <div>
                            <p className="font-bold text-slate-900">{resume.name}</p>
                            <p className="text-xs text-slate-500">{resume.title}</p>
                          </div>
                          {selectedResumeId === resume._id && <CheckCircle2 className="text-blue-600" size={20} />}
                        </button>
                      ))}
                      {resumes.length === 0 && (
                        <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-xl">
                          <p className="text-slate-500 text-xs">No resumes found. AI will use generic context.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">Job Description</label>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here to generate relevant questions..."
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={generateQuestions}
                    disabled={loading || !jobDescription}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                    Generate Practice Questions
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'practice' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8"
              >
                <div className="flex justify-between items-center mb-8">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex gap-1">
                    {questions.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={cn(
                          "w-8 h-1 rounded-full transition-all",
                          idx === currentQuestionIndex ? "bg-blue-600 w-12" : idx < currentQuestionIndex ? "bg-green-500" : "bg-slate-200"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">
                  "{questions[currentQuestionIndex]}"
                </h3>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Your Answer</label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or use voice-to-text..."
                    className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-lg"
                  />
                  <div className="flex justify-between items-center pt-4">
                    <p className="text-slate-500 text-sm italic">Tip: Be specific and use the STAR method.</p>
                    <button
                      onClick={handleNextQuestion}
                      disabled={!currentAnswer}
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      {currentQuestionIndex === questions.length - 1 ? 'Finish & Get Feedback' : 'Next Question'}
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'feedback' && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Practice Session Complete!</h2>
                  <p className="text-slate-600 mb-8">AI is analyzing your responses to provide detailed feedback.</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Confidence</p>
                      <p className="text-2xl font-bold text-blue-600">High</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Clarity</p>
                      <p className="text-2xl font-bold text-purple-600">85%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Keywords</p>
                      <p className="text-2xl font-bold text-green-600">12/15</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep('setup')}
                    className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all"
                  >
                    Start New Session
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    Detailed AI Feedback
                  </h3>
                  <div className="space-y-6">
                    {aiFeedback.length > 0 ? aiFeedback.map((f, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-900 mb-2">Q: {f.question}</p>
                        <div className="flex items-start gap-3 text-sm text-slate-600">
                          <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={16} />
                          <p><span className="font-bold text-slate-800">Strength:</span> {f.strength}</p>
                        </div>
                        <div className="flex items-start gap-3 text-sm text-slate-600 mt-2">
                          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                          <p><span className="font-bold text-slate-800">Improvement:</span> {f.improvement}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                        <span className="ml-3 text-slate-600">AI is analyzing your answers...</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History size={18} />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Software Engineer Role</p>
                  <p className="text-xs text-slate-500">2 days ago • 5 Questions</p>
                </div>
              ))}
            </div>
          </div>

          <AdSense variant="square" />

          <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20">
            <h3 className="font-bold mb-2">Pro Tip</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Use the STAR method (Situation, Task, Action, Result) to structure your behavioral answers. It helps you stay focused and ensures you highlight your impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
