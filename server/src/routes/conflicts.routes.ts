import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { getConflicts, reportConflict, updateConflictStatus } from "../controllers/conflicts.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requirePlan("LOUBA"), getConflicts);
router.post("/", requirePlan("LOUBA"), reportConflict);
router.patch("/:id", requirePlan("LOUBA"), authorize(["COMPANY_ADMIN", "HR_MANAGER"]), updateConflictStatus);

export default router;
