import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './lib/api';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import CoverLetterBuilder from './pages/CoverLetterBuilder';
import ATSAnalyzer from './pages/ATSAnalyzer';
import Profile from './pages/Profile';
import InterviewPrep from './pages/InterviewPrep';
import LinkedInOptimizer from './pages/LinkedInOptimizer';
import SalaryInsights from './pages/SalaryInsights';
import SkillGapAnalysis from './pages/SkillGapAnalysis';
import PortfolioGenerator from './pages/PortfolioGenerator';
import Networking from './pages/Networking';
import OfferEvaluator from './pages/OfferEvaluator';
import CareerRoadmap from './pages/CareerRoadmap';
import CompanyIntelligence from './pages/CompanyIntelligence';
import Login from './pages/Login';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const guestUser = localStorage.getItem('guestUser');

      if (token) {
        try {
          const userData = await api.auth.me();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('token');
        }
      } else if (guestUser) {
        setUser(JSON.parse(guestUser));
      }
      
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.removeItem('guestUser');
    setUser(userData);
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      email: 'guest@propath.com',
      displayName: 'Guest User',
      isGuest: true
    };
    localStorage.setItem('guestUser', JSON.stringify(guestUser));
    setUser(guestUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('guestUser');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} onGuestLogin={handleGuestLogin} /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <Layout user={user} onLogout={handleLogout}><Dashboard user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/builder"
          element={user ? <Layout user={user} onLogout={handleLogout}><ResumeBuilder user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/builder/:id"
          element={user ? <Layout user={user} onLogout={handleLogout}><ResumeBuilder user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/cover-letter"
          element={user ? <Layout user={user} onLogout={handleLogout}><CoverLetterBuilder user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/cover-letter/:id"
          element={user ? <Layout user={user} onLogout={handleLogout}><CoverLetterBuilder user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/analyzer"
          element={user ? <Layout user={user} onLogout={handleLogout}><ATSAnalyzer user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Layout user={user} onLogout={handleLogout}><Profile user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/interview-prep"
          element={user ? <Layout user={user} onLogout={handleLogout}><InterviewPrep user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/linkedin-optimizer"
          element={user ? <Layout user={user} onLogout={handleLogout}><LinkedInOptimizer user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/salary-insights"
          element={user ? <Layout user={user} onLogout={handleLogout}><SalaryInsights user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/skill-gap"
          element={user ? <Layout user={user} onLogout={handleLogout}><SkillGapAnalysis user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/portfolio"
          element={user ? <Layout user={user} onLogout={handleLogout}><PortfolioGenerator user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/networking"
          element={user ? <Layout user={user} onLogout={handleLogout}><Networking user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/offer-evaluator"
          element={user ? <Layout user={user} onLogout={handleLogout}><OfferEvaluator user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/career-roadmap"
          element={user ? <Layout user={user} onLogout={handleLogout}><CareerRoadmap user={user} /></Layout> : <Navigate to="/login" />}
        />
        <Route
          path="/company-intelligence"
          element={user ? <Layout user={user} onLogout={handleLogout}><CompanyIntelligence user={user} /></Layout> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}
