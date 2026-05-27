import { getAllMyBlogs } from '../models/blogModel.js'; // Import the function to get blogs by user ID

// Controller for rendering the dashboard with user's blogs
export const getDashboard = async (req, res) => {
  const userId = req.user.id;  // Assuming user ID is in the token (JWT)

  try {
    const blogs = await getAllMyBlogs(userId);
    res.json({success:true,data:{
      user: req.user,  
     blogs: blogs    
}
    });
  } catch (err) {
    console.error("error is : ",err);
    res.status(500).send('Server Error');
  }
};