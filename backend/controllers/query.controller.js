import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

export const askQuery = (req, res) => {
  const userQuery = req.body.query;

  if (!userQuery) {
    return res.status(400).send("Query is required");
  }

  const filename = fileURLToPath(import.meta.url);
  let __dirname = dirname(filename);
  __dirname = dirname(__dirname);

  // Call the Python script
  const pythonScriptPath = join(__dirname, "python", "main.py");
  console.log("script path", pythonScriptPath);

  const pythonProcess = spawn("python", [pythonScriptPath, userQuery]);

  // Collect output from the Python script
  let output = "";
  pythonProcess.stdout.on("data", (data) => {
    output += data.toString();
  });

  // Collect any errors
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error: ${data.toString()}`);
  });

  // When Python script finishes
  pythonProcess.on("close", (code) => {
    if (code === 0) {
      res.send(output); // Send Python output to client
    } else {
      res.status(500).send("Error processing query");
    }
  });
};
