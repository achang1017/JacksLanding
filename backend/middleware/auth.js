// backend/middleware/auth.js
import { supabaseAdmin } from '../services/supabase.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'No valid authorization header found' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token' 
      });
    }
    
    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    // Attach user info to request
    req.user = user;
    req.userId = user.id;
    req.userProfile = profile;
    req.isAdmin = profile?.role === 'admin';
    req.isResident = profile?.role === 'resident';
    
    console.log(`✅ Authenticated user: ${user.email} (${profile?.role || 'guest'})`);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({ 
      success: false,
      error: 'Unauthorized',
      message: 'Authentication failed' 
    });
  }
};

// Middleware to require admin role
export const requireAdmin = async (req, res, next) => {
  if (!req.isAdmin) {
    return res.status(403).json({ 
      success: false,
      error: 'Forbidden',
      message: 'Admin access required' 
    });
  }
  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        req.user = user;
        req.userId = user.id;
        req.userProfile = profile;
        req.isAdmin = profile?.role === 'admin';
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};