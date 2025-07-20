// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware'); // Import the new middleware
const { getUserProfile, getAllUsers } = require('../controllers/userController');

// Get logged-in user profile (any authenticated user can view their own profile)
router.get('/profile', authenticateToken, getUserProfile);

// Get list of all users (restricted to 'admin' role)
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers); // Apply authorizeRoles here

module.exports = router;
