# ProPath - Full Stack Application

ProPath - AI Career Suite

ProPath is a comprehensive, full-stack career development platform designed to empower job seekers with AI-driven tools. From building professional resumes to optimizing LinkedIn profiles and preparing for interviews, ProPath provides an all-in-one solution for modern career management.

## 🚀 Key Features

### 1. AI-Powered Resume Builder
*   **20+ Professional Templates**: Choose from a wide variety of designs, including Modern, Minimal, Executive, and Technical layouts.
*   **AI Summary Generator**: Automatically craft compelling professional summaries based on your skills and experience.
*   **AI Content Enhancement**: Use the "AI Enhance" feature to rewrite bullet points and descriptions for maximum impact.
*   **PDF Import & Parsing**: Upload an existing PDF resume and let our AI extract and structure the data for you.
*   **Real-time Preview**: See exactly how your resume looks as you type.
*   **Custom Sections**: Add tailored sections for Awards, Projects, Certifications, or any custom content.
*   **A/B Testing**: Easily duplicate resumes to test different versions for different job applications.
*   **Multi-language Support**: Translate your resume into multiple languages with a single click.

### 2. Portfolio Website Generator
*   **Instant Conversion**: Turn your resume data into a fully responsive, professional portfolio website.
*   **Customizable Themes**: Select from multiple portfolio templates (Modern, Minimal, Creative, Dark).
*   **Single-File Export**: Download a standalone HTML file that you can host anywhere.

### 3. ATS Optimization & Analysis
*   **ATS Score**: Get an instant score on how well your resume is optimized for Applicant Tracking Systems.
*   **Keyword Analysis**: Identify missing keywords based on specific job descriptions.
*   **Formatting Checks**: Ensure your resume is readable by automated systems.

### 4. Career Tools Suite
*   **Cover Letter Builder**: Generate personalized cover letters tailored to specific roles using AI.
*   **LinkedIn Optimizer**: Get actionable advice on how to improve your LinkedIn profile visibility.
*   **Interview Prep**: Practice with AI-generated interview questions specific to your industry and role.
*   **Skill Gap Analysis**: Compare your current skills against job requirements to identify areas for growth.
*   **Salary Insights**: Access data-driven insights into market rates for your position.

### 5. Smart Sharing & Networking
*   **QR Code Sharing**: Generate a unique QR code for your digital resume to share at networking events.
*   **Interactive Digital Resume**: Share a live link to your resume that recruiters can view on any device.
*   **Offer Evaluator**: Compare multiple job offers based on salary, benefits, and growth potential.

## 🛠️ Technical Stack

*   **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion.
*   **Backend**: Node.js, Express, MongoDB (Mongoose).
*   **AI Integration**: Google Gemini AI (via `@google/genai`).
*   **PDF Processing**: PDF.js for extraction and `html2pdf.js` for generation.
*   **Authentication**: Secure JWT-based authentication with Bcrypt password hashing.

## 🌐 How it Works

1.  **Build**: Input your details manually or import an existing PDF.
2.  **Optimize**: Use AI tools to polish your content and ensure ATS compatibility.
3.  **Design**: Choose a template and accent color that matches your professional brand.
4.  **Share**: Download as a PDF, generate a portfolio site, or share via a live link/QR code.

---
*ProPath - Navigating your professional journey with intelligence.*


## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas URI)
- Gemini API Key (for AI features)

## Setup Instructions

### 1. Backend Setup
Navigate to the backend directory:
```bash
cd backend
npm install
```
Create a `.env` file in `backend/` (see `backend/.env.example`) and start the server:
```bash
npm run dev
```

### 2. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
```
Create a `.env` file in `frontend/` (see `frontend/.env.example`) and start the development server:
```bash
npm run dev
```

### 3. Root Helper Commands
From the `propath` root directory, you can also use these helper commands:
- `npm run install:all`: Installs dependencies for both frontend and backend.
- `npm run dev`: Starts the backend server (which also serves the frontend in development mode via Vite middleware).
- `npm run build`: Builds the frontend for production.

## Project Structure

- `/frontend`: Contains the React application (Vite, Tailwind CSS, Lucide Icons).
- `/backend`: Contains the Node.js/Express server, Mongoose models, and API routes.
- `package.json`: Main package file that manages workspaces and scripts.

## Building for Production

To build the frontend for production:
```bash
npm run build
```

To run the production build:
```bash
npm start
```
