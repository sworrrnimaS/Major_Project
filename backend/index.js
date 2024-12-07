import express from "express";
import bodyParser from "body-parser";
import queryRouter from "./routes/query.route.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON body
app.use(bodyParser.json());

// Endpoint to process query via Python
app.use("/query", queryRouter);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
