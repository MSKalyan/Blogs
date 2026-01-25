import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

// Build unlimited nested comment tree
function buildCommentTree(flatComments) {
  const map = {};
  flatComments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  const roots = [];

  flatComments.forEach((c) => {
    if (c.parent_comment_id) {
      map[c.parent_comment_id]?.replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]);
    }
  });

  return roots;
}

// Recursive comment item
function CommentItem({ comment, depth = 0, replyText, setReplyText, onReply, onReact }) {
  const indent = Math.min(depth, 6) * 18;

  return (
    <div style={{ marginLeft: indent }} className="mt-4">
      <div className="bg-gray-50 rounded-lg p-3 border">
        <div className="flex justify-between">
          <p className="font-semibold text-sm">{comment.author_name}</p>
          <p className="text-xs text-gray-500">
            {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
          </p>
        </div>

        <p className="text-gray-800 mt-1 whitespace-pre-line">
          {comment.content}
        </p>

        {/* Like / Dislike */}
        <div className="flex items-center gap-3 mt-2 text-sm">
          <button
            onClick={() => onReact(comment.id, "like")}
            className={`px-2 py-1 rounded border ${
              comment.my_reaction === "like" ? "bg-green-100" : "bg-white"
            }`}
          >
            👍 {comment.likes || 0}
          </button>

          <button
            onClick={() => onReact(comment.id, "dislike")}
            className={`px-2 py-1 rounded border ${
              comment.my_reaction === "dislike" ? "bg-red-100" : "bg-white"
            }`}
          >
            👎 {comment.dislikes || 0}
          </button>
        </div>

        {/* Reply input */}
        <div className="flex gap-2 mt-3">
          <input
            value={replyText[comment.id] || ""}
            onChange={(e) =>
              setReplyText({
                ...replyText,
                [comment.id]: e.target.value,
              })
            }
            placeholder="Reply..."
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => onReply(comment.id)}
            className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
          >
            Reply
          </button>
        </div>
      </div>

      {/* Render replies recursively */}
      {comment.replies?.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              depth={depth + 1}
              replyText={replyText}
              setReplyText={setReplyText}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);

  // comments
  const [comments, setComments] = useState([]); // flat list
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  const fetchComments = async () => {
    const commentsRes = await api.get(`/comments/blog/${id}`);
    setComments(commentsRes.data.comments || []);
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const blogRes = await api.get(`/blogs/${id}`);
        setBlog(blogRes.data.data.blog);

        await fetchComments();
      } catch (err) {
        console.error("Failed to load blog details:", err);
      }
    };

    fetchBlogData();
    // eslint-disable-next-line
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await api.post(`/comments/blog/${id}`, {
        content: newComment.trim(),
      });

      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // ✅ New reply endpoint
  const handleReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;

    try {
      await api.post(`/comments/${commentId}/reply`, {
        content: replyText[commentId].trim(),
      });

      setReplyText((prev) => ({ ...prev, [commentId]: "" }));
      await fetchComments();
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  // ✅ Like/Dislike endpoint
  const handleReact = async (commentId, type) => {
    try {
      await api.post(`/comments/${commentId}/react`, { type });
      await fetchComments();
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  if (!blog) {
    return <p className="text-center mt-20 text-gray-500">Loading blog...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <p className="text-sm text-gray-500 mb-2">
          By <span className="font-medium">{blog.author}</span>
        </p>

        <h1 className="text-3xl font-semibold mb-4">{blog.title}</h1>

        <p className="text-gray-700 whitespace-pre-line mb-6">{blog.content}</p>

        {blog.image && (
          <img
            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${blog.image}`}
            alt={blog.title}
            className="w-full max-h-[420px] object-cover rounded-lg mb-8"
          />
        )}

        {/* COMMENTS */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Comments</h3>

          {/* Add comment */}
          <div className="flex gap-2 mb-6">
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Comment
            </button>
          </div>

          {/* Comment thread */}
          {commentTree.length === 0 ? (
            <p className="text-gray-500">No comments yet</p>
          ) : (
            commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                replyText={replyText}
                setReplyText={setReplyText}
                onReply={handleReply}
                onReact={handleReact}
              />
            ))
          )}
        </div>

        <Link
          to="/blogs"
          className="inline-block mt-10 text-blue-600 font-medium hover:underline"
        >
          ← Back to blogs
        </Link>
      </div>
    </div>
  );
}

export default BlogDetails;
