import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  Search, 
  Clock, 
  ChevronRight,
  Sparkles,
  FileEdit,
  Mail,
  Globe,
  LayoutDashboard,
  User as UserIcon,
  Bot,
  Linkedin,
  DollarSign,
  Brain,
  Map as MapIcon,
  Rocket,
  Building2,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import PdfUploadModal from '../components/PdfUploadModal';
import { cn } from '../lib/utils';

export default function Dashboard({ user }) {
  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: 'resume', id: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesData, lettersData] = await Promise.all([
          api.resumes.list(),
          api.coverLetters.list()
        ]);
        setResumes(Array.isArray(resumesData) ? resumesData : []);
        setCoverLetters(Array.isArray(lettersData) ? lettersData : []);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteResume = (id) => {
    setDeleteModal({ isOpen: true, type: 'resume', id });
  };

  const handleDeleteLetter = (id) => {
    setDeleteModal({ isOpen: true, type: 'letter', id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    
    try {
      if (deleteModal.type === 'resume') {
        await api.resumes.delete(deleteModal.id);
        setResumes(prev => prev.filter(r => r._id !== deleteModal.id));
      } else {
        await api.coverLetters.delete(deleteModal.id);
        setCoverLetters(prev => prev.filter(l => l._id !== deleteModal.id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleteModal({ isOpen: false, type: 'resume', id: null });
    }
  };

  const handleDuplicateResume = async (resume) => {
    try {
      const { _id, ...rest } = resume;
      const newResume = await api.resumes.create({
        ...rest,
        name: `${resume.name} (Copy)`
      });
      setResumes(prev => [newResume, ...prev]);
    } catch (err) {
      console.error("Duplicate failed:", err);
    }
  };

  const handleFileUpload = async (resumeId, file) => {
    if (!file) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      const updatedResume = await api.resumes.uploadFile(resumeId, formData);
      setResumes(prev => prev.map(r => r._id === resumeId ? updatedResume : r));
    } catch (err) {
      console.error("File upload failed:", err);
    }
  };

  const handlePdfParsed = (data) => {
    if (data._id) {
      setResumes(prev => [data, ...prev]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <PdfUploadModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
        onParsed={handlePdfParsed}
        userId={user.id}
      />
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.displayName?.split(' ')[0]}!</h1>
        <p className="text-slate-600">Manage your professional documents and optimize your career path.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Resumes Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">My Resumes</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-sm"
                >
                  <Upload size={18} />
                  Import PDF
                </button>
                <Link
                  to="/builder"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                  <Plus size={18} />
                  Create New
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {resumes.map((resume) => (
                  <motion.div
                    key={resume._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border",
                        resume.pdfUrl ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      )}>
                        {resume.previewImage ? (
                          <img src={resume.previewImage} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : resume.pdfUrl ? (
                          <FileText size={20} />
                        ) : (
                          <FileText size={20} />
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {resume.pdfUrl && (
                          <a 
                            href={resume.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="View PDF"
                          >
                            <Search size={16} />
                          </a>
                        )}
                        <label className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer" title="Replace Preview Image">
                          <Upload size={16} />
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(resume._id, e.target.files[0])}
                          />
                        </label>
                        <button
                          onClick={() => handleDuplicateResume(resume)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteResume(resume._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 truncate">{resume.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                      <Clock size={12} />
                      Updated {new Date(resume.lastUpdated).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/builder/${resume._id}`)}
                        className="flex-1 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <FileEdit size={14} />
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {resumes.length === 0 && !loading && (
                <div className="sm:col-span-2 py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <FileText className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No resumes yet. Start building your career today!</p>
                </div>
              )}
            </div>
          </section>

          {/* Cover Letters Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Mail className="text-purple-600" />
                <h2 className="text-xl font-bold text-slate-900">My Cover Letters</h2>
              </div>
              <Link
                to="/cover-letter"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
              >
                <Plus size={18} />
                Create New
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {coverLetters.map((letter) => (
                  <motion.div
                    key={letter._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                        <Mail size={20} />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteLetter(letter._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1 truncate">{letter.title}</h3>
                    <p className="text-xs text-slate-500 mb-1">{letter.companyName || 'No company specified'}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                      <Clock size={12} />
                      Updated {new Date(letter.lastUpdated).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/cover-letter/${letter._id}`)}
                        className="flex-1 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <FileEdit size={14} />
                        Edit
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {coverLetters.length === 0 && !loading && (
                <div className="sm:col-span-2 py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Mail className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="text-slate-500">No cover letters yet. Create one for your next application!</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Career Optimization Suite</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                to="/career-roadmap"
                className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl text-white shadow-xl shadow-indigo-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <MapIcon size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Career Roadmap</h3>
                  <p className="text-indigo-100 text-sm mb-4">Visualize your path from current role to your dream job.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Map My Future
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Rocket className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/company-intelligence"
                className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Company Intel</h3>
                  <p className="text-slate-300 text-sm mb-4">Get real-time "cheat sheets" and tech stack insights.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Research Company
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Globe className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/analyzer"
                className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-white shadow-xl shadow-blue-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Search size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">ATS Analyzer</h3>
                  <p className="text-blue-100 text-sm mb-4">Check your resume's compatibility with job descriptions using AI.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Try it now
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Sparkles className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/interview-prep"
                className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl text-white shadow-xl shadow-purple-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Bot size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">AI Interview Prep</h3>
                  <p className="text-purple-100 text-sm mb-4">Practice your interview skills with AI-generated questions.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Start Practice
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Bot className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/linkedin-optimizer"
                className="p-6 bg-gradient-to-br from-[#0077B5] to-[#005885] rounded-2xl text-white shadow-xl shadow-blue-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Linkedin size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">LinkedIn Optimizer</h3>
                  <p className="text-blue-100 text-sm mb-4">Boost your professional presence with AI suggestions.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Optimize Profile
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Linkedin className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/salary-insights"
                className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl text-white shadow-xl shadow-green-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Salary Insights</h3>
                  <p className="text-green-100 text-sm mb-4">Get real-time market data and negotiation strategies.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    View Insights
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <DollarSign className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/skill-gap"
                className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl text-white shadow-xl shadow-amber-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Brain size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Skill Gap Analysis</h3>
                  <p className="text-amber-100 text-sm mb-4">Identify missing skills and get learning recommendations.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Analyze Gaps
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Brain className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/portfolio"
                className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Globe size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Portfolio Generator</h3>
                  <p className="text-indigo-100 text-sm mb-4">Turn your resume into a professional hosted website.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Generate Portfolio
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Globe className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/networking"
                className="p-6 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl text-white shadow-xl shadow-teal-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Mail size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Networking AI</h3>
                  <p className="text-teal-100 text-sm mb-4">Generate personalized outreach emails for recruiters.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Draft Message
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <Mail className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>

              <Link
                to="/offer-evaluator"
                className="p-6 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl text-white shadow-xl shadow-rose-200 group relative overflow-hidden"
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <DollarSign size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Offer Evaluator</h3>
                  <p className="text-rose-100 text-sm mb-4">Compare job offers and practice salary negotiation.</p>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    Evaluate Offers
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                <DollarSign className="absolute top-4 right-4 text-white/10" size={80} />
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <AdSense variant="vertical" className="hidden lg:flex" />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
            <AdSense variant="square" className="mx-auto border-none shadow-none bg-transparent" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Deletion</h3>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this {deleteModal.type === 'resume' ? 'resume' : 'cover letter'}? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, type: 'resume', id: null })}
                    className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
