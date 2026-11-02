import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getProfile, updateProfile as updateProfileApi } from '../services/profileService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [, setUserVersion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    return onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        // Sync user record to backend SQLite database immediately
        try {
          await getProfile(user);
        } catch (error) {
          console.warn('[Auth] Background profile sync:', error.message);
        }
      }
    });
  }, []);

  const signup = async (email, password, fullName) => {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: fullName });
    setCurrentUser(credential.user);
    try {
      await getProfile(credential.user);
    } catch (error) {
      console.warn('[Auth] Background sync on signup:', error.message);
    }
    return credential.user;
  };

  const login = async (email, password) => {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    try {
      await getProfile(credential.user);
    } catch (error) {
      console.warn('[Auth] Background sync on login:', error.message);
    }
    return credential.user;
  };

  const logout = () => auth ? signOut(auth) : Promise.resolve();
  const resetPassword = (email) => { if (!auth) return Promise.reject(new Error('Firebase authentication is not configured.')); return sendPasswordResetEmail(auth, email); };
  const updateDisplayName = async (displayName) => {
    if (!auth || !currentUser) throw new Error('Firebase authentication is not configured.');
    await updateProfile(currentUser, { displayName });
    await updateProfileApi(currentUser, displayName);
    setCurrentUser(currentUser);
    setUserVersion((version) => version + 1);
  };

  return <AuthContext.Provider value={{ currentUser, loading, signup, login, logout, resetPassword, updateDisplayName }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
