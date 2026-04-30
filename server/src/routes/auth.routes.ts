/**
 * Définition des routes pour l'authentification.
 * Ces routes permettent aux utilisateurs de se connecter et de s'enregistrer.
 */
import { Router } from "express";
import {
  login,
  register,
  registerCompany,
  forgotPassword,
  resetPassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Route pour l'utilisateur actuel (rafraîchissement)
router.get("/me", authenticate, getCurrentUser);

// Route pour l'inscription d'un nouvel utilisateur
// POST /api/auth/register
router.post("/register", register);

// Création entreprise + 1er admin (self-serve)
// POST /api/auth/register-company
router.post("/register-company", registerCompany);

// Route pour la connexion
// POST /api/auth/login
router.post("/login", login);

// Mot de passe oublié
// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// Reset mot de passe
// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
