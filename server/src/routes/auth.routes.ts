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
} from "../controllers/auth.controller.js";

const router = Router();

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
