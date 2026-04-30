import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { getMessages, sendMessage, getContacts } from "../controllers/message.controller.js";

const router = Router();

router.use(authenticate);

router.get("/contacts", getContacts);
router.get("/:contactId", getMessages);
router.post("/", sendMessage);

export default router;
