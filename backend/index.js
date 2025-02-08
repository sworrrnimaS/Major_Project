import express from "express";
import bodyParser from "body-parser";
import chatRouter from "./routes/chat.route.js";
import sessionRouter from "./routes/session.route.js";
import { connectDB } from "./lib/connectDB.js";
import webhookRouter from "./routes/webhook.route.js";
import cors from "cors";
import { clerkMiddleware, requireAuth } from "@clerk/express";

const app = express();

app.use(cors(process.env.CLIENT_URL));

const port = process.env.PORT || 3000;

app.use(clerkMiddleware());

app.use("/webhooks", webhookRouter);

app.use(express.json());

/*

// app.get("/auth-state", (req, res) => {
//   const authState = req.auth;
//   res.json(authState);
// });

// app.get("/protect", (req, res) => {
//   const { userId } = req.auth;
//   if (!userId) {
//     return res.status(401).json("Not authenticated");
//   }
//   res.status(200).json("Content");
// });

// app.get("/protect", (req, res) => {
//   const { userId } = req.auth;
//   if (!userId) {
//     return res.status(401).json("Not authenticated");
//   }
//   res.status(200).json("Content");
// });

// app.use("/protect2", requireAuth(), (req, res) => {
//   res.json(200).json({ message: "Content" });
// });

*/

app.use("/session", sessionRouter);

app.use("/chat", chatRouter);

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
