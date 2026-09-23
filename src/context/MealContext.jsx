import { createContext, useContext, useEffect, useState } from 'react';
import { mockMeals } from '../data/mockMeals';

const defaultPreferences = { ingredients: ['Rice', 'Egg', 'Onion', 'Tomato'], mealType: 'Any', time: '20 min', budget: '₹50', diet: 'Eggitarian', restrictions: '', equipment: ['Induction', 'Pan'] };
const MealContext = createContext(null);

export function MealProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [results, setResults] = useState(mockMeals.slice(0, 3));
  const [savedMeals, setSavedMeals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ai-meal-planner-saved') || '[]'); } catch { return []; }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => { localStorage.setItem('ai-meal-planner-saved', JSON.stringify(savedMeals)); }, [savedMeals]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 2800); return () => clearTimeout(timer); } }, [toast]);

  const toggleSaved = (meal) => {
    const alreadySaved = savedMeals.some((saved) => saved.id === meal.id);
    setSavedMeals((current) => alreadySaved ? current.filter((saved) => saved.id !== meal.id) : [...current, meal]);
    setToast({ type: alreadySaved ? 'info' : 'success', message: alreadySaved ? `${meal.name} removed from saved meals.` : `${meal.name} saved for later.` });
  };

  const removeSaved = (id) => setSavedMeals((current) => current.filter((meal) => meal.id !== id));
  const updatePreferences = (updates) => setPreferences((current) => ({ ...current, ...updates }));

  return <MealContext.Provider value={{ preferences, updatePreferences, results, setResults, savedMeals, toggleSaved, removeSaved, toast, setToast }}>{children}</MealContext.Provider>;
}

export function useMeals() {
  const context = useContext(MealContext);
  if (!context) throw new Error('useMeals must be used inside MealProvider');
  return context;
}
