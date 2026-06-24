require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const messageRoutes = require('./routes/messages');
const { apiLimiter } = require('./middleware/rateLimiters');

const app = express();

connectDB();

// Security headers
app.use(helmet());

// Lock CORS down to only your real frontend domain(s)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

app.use(express.json({ limit: '50kb' })); // small limit - this isn't a file upload API
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);

// Simple health/keep-alive endpoint - also used by the free cron-ping to prevent DB pause
app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
