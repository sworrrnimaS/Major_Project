import Session from "./../models/session.model.js";
import User from "./../models/user.model.js";
import { generateSessionSummary as generateSummaryOfSummaries } from "./generateSummary.js";

function detectSummaryType(query) {
  const queryLower = query.toLowerCase().trim();

  // Patterns for latest session summary
  const latestSessionPatterns = [
    /last (session|conversation|chat)/i,
    /previous (session|conversation|chat)/i,
    /recent (session|conversation|chat)/i,
    /what did we just (discuss|talk about)/i,
    /what did you just (tell|say)/i,
    /what were we just (discussing|talking about)/i,
    /(summarize|recap) (this|our) (session|conversation|chat)/i,
    /what did we discuss in this (session|conversation|chat)/i,
  ];

  // Patterns for complete history summary
  const completeHistoryPatterns = [
    /all (our|the) (sessions|conversations|chats)/i,
    /complete (history|summary)/i,
    /everything we('ve| have) discussed/i,
    /full (history|summary)/i,
    /(summarize|recap) all/i,
    /all past (sessions|conversations|chats)/i,
    /entire (history|conversation)/i,
    /from the (beginning|start)/i,
    /all previous (sessions|conversations|chats)/i,
  ];

  // Check for latest session patterns
  const isLatestSession = latestSessionPatterns.some((pattern) =>
    pattern.test(queryLower)
  );

  // Check for complete history patterns
  const isCompleteHistory = completeHistoryPatterns.some((pattern) =>
    pattern.test(queryLower)
  );

  // Return the detected type
  if (isLatestSession) {
    console.log("Detected: Latest Session Summary Request");
    console.log("Query:", query);
    console.log("Type: Latest Session");
    return "LATEST_SESSION";
  } else if (isCompleteHistory) {
    console.log("Detected: Complete History Summary Request");
    console.log("Query:", query);
    console.log("Type: Complete History");
    return "COMPLETE_HISTORY";
  } else {
    console.log("Detected: Specific Memory Query");
    console.log("Query:", query);
    console.log("Type: Specific Query");
    return "SPECIFIC_QUERY";
  }
}

export const handleLongTermMemory = async (data, sessionId, user) => {
  const summaryType = detectSummaryType(data.follow_up);

  console.log("\nLong Term Memory Processing:");
  console.log("-".repeat(50));

  let response = "";
  switch (summaryType) {
    case "LATEST_SESSION":
      console.log("Action: Retrieving latest session summary");
      console.log("Context: Will fetch only the most recent conversation");
      const latestSession = await Session.findById(sessionId);
      response = latestSession.sessionSummary;
      break;

    case "COMPLETE_HISTORY":
      console.log("Action: Retrieving complete conversation history");
      console.log("Context: Will fetch all available conversation history");

      const allSessionsForUser = await Session.find({ user: user._id });

      const allSessionsSummaries = allSessionsForUser
        .map((session) =>
          session.sessionSummary.trim().replace(/['"\r\n\\/]/g, "")
        )
        .join("");

      // console.log("ALL SESSION SUMMARIES:", allSessionsSummaries);
      const summaryOfSummaries = await generateSummaryOfSummaries(
        sessionId,
        allSessionsSummaries,
        true
      );
      // console.log(
      //   "SummaryOfSummaries:",
      //   summaryOfSummaries
      //     .trim()
      //     .replace(/"/g, "")
      //     .replace(/\n/g, "")
      //     .split("Generated Summary Response:")[1] || ""
      // );
      response =
        summaryOfSummaries
          .trim()
          .replace(/"/g, "")
          .replace(/\n/g, "")
          .split("Generated Summary Response:")[1] || "";

      break;

    case "SPECIFIC_QUERY":
      console.log("Action: Processing specific memory query");
      console.log("Context: Will search for specific information in history");
      // Add your logic for handling specific queries
      response = "I cannot find anything related to this query!";
      break;
  }

  // For testing purposes, returning a mock response
  return {
    query_type: summaryType,
    original_query: data.follow_up,
    resolved_query: response,
    response: `Processed as ${summaryType} query`,
  };
};
