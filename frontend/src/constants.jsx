import React from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Code, 
  FolderGit2, 
  Award, 
  CheckCircle2, 
  Languages, 
  Plus 
} from 'lucide-react';

export const SECTION_TYPES = [
  { id: 'experience', title: 'Work Experience', icon: <Briefcase size={18} />, type: 'experience' },
  { id: 'education', title: 'Education', icon: <GraduationCap size={18} />, type: 'education' },
  { id: 'skills', title: 'Skills', icon: <Code size={18} />, type: 'skills' },
  { id: 'projects', title: 'Projects', icon: <FolderGit2 size={18} />, type: 'projects' },
  { id: 'awards', title: 'Awards', icon: <Award size={18} />, type: 'awards' },
  { id: 'certifications', title: 'Certifications', icon: <CheckCircle2 size={18} />, type: 'certifications' },
  { id: 'languages', title: 'Languages', icon: <Languages size={18} />, type: 'languages' },
  { id: 'custom', title: 'Custom Section', icon: <Plus size={18} />, type: 'custom' },
];

export const TEMPLATES = [
  { id: 'modern', name: 'Modern', description: 'Clean and professional', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AModern+Resume' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AMinimal+Resume' },
  { id: 'classic', name: 'Classic', description: 'Traditional layout', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AClassic+Resume' },
  { id: 'sidebar', name: 'Sidebar', description: 'Modern with sidebar', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0ASidebar+Resume' },
  { id: 'professional', name: 'Professional', description: 'Bold and authoritative', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AProfessional+Resume' },
  { id: 'compact', name: 'Compact', description: 'Space-efficient design', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0ACompact+Resume' },
  { id: 'elegant', name: 'Elegant', description: 'Serif-based luxury', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AElegant+Resume' },
  { id: 'creative', name: 'Creative', description: 'Modern and unique', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0ACreative+Resume' },
  { id: 'executive', name: 'Executive', description: 'High-level leadership', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AExecutive+Resume' },
  { id: 'technical', name: 'Technical', description: 'Focus on skills & tools', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0ATechnical+Resume' },
  { id: 'academic', name: 'Academic', description: 'Detailed research focus', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AAcademic+Resume' },
  { id: 'functional', name: 'Functional', description: 'Skill-based layout', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AFunctional+Resume' },
  { id: 'hybrid', name: 'Hybrid', description: 'Best of both worlds', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AHybrid+Resume' },
  { id: 'startup', name: 'Startup', description: 'Modern and energetic', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AStartup+Resume' },
  { id: 'corporate', name: 'Corporate', description: 'Strictly professional', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0ACorporate+Resume' },
  { id: 'ms-blue-grey', name: 'MS Blue Grey', description: 'Inspired by Microsoft Word', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AMS+Blue+Grey+Resume' },
  { id: 'ms-modern', name: 'MS Modern', description: 'Clean Microsoft style', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AMS+Modern+Resume' },
  { id: 'ms-simple', name: 'MS Simple', description: 'Basic Microsoft layout', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AMS+Simple+Resume' },
  { id: 'ms-professional', name: 'MS Professional', description: 'Traditional MS Word', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AMS+Professional+Resume' },
  { id: 'minimalist-dark', name: 'Midnight', description: 'Dark-themed minimal', image: 'https://placehold.co/400x600/0f172a/f8fafc?text=John+Doe%0AMidnight+Resume' },
  { id: 'bold-blue', name: 'Oceanic', description: 'Strong blue accents', image: 'https://placehold.co/400x600/2563eb/f8fafc?text=John+Doe%0AOceanic+Resume' },
  { id: 'clean-serif', name: 'Journal', description: 'Clean serif design', image: 'https://placehold.co/400x600/f8fafc/334155?text=John+Doe%0AJournal+Resume' },
];
