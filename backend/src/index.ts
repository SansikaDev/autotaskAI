import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './config/passport'; // This file contains the passport strategy setup

import { taskRoutes } from './routes/taskRoutes';
import { authRoutes } from './routes/authRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Basic logging setup
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

log('Server starting up...');
log(`JWT_SECRET is ${process.env.JWT_SECRET ? 'set' : 'not set'}`);

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Allow frontend origin
app.use(helmet());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  log(`Incoming request: ${req.method} ${req.url}`);
  log(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

// Session setup for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret', // Use a strong secret from .env
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session()); // Use passport.session() for persistent login sessions

// Google Auth routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/api/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successful authentication, generate JWT and redirect
    const user = req.user as any; // Cast req.user to any or appropriate type
    const token = user.generateAuthToken(); // Assuming generateAuthToken exists on the User model
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

// Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Error handling
app.use(errorHandler);

// Global unhandled exception handler
process.on('uncaughtException', (err) => {
  console.error('[Unhandled Exception]:', err);
  process.exit(1); // Exit process after logging unhandled exception
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection]:', reason);
  process.exit(1); // Exit process after logging unhandled rejection
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autotaskai')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

export default app; 