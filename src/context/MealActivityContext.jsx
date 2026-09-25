import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { normalizeRecipe } from '../data/recipes';
import { addRecentlyViewed as postViewed, addSearch as postSearch, getProfile, removeSavedMeal as deleteSaved, saveMeal as postSaved, updatePreferences as putPreferences } from '../services/profileService';

const MealActivityContext = createContext(null);
const defaultPreferences = { ingredients: ['Rice', 'Egg', 'Onion', 'Tomato'], mealType: 'Any', time: '20 min', budget: '₹50', diet: 'Eggitarian', spicePreference: 'Medium', restrictions: '', equipment: ['Induction', 'Pan'] };

function mapPreferences(values = {}) {
  return { ingredients: values.ingredients || defaultPreferences.ingredients, mealType: values.mealType || defaultPreferences.mealType, time: values.time || values.cookingTime || defaultPreferences.time, budget: values.budget || defaultPreferences.budget, diet: values.diet || defaultPreferences.diet, spicePreference: values.spicePreference || values.spiceLevel || defaultPreferences.spicePreference, restrictions: Array.isArray(values.restrictions) ? values.restrictions.join(', ') : (values.restrictions || ''), equipment: values.equipment || defaultPreferences.equipment };
}

export function MealActivityProvider({ children }) {
  const { currentUser } = useAuth();
  const [recentSearches, setRecentSearches] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!currentUser?.uid) { setRecentSearches([]); setRecentlyViewed([]); setSavedMeals([]); setPreferences(defaultPreferences); setLoading(false); return () => { active = false; }; }
    setLoading(true);
    getProfile(currentUser).then((profile) => { if (!active) return; setRecentSearches(profile.searches || []); setRecentlyViewed((profile.viewed || []).map(normalizeRecipe)); setSavedMeals((profile.saved || []).map(normalizeRecipe)); setPreferences(mapPreferences(profile.preferences)); setError(''); }).catch(() => { if (active) { setRecentSearches([]); setRecentlyViewed([]); setSavedMeals([]); setPreferences(defaultPreferences); setError('Unable to load your meal activity.'); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [currentUser]);

  const addSearch = async (search) => { if (!currentUser) return; await postSearch(currentUser, search); };
  const addRecentlyViewed = async (recipe) => { if (!currentUser) return; await postViewed(currentUser, recipe); setRecentlyViewed((current) => [normalizeRecipe(recipe), ...current.filter((item) => item.id !== recipe.id)].slice(0, 10)); };
  const saveMeal = async (recipe) => { if (!currentUser) return; await postSaved(currentUser, recipe); setSavedMeals((current) => current.some((item) => item.id === recipe.id) ? current : [...current, normalizeRecipe(recipe)]); };
  const removeSavedMeal = async (id) => { if (!currentUser) return; await deleteSaved(currentUser, id); setSavedMeals((current) => current.filter((meal) => meal.id !== id)); };
  const toggleSaved = async (recipe) => { if (savedMeals.some((item) => item.id === recipe.id)) await removeSavedMeal(recipe.id); else await saveMeal(recipe); };
  const updatePreferences = (updates) => { const next = { ...preferences, ...updates }; setPreferences(next); if (currentUser) putPreferences(currentUser, { diet: next.diet, cookingTime: next.time, budget: next.budget, spiceLevel: next.spicePreference, restrictions: next.restrictions ? next.restrictions.split(',').map((item) => item.trim()).filter(Boolean) : [], equipment: next.equipment }).catch(() => setError('Unable to save your meal preferences.')); };

  return <MealActivityContext.Provider value={{ recentSearches, recentlyViewed, savedMeals, preferences, loading, error, addSearch, addRecentlyViewed, saveMeal, removeSavedMeal, toggleSaved, updatePreferences }}>{children}</MealActivityContext.Provider>;
}

export function useMealActivity() { const context = useContext(MealActivityContext); if (!context) throw new Error('useMealActivity must be used inside MealActivityProvider'); return context; }
