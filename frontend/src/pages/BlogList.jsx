import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import api from "../api/api";

function BlogList() {
  const [name, setName] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setName(userRes.data.name);

        const blogRes = await api.get(`/blogs?page=${page}&limit=10`);

        // ✅ FIX HERE
        setBlogs(blogRes.data.blogs || []);
        setTotalPages(blogRes.data.totalPages || 1);
      } catch (err) {
        console.error("Not authenticated or error fetching data");
      }
    };

    fetchUserAndBlogs();
  }, [page]);

  return (
    <div style={{ padding: "1rem" }}>
      {name && <h1>Welcome, {name}</h1>}

      {blogs.length === 0 ? (
        <p>No blogs found</p>
      ) : (
        blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} name={blog.author_name} />
        ))
      )}

      {/* ✅ Pagination Controls */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default BlogList;
