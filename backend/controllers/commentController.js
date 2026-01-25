import pool from "../models/db.js";

// GET /api/comments/blog/:blogId
export const getCommentsByBlog = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.user?.id;

    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.blog_id,
        c.user_id,
        c.parent_comment_id,
        c.content,
        c.created_at,
        u.name AS author_name,

        COALESCE(SUM(CASE WHEN cr.type = 'like' THEN 1 ELSE 0 END), 0) AS likes,
        COALESCE(SUM(CASE WHEN cr.type = 'dislike' THEN 1 ELSE 0 END), 0) AS dislikes,

        MAX(CASE WHEN cr.user_id = $2 THEN cr.type ELSE NULL END) AS my_reaction
      FROM comments c
      JOIN users u ON u.id = c.user_id
      LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
      WHERE c.blog_id = $1
      GROUP BY c.id, u.name
      ORDER BY c.created_at ASC
      `,
      [blogId, userId]
    );

    res.json({ success: true, comments: result.rows });
  } catch (err) {
    console.error("getCommentsByBlog error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/comments/blog/:blogId
export const addComment = async (req, res) => {
  try {
    const blogId = req.params.blogId;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    }

    const inserted = await pool.query(
      `
      INSERT INTO comments (blog_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, NULL, $3)
      RETURNING *
      `,
      [blogId, userId, content.trim()]
    );

    res.status(201).json({ success: true, comment: inserted.rows[0] });
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/comments/:commentId/reply
export const replyToComment = async (req, res) => {
  try {
    const parentCommentId = req.params.commentId;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Reply cannot be empty" });
    }

    const parent = await pool.query(
      `SELECT id, blog_id FROM comments WHERE id = $1`,
      [parentCommentId]
    );

    if (parent.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Parent comment not found" });
    }

    const blogId = parent.rows[0].blog_id;

    const inserted = await pool.query(
      `
      INSERT INTO comments (blog_id, user_id, parent_comment_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [blogId, userId, parentCommentId, content.trim()]
    );

    res.status(201).json({ success: true, reply: inserted.rows[0] });
  } catch (err) {
    console.error("replyToComment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/comments/:commentId/react
export const reactToComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;
    const { type } = req.body; // like/dislike

    if (!["like", "dislike"].includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid reaction type" });
    }

    const existing = await pool.query(
      `SELECT type FROM comment_reactions WHERE comment_id=$1 AND user_id=$2`,
      [commentId, userId]
    );

    if (existing.rows.length > 0) {
      if (existing.rows[0].type === type) {
        await pool.query(
          `DELETE FROM comment_reactions WHERE comment_id=$1 AND user_id=$2`,
          [commentId, userId]
        );
        return res.json({ success: true, status: "removed" });
      }

      await pool.query(
        `UPDATE comment_reactions SET type=$1 WHERE comment_id=$2 AND user_id=$3`,
        [type, commentId, userId]
      );
      return res.json({ success: true, status: "updated" });
    }

    await pool.query(
      `INSERT INTO comment_reactions (comment_id, user_id, type) VALUES ($1, $2, $3)`,
      [commentId, userId, type]
    );

    return res.json({ success: true, status: "created" });
  } catch (err) {
    console.error("reactToComment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
