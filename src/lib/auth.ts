import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'klypup-pricing-dashboard-secret-key-2026';

export interface JWTPayload {
  userId: string;
  orgId: string;
  role: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getAuthFromHeaders(headers: Headers): JWTPayload | null {
  const authHeader = headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // Also check cookie
    const cookie = headers.get('cookie');
    if (cookie) {
      const tokenMatch = cookie.match(/token=([^;]+)/);
      if (tokenMatch) {
        return verifyToken(tokenMatch[1]);
      }
    }
    return null;
  }
  return verifyToken(authHeader.slice(7));
}

export function requireRole(auth: JWTPayload | null, ...roles: string[]): JWTPayload {
  if (!auth) {
    throw new Error('Unauthorized');
  }
  if (roles.length > 0 && !roles.includes(auth.role)) {
    throw new Error('Forbidden');
  }
  return auth;
}
