import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import Session from "../models/session.model.js";
import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import { handleLongTermMemory } from "../helpers/handleLongTermMemory.js";
import { generateSessionSummary } from "../helpers/generateSummary.js";
import { isLongTermMemoryQuery } from "../helpers/isLongTermMemory.js";
import generateSessionTitle from "../helpers/generateSessionTitle.js";

export const askQuery = async (req, res) => {
  const userQuery = req.body.query;
  const sessionId = req.params.sessionId;

  const clerkUserId = req.auth.userId;

  const user = await User.findOne({ clerkUserId });
  console.log(user);

  if (!userQuery) {
    return res.status(400).send("Query is required");
  }

  // implement get latest query(resolved query) for a session to replace this Note if this is the first query put empty string
  let latestQueryForSession = async (sessionId) => {
    try {
      const getLatestQuery = await Chat.findOne({
        sessionId,
        isLTM: false,
      }).sort({
        createdAt: -1,
      });

      if (!getLatestQuery) {
        console.log("This is the first query for this session");
        return "";
      }

      return getLatestQuery;
    } catch (err) {
      console.log("Error during fetching previous query and response", err);
    }
  };

  const resultLatestQuery = await latestQueryForSession(sessionId);
  // console.log("resultLatestQuery:", resultLatestQuery);

  let conversationHistory = {
    query: resultLatestQuery?.resolvedQuery ?? "",
    response: resultLatestQuery?.response ?? "",
  };

  let previousQuery = conversationHistory.query;
  let previousResponse = conversationHistory.response;

  const previousData = {
    query: previousQuery,
    response: previousResponse,
    follow_up: userQuery,
  };

  // console.log(previousData);
  let response;

  if (isLongTermMemoryQuery(previousData.follow_up)) {
    console.log(
      "Long-term memory query detected, handling with longTermMemory.js"
    );
    response = await handleLongTermMemory(previousData, sessionId, user);
    // console.log(response);

    const session = await Session.findById(sessionId);
    const userOfThisSession = await User.findById(session.user);
    // console.log(userOfThisSession);

    const chat = new Chat({
      sessionId: sessionId,
      user: userOfThisSession._id,
      query: userQuery,
      response: response.resolved_query.trim().replace(/["\r\n\\/]/g, ""),
      resolvedQuery: "",
      isLTM: true,
    });
    await chat.save();

    return res.status(200).json({
      status: "success",
      query: userQuery,
      response: response.resolved_query.trim().replace(/["\r\n\\/]/g, ""),
    });
  } else {
    console.log("Regular query detected, processing with main.py");
    response = await executePythonProcess(previousData);
  }

  // console.log(response);

  conversationHistory = {
    query: userQuery,
    response: response.response || "No response",
    resolvedQuery: response.resolvedQuery,
  };
  // console.log(conversationHistory);
  console.log(clerkUserId);
  await saveChatAndUpdateSession(conversationHistory, sessionId, clerkUserId);
  // When Python script finishes
  res.status(200).json({
    status: "success",
    query: conversationHistory.query,
    response: conversationHistory.response,
  });
};

async function saveChatAndUpdateSession(jsonObject, sessionId, clerkUserId) {
  try {
    console.log(clerkUserId);
    const user = await User.findOne({ clerkUserId });
    console.log(user);

    const saveChat = new Chat({
      sessionId: sessionId,
      user: user._id,
      query: jsonObject.query,
      response: jsonObject.response,
      resolvedQuery: jsonObject.resolvedQuery,
    });

    const savedChat = await saveChat.save();

    /*
    
    SUMMARY GENERATING LOGIC STARTS

    */

    const session = await Session.findById(sessionId);
    let count = session.summaryCount;
    let chatCount = await Chat.countDocuments({ sessionId });
    console.log(chatCount);
    let extractedSessionSummary = session.sessionSummary + " ";

    if (count < 5) {
      count += 1;
      extractedSessionSummary += jsonObject.response;
      if (count === 1 && chatCount < 5) {
        const generatedSessionTitle = generateSessionTitle(jsonObject.query);
        // console.log(generatedSessionTitle);
        await Session.findByIdAndUpdate(
          { _id: sessionId },
          {
            $set: {
              sessionTitle: generatedSessionTitle,
            },
          },
          { new: true }
        );
      }

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
      type: "Error from saveChatAndUpdateSession chat.controller.js",
      message: "Error saving chat or updating session:",
      error,
    };
    console.log(response);
  }
}

export const getAllChatsForSession = async (req, res) => {
  const sessionId = req.params.sessionId;
  const clerkUserId = req.auth.userId;

  if (!clerkUserId) {
    return res.status(401).json({
      status: "fail",
      message: "Not Authenticated to get all chats for session",
    });
  }

  const chats = await Chat.find({ sessionId });
  if (chats.length === 0) {
    return res.status(200).json([]);
  }

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

const executePythonProcess = (data) => {
  return new Promise((resolve, reject) => {
    const filename = fileURLToPath(import.meta.url);
    let __dirname = dirname(filename);
    __dirname = dirname(__dirname);

    // Call the Python script
    const pythonScriptPath = join(__dirname, "python", "main.py");
    // console.log("script path", pythonScriptPath);

    const pythonProcess = spawn("python", [pythonScriptPath]);

    console.log(JSON.stringify(data));

    pythonProcess.stdin.write(JSON.stringify(data));
    pythonProcess.stdin.end();

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

        let newOutput = output.trim();

        const jsonStart = newOutput.indexOf("{");
        const jsonEnd = newOutput.lastIndexOf("}") + 1;
        const jsonString = newOutput.slice(jsonStart, jsonEnd);

        // console.log(JSON.parse(jsonString));

        const resolvedQuery = JSON.parse(jsonString).resolved_query;
        const answer = JSON.parse(jsonString)
          .response.trim()
          .split("ModelResponse(text=")
          .join("")
          .replace(/\r?\n/g, "")
          .replace(/['"/]/g, "")
          .replace(/\\n/g, "")
          .split(", tokens_used=")[0];

        const jsonObject = {
          resolvedQuery: resolvedQuery,
          response: answer,
        };

        resolve(jsonObject);
      } else {
        reject({ error: "Executing main.py child process failed!" });
      }
    });
  });
};
