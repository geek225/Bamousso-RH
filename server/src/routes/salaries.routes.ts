import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { requirePlan } from "../middleware/planGate.js";
import { getSalaries, generatePayroll } from "../controllers/salaries.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePlan("LOUBA"));
router.use(authorize(["COMPANY_ADMIN", "HR_MANAGER"]));

router.get("/", getSalaries);
router.post("/generate", generatePayroll);

export default router;
