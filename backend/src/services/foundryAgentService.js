import { AIProjectClient } from '@azure/ai-projects';
import { DefaultAzureCredential } from '@azure/identity';
import { assertFoundryConfiguration, env } from '../config/env.js';

let openAIClient;
function getOpenAIClient() {
  assertFoundryConfiguration();
  if (!openAIClient) {
    const project = new AIProjectClient(env.foundryProjectEndpoint, new DefaultAzureCredential());
    openAIClient = project.getOpenAIClient();
  }
  return openAIClient;
}

function buildPrompt(preferences) {
  return `Plan meals for the user using the following constraints.

Available ingredients: ${preferences.ingredients.join(', ')}
Meal type: ${preferences.mealType}
Available time: ${preferences.time || 'no limit'}
Additional budget: ${preferences.budget || 'no limit'}
Dietary preference: ${preferences.diet}
Restrictions: ${preferences.restrictions.join(', ') || 'none'}
Available equipment: ${preferences.equipment.join(', ') || 'not specified'}

Use the recipe knowledge available to you. Prioritize dietary compatibility, allergies and restrictions, available ingredients, available equipment, cooking time, budget, simplicity, and minimal additional ingredients. Return up to 3 suitable meal recommendations. Clearly distinguish available ingredients from additional ingredients. Do not recommend equipment the user does not have. If no suitable meal exists, return an empty meals array and explain why in a suitable meal description.

The dietary preference is authoritative. If it conflicts with an ingredient, such as vegetarian with egg, do not silently assume an interpretation; explain the conflict and provide a clarification recommendation.

Return only JSON matching this shape: ${JSON.stringify({ meals: [{ name: 'string', description: 'string', mealType: 'string', diet: 'string', time: 20, difficulty: 'easy', additionalCost: 0, availableIngredients: ['string'], additionalIngredients: ['string'], equipment: ['string'], whyItFits: 'string', steps: ['string'], substitutions: ['string'], nutrition: { calories: 0, protein: 0 } }] })}`;
}

function extractJson(text) {
  const cleaned = String(text || '').replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  try { return JSON.parse(cleaned); } catch { /* Try the first balanced JSON object below. */ }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Foundry returned no JSON object.');
  try { return JSON.parse(cleaned.slice(start, end + 1)); } catch { throw new Error('Foundry returned malformed JSON.'); }
}

function normalizeMeals(payload, preferences) {
  if (!payload || !Array.isArray(payload.meals)) throw new Error('Foundry response did not contain meals.');
  return payload.meals.slice(0, 3).filter((meal) => meal && typeof meal.name === 'string').map((meal, index) => ({
    id: meal.id || `${meal.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'meal'}-${index}`,
    name: meal.name,
    emoji: meal.emoji || '🍽️',
    description: meal.description || 'A meal selected for your preferences.',
    mealType: meal.mealType || preferences.mealType,
    diet: meal.diet || preferences.diet,
    time: Number(meal.time) || 0,
    difficulty: meal.difficulty || 'Easy',
    additionalCost: typeof meal.additionalCost === 'number' ? `₹${meal.additionalCost}` : (meal.additionalCost || '₹0'),
    ingredients: [...(meal.availableIngredients || []), ...(meal.additionalIngredients || [])],
    equipment: Array.isArray(meal.equipment) ? meal.equipment : [],
    availableIngredients: Array.isArray(meal.availableIngredients) ? meal.availableIngredients : [],
    additionalIngredients: Array.isArray(meal.additionalIngredients) ? meal.additionalIngredients : [],
    steps: Array.isArray(meal.steps) ? meal.steps : [],
    substitutions: Array.isArray(meal.substitutions) ? meal.substitutions : [],
    nutrition: meal.nutrition || {},
    whyItFits: meal.whyItFits || 'This recommendation matches your stated constraints.',
  }));
}

export async function planMealWithAgent(preferences) {
  console.log('[MealPlanner] Calling Foundry Agent');
  const client = getOpenAIClient();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.foundryRequestTimeoutMs);
  try {
    const response = await client.responses.create({
      input: buildPrompt(preferences),
    }, {
      body: { agent_reference: { name: env.foundryAgentName, type: 'agent_reference', version: env.foundryAgentVersion } },
      abortSignal: controller.signal,
    });
    console.log('[MealPlanner] Agent response received');
    return normalizeMeals(extractJson(response.output_text), preferences);
  } finally {
    clearTimeout(timeout);
  }
}