import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { createExplanation, getExplanations, respondExplanation, closeExplanation } from "../controllers/explanation.controller.js";

const router = Router();

router.post("/", authenticate, createExplanation);
router.get("/", authenticate, getExplanations);
router.patch("/:id/respond", authenticate, respondExplanation);
router.patch("/:id/close", authenticate, closeExplanation);

export default router;
