import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { spawn } from "child_process";
import Session from "./../models/session.model.js";

const runPythonScript = async (answersParagraph) => {
  return new Promise((resolve, reject) => {
    const filename = fileURLToPath(import.meta.url);
    let __dirname = dirname(filename);
    __dirname = dirname(filename);
    const parentDir = dirname(__dirname);
    // console.log(parentDir);
    const pythonScriptPath = join(
      parentDir,
      "python", //specifying the directory name which is python it doesn't mean actual python executable it's just a folder name
      "summary_long_term_memory",
      "memory.py"
    );
    const pythonProcess = spawn("python", [
      pythonScriptPath,
      `"${answersParagraph}"`,
    ]);
    let output = "";
    pythonProcess.stdout.on("data", (data) => {
      output += data.toString();
      console.log(output);
    });
    pythonProcess.stderr.on("data", (data) => {
      console.error(`Error: ${data.toString()}`);
    });
    pythonProcess.on("error", (error) => console.log(`error :${error}`));
    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(`Child Process for generating summary exited with code ${code}`);
      }
    });
  });
};

export const generateSessionSummary = async (
  sessionId,
  answersParagraph,
  summaryOfSummaries = false
) => {
  try {
    const response = await runPythonScript(answersParagraph);
    //For debugging
    // console.log(
    //   "\n\n\n\n\n\n\n\n\n\n\n\n\n",
    //   response
    //     .replace(/"/g, "")
    //     .replace(/\n/g, "")
    //     .split("Generated Summary Response:")[1]
    // );

    let count = 0;
    const sessionSummary = response.includes("Generated Summary Response:")
      ? response
          .replace(/"/g, "")
          .replace(/\n/g, "")
          .split("Generated Summary Response:")[1] || ""
      : response;

    if (!summaryOfSummaries) {
      await Session.findByIdAndUpdate(
        sessionId.toString(),
        {
          $set: {
            summaryCount: count,
            sessionSummary: sessionSummary,
          },
        },
        { new: true }
      );
      return true;
    } else {
      return response;
    }
  } catch (error) {
    console.error("Error running runPythonScript in generateSummary", error);
  }
};
