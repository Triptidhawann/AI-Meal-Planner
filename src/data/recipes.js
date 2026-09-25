import { mockMeals } from './mockMeals';

function slugify(value) {
  return String(value || 'meal')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'meal';
}

export function normalizeRecipe(recipe) {
  return { ...recipe, id: recipe.id || slugify(recipe.name) };
}

export function normalizeRecipes(recipes) {
  return Array.isArray(recipes) ? recipes.filter(Boolean).map(normalizeRecipe) : [];
}

export function getRecipeById(recipeId, recipes = []) {
  const catalog = [...normalizeRecipes(recipes), ...mockMeals];
  return catalog.find((recipe) => recipe.id === recipeId);
}