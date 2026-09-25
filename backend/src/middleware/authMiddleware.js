import { getFirebaseAdminAuth } from '../config/firebaseAdmin.js';

export async function requireAuth(request, response, next) {
  const header = request.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return response.status(401).json({ success: false, error: 'Authentication required.' });
  try {
    const token = header.slice(7).trim();
    if (!token) return response.status(401).json({ success: false, error: 'Authentication required.' });
    const decoded = await getFirebaseAdminAuth().verifyIdToken(token);
    request.user = { uid: decoded.uid, email: decoded.email || '', displayName: decoded.name || '' };
    return next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    return response.status(401).json({ success: false, error: 'Invalid or expired authentication token.' });
  }
}
