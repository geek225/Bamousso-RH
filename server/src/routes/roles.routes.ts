import express from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getRoles, createRole, updateRole, deleteRole } from "../controllers/roles.controller.js";

const router = express.Router();

router.use(authenticate);
// Seul le COMPANY_ADMIN peut gérer les rôles personnalisés
router.use(authorize(["COMPANY_ADMIN"]));

router.get("/", getRoles);
router.post("/", createRole);
router.put("/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
