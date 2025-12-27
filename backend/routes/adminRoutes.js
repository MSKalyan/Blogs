import express from 'express';
import * as adminController from '../controllers/adminController.js';
import requireAuth from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/adminMiddleware.js';  // Import the requireAdmin middleware

const router = express.Router();
router.get('/adminpanel', requireAuth, requireAdmin, adminController.adminPanel);

router.get('/users/:id/blogs', requireAuth, requireAdmin, adminController.viewUserBlogs);

router.get('/blogs/:id/delete', requireAuth, requireAdmin, adminController.handleDeleteBlog);

router.get('/users/:id/delete', requireAuth, requireAdmin, adminController.handleDeleteUser);

export default router;
