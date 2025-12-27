import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to MyBlog
      </h1>

      <p className="text-lg text-gray-600 max-w-xl mb-10">
        Share your thoughts, stories, and knowledge with the world.
      </p>

      <section className="border-t pt-8 w-full max-w-xl">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Discover Amazing Blogs
        </h2>

        {isLoggedIn ? (
          <Link
            to="/blogs"
            className="inline-block text-blue-600 font-medium hover:underline"
          >
            Explore the latest blogs from our community →
          </Link>
        ) : (
          <p className="font-medium text-gray-700">
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>{" "}
            or{" "}
            <Link
              to="/register"
              className="text-blue-600 hover:underline"
            >
              Register
            </Link>{" "}
            to start writing your own blogs and connect with others!
          </p>
        )}
      </section>
    </div>
  );
}

export default Home;
