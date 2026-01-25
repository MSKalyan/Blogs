import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import * as commentController from "../controllers/commentController.js";

const router = express.Router();

// Get all comments for a blog
router.get("/blog/:blogId", requireAuth, commentController.getCommentsByBlog);

// Add top-level comment
router.post("/blog/:blogId", requireAuth, commentController.addComment);

// Reply to any comment (unlimited nesting)
router.post("/:commentId/reply", requireAuth, commentController.replyToComment);

// Like/Dislike toggle
router.post("/:commentId/react", requireAuth, commentController.reactToComment);

export default router;
