import { planMealWithAgent } from '../services/foundryAgentService.js';

const supportedMealTypes = new Set(['breakfast', 'lunch', 'dinner', 'snack', 'any']);
const supportedTimes = new Set(['10 min', '20 min', '30 min', '45 min', '1 hour+', '10', '20', '30', '45']);
const supportedDiets = new Set(['no preference', 'vegetarian', 'vegan', 'eggitarian', 'non-vegetarian']);

class ValidationError extends Error {
  statusCode = 400;
}

function asOptionalString(value) {
  return value === undefined || value === null || value === '' ? undefined : String(value).trim();
}

function asStringArray(value, fieldName) {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) throw new ValidationError(`${fieldName} must be an array of strings.`);
  return value.map((item) => item.trim());
}

export function validatePreferences(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ValidationError('Request body must be an object.');
  if (!Array.isArray(body.ingredients) || body.ingredients.length === 0) throw new ValidationError('At least one ingredient is required.');
  if (body.ingredients.some((item) => typeof item !== 'string' || !item.trim())) throw new ValidationError('Ingredients must be non-empty strings.');

  const mealType = asOptionalString(body.mealType);
  if (mealType && !supportedMealTypes.has(mealType.toLowerCase())) throw new ValidationError('Meal type is not supported.');
  const time = asOptionalString(body.time);
  if (time && !supportedTimes.has(time.toLowerCase())) throw new ValidationError('Time must be one of the supported values.');
  const diet = asOptionalString(body.diet);
  if (diet && !supportedDiets.has(diet.toLowerCase())) throw new ValidationError('Dietary preference is not supported.');

  return {
    ingredients: body.ingredients.map((item) => item.trim()),
    mealType: mealType || 'Any',
    time: time || '',
    budget: asOptionalString(body.budget) || '',
    diet: diet || 'No preference',
    restrictions: asStringArray(body.restrictions, 'Restrictions'),
    equipment: asStringArray(body.equipment, 'Equipment'),
  };
}

export async function planMeal(request, response, next) {
  console.log('[MealPlanner] Request received');
  try {
    const preferences = validatePreferences(request.body);
    const meals = await planMealWithAgent(preferences);
    if (!meals.length) return response.status(502).json({ success: false, error: 'No suitable meals were found. Try changing your ingredients or preferences.' });
    console.log('[MealPlanner] Returning recommendations');
    return response.json({ success: true, data: { meals } });
  } catch (error) {
    if (error.statusCode === 400) return response.status(400).json({ success: false, error: error.message });
    console.error('[MealPlanner] Request failed:', error.message);
    return next(error);
  }
}