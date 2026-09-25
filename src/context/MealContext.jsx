import { createContext, useContext, useEffect, useState } from 'react';
import { mockMeals } from '../data/mockMeals';
import { normalizeRecipes, normalizeRecipe } from '../data/recipes';

const defaultPreferences = { ingredients: ['Rice', 'Egg', 'Onion', 'Tomato'], mealType: 'Any', time: '20 min', budget: '₹50', diet: 'Eggitarian', restrictions: '', equipment: ['Induction', 'Pan'] };
const MealContext = createContext(null);

export function MealProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [results, setResultsState] = useState(() => {
    try {
      const storedResults = JSON.parse(localStorage.getItem('ai-meal-planner-results') || 'null');
      return storedResults?.length ? normalizeRecipes(storedResults) : mockMeals.slice(0, 3);
    } catch { return mockMeals.slice(0, 3); }
  });
  const [savedMeals, setSavedMeals] = useState(() => {
    try { return normalizeRecipes(JSON.parse(localStorage.getItem('ai-meal-planner-saved') || '[]')); } catch { return []; }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => { localStorage.setItem('ai-meal-planner-saved', JSON.stringify(savedMeals)); }, [savedMeals]);
  useEffect(() => { localStorage.setItem('ai-meal-planner-results', JSON.stringify(results)); }, [results]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 2800); return () => clearTimeout(timer); } }, [toast]);

  const setResults = (meals) => setResultsState(normalizeRecipes(meals));
  const toggleSaved = (meal) => {
    const normalizedMeal = normalizeRecipe(meal);
    const alreadySaved = savedMeals.some((saved) => saved.id === normalizedMeal.id);
    setSavedMeals((current) => alreadySaved ? current.filter((saved) => saved.id !== normalizedMeal.id) : [...current, normalizedMeal]);
    setToast({ type: alreadySaved ? 'info' : 'success', message: alreadySaved ? `${normalizedMeal.name} removed from saved meals.` : `${normalizedMeal.name} saved for later.` });
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
