import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { createUser, getUsers, updateUser, deleteUser, updateUserPassword, suspendUser, activateUser } from "../controllers/user.controller.js";

const router = Router();

// SUPER_ADMIN can manage all users
router.use(authenticate);

router.post("/", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"]), createUser);
router.put("/:id", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"]), updateUser);
router.put("/:id/password", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"]), updateUserPassword);
router.post("/:id/suspend", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"]), suspendUser);
router.post("/:id/activate", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"]), activateUser);
router.delete("/:id", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER"]), deleteUser);
router.get("/", authorize(["SUPER_ADMIN", "COMPANY_ADMIN", "HR_MANAGER", "HR_ASSISTANT"]), getUsers);

export default router;
