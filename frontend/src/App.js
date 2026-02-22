import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import BlogList from "./pages/BlogList";
import BlogDetails from "./pages/BlogDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBlogs from "./pages/MyBlogs";
import CreateBlog from "./pages/CreateBlog";
import EditProfile from "./pages/EditProfile";
import AdminRoute from "./components/adminRoute";
import Admin from "./pages/Admin"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:id" element={<BlogDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/myblogs" element={<MyBlogs/>}/>
          <Route path="/create" element={<CreateBlog/>}/>
          <Route path="/editprofile" element={<EditProfile/>}/>
          <Route path="/admin" element={<AdminRoute><Admin/></AdminRoute>}/>
        </Routes>
        </Layout>
    </Router>
  )
}

export default App;
