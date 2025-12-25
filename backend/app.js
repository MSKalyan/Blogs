import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import indexRoutes from './routes/indexRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import multer from 'multer'
import { fileURLToPath } from 'url';

// Get the current directory (equivalent to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Initialize dotenv to use environment variables
dotenv.config();

// Configure storage options for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');  // Upload folder (ensure it exists)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique file name
  }
});

const upload = multer({ storage: storage });
// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/blogs', blogRoutes);
app.use('/admin', adminRoutes);
app.use('/comments', commentRoutes);
app.use('/uploads', express.static('uploads'));


// 404 page
app.use((req, res) => {
  res.status(404).send('Page Not Found');
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
