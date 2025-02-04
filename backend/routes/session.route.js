import express from "express";
import {
  createNewSession,
  getAllSessions,
  deleteAllSessionsForUser,
} from "../controllers/session.controller.js";

const router = express.Router();

router.get("/createSession", createNewSession);

router.get("/getAllSessions/:userId", getAllSessions);

router.delete("/deleteAllSessionsForUser/:userId", deleteAllSessionsForUser);

export default router;
