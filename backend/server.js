import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import reservationsRoutes from './routes/reservations.routes.js';
import chargesRoutes from './routes/charges.routes.js';


// Import services
import { testConnection } from './services/supabase.js';

// Import routes
import lotsRoutes from './routes/lots.routes.js';
import authRoutes from './routes/auth.routes.js';
import inquiriesRoutes from './routes/inquiries.routes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Jack\'s Landing RV Resort API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  const isConnected = await testConnection();
  res.status(isConnected ? 200 : 500).json({
    success: isConnected,
    message: isConnected ? 'Database connected!' : 'Database connection failed'
  });
});

// API Routes
app.use('/api/lots', lotsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/charges', chargesRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  
  // Test database connection on startup
  await testConnection();
});