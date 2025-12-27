import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function MyBlogs() {
  const [name, setName] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // get logged-in user
        const userRes = await api.get("/auth/me");
        setName(userRes.data.name);

        // get user's blogs
        const blogRes = await api.get("/blogs/myblogs");
        setBlogs(blogRes.data.data || []);
      } catch (err) {
        console.error(err);
        setNotLoggedIn(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (notLoggedIn) return <p>Please log in to see your blogs.</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>{name}'s Blogs</h2>

      <button
        onClick={() => navigate("/create")}
        style={{ marginBottom: "1rem" }}
      >
        + Add New Blog
      </button>

      {!blogs || blogs.length === 0 ? (
        <p>You have not created any blogs yet.</p>
      ) : (
        blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            name={name}
            showActions={true}
          />
        ))
      )}
    </div>
  );
}

export default MyBlogs;
