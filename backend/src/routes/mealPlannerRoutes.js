import { Router } from 'express';
import { planMeal } from '../controllers/mealPlannerController.js';

const router = Router();
router.post('/plan', planMeal);

export default router;