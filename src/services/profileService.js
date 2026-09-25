const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(user, path, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch(`${apiBase}/api/profile${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.success) throw new Error(payload.error || 'Unable to load profile data.');
  return payload.data;
}

export const getProfile = (user) => request(user, '/');
export const updateProfile = (user, displayName) => request(user, '/', { method: 'PUT', body: JSON.stringify({ displayName }) });
export const updatePreferences = (user, preferences) => request(user, '/preferences', { method: 'PUT', body: JSON.stringify(preferences) });
export const addSearch = (user, search) => request(user, '/searches', { method: 'POST', body: JSON.stringify(search) });
export const addRecentlyViewed = (user, recipe) => request(user, '/viewed', { method: 'POST', body: JSON.stringify({ recipeId: recipe.id, recipeName: recipe.name, recipeData: recipe }) });
export const saveMeal = (user, recipe) => request(user, '/saved', { method: 'POST', body: JSON.stringify({ recipeId: recipe.id, recipeName: recipe.name, recipeData: recipe }) });
export const removeSavedMeal = (user, recipeId) => request(user, `/saved/${encodeURIComponent(recipeId)}`, { method: 'DELETE' });
