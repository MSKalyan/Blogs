import { useEffect, useState } from "react";
import api from "../api/api";

function EditProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch current user (cookie-based auth)
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setName(res.data.name);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch profile failed:", err);
        setMessage("Please log in to view your profile.");
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await api.put("/auth/update", { name, password });

      setMessage("Profile updated successfully!");
      setUser((prev) => ({ ...prev, name }));
      setPassword("");
    } catch (err) {
      console.error("Update profile failed:", err);
      setMessage("Error updating profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>{message}</p>;

  return (
    <div style={{ maxWidth: "500px", margin: "2rem auto" }}>
      <h2>My Profile</h2>

      {message && (
        <p
          style={{
            color: message.includes("success") ? "green" : "red",
            marginBottom: "1rem",
          }}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Email:</label>
          <input
            type="text"
            value={user.email}
            disabled
            style={{ width: "100%", padding: "0.5rem", background: "#eee" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Role:</label>
          <input
            type="text"
            value={user.role}
            disabled
            style={{ width: "100%", padding: "0.5rem", background: "#eee" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>New Password:</label>
          <input
            type="password"
            placeholder="Leave blank to keep current password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button
          type="submit"
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default EditProfile;
