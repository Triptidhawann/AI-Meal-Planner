import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const dataDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data');
fs.mkdirSync(dataDirectory, { recursive: true });

export const db = new Database(path.join(dataDirectory, 'mealplanner.db'));
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, firebase_uid TEXT UNIQUE NOT NULL, email TEXT NOT NULL, display_name TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS user_preferences (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL UNIQUE, diet TEXT, cooking_time TEXT, budget TEXT, spice_level TEXT, restrictions TEXT, equipment TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS meal_searches (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, meal_type TEXT, time TEXT, budget TEXT, diet TEXT, restrictions TEXT, equipment TEXT, ingredients TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS recently_viewed (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, recipe_id TEXT NOT NULL, recipe_name TEXT NOT NULL, recipe_data TEXT, viewed_at TEXT NOT NULL, UNIQUE(user_id, recipe_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS saved_meals (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, recipe_id TEXT NOT NULL, recipe_name TEXT NOT NULL, recipe_data TEXT, saved_at TEXT NOT NULL, UNIQUE(user_id, recipe_id), FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE);
  CREATE INDEX IF NOT EXISTS idx_meal_searches_user_id ON meal_searches(user_id);
  CREATE INDEX IF NOT EXISTS idx_meal_searches_created_at ON meal_searches(created_at);
  CREATE INDEX IF NOT EXISTS idx_recently_viewed_user_id ON recently_viewed(user_id);
  CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at);
  CREATE INDEX IF NOT EXISTS idx_saved_meals_user_id ON saved_meals(user_id);
  CREATE INDEX IF NOT EXISTS idx_saved_meals_saved_at ON saved_meals(saved_at);
`);
