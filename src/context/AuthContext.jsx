import { createContext, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return undefined; }
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const signup = async (email, password, fullName) => {
    if (!auth) throw new Error('Firebase authentication is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: fullName });
    setCurrentUser({ ...credential.user, displayName: fullName });
    return credential.user;
  };

  const login = (email, password) => { if (!auth) return Promise.reject(new Error('Firebase authentication is not configured.')); return signInWithEmailAndPassword(auth, email, password); };
  const logout = () => auth ? signOut(auth) : Promise.resolve();
  const resetPassword = (email) => { if (!auth) return Promise.reject(new Error('Firebase authentication is not configured.')); return sendPasswordResetEmail(auth, email); };

  return <AuthContext.Provider value={{ currentUser, loading, signup, login, logout, resetPassword }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}