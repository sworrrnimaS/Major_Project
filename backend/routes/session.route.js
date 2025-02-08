import express from "express";
import {
  createNewSession,
  getAllSessions,
  deleteAllSessionsAndChatsForUser,
} from "../controllers/session.controller.js";

const router = express.Router();

router.get("/createSession", createNewSession);

router.get("/getAllSessions", getAllSessions);

router.delete(
  "/deleteAllSessionsAndChatsForUser/:userId",
  deleteAllSessionsAndChatsForUser
);

export default router;
