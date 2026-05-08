const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const moviesRouter = require('./routes/movies');
const seriesRouter = require('./routes/series');
const genresRouter = require('./routes/genres');

const app = express();
const PORT = process.env.PORT || 3000;

// Cache: TTL of 30 minutes (1800 seconds)
const cache = new NodeCache({ stdTTL: 1800, checkperiod: 600 });
app.locals.cache = cache;

// CORS - allow all origins for development
app.use(cors());

// Rate limiting - 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
app.use('/api/movies', moviesRouter);
app.use('/api/series', seriesRouter);
app.use('/api/genres', genresRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
});

module.exports = app;
