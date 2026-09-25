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

function Toast() { const { toast, setToast } = useMeals(); if (!toast) return null; return <div className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white shadow-soft"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage text-sage-deep">{toast.type === 'success' ? <Check size={15} /> : <Info size={15} />}</span><span className="flex-1">{toast.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={16} /></button></div>; }
function ScrollToTop() { const { pathname } = useLocation(); useEffect(() => { window.scrollTo(0, 0); }, [pathname]); return null; }
function AppContent() { return <><ScrollToTop /><Navbar /><Routes><Route path="/" element={<Home />} /><Route path="/plan" element={<MealPlanner />} /><Route path="/results" element={<Results />} /><Route path="/recipe/:recipeId" element={<RecipeDetailsPage />} /><Route path="/saved" element={<SavedMeals />} /><Route path="*" element={<Home />} /></Routes><Footer /><Toast /></>; }
export default function App() { return <MealProvider><AppContent /></MealProvider>; }
