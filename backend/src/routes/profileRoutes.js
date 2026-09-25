import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { deleteSaved, readPreferences, readProfile, readSaved, readSearches, readViewed, writePreferences, writeProfile, writeSaved, writeSearch, writeViewed } from '../controllers/profileController.js';

const router = Router();
router.use(requireAuth);
router.get('/', readProfile);
router.put('/', writeProfile);
router.get('/preferences', readPreferences);
router.put('/preferences', writePreferences);
router.get('/searches', readSearches);
router.post('/searches', writeSearch);
router.get('/viewed', readViewed);
router.post('/viewed', writeViewed);
router.get('/saved', readSaved);
router.post('/saved', writeSaved);
router.delete('/saved/:recipeId', deleteSaved);

export default router;
