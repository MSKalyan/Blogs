import React, { useEffect, useState } from "react";
import api from "../api/api";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cookies are sent automatically
        const userRes = await api.get("/admin/adminpanel");
        setUsers(userRes.data.users || []);

        const blogRes = await api.get("/admin/blogs");
        setBlogs(blogRes.data.blogs || []);
      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("User deleted successfully!");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Could not delete user.");
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await api.delete(`/admin/blogs/${id}`);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      alert("Blog deleted successfully!");
    } catch (err) {
      console.error("Failed to delete blog:", err);
      alert("Could not delete blog.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading admin data...</p>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Admin Dashboard
      </h1>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Manage Users
        </h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((u) => (
              <li key={u.id} className="flex justify-between items-center py-3">
                <span>
                  <b>{u.name}</b> — {u.email} ({u.role})
                </span>
                <button
                  onClick={() => handleDeleteUser(u.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
          Manage Blogs
        </h2>

        {blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {blogs.map((b) => (
              <li key={b.id} className="flex justify-between items-center py-3">
                <div>
                  <b>{b.title}</b>{" "}
                  <span className="text-gray-600">
                    — by {b.author_name}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => (window.location.href = `/blogs/${b.id}`)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(b.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Admin;
