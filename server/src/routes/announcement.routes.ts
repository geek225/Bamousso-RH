import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createAnnouncement, getAnnouncements } from "../controllers/announcement.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

router.get("/", getAnnouncements);
router.post("/", authorize(["COMPANY_ADMIN", "HR_MANAGER"]), upload.single('file'), createAnnouncement);

export default router;
