import express from "express";
import {
  askQuery,
  getAllChatsForSession,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/:sessionId", askQuery);
router.get("/getAllChats/:sessionId", getAllChatsForSession);

export default router;
