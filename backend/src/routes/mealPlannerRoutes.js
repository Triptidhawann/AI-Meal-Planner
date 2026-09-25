import { Router } from 'express';
import { planMeal } from '../controllers/mealPlannerController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.post('/plan', requireAuth, planMeal);

export default router;