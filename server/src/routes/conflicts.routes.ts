import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { getConflicts } from "../controllers/conflicts.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requirePlan("LOUBA"), getConflicts);

export default router;
