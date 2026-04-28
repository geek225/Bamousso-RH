import { Router } from 'express';
import { checkSubscriptions } from '../controllers/cron.controller.js';

const router = Router();

// Endpoint pour le Cron Job Vercel
router.get('/subscriptions', checkSubscriptions);

export default router;
