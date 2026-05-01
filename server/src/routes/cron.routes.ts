import { Router } from 'express';
import { checkSubscriptions, cleanupAbandonedCompanies } from '../controllers/cron.controller.js';

const router = Router();

// Endpoints pour les Cron Jobs Vercel
router.get('/subscriptions', checkSubscriptions);
router.get('/cleanup', cleanupAbandonedCompanies);

export default router;
