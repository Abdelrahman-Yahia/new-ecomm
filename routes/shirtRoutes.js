// routes/shirtRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllShirts,
  getShirtById,
  createShirt,
  updateShirt,
  deleteShirt
} = require('../controllers/shirtController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware'); // Import the new middleware

// Public routes (no authentication needed)
router.get('/', getAllShirts); // Anyone can view all shirts
router.get('/:id', getShirtById); // Anyone can view a specific shirt

// Protected routes (authentication and specific roles required)
// Only users with 'admin' role can create, update, or delete shirts
router.post('/', authenticateToken, authorizeRoles('admin'), createShirt);
router.put('/:id', authenticateToken, authorizeRoles('admin'), updateShirt);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteShirt);

module.exports = router;
