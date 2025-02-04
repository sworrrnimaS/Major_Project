import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Session from "../models/session.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { generateSessionSummary } from "../helpers/generateSummary.js";

export const askQuery = async (req, res) => {
  const userQuery = req.body.query;
  const sessionId = req.params.sessionId;

  if (!userQuery) {
    return res.status(400).send("Query is required");
  }

  const filename = fileURLToPath(import.meta.url);
  let __dirname = dirname(filename);
  __dirname = dirname(__dirname);

  // Call the Python script
  const pythonScriptPath = join(__dirname, "python", "main.py");
  // console.log("script path", pythonScriptPath);

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
  pythonProcess.on("close", async (code) => {
    if (code === 0) {
      //For debugging:
      // console.log(output)

      let newOutput = output.trim(output.split("response")[1]);

      const jsonStart = newOutput.indexOf("{");
      const jsonEnd = newOutput.lastIndexOf("}") + 1;
      const jsonString = newOutput.slice(jsonStart, jsonEnd);

      // console.log(JSON.parse(jsonString).response);

      const query = JSON.parse(jsonString).response.query;
      const answer = JSON.parse(jsonString).response.answer.replace(
        /["\n]|\/\*.*?\*\//g,
        " "
      );

      const jsonObject = {
        query: query,
        response: answer,
      };

      const response = await saveChatAndUpdateSession(jsonObject, sessionId);

      res.status(200).json(jsonObject);
    } else {
      res.status(500).send("Error processing query");
    }
  });
};

async function saveChatAndUpdateSession(jsonObject, sessionId) {
  try {
    const clerkUserId = "user_2pw0QKQQ4YxSCfgD5ctwVKjfMo0";
    const user = await User.findOne({ clerkUserId });

    const saveChat = new Chat({
      sessionId: sessionId,
      user: user._id,
      query: jsonObject.query,
      response: jsonObject.response,
    });

    const savedChat = await saveChat.save();

    /*
    
    SUMMARY GENERATING LOGIC STARTS

    */
    const session = await Session.findById(sessionId);
    let count = session.summaryCount;
    let extractedSessionSummary = session.sessionSummary + " ";

    if (count < 5) {
      count += 1;
      extractedSessionSummary += jsonObject.response;
      await Session.findByIdAndUpdate(
        { _id: sessionId },
        {
          $set: {
            summaryCount: count,
            sessionSummary: extractedSessionSummary,
          },
        },
        { new: true }
      );
    }

    if (count === 5) {
      const generatedSummary = await generateSessionSummary(
        sessionId,
        extractedSessionSummary
      );
      if (generatedSummary) {
        console.log(
          `Summary has been generated and saved for session id ${sessionId}`
        );
      } else {
        console.error("Session summary generation failed.");
      }
    }

    /*
    
    SUMMARY GENERATING CODE AND LOGIC ENDS

    */

    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { $push: { chatIds: savedChat._id } },
      { new: true }
    );

    const response = {
      type: "success",
      message: `Chat created with Chat Id :${savedChat._id} and session with Session Id :${sessionId} updated!`,
    };
    console.log(response);
    //             data: jsonObject,
  } catch (error) {
    const response = {
      type: "error from saveChatAndUpdateSession chat.controller.js",
      message: "Error saving chat or updating session:",
      error,
    };
    console.log(response);
  }
}

export const getAllChatsForSession = async (req, res) => {
  const sessionId = req.params.sessionId;

  const chats = await Chat.find({ sessionId });

  res.status(200).json(chats);
};

export const deleteAllChatsForSession = async (req, res) => {
  const sessionId = req.params.sessionId;
  try {
    await Chat.deleteMany({ sessionId });

    await Session.findOneAndUpdate(
      { _id: sessionId },
      { $set: { chatIds: [], sessionSummary: "" } },
      { new: true }
    );
    console.log(
      `Chats and session details for session id: ${sessionId} have been deleted`
    );

    res.status(200).json({
      message: "All chats and session details cleared successfully",
    });
  } catch (err) {
    console.error(
      "Error occurred while deleting all chats and clearing session details:",
      err
    );
    res.status(500).json({
      message: "Error occured while deleting all chats for a session",
      err,
    });
  }
};
