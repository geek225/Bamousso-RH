import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createAnnouncement, getAnnouncements } from "../controllers/announcement.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getAnnouncements);
router.post("/", authorize(["COMPANY_ADMIN", "HR_MANAGER"]), createAnnouncement);

export default router;
