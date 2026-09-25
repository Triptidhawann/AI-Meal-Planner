import { db } from '../config/database.js';

const now = () => new Date().toISOString();
const parseJson = (value, fallback = []) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };

export function getOrCreateUser(firebaseUser) {
  const timestamp = now();
  const existing = db.prepare('SELECT * FROM users WHERE firebase_uid = ?').get(firebaseUser.uid);
  if (existing) {
    db.prepare('UPDATE users SET email = ?, display_name = ?, updated_at = ? WHERE id = ?').run(firebaseUser.email || existing.email, firebaseUser.displayName || existing.display_name, timestamp, existing.id);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(existing.id);
  }
  const result = db.prepare('INSERT INTO users (firebase_uid, email, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || null, timestamp, timestamp);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
}

function serializePreferences(row) { return { diet: row?.diet || 'No preference', cookingTime: row?.cooking_time || '20 min', budget: row?.budget || '₹50', spiceLevel: row?.spice_level || 'Medium', restrictions: parseJson(row?.restrictions), equipment: parseJson(row?.equipment) }; }
function serializeSearch(row) { return { id: row.id, createdAt: row.created_at, ingredients: parseJson(row.ingredients), mealType: row.meal_type, time: row.time, budget: row.budget, diet: row.diet, restrictions: parseJson(row.restrictions), equipment: parseJson(row.equipment) }; }
function serializeRecipe(row, timestampField) { return { id: row.recipe_id, name: row.recipe_name, ...parseJson(row.recipe_data, {}), [timestampField]: row[timestampField === 'viewedAt' ? 'viewed_at' : 'saved_at'] }; }

export function getProfile(user) {
  const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(user.id);
  const searches = db.prepare('SELECT * FROM meal_searches WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').all(user.id).map(serializeSearch);
  const viewed = db.prepare('SELECT * FROM recently_viewed WHERE user_id = ? ORDER BY viewed_at DESC LIMIT 10').all(user.id).map((row) => serializeRecipe(row, 'viewedAt'));
  const saved = db.prepare('SELECT * FROM saved_meals WHERE user_id = ? ORDER BY saved_at DESC').all(user.id).map((row) => serializeRecipe(row, 'savedAt'));
  const stats = { searches: db.prepare('SELECT COUNT(*) AS count FROM meal_searches WHERE user_id = ?').get(user.id).count, viewed: db.prepare('SELECT COUNT(*) AS count FROM recently_viewed WHERE user_id = ?').get(user.id).count, saved: db.prepare('SELECT COUNT(*) AS count FROM saved_meals WHERE user_id = ?').get(user.id).count };
  return { user: { name: user.display_name || 'Meal Planner User', email: user.email }, preferences: serializePreferences(preferences), stats, searches, viewed, saved };
}

export function updateUserProfile(user, displayName) { db.prepare('UPDATE users SET display_name = ?, updated_at = ? WHERE id = ?').run(displayName, now(), user.id); return db.prepare('SELECT * FROM users WHERE id = ?').get(user.id); }
export function updatePreferences(user, values) { const timestamp = now(); db.prepare(`INSERT INTO user_preferences (user_id, diet, cooking_time, budget, spice_level, restrictions, equipment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET diet = excluded.diet, cooking_time = excluded.cooking_time, budget = excluded.budget, spice_level = excluded.spice_level, restrictions = excluded.restrictions, equipment = excluded.equipment, updated_at = excluded.updated_at`).run(user.id, values.diet || '', values.cookingTime || '', values.budget || '', values.spiceLevel || '', JSON.stringify(values.restrictions || []), JSON.stringify(values.equipment || []), timestamp, timestamp); return serializePreferences(db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(user.id)); }
export function addSearch(user, values) { db.prepare('INSERT INTO meal_searches (user_id, meal_type, time, budget, diet, restrictions, equipment, ingredients, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(user.id, values.mealType || '', values.time || '', values.budget || '', values.diet || '', JSON.stringify(values.restrictions || []), JSON.stringify(values.equipment || []), JSON.stringify(values.ingredients), now()); }
export function addViewed(user, recipe) { const timestamp = now(); db.prepare('INSERT INTO recently_viewed (user_id, recipe_id, recipe_name, recipe_data, viewed_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, recipe_id) DO UPDATE SET recipe_name = excluded.recipe_name, recipe_data = excluded.recipe_data, viewed_at = excluded.viewed_at').run(user.id, recipe.recipeId, recipe.recipeName, JSON.stringify(recipe.recipeData || {}), timestamp); }
export function addSaved(user, recipe) { db.prepare('INSERT INTO saved_meals (user_id, recipe_id, recipe_name, recipe_data, saved_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(user_id, recipe_id) DO NOTHING').run(user.id, recipe.recipeId, recipe.recipeName, JSON.stringify(recipe.recipeData || {}), now()); }
export function removeSaved(user, recipeId) { return db.prepare('DELETE FROM saved_meals WHERE user_id = ? AND recipe_id = ?').run(user.id, recipeId).changes > 0; }
