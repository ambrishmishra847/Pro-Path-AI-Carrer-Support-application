import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  title: { type: String },
  email: { type: String },
  phone: { type: String },
  location: { type: String },
  summary: { type: String },
  sections: [{
    id: String,
    title: String,
    content: String,
    items: [mongoose.Schema.Types.Mixed]
  }],
  templateId: { type: String, default: 'modern' },
  accentColor: { type: String, default: '#2563eb' },
  previewImage: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

export const Resume = mongoose.model('Resume', resumeSchema);

const coverLetterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  recipientName: { type: String },
  recipientTitle: { type: String },
  companyName: { type: String },
  content: { type: String },
  lastUpdated: { type: Date, default: Date.now }
});

export const CoverLetter = mongoose.model('CoverLetter', coverLetterSchema);
