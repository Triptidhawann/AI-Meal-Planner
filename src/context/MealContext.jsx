import { createContext, useContext, useEffect, useState } from 'react';
import { mockMeals } from '../data/mockMeals';
import { normalizeRecipes, normalizeRecipe } from '../data/recipes';
import { useMealActivity } from './MealActivityContext';

const MealContext = createContext(null);

export function MealProvider({ children }) {
  const { preferences, updatePreferences, savedMeals, toggleSaved: toggleActivitySaved, removeSavedMeal } = useMealActivity();
  const [results, setResultsState] = useState(() => mockMeals.slice(0, 3));
  const [toast, setToast] = useState(null);

  useEffect(() => { try { const storedResults = JSON.parse(localStorage.getItem('ai-meal-planner-results') || 'null'); if (storedResults?.length) setResultsState(normalizeRecipes(storedResults)); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('ai-meal-planner-results', JSON.stringify(results)); } catch {} }, [results]);
  useEffect(() => { if (toast) { const timer = setTimeout(() => setToast(null), 2800); return () => clearTimeout(timer); } }, [toast]);

  const setResults = (meals) => setResultsState(normalizeRecipes(meals));
  const toggleSaved = async (meal) => {
    const normalizedMeal = normalizeRecipe(meal);
    const alreadySaved = savedMeals.some((saved) => saved.id === normalizedMeal.id);
    try {
      await toggleActivitySaved(normalizedMeal);
      setToast({ type: alreadySaved ? 'info' : 'success', message: alreadySaved ? `${normalizedMeal.name} removed from saved meals.` : `${normalizedMeal.name} saved for later.` });
    } catch { setToast({ type: 'error', message: 'Unable to update saved meals. Please try again.' }); }
  };

  return <MealContext.Provider value={{ preferences, updatePreferences, results, setResults, savedMeals, toggleSaved, removeSaved: removeSavedMeal, toast, setToast }}>{children}</MealContext.Provider>;
}

export function useMeals() {
  const context = useContext(MealContext);
  if (!context) throw new Error('useMeals must be used inside MealProvider');
  return context;
}
