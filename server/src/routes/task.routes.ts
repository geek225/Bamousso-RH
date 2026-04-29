import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/task.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
