import express from "express";
import {
  createNewSession,
  getAllSessions,
} from "../controllers/session.controller.js";

const router = express.Router();

router.get("/createSession", createNewSession);

router.get("/getAllSessions/:userId", getAllSessions);

export default router;
