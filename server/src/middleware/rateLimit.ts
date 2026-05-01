import { rateLimit } from 'express-rate-limit';

/**
 * Limiteur général pour toute l'API
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de requêtes effectuées depuis cette adresse IP, veuillez réessayer plus tard.",
});

/**
 * Limiteur pour les actions d'authentification standards (Login)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 tentatives max
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de tentatives de connexion, veuillez réessayer dans une heure.",
});

/**
 * Limiteur strict pour les actions critiques (Reset password, Register Company)
 * Prévient les abus massifs et le spam.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 tentatives max par heure
  standardHeaders: true,
  legacyHeaders: false,
  message: "Trop de requêtes sensibles effectuées, veuillez réessayer dans une heure.",
});
