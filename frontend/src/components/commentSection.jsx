import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";

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

function CommentItem({ comment, depth, onReply, onReact }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const indent = Math.min(depth, 6) * 18; // prevent infinite UI indent

  return (
    <div style={{ marginLeft: indent }} className="mt-4">
      <div className="bg-gray-50 rounded-lg p-3 border">
        <div className="flex justify-between">
          <p className="font-semibold text-sm">{comment.author_name}</p>
          <p className="text-xs text-gray-500">
            {new Date(comment.created_at).toLocaleString()}
          </p>
        </div>

        <p className="text-gray-800 mt-1 whitespace-pre-line">{comment.content}</p>

        {/* Reactions */}
        <div className="flex items-center gap-3 mt-2 text-sm">
          <button
            onClick={() => onReact(comment.id, "like")}
            className={`px-2 py-1 rounded border ${
              comment.my_reaction === "like" ? "bg-green-100" : "bg-white"
            }`}
          >
            👍 {comment.likes}
          </button>

          <button
            onClick={() => onReact(comment.id, "dislike")}
            className={`px-2 py-1 rounded border ${
              comment.my_reaction === "dislike" ? "bg-red-100" : "bg-white"
            }`}
          >
            👎 {comment.dislikes}
          </button>

          <button
            onClick={() => setShowReplyBox((s) => !s)}
            className="text-blue-600 hover:underline"
          >
            Reply
          </button>
        </div>

        {/* Reply Box */}
        {showReplyBox && (
          <div className="flex gap-2 mt-3">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={async () => {
                if (!replyText.trim()) return;
                await onReply(comment.id, replyText);
                setReplyText("");
                setShowReplyBox(false);
              }}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
            >
              Reply
            </button>
          </div>
        )}
      </div>

      {/* Recursively render replies */}
      {comment.replies?.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((r) => (
            <CommentItem
              key={r.id}
              comment={r}
              depth={depth + 1}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ blogId }) {
  const [flatComments, setFlatComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const commentTree = useMemo(() => buildCommentTree(flatComments), [flatComments]);

  const fetchComments = async () => {
    const res = await api.get(`/comments/blog/${blogId}`);
    setFlatComments(res.data.comments || []);
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [blogId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await api.post(`/comments/blog/${blogId}`, { content: newComment.trim() });
      setNewComment("");
      await fetchComments();
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId, content) => {
    await api.post(`/comments/${commentId}/reply`, { content });
    await fetchComments();
  };

  const handleReact = async (commentId, type) => {
    await api.post(`/comments/${commentId}/react`, { type });
    await fetchComments();
  };

  return (
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
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
        >
          Comment
        </button>
      </div>

      {/* Thread */}
      {commentTree.length === 0 ? (
        <p className="text-gray-500">No comments yet</p>
      ) : (
        commentTree.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            depth={0}
            onReply={handleReply}
            onReact={handleReact}
          />
        ))
      )}
    </div>
  );
}
