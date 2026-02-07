const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { initDatabase, query } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const parseAllowedOrigins = () => {
  const configured = process.env.CORS_ORIGINS;
  if (configured && configured.trim().length > 0) {
    return configured
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  // Sensible dev defaults
  if (process.env.NODE_ENV === 'development') {
    return ['http://localhost:8080', 'http://localhost:5173'];
  }

  return [];
};

// Middleware
const allowedOrigins = parseAllowedOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients or same-origin requests
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Basic abuse protection (tune via env vars as needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/contact', publicFormLimiter);
app.use('/api/reservations', publicFormLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory (local storage)
// This is needed for locally-stored menu/wine images like "/uploads/xyz.jpg".
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Dei Frati API' });
});

// Base API route (useful for smoke tests when using an "/api" base URL)
app.get('/api', (req, res) => {
  res.json({ message: 'Dei Frati API', ok: true });
});

// Health check (useful for Railway and for verifying DB connectivity)
app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: 'ok' });
  } catch (error) {
    res.status(503).json({ ok: false, db: 'unreachable' });
  }
});

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Menu routes
app.use('/api/menu', require('./routes/menu'));

// Wines routes
app.use('/api/wines', require('./routes/wines'));

// Reservation routes
app.use('/api/reservations', require('./routes/reservations'));

// Contact routes
app.use('/api/contact', require('./routes/contact'));

// Upload routes
app.use('/api/upload', require('./routes/upload'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const start = async () => {
  try {
    await initDatabase();
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

module.exports = app;