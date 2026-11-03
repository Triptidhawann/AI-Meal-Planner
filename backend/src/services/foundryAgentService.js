import { AIProjectClient } from '@azure/ai-projects';
import { ClientSecretCredential, DefaultAzureCredential } from '@azure/identity';
import { assertFoundryConfiguration, env } from '../config/env.js';

function getCredential() {
  const tenantId = (process.env.AZURE_TENANT_ID || '').trim();
  const clientId = (process.env.AZURE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.AZURE_CLIENT_SECRET || '').trim();

  if (tenantId && clientId && clientSecret) {
    console.log('[MealPlanner] Authenticating with ClientSecretCredential');
    return new ClientSecretCredential(tenantId, clientId, clientSecret);
  }

  console.log('[MealPlanner] Authenticating with DefaultAzureCredential');
  return new DefaultAzureCredential();
}

let openAIClient;
function getOpenAIClient() {
  assertFoundryConfiguration();
  if (!openAIClient) {
    console.log('[MealPlanner] Initializing AIProjectClient with endpoint:', env.foundryProjectEndpoint);
    const project = new AIProjectClient(env.foundryProjectEndpoint, getCredential());
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

CRITICAL INGREDIENT INSTRUCTIONS:
1. Base the recommendations PRIMARILY and DIRECTLY on the user's available ingredients: [${preferences.ingredients.join(', ')}].
2. DO NOT force, add, or suggest eggs unless 'egg' or 'eggs' is explicitly in the available ingredients. A dietary preference such as 'Eggitarian', 'Non-vegetarian', or 'No preference' simply indicates what is permitted; it does NOT mean every meal must include eggs or meat.
3. If the user provides rice, onion, tomato, and sugar, create dishes made from those specific items (such as Tomato Rice, Onion-Tomato Pulao, Caramelized Onion Rice).
4. Clearly distinguish available ingredients from additional ingredients. Keep additional ingredients to a minimum.
5. Do not recommend equipment the user does not have. If no suitable meal exists, return an empty meals array and explain why.

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
  console.log('[MealPlanner] Calling Foundry Agent:', env.foundryAgentName, 'version:', env.foundryAgentVersion);
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
