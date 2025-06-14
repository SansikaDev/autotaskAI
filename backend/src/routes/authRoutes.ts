import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Validate password
    if (!user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  console.log('[AuthRoutes] /me endpoint reached');
  console.log('[AuthRoutes] Authorization header:', req.header('Authorization'));
  
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('[AuthRoutes] Extracted token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('[AuthRoutes] No token provided');
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('[AuthRoutes] Decoded token:', JSON.stringify(decoded));
      
      // Check if the decoded token has the expected structure
      if (!decoded || typeof decoded !== 'object') {
        console.error('[AuthRoutes] Invalid token structure:', decoded);
        return res.status(401).json({ message: 'Invalid token structure' });
      }

      // Handle both possible token structures
      const userId = (decoded as any).id || (decoded as any).user?.id;
      
      if (!userId) {
        console.error('[AuthRoutes] No user ID found in token:', decoded);
        return res.status(401).json({ message: 'Invalid token: no user ID found' });
      }

      console.log('[AuthRoutes] User ID from token:', userId);
      
      const user = await User.findById(userId).select('-password');
      if (!user) {
        console.log('[AuthRoutes] User not found for ID:', userId);
        return res.status(404).json({ message: 'User not found' });
      }
      
      console.log('[AuthRoutes] User found:', user.email);
      res.json(user);
    } catch (jwtError) {
      console.error('[AuthRoutes] JWT verification error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('[AuthRoutes] Error in /me endpoint:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

export const authRoutes = router; 