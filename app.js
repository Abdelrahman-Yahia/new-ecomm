// index.js (Confirm this structure)

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const shirtRoutes = require('./routes/shirtRoutes');
const userRoutes = require('./routes/userRoutes'); // Ensure this is imported
const errorHandler = require('./middleware/errorMiddleware'); // Ensure this is imported (if you use it)
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS setup to allow requests from your frontend
app.use(cors()); // Uses the ORIGIN from .env

// Middleware to parse JSON request bodies
app.use(express.json());

// Mount the route handlers
app.use('/api/auth', authRoutes);
app.use('/api/shirts', shirtRoutes);
app.use('/api/users', userRoutes); // Mount user routes

// Centralized error handling (optional, but good practice)
app.use(errorHandler);

// Start the server
app.listen(port, () => console.log(`Server running on port ${port}`));
