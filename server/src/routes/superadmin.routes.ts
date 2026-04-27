/**
 * Routes SUPER_ADMIN : gestion globale de la plateforme.
 */
import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getAllCompanies,
  getPlatformStats,
  createSuperAdmin,
  toggleCompanyLock,
  changePassword,
} from "../controllers/superadmin.controller.js";

const router = Router();

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// ─── Routes SUPER_ADMIN uniquement ───────────────────────────────────────────
router.get("/companies", authorize(["SUPER_ADMIN"]), getAllCompanies);
router.get("/stats", authorize(["SUPER_ADMIN"]), getPlatformStats);
router.post("/super-admins", authorize(["SUPER_ADMIN"]), createSuperAdmin);
router.patch("/companies/:id/toggle-lock", authorize(["SUPER_ADMIN"]), toggleCompanyLock);

// ─── Route accessible à tous les rôles (changer son propre mot de passe) ─────
router.patch("/change-password", changePassword);

export default router;
