import express from "express";
import path from "path";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import multer from "multer";
import dns from "dns";
import { v2 as cloudinary } from "cloudinary";

// Override DNS servers to use Google Public DNS (helps with SRV resolution)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  console.log("🌐 DNS servers set to Google Public DNS");
} catch (e) {
  console.warn("⚠️ Failed to set DNS servers:", e.message);
}

import { User, Resume, CoverLetter } from "./models.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI = process.env.MONGODB_URI;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Config (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Connect to MongoDB
  if (MONGODB_URI) {
    console.log("🔍 Attempting to connect to MongoDB...");
    
    // DNS Debugging for SRV records
    if (MONGODB_URI.startsWith('mongodb+srv://')) {
      const host = MONGODB_URI.split('@')[1]?.split('/')[0];
      if (host) {
        dns.resolveSrv(`_mongodb._tcp.${host}`, (err, addresses) => {
          if (err) {
            console.warn("⚠️ DNS SRV Resolution Failed for host:", host);
            console.warn("   This confirms your network is blocking MongoDB SRV records.");
          } else {
            console.log("✅ DNS SRV Resolution Successful");
          }
        });
      }
    }

    // Check for common placeholders
    if (MONGODB_URI.includes('<password>') || MONGODB_URI.includes('<username>')) {
      console.error("❌ ERROR: Your MONGODB_URI contains placeholders like <password> or <username>.");
      console.error("   FIX: Replace these with your actual database credentials in the Settings menu.");
    }

    try {
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        family: 4, // Force IPv4 to avoid some DNS/Network issues
      });
      console.log("✅ Connected to MongoDB Atlas");
    } catch (err) {
      console.error("❌ MongoDB connection error details:");
      console.error("   Message:", err.message);
      
      if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv') || err.message.includes('TIMEOUT')) {
        console.error("   --------------------------------------------------");
        console.error("   POSSIBLE CAUSE: Network/DNS Blocking");
        console.error("   FIX: Use the 'Standard Connection String' (mongodb://) instead of 'mongodb+srv://'.");
        console.error("   1. In Atlas, click 'Connect' -> 'Connect your application'.");
        console.error("   2. Select Driver: Node.js, Version: 2.2.12 or earlier.");
        console.error("   3. Copy the long string starting with 'mongodb://'.");
        console.error("   --------------------------------------------------");
      } else if (err.message.includes('authentication failed')) {
        console.error("   --------------------------------------------------");
        console.error("   POSSIBLE CAUSE: Wrong Username or Password");
        console.error("   FIX: Check your MONGODB_URI for typos. Ensure <password> is replaced with your actual password.");
        console.error("   --------------------------------------------------");
      } else if (MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1')) {
        console.error("   --------------------------------------------------");
        console.error("   POSSIBLE CAUSE: Local MongoDB not running");
        console.error("   FIX: Ensure MongoDB is installed and running on your machine.");
        console.error("   Download: https://www.mongodb.com/try/download/community");
        console.error("   --------------------------------------------------");
      } else {
        console.error("   Full Error Object:", err);
      }
    }
  } else {
    console.warn("MONGODB_URI not provided. Running without database.");
  }

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      env: {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasGeminiKey: !!process.env.GEMINI_API_KEY
      }
    });
  });

  // Auth Middleware
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    console.log("📝 Registration attempt for:", req.body.email);
    
    // Check DB Connection
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Registration failed: Database not connected");
      return res.status(503).json({ error: "Database connection is not ready. Please check your MONGODB_URI." });
    }

    try {
      const { email, password, displayName } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.warn("⚠️ Registration failed: Email already exists", email);
        return res.status(400).json({ error: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ email, password: hashedPassword, displayName });
      await user.save();
      
      console.log("✅ User registered successfully:", email);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ token, user: { email, displayName, id: user._id } });
    } catch (err) {
      console.error("❌ Registration error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    console.log("🔑 Login attempt for:", req.body.email);

    // Check DB Connection
    if (mongoose.connection.readyState !== 1) {
      console.error("❌ Login failed: Database not connected");
      return res.status(503).json({ error: "Database connection is not ready. Please check your MONGODB_URI." });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) {
        console.warn("⚠️ Login failed: User not found", email);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.warn("⚠️ Login failed: Incorrect password for", email);
        return res.status(401).json({ error: "Invalid email or password" });
      }

      console.log("✅ User logged in successfully:", email);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET);
      res.json({ token, user: { email: user.email, displayName: user.displayName, id: user._id } });
    } catch (err) {
      console.error("❌ Login error:", err);
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/auth/me", authenticate, async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ email: user.email, displayName: user.displayName, id: user._id });
  });

  // Resume Routes
  app.get("/api/resumes", authenticate, async (req, res) => {
    const resumes = await Resume.find({ userId: req.userId }).sort({ lastUpdated: -1 });
    res.json(resumes);
  });

  app.get("/api/resumes/:id", authenticate, async (req, res) => {
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId });
    if (!resume) return res.status(404).json({ error: "Resume not found" });
    res.json(resume);
  });

  app.post("/api/resumes", authenticate, async (req, res) => {
    const resume = new Resume({ ...req.body, userId: req.userId });
    await resume.save();
    res.json(resume);
  });

  app.put("/api/resumes/:id", authenticate, async (req, res) => {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    res.json(resume);
  });

  app.delete("/api/resumes/:id", authenticate, async (req, res) => {
    await Resume.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  });

  // Image Upload Route
  app.post("/api/resumes/:id/upload", authenticate, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Upload to Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "propath_resumes",
        resource_type: "auto"
      });

      // Update Resume with Cloudinary URL
      const resume = await Resume.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { previewImage: result.secure_url, lastUpdated: new Date() },
        { new: true }
      );

      res.json(resume);
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Cover Letter Routes
  app.get("/api/cover-letters", authenticate, async (req, res) => {
    const letters = await CoverLetter.find({ userId: req.userId }).sort({ lastUpdated: -1 });
    res.json(letters);
  });

  app.get("/api/cover-letters/:id", authenticate, async (req, res) => {
    const letter = await CoverLetter.findOne({ _id: req.params.id, userId: req.userId });
    if (!letter) return res.status(404).json({ error: "Cover letter not found" });
    res.json(letter);
  });

  app.post("/api/cover-letters", authenticate, async (req, res) => {
    const letter = new CoverLetter({ ...req.body, userId: req.userId });
    await letter.save();
    res.json(letter);
  });

  app.put("/api/cover-letters/:id", authenticate, async (req, res) => {
    const letter = await CoverLetter.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body, lastUpdated: new Date() },
      { new: true }
    );
    res.json(letter);
  });

  app.delete("/api/cover-letters/:id", authenticate, async (req, res) => {
    await CoverLetter.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  });

  // Vite middleware for development (Optional)
  if (process.env.NODE_ENV !== "production" && process.env.API_ONLY !== "true") {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: path.resolve(__dirname, '../frontend'),
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Vite middleware enabled");
    } catch (err) {
      console.warn("Vite not found or failed to load. Running as API-only server.");
    }
  } else if (process.env.NODE_ENV === "production") {
    const distPath = path.resolve(__dirname, '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
