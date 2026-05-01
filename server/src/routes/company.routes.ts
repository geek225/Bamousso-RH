import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  lockCompany,
  unlockCompany,
  updateLogo,
  updateSubscription,
  updateStatus
} from "../controllers/company.controller.js";
import { upload, validateFileType } from "../middleware/upload.js";

const router = Router();

router.use(authenticate);

// SUPER_ADMIN only routes
router.post("/", authorize(["SUPER_ADMIN"]), createCompany);
router.get("/", authorize(["SUPER_ADMIN"]), getCompanies);
router.post("/:id/lock", authorize(["SUPER_ADMIN"]), lockCompany);
router.post("/:id/unlock", authorize(["SUPER_ADMIN"]), unlockCompany);
router.put("/:id/subscription", authorize(["SUPER_ADMIN"]), updateSubscription);
router.delete("/:id", authorize(["SUPER_ADMIN"]), deleteCompany);

// Routes allowed for SUPER_ADMIN AND COMPANY_ADMIN
router.get("/:id", authorize(["SUPER_ADMIN", "COMPANY_ADMIN"]), getCompanyById);
router.put("/:id", authorize(["SUPER_ADMIN", "COMPANY_ADMIN"]), updateCompany);
router.put("/:id/logo", authorize(["SUPER_ADMIN", "COMPANY_ADMIN"]), upload.single('logo'), validateFileType, updateLogo);

export default router;
