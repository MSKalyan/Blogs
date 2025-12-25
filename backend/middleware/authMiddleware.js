import jwt from 'jsonwebtoken';

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  // If there's no token, redirect to login
  if (!token) {
    return res.status(401).json({success:false,message:"Authentication required"});
  }

  try {
    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If the token is valid, attach user data to the request object
    req.user = decoded;
    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    // Redirect to login if the token is invalid or expired
    res.status(403).json({success:false,message:"Admin access required"});
  }
}

export default requireAuth;
