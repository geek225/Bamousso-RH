import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import {
  getAnalyticsSummary,
  getLeavesPerMonth,
  getAttendanceTrend,
  getWorkforceEvolution,
} from "../controllers/analytics.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePlan("BAMOUSSO")); // Analytics : Bamousso et Koro uniquement

router.get("/summary", getAnalyticsSummary);
router.get("/leaves-per-month", getLeavesPerMonth);
router.get("/attendance-trend", getAttendanceTrend);
router.get("/workforce-evolution", getWorkforceEvolution);

export default router;
