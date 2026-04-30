import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { reportSuggestion, getSuggestions, updateSuggestionStatus } from "../controllers/suggestions.controller.js";

const router = Router();

router.post("/", authenticate, reportSuggestion);
router.get("/", authenticate, getSuggestions);
router.patch("/:id", authenticate, updateSuggestionStatus);

export default router;
