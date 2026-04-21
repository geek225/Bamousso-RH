import { Router } from "express";
import { initiatePayment, handleWebhook, simulateSuccess, confirmPayment } from "../controllers/payment.controller.js";

const router = Router();

/**
 * @route   POST /api/payments/initiate
 * @desc    Initialise un paiement via Paydunya
 * @access  Public
 */
router.post("/initiate", initiatePayment);

/**
 * @route   GET /api/payments/confirm/:token
 * @desc    Confirme le statut d'un paiement via son token
 * @access  Public
 */
router.get("/confirm/:token", confirmPayment);

/**
 * @route   GET /api/payments/simulate-success
 * @desc    Simule un succès de paiement (Développement uniquement)
 * @access  Public
 */
router.get("/simulate-success", simulateSuccess);

/**
 * @route   POST /api/payments/webhook
 * @desc    Callback pour les notifications de Paydunya (IPN)
 * @access  Public
 */
router.post("/webhook", handleWebhook);

export default router;
