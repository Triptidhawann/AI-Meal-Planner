import { auth } from '../config/firebase';

export async function planMeal(preferences) {
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : '';
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meal-planner/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({
      ingredients: preferences.ingredients,
      mealType: preferences.mealType,
      time: preferences.time,
      budget: preferences.budget,
      diet: preferences.diet,
      restrictions: preferences.restrictions,
      equipment: preferences.equipment,
    }),
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('Unable to connect to the meal planning service. Please try again.');
  }

  if (!response.ok || !payload.success) {
    throw new Error(response.status === 400 ? payload.error : 'Unable to connect to the meal planning service. Please try again.');
  }

  if (!payload.data?.meals?.length) {
    throw new Error('No suitable meals were found. Try changing your ingredients or preferences.');
  }

  return payload.data.meals;
}
