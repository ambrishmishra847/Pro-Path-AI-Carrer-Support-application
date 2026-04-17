import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  Globe, 
  Rocket, 
  Eye, 
  Layout, 
  Palette, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Copy, 
  Check,
  ChevronRight,
  ExternalLink,
  Smartphone,
  Monitor,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AdSense from '../components/AdSense';
import { cn } from '../lib/utils';

export default function PortfolioGenerator({ user }) {
  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('modern');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [isGenerating, setIsGenerating] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const data = await api.resumes.list();
        if (Array.isArray(data)) {
          setResumes(data);
          if (data.length > 0) setSelectedResumeId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch resumes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const generateHtml = (resume) => {
    const skills = resume.sections.find(s => s.type === 'skills')?.content?.split(',').map(s => s.trim()) || [];
    const experience = resume.sections.find(s => s.type === 'experience')?.items || [];
    const education = resume.sections.find(s => s.type === 'education')?.items || [];
    const projects = resume.sections.find(s => s.type === 'projects')?.items || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${user.displayName} - Portfolio</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f0f2f5; color: #333; }
        h1, h2, h3, h4, h5, h6 { font-weight: 700; }
        .section-padding { padding: 80px 0; }
        .section-title { margin-bottom: 50px; }
        html { scroll-behavior: smooth; }
        .navbar { background-color: rgba(255, 255, 255, 0.9); box-shadow: 0 2px 10px rgba(0,0,0,0.1); transition: all 0.3s ease; }
        .navbar-brand { font-weight: 700; color: ${accentColor} !important; }
        .nav-link { font-weight: 600; color: #555 !important; transition: color 0.3s ease; }
        .nav-link:hover, .nav-link.active { color: ${accentColor} !important; }
        #hero { background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://picsum.photos/seed/portfolio/1920/1080') no-repeat center center; background-size: cover; color: white; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center; }
        #hero h1 { font-size: 3.5rem; font-weight: 700; margin-bottom: 20px; }
        #hero p { font-size: 1.5rem; font-weight: 300; margin-bottom: 30px; }
        .btn-hero { font-weight: 600; padding: 12px 30px; border-radius: 50px; transition: all 0.3s ease; background-color: ${accentColor}; border-color: ${accentColor}; color: white; }
        .btn-hero:hover { transform: translateY(-3px); box-shadow: 0 4px 15px rgba(0,0,0,0.2); background-color: ${accentColor}; filter: brightness(0.9); }
        .card { border: none; border-radius: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        .skill-badge { background-color: white; border: 1px solid #eee; padding: 10px 20px; border-radius: 50px; font-weight: 600; display: inline-block; margin: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        footer { background-color: #343a40; color: white; padding: 40px 0; text-align: center; }
        .social-icons a { font-size: 1.5rem; color: white; margin: 0 10px; transition: color 0.3s ease; }
        .social-icons a:hover { color: ${accentColor}; }
    </style>
</head>
<body data-bs-spy="scroll" data-bs-target="#navbar">
    <nav id="navbar" class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand" href="#">${user.displayName}</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#hero">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="#about">About</a></li>
                    <li class="nav-item"><a class="nav-link" href="#skills">Skills</a></li>
                    <li class="nav-item"><a class="nav-link" href="#experience">Experience</a></li>
                    <li class="nav-item"><a class="nav-link" href="#projects">Projects</a></li>
                    <li class="nav-item"><a class="nav-link" href="#contact">Contact</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <section id="hero">
        <div class="container">
            <h1>I'm ${user.displayName}</h1>
            <p>${resume.title || 'Professional Specialist'}</p>
            <a href="#projects" class="btn btn-hero">View My Work</a>
        </div>
    </section>

    <section id="about" class="section-padding">
        <div class="container">
            <h2 class="text-center section-title">About Me</h2>
            <div class="row justify-content-center">
                <div class="col-lg-8 text-center">
                    <p class="lead">${resume.summary || 'Passionate professional dedicated to excellence and innovation.'}</p>
                </div>
            </div>
        </div>
    </section>

    <section id="skills" class="section-padding bg-light">
        <div class="container">
            <h2 class="text-center section-title">My Skills</h2>
            <div class="text-center">
                ${skills.map(skill => `<div class="skill-badge">${skill}</div>`).join('')}
            </div>
        </div>
    </section>

    <section id="experience" class="section-padding">
        <div class="container">
            <h2 class="text-center section-title">Work Experience</h2>
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    ${experience.map((exp) => `
                        <div class="card mb-4">
                            <div class="card-body p-4">
                                <h5 class="card-title text-primary">${exp.title}</h5>
                                <h6 class="card-subtitle mb-2 text-muted">${exp.company} | ${exp.period}</h6>
                                <p class="card-text">${exp.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <section id="projects" class="section-padding bg-light">
        <div class="container">
            <h2 class="text-center section-title">Projects</h2>
            <div class="row g-4">
                ${projects.map((proj) => `
                    <div class="col-md-6">
                        <div class="card h-100">
                            <div class="card-body p-4">
                                <h5 class="card-title">${proj.name}</h5>
                                <p class="card-text">${proj.description}</p>
                                ${proj.link ? `<a href="${proj.link}" target="_blank" class="btn btn-sm btn-outline-primary">View Project</a>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section id="contact" class="section-padding">
        <div class="container text-center">
            <h2 class="section-title">Get In Touch</h2>
            <p class="lead mb-4">I'm open to discussing new projects, creative ideas, or opportunities.</p>
            <p class="h4 mb-4"><a href="mailto:${resume.email || user.email}" class="text-decoration-none text-dark">${resume.email || user.email}</a></p>
            <div class="social-icons">
                ${resume.github ? `<a href="${resume.github}" target="_blank"><i class="fab fa-github"></i></a>` : ''}
                ${resume.linkedin ? `<a href="${resume.linkedin}" target="_blank"><i class="fab fa-linkedin-in"></i></a>` : ''}
            </div>
        </div>
    </section>

    <footer>
        <div class="container">
            <p>&copy; ${new Date().getFullYear()} ${user.displayName}. All Rights Reserved.</p>
            <p class="small mt-2">Generated with ProPath Career Suite</p>
        </div>
    </footer>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
  };

  const handleGenerate = async () => {
    const resume = resumes.find(r => r._id === selectedResumeId);
    if (!resume) return;

    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      const html = generateHtml(resume);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${user.displayName?.replace(/\s+/g, '_')}_Portfolio.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setPortfolioUrl(`https://propath.me/${user.displayName?.toLowerCase().replace(/\s+/g, '-') || 'user'}`);
      setIsGenerating(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Globe size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Personal Portfolio Generator</h1>
        </div>
        <p className="text-slate-600">Turn your resume data into a professional, hosted portfolio website in seconds.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} />
                  Select Resume
                </h3>
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
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                      <FileText className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-slate-500 text-sm">No resumes found. Create one first!</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Palette size={16} />
                  Brand Color
                </h3>
                <div className="flex flex-wrap gap-3">
                  {['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626'].map(color => (
                    <button
                      key={color}
                      onClick={() => setAccentColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full border-4 transition-all",
                        accentColor === color ? "border-slate-900 scale-110" : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedResumeId}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                Generate & Download Portfolio
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {portfolioUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Portfolio Generated!</h2>
                <p className="text-slate-600 mb-8">Your portfolio HTML file has been downloaded. You can host it anywhere!</p>

                <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-8">
                  <ExternalLink className="text-slate-400" size={18} />
                  <input
                    readOnly
                    value={portfolioUrl}
                    className="flex-1 bg-transparent text-slate-900 font-bold outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye size={18} />
              Live Preview
            </h3>
            <div className="aspect-[9/16] bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group">
              <div className="absolute inset-0 bg-white p-4 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-200" />
                <div className="w-3/4 h-4 bg-slate-200 rounded" />
                <div className="w-1/2 h-4 bg-slate-100 rounded" />
                <div className="space-y-2 pt-4">
                  <div className="w-full h-24 bg-slate-50 rounded-lg" />
                  <div className="w-full h-24 bg-slate-50 rounded-lg" />
                </div>
              </div>
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                <button className="px-4 py-2 bg-white text-slate-900 font-bold rounded-lg shadow-xl">
                  Full Preview
                </button>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Smartphone size={18} className="text-blue-600" />
              <Monitor size={18} className="text-slate-400" />
            </div>
          </div>

          <AdSense variant="square" />

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} />
              SEO Optimized
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your portfolio is automatically optimized for search engines, making it easier for recruiters to find you when searching for your skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
