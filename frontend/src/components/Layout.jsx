import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, Search, LayoutDashboard, LogOut, Rocket, User as UserIcon, Menu, X, Bot, Linkedin, DollarSign, Brain, Globe, Sparkles, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/builder', label: 'Resume Builder', icon: <FileText size={18} /> },
    { path: '/cover-letter', label: 'Cover Letter', icon: <FileText size={18} /> },
    { path: '/analyzer', label: 'ATS Analyzer', icon: <Search size={18} /> },
    { path: '/interview-prep', label: 'Interview Prep', icon: <Bot size={18} /> },
    { path: '/linkedin-optimizer', label: 'LinkedIn Optimizer', icon: <Linkedin size={18} /> },
    { path: '/salary-insights', label: 'Salary Insights', icon: <DollarSign size={18} /> },
    { path: '/skill-gap', label: 'Skill Gap', icon: <Brain size={18} /> },
    { path: '/offer-evaluator', label: 'Offer Evaluator', icon: <DollarSign size={18} /> },
    { path: '/career-roadmap', label: 'Career Roadmap', icon: <Rocket size={18} /> },
    { path: '/company-intelligence', label: 'Company Intel', icon: <Building2 size={18} /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen transition-all duration-300 z-50",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl shrink-0">
              <Rocket size={24} />
              <span>ProPath</span>
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors mx-auto lg:mx-0"
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all group",
                location.pathname === item.path 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
              )}
              title={isSidebarCollapsed ? item.label : ""}
            >
              <div className={cn(
                "shrink-0 transition-colors",
                location.pathname === item.path ? "text-white" : "text-slate-400 group-hover:text-blue-600"
              )}>
                {item.icon}
              </div>
              {!isSidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all",
              isSidebarCollapsed && "justify-center"
            )}
            title={isSidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Nav & Desktop Top Bar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 lg:z-30">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg lg:hidden transition-all"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl lg:hidden">
                <Rocket size={24} />
                <span>ProPath</span>
              </Link>
              <div className="hidden lg:block">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {user.isGuest && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-full border border-amber-200">
                      Guest
                    </span>
                  )}
                  <span className="text-sm font-bold text-slate-900">{user.displayName || 'User'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden sm:block">{user.email}</span>
              </div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
                {user.displayName?.charAt(0) || 'U'}
              </div>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all",
                        location.pathname === item.path 
                          ? "bg-blue-50 text-blue-600 shadow-sm" 
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        location.pathname === item.path ? "bg-blue-100" : "bg-slate-100"
                      )}>
                        {item.icon}
                      </div>
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-slate-100 mt-4">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut size={20} />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-8 px-4">
          <div className="container mx-auto text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} ProPath. All-in-one Career Suite.
          </div>
        </footer>
      </div>
    </div>
  );
}
