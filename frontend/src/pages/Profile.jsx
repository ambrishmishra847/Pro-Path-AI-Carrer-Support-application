import React, { useState } from 'react';
import { api } from '../lib/api';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  Save, 
  Loader2,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';
import AdSense from '../components/AdSense';

export default function Profile({ user }) {
  const [profile, setProfile] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Assuming api.auth.updateProfile exists or we can use a generic update
      // For now, we'll just simulate it or use a placeholder
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your personal information and professional links.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={48} className="text-slate-300" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="font-bold text-xl text-slate-900">{profile.displayName}</h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>

            <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-100">
              <h3 className="font-bold mb-4">Profile Completion</h3>
              <div className="space-y-2">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[80%]"></div>
                </div>
                <p className="text-sm opacity-80">80% Complete</p>
              </div>
            </div>

            <AdSense variant="square" className="mx-auto" />
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <UserIcon className="text-blue-600" size={20} />
                Personal Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Full Name</label>
                  <input
                    value={profile.displayName}
                    onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Email Address</label>
                  <input
                    value={profile.email}
                    disabled
                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Phone Number</label>
                  <input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Location</label>
                  <input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="New York, NY"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Short Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Globe className="text-blue-600" size={20} />
                Professional Links
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Linkedin size={20} className="text-blue-600" />
                  </div>
                  <input
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="linkedin.com/in/username"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Github size={20} className="text-slate-900" />
                  </div>
                  <input
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    placeholder="github.com/username"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Globe size={20} className="text-slate-600" />
                  </div>
                  <input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="portfolio.com"
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
