import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthLoading() {
  return <main className="grid min-h-[60vh] place-items-center px-5 py-16"><div className="text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-saffron text-2xl shadow-card">🍳</div><p className="mt-5 font-display text-3xl text-ink">Loading AI Meal Planner...</p></div></main>;
}

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoading />;
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}