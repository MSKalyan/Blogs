// import express from 'express';
// import requireAuth from '../middleware/authMiddleware.js';  // Ensure you have authentication middleware
// import pool from '../models/db.js';
// import jwt from 'jsonwebtoken';
// import * as dashboardController from '../controllers/dashboardController.js';
// import bcrypt from 'bcryptjs'
// import setUser from '../middleware/setUser.js';
// const router = express.Router();

// router.get('/',setUser, async (req, res) => {
//   const search = req.query.search || '';

//   try {
//     const result = await pool.query(`
//       SELECT blogs.*, users.name AS author_name
//       FROM blogs
//       JOIN users ON blogs.author = users.id
//       WHERE blogs.title ILIKE $1 OR blogs.content ILIKE $1
//       ORDER BY blogs.created_at DESC
//     `, [`%${search}%`]);

//         res.json({
//       success: true,
//       blogs: result.rows
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// router.get('/dashboard', requireAuth, dashboardController.getDashboard);


// // GET request to show the Edit Profile page
// router.get('/edit-profile', requireAuth, async (req, res) => {
//   const userId = req.user.id;

//   try {
//     const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
//     const user = result.rows[0];
//     res.json({success:true,data:user});
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });

// // POST request to update the profile
// router.post('/edit-profile', requireAuth, async (req, res) => {
//   const userId = req.user.id;
//   const { name, email, password } = req.body;

//   try {
//     if (password && password.trim() !== "") {
//       // If user entered a new password, hash it
//       const hashedPassword = await bcrypt.hash(password, 10);
      
//       // Update name, email, and password
//       await pool.query(
//         'UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4',
//         [name, email, hashedPassword, userId]
//       );
//     } else {
//       // User did not enter a new password
//       await pool.query(
//         'UPDATE users SET name = $1, email = $2 WHERE id = $3',
//         [name, email, userId]
//       );
//     }

//     // Create a new token with updated name and email
//     const newToken = jwt.sign({ id: userId, name, email }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.cookie('token', newToken, { httpOnly: true });

//     res.json({
// 	success:true,
// 	message:'Profile updated successfully ',
// 	data:{
// 		id:userId,
// 		name,
// 		email
// 	}
// });
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server Error');
//   }
// });


// export default router;
