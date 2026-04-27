import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadDocument, getDocuments } from "../controllers/document.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

router.get("/", getDocuments);
router.post("/", authorize(["COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"]), upload.single('file'), uploadDocument);

export default router;
