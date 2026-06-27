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

app.use(helmet());

// Permissive CORS for now - allows the live site to work while we confirm everything else
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json({ limit: '50kb' }));
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', async (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
