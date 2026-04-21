import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadDocument, getDocuments } from "../controllers/document.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getDocuments);
router.post("/", authorize(["COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"]), uploadDocument);

export default router;
