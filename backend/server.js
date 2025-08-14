// ../backend/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

//Import routes
import authRoutes from './routes/auth.routes.js';
import lotsRoutes from './routes/lots.routes.js';
import reservationsRoutes from './routes/reservations.routes.js';
import chargesRoutes from './routes/charges.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import inquiriesRoutes from './routes/inquiries.routes.js';
import adminRoutes from './routes/admin.routes.js';
import stripeRoutes from './routes/stripe.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authenticateUser } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api', limiter);

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Stripe webhook endpoint (before body parsing for raw body)
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/lots', lotsRoutes);
app.use('/api/reservations', authenticateUser, reservationsRoutes);
app.use('/api/charges', authenticateUser, chargesRoutes);
app.use('/api/payments', authenticateUser, paymentsRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/admin', authenticateUser, adminRoutes);
app.use('/api/stripe', stripeRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
});


