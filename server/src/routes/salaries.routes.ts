import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { getSalaries } from "../controllers/salaries.controller.js";

const router = Router();

router.use(authenticate);
router.get("/", requirePlan("LOUBA"), getSalaries);

export default router;
