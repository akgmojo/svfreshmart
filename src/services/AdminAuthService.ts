import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AdminRole, AdminUser } from '../types';
import { getAdminByUsername, getAdminById, getAllAdmins } from '../data/db';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'svfreshmart_admin_secure_secret_2026';

export interface AdminSession {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
}

export class AdminAuthService {
  /**
   * Authenticate admin by username and password
   */
  static authenticate(username: string, password: string): { 
    success: boolean; 
    token?: string; 
    admin?: Omit<AdminUser, 'passwordHash'>; 
    error?: string 
  } {
    if (!username || !password) {
      return { success: false, error: 'Username and password are required.' };
    }

    const admin = getAdminByUsername(username.trim());
    if (!admin || !admin.isActive) {
      return { success: false, error: 'Invalid admin credentials or account inactive.' };
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid admin credentials.' };
    }

    const sessionPayload: AdminSession = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role
    };

    const token = jwt.sign(sessionPayload, ADMIN_JWT_SECRET, { expiresIn: '12h' });

    // Exclude password hash from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeAdmin } = admin;

    return {
      success: true,
      token,
      admin: safeAdmin
    };
  }

  /**
   * Verify admin JWT token
   */
  static verifyAdminToken(token: string): AdminSession | null {
    try {
      if (!token) return null;
      const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminSession;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Extract AdminSession from request (Header or Cookie)
   */
  static getAdminFromRequest(request: Request): AdminSession | null {
    // 1. Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const session = this.verifyAdminToken(token);
      if (session) return session;
    }

    // 2. Check Cookie header
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/svf_admin_token=([^;]+)/);
    if (match && match[1]) {
      const token = decodeURIComponent(match[1].trim());
      const session = this.verifyAdminToken(token);
      if (session) return session;
    }

    return null;
  }

  /**
   * Check if role satisfies permission criteria
   */
  static hasPermission(userRole: AdminRole, allowedRoles: AdminRole[]): boolean {
    if (userRole === 'Super Admin') return true;
    return allowedRoles.includes(userRole);
  }
}
