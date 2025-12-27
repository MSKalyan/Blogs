import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import pool from '../models/db.js'; // database connection

export const getLogin = (req, res) => {
  res.json({message:'Login endpoint'});
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    // If user not found
    if (userResult.rows.length === 0) {
      return res.status(400).send('Invalid credentials');
    }

    const user = userResult.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    // If password does not match
    if (!isMatch) {
      return res.status(400).send('Invalid credentials');
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Set the token in the cookie
   res.cookie("token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 1000
});
res.json({
  success: true,
  message: "Login successful",
  role: user.role
});

}
catch (err) {
    console.error(err);
    return res.status(500).send('Server error');
  }
};

export const getRegister = (req, res) => {
  res.json({message:'Register endpoint'});
};

export const postRegister = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("Name, email, and password are required.");
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    const result = await pool.query(
      'INSERT INTO users (name, email, password, created_at, role) VALUES ($1, $2, $3, NOW(), $4) RETURNING *',
      [name, email, hashedPassword, 'user'] // Default role is 'user'
    );

    const newUser = result.rows[0];

    res.status(201).json({success:true,message:'User registered successfully',
data:newUser});
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user.');
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({success:true,message:"Logged out successfully"});
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id; // comes from JWT (cookie)
  const { name, password } = req.body;

  try {
    // If password is provided, hash it
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);

      await pool.query(
        "UPDATE users SET name = $1, password = $2 WHERE id = $3",
        [name, hashedPassword, userId]
      );
    } else {
      // Update only name
      await pool.query(
        "UPDATE users SET name = $1 WHERE id = $2",
        [name, userId]
      );
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};