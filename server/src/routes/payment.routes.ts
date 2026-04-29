import { Router } from 'express';
import { initiatePayment, handleWebhook, confirmPayment } from '../controllers/payment.controller.js';

const router = Router();

router.post('/initiate', initiatePayment);
router.post('/webhook', handleWebhook);
router.get('/confirm/:token', confirmPayment);
router.get('/confirm/by-company/:companyId', confirmPayment);

export default router;
