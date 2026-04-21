import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { toggleClock, getAttendances } from "../controllers/attendance.controller.js";

const router = Router();

router.use(authenticate);

router.post("/toggle", toggleClock);
router.get("/", getAttendances);

export default router;
