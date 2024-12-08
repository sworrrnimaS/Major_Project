import express from "express";
import bodyParser from "body-parser";
import queryRouter from "./routes/query.route.js";
import { connectDB } from "./lib/connectDB.js";
import webhookRouter from "./routes/webhook.route.js";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

const app = express();

app.use(cors(process.env.CLIENT_URL));

const port = process.env.PORT || 3000;

app.use(clerkMiddleware());

app.use("/webhooks", webhookRouter);

app.use(express.json());

app.use("/query", queryRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  res.json({
    message: err.message || "Something went wrong!",
    status: err.status,
    stack: err.stack,
  });
});

app.listen(port, () => {
  connectDB();
  console.log(`Server running at http://localhost:${port}`);
});
