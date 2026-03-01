import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Define the permissions mapping for each role
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ['all_access', 'manage_users', 'view_audit', 'manage_treasury', 'post_notices'],
  COMMITTEE: ['view_dashboard', 'manage_maintenance', 'post_notices', 'view_expenses', 'schedule_meetings'],
  STAFF: ['view_dashboard', 'manage_helpdesk', 'update_assets'],
  SECURITY: ['view_dashboard', 'manage_visitors', 'view_emergency', 'receive_sos'],
  RESIDENT: ['view_personal_dashboard', 'pay_maintenance', 'book_amenities', 'raise_complaint']
};

export const protect = (req: any, res: Response, next: NextFunction) => {
  let token;
  if (req.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as any;
    
    // Validate that the ID in the token is a valid MongoDB ObjectId
    // This prevents CastErrors in downstream routes that use req.user.id
    if (decoded.id && !mongoose.Types.ObjectId.isValid(decoded.id)) {
      console.warn(`⚠️ Invalid User ID in token: ${decoded.id}`);
      return res.status(401).json({ message: 'Invalid session. Please log in again.' });
    }

    req.user = decoded; // { id, role, permissions }
    next();
  } catch (error: any) {
    console.error('🔒 Auth Middleware Error:', error.message);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

/**
 * Middleware to check if user has specific role OR specific permission
 * Usage: authorize(['ADMIN'], ['manage_users'])
 */
export const authorize = (allowedRoles: string[] = [], requiredPermissions: string[] = []) => {
  return (req: any, res: Response, next: NextFunction) => {
    const userRole = req.user.role;
    const userPerms = ROLE_PERMISSIONS[userRole] || [];

    const hasRole = allowedRoles.length === 0 || allowedRoles.includes(userRole);
    const hasPermission = requiredPermissions.length === 0 || 
                          requiredPermissions.some(p => userPerms.includes(p) || userPerms.includes('all_access'));

    if (hasRole && hasPermission) {
      return next();
    }

    console.error(`🚫 Access Denied: User role ${userRole} lacks required roles [${allowedRoles}] or permissions [${requiredPermissions}]`);
    res.status(403).json({ 
      message: `Access denied. Requires one of roles: [${allowedRoles}] or permissions: [${requiredPermissions}]` 
    });
  };
};

// Fix: Adding the missing adminOnly middleware as a wrapper for ADMIN role authorization
export const adminOnly = authorize(['ADMIN']);
export const authorizeAdmin = authorize(['ADMIN']);
