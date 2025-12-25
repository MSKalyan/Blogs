import express from 'express';
import requireAuth from '../middleware/authMiddleware.js';
import pool from '../models/db.js';

const router = express.Router();

// Add a comment
router.post('/:blogId', requireAuth, async (req, res) => {
    const { blogId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
     if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Comment content is required'
    });
  }

    try {
    const result = await pool.query(
            'INSERT INTO comments (blog_id, user_id, content) VALUES ($1, $2, $3)',
            [blogId, userId, content]
        );
res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: result.rows[0]
    });
  } catch (err) {
        console.error(err);
        res.status(500).json({success:false,message:'Failed to add comment'});
    }
});

export default router
