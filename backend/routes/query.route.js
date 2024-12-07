import express from "express";
import { askQuery } from "../controllers/query.controller.js";

const router = express.Router();

router.get("/", askQuery);

export default router;
