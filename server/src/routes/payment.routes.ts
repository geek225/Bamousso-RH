import { Router } from 'express';
import { initiatePayment, handleWebhook } from '../controllers/payment.controller.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/webhook', handleWebhook);

export default router;
