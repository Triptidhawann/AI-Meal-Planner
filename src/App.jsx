import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Check, Info, X } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { MealProvider, useMeals } from './context/MealContext';
import Home from './pages/Home';
import MealPlanner from './pages/MealPlanner';
import Results from './pages/Results';
import RecipeDetailsPage from './pages/RecipeDetailsPage';
import SavedMeals from './pages/SavedMeals';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfilePlaceholder from './pages/ProfilePlaceholder';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function Toast() { const { toast, setToast } = useMeals(); if (!toast) return null; return <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage text-sage-deep">{toast.type === 'success' ? <Check size={15} /> : <Info size={15} />}</span><span className="flex-1">{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button></div>; }
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }
function AppContent() { return <><ScrollToTop /><Navbar /><Routes><Route path="/" element={<Home />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/plan" element={<ProtectedRoute><MealPlanner /></ProtectedRoute>} /><Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} /><Route path="/recipe/:recipeId" element={<ProtectedRoute><RecipeDetailsPage /></ProtectedRoute>} /><Route path="/saved" element={<ProtectedRoute><SavedMeals /></ProtectedRoute>} /><Route path="/profile" element={<ProtectedRoute><ProfilePlaceholder /></ProtectedRoute>} /><Route path="*" element={<Home />} /></Routes><Footer /><Toast /></>; }
export default function App() { return <AuthProvider><MealProvider><AppContent /></MealProvider></AuthProvider>; }
