const express = require('express');
const connectDB = require('./config/db'); // MongoDB connection
const cors = require('cors');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', require('./routes/students')); // Student routes
app.use('/api/subjects', require('./routes/subjects')); // Subject routes
app.use('/api/scores', require('./routes/scores')); // Score routes
app.use('/api/results', require('./routes/results')); // Result routes
app.use('/api/gradingRules', require('./routes/gradingRules')); // Grading rule routes

// Default route
app.get('/', (req, res) => res.send('API is running...'));

module.exports = app;
