import { getAllUsers, getUserById, getUserBlogs, deleteUser, deleteBlog } from '../models/adminModel.js';
import pool from '../models/db.js';

export const adminPanel = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const search = req.query.search || '';
    const role = req.query.role || '';

    // Fetch filtered users
    const users = await getAllUsers(page, limit, search, role);

    // Count total users with the same filters
    const filterQuery = `
      SELECT COUNT(*) FROM users
      WHERE name != 'admin'
      AND (name ILIKE $1 OR email ILIKE $1)
      ${role ? `AND role = '${role}'` : ''}
    `;
    const countResult = await pool.query(filterQuery, [`%${search}%`]);
    const totalUsers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json('admin/adminPanel', {
      user: req.user,
      users,
      currentPage: page,
      totalPages,
      search,
      role
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

export const viewUserBlogs = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const search = req.query.search || '';
  const category = req.query.category || ''; // Corrected: use category param

  try {
    // Calculate the OFFSET for pagination
    const offset = (page - 1) * limit;

    // Fetch blogs with pagination, search, and category filter
    const blogs = await getUserBlogs(id, page, limit, search, category);

    // Get the total number of blogs based on search and category filter
    const result = await pool.query(
      'SELECT COUNT(*) FROM blogs WHERE author = $1 AND (title ILIKE $2 OR content ILIKE $2) AND ($3 = \'\' OR category = $3)',
      [id, `%${search}%`, category]
    );
    const names = await pool.query(`SELECT users.name FROM users JOIN blogs ON blogs.author=users.id`);
    const name= names.rows[0]?.name;
    const totalBlogs = parseInt(result.rows[0].count);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.render('admin/viewUserBlogs', {
      blogs,
      currentPage: page,
      totalPages,
      userId: id,
      name,
      search,
      category
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete a specific user's blog
export const handleDeleteBlog = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteBlog(id);  // Delete the blog
    res.redirect('/admin/adminpanel');  // Redirect to admin panel after deletion
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Delete a user
export const handleDeleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteUser(id); // Delete the user from the database
    res.redirect('/admin/adminpanel'); // Redirect to admin panel after user deletion
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

// Admin middleware to ensure that only admin can access the routes
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  res.status(403).send('Access denied: Admins only.');
}

export default requireAdmin;
