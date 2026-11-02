import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import mealPlannerRoutes from './routes/mealPlannerRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { db } from './config/database.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();

const configuredOrigin = (env.frontendUrl || '').replace(/\/+$/, '');

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., server-to-server, health check, curl)
    if (!origin) return callback(null, true);

    try {
      const parsed = new URL(origin);
      const normalized = `${parsed.protocol}//${parsed.host}`;
      if (
        normalized === configuredOrigin ||
        normalized === 'https://ai-meal-planner-wine.vercel.app' ||
        parsed.hostname.endsWith('.vercel.app') ||
        normalized === 'http://localhost:5173' ||
        normalized === 'http://localhost:3000'
      ) {
        return callback(null, true);
      }
    } catch {
      if (origin === configuredOrigin || origin.includes('vercel.app')) {
        return callback(null, true);
      }
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '32kb' }));

app.get('/', (_request, response) => response.json({
  success: true,
  message: 'AI Meal Planner API is running',
  health: '/api/health',
  users: '/api/users',
}));

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'AI Meal Planner API' }));

app.get('/api/users', (_request, response) => {
  try {
    const users = db.prepare('SELECT id, firebase_uid, email, display_name, created_at, updated_at FROM users ORDER BY id DESC').all();
    const stats = {
      totalUsers: users.length,
      totalSearches: db.prepare('SELECT COUNT(*) AS count FROM meal_searches').get().count,
      totalSaved: db.prepare('SELECT COUNT(*) AS count FROM saved_meals').get().count,
    };
    return response.json({ success: true, stats, users });
  } catch (err) {
    return response.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api/meal-planner', mealPlannerRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => console.log(`AI Meal Planner API listening on http://localhost:${env.port}`));
