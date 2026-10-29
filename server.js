require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const studentsRouter = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/students', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database is not connected. Check MONGODB_URI and Atlas network access.' });
  }
  next();
}, studentsRouter);

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((req, res) => res.status(404).send('Page not found.'));

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('Unable to start: MONGODB_URI is missing. Copy .env.example to .env and add your Atlas URI.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => console.log(`Student Management System running at http://localhost:${PORT}`));
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

start();
