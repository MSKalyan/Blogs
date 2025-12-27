import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as blogController from '../controllers/blogController.js';
import requireAuth from '../middleware/authMiddleware.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage });


router.get('/', requireAuth, blogController.getBlogList);

router.get('/myblogs', requireAuth, blogController.getMyBlogs);

// router.get('/create', requireAuth, blogController.getCreateBlog);
router.post('/create', requireAuth, upload.single('image'), blogController.postCreateBlog);

router.get('/:id', requireAuth, blogController.viewBlog);

// router.get('/:id/edit', requireAuth, blogController.getEditBlog);
router.post('/:id/edit', requireAuth, upload.single('image'), blogController.postEditBlog);

router.post('/:id/react', requireAuth, blogController.reactToBlog);

router.get('/:id/reactions', blogController.getReactions);

// router.get('/:id/delete', requireAuth, blogController.handleDeleteBlog);

export default router;
