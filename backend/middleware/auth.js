// backend/middleware/auth.js
import { getUserFromToken, isAdmin, isResident } from '../services/supabase.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No valid authorization header found' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Authentication failed' 
    });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }
    
    const adminStatus = await isAdmin(req.userId);
    
    if (!adminStatus) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Admin access required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify admin status' 
    });
  }
};

export const requireResident = async (req, res, next) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Authentication required' 
      });
    }
    
    const residentStatus = await isResident(req.userId);
    const adminStatus = await isAdmin(req.userId);
    
    if (!residentStatus && !adminStatus) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Resident access required' 
      });
    }
    
    next();
  } catch (error) {
    console.error('Resident check error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to verify resident status' 
    });
  }
};

// Optional authentication - sets user if token is provided
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const user = await getUserFromToken(token);
      
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};