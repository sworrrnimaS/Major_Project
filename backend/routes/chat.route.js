import express from "express";
import {
  askQuery,
  deleteAllChatsForSession,
  getAllChatsForSession,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/:sessionId", askQuery);
router.get("/getAllChats/:sessionId", getAllChatsForSession);
router.delete("/deleteAllChatsForSession/:sessionId", deleteAllChatsForSession);

export default router;
