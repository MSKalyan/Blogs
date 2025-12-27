import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setIsLoggedIn(true);
        setRole(res.data.role);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setRole(null);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setIsLoggedIn(false);
      setRole(null);
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav style={styles.navbar}>
      {/* Sidebar toggle */}
      {isLoggedIn && <button onClick={toggleSidebar}>☰</button>}

      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <h2 style={styles.logo}>MyBlog</h2>
      </Link>

      <div style={styles.links}>
        {isLoggedIn ? (
          <>
            {/* Search bar */}
            <input
              type="text"
              placeholder="Search blogs..."
              style={styles.search}
            />

            <div style={styles.rightSection}>
              {/* Admin Panel */}
              {role === "admin" && (
                <Link to="/admin" style={styles.adminBtn}>
                  Admin Panel
                </Link>
              )}

              {/* Logout */}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Login
            </Link>
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
