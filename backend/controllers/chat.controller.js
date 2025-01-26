import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Session from "../models/session.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";

export const askQuery = (req, res) => {
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
  pythonProcess.on("close", (code) => {
    if (code === 0) {

      //For debugging:
      // console.log(output)

      let newOutput=output.trim((output.split("response")[1]))

      const jsonStart = newOutput.indexOf("{");
      const jsonEnd = newOutput.lastIndexOf("}") + 1;
      const jsonString = newOutput.slice(jsonStart, jsonEnd);

      const query=JSON.parse(jsonString).response.query
      const answer=(JSON.parse(jsonString).response.answer).split('\n').join(' ')
      const jsonObject={
        "query":query,
        "response":answer
      }
      
      saveChatAndUpdateSession(jsonObject, sessionId);

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
          
          Send a query to summarise the response to another llm(another child process) and upsert the summary response to Session collection in database also generate the title for the first query 
          
          */

          const updatedSession = await Session.findByIdAndUpdate(
            sessionId,
            { $push: { chatIds: savedChat._id } },
            { new: true }
          );

          res.status(200).json({
            message: `Chat created with Chat Id :${savedChat._id} and session with Session Id :${sessionId} updated!`,
            data: jsonObject,
          });
          // console.log("Updated session with new chat:", updatedSession);
        } catch (error) {
          // console.error("Error saving chat or updating session:", error);
          res
            .status(500)
            .json({ message: "Error saving chat or updating session:", error });
        }
      }
    } else {
      res.status(500).send("Error processing query");
    }
  });
};

export const getAllChatsForSession = async (req, res) => {
  const sessionId = req.params.sessionId;

  const chats = await Chat.find({ sessionId });

  res.status(200).json(chats);
};
