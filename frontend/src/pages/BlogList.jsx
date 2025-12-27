import { useEffect, useState } from "react";
import BlogCard from "../components/BlogCard";
import api from "../api/api";

function BlogList() {
  const [name, setName] = useState("");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const userRes = await api.get("/auth/me");
        setName(userRes.data.name);

        const blogRes = await api.get("/blogs");
        setBlogs(blogRes.data.data || []);
      } catch (err) {
        console.error("Not authenticated or error fetching data");
      }
    };

    fetchUserAndBlogs();
  }, []);

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
    </div>
  );
}

export default BlogList;
