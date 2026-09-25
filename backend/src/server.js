import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import mealPlannerRoutes from './routes/mealPlannerRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import './config/database.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
app.use(cors({ origin: env.frontendUrl }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'AI Meal Planner API' }));
app.use('/api/meal-planner', mealPlannerRoutes);
app.use('/api/profile', profileRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => console.log(`AI Meal Planner API listening on http://localhost:${env.port}`));