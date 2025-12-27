import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";

function BlogDetails() {
  const { id } = useParams();

  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const blogRes = await api.get(`/blogs/${id}`);
        setBlog(blogRes.data.data.blog);

        const commentsRes = await api.get(`/comments`, {
          params: { blogId: id },
        });
        setComments(commentsRes.data.comments || []);
      } catch (err) {
        console.error("Failed to load blog details:", err);
      }
    };

    fetchBlogData();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await api.post("/comments", {
        blogId: id,
        text: newComment,
      });

      setComments([res.data.comment, ...comments]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText[commentId]?.trim()) return;

    try {
      const res = await api.post("/comments/reply", {
        commentId,
        text: replyText[commentId],
      });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...c.replies, res.data.reply] }
            : c
        )
      );

      setReplyText({ ...replyText, [commentId]: "" });
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await api.post("/comments/like", { commentId });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );
    } catch (err) {
      console.error("Failed to like comment:", err);
    }
  };

  const handleLikeReply = async (commentId, replyIdx) => {
    try {
      const replyId =
        comments.find((c) => c.id === commentId).replies[replyIdx].id;

      await api.post("/comments/likeReply", { replyId });

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: c.replies.map((r, i) =>
                  i === replyIdx ? { ...r, likes: r.likes + 1 } : r
                ),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Failed to like reply:", err);
    }
  };

  if (!blog) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading blog...
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
        <p className="text-sm text-gray-500 mb-2">
          By <span className="font-medium">{blog.author}</span>
        </p>

        <h1 className="text-3xl font-semibold mb-4">
          {blog.title}
        </h1>

        <p className="text-gray-700 whitespace-pre-line mb-6">
          {blog.content}
        </p>

        {blog.image && (
          <img
            src={`${process.env.REACT_APP_API_BASE_URL}/uploads/${blog.image}`}
            alt={blog.title}
            className="w-full max-h-[420px] object-cover rounded-lg mb-8"
          />
        )}

        {/* COMMENTS */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">
            Comments
          </h3>

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

          {/* Comment list */}
          <ul className="space-y-6">
            {comments.map((comment) => (
              <li key={comment.id}>
                <p className="font-medium">
                  {comment.user_name}
                </p>
                <p className="text-gray-700 mb-2">
                  {comment.text}
                </p>

                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className="text-sm text-blue-600 hover:underline mb-3"
                >
                  👍 {comment.likes}
                </button>

                {/* Replies */}
                {comment.replies?.map((reply, idx) => (
                  <div
                    key={idx}
                    className="ml-4 border-l pl-4 mb-2"
                  >
                    <p className="text-gray-700">
                      {reply.text}
                    </p>
                    <button
                      onClick={() =>
                        handleLikeReply(comment.id, idx)
                      }
                      className="text-sm text-blue-600 hover:underline"
                    >
                      👍 {reply.likes}
                    </button>
                  </div>
                ))}

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
                    onClick={() => handleReply(comment.id)}
                    className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                  >
                    Reply
                  </button>
                </div>
              </li>
            ))}
          </ul>
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
