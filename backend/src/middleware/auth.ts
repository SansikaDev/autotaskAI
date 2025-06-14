import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const auth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('[AuthMiddleware] Entering auth middleware');
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('[AuthMiddleware] No token found.');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    console.log('[AuthMiddleware] Token found, attempting verification.');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('[AuthMiddleware] Decoded token:', JSON.stringify(decoded));

    // Check if the decoded token has the expected structure
    if (!decoded || typeof decoded !== 'object') {
      console.error('[AuthMiddleware] Invalid token structure:', decoded);
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    // Handle both possible token structures
    const userId = (decoded as any).id || (decoded as any).user?.id;
    
    if (!userId) {
      console.error('[AuthMiddleware] No user ID found in token:', decoded);
      return res.status(401).json({ message: 'Invalid token: no user ID found' });
    }

    console.log('[AuthMiddleware] User ID from token:', userId);
    req.user = { id: userId };
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Token validation error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
  console.log('[AuthMiddleware] Exiting auth middleware');
}; 