export const isLongTermMemoryQuery = (query) => {
  // Convert query to lowercase for case-insensitive matching
  const queryLower = query.toLowerCase().trim();

  // Core patterns that strongly indicate a memory/historical query
  const strongPatterns = [
    // Session based patterns
    /last (session|conversation|chat)/i,
    /previous (session|conversation|chat)/i,
    /recent (session|conversation|chat)/i,
    /what did we just (discuss|talk about)/i,
    /what did you just (tell|say)/i,
    /what were we just (discussing|talking about)/i,
    /(summarize|recap) (this|our) (session|conversation|chat)/i,
    /what did we discuss in this (session|conversation|chat)/i,

    // Complete history patterns
    /all (our|the) (sessions|conversations|chats)/i,
    /complete (history|summary)/i,
    /everything we('ve| have) discussed/i,
    /full (history|summary)/i,
    /(summarize|recap) all/i,
    /all past (sessions|conversations|chats)/i,
    /entire (history|conversation)/i,
    /from the (beginning|start)/i,
    /all previous (sessions|conversations|chats)/i,

    // General memory patterns
    /you (said|told|mentioned)/i,
    /we (talked|discussed|spoke)/i,
    /what did you (say|tell|mention)/i,
    /remember/i,
    /previous/i,
    /last time/i,
    /earlier/i,
    /before/i,
    /already/i,
  ];

  // Check for any direct matches with strong patterns
  for (const pattern of strongPatterns) {
    if (pattern.test(queryLower)) {
      console.log("Memory query detected through strong pattern:", pattern);
      return true;
    }
  }

  // Context-based checks
  const contextualChecks = [
    // Past tense references
    query.includes("told"),
    query.includes("said"),
    query.includes("mentioned"),

    // Time references
    query.includes("ago"),
    query.includes("previously"),
    query.includes("last"),
    query.includes("earlier"),

    // Memory references
    query.includes("recall"),
    query.includes("remember"),

    // Session references
    query.includes("session"),
    query.includes("conversation"),
    query.includes("chat"),
    query.includes("discussed"),
    query.includes("talking"),
    query.includes("summary"),
    query.includes("history"),
    query.includes("recap"),
  ];

  // Count how many contextual indicators are present
  const contextMatches = contextualChecks.filter((check) => check).length;

  // Composite phrases that strongly indicate memory queries
  const compositeIndicators = [
    "what did",
    "you mentioned",
    "tell me again",
    "you said",
    "we talked about",
    "going back to",
    "as you said",
    "like you mentioned",
    "can you summarize",
    "give me a summary",
    "tell me about our",
    "what have we",
    "show me all",
    "tell me everything",
    "from the start",
  ];

  // Check for composite phrases
  for (const phrase of compositeIndicators) {
    if (queryLower.includes(phrase)) {
      console.log("Memory query detected through composite phrase:", phrase);
      return true;
    }
  }

  // If we have multiple contextual matches, it's likely a memory query
  if (contextMatches >= 2) {
    console.log(
      "Memory query detected through multiple contextual matches:",
      contextMatches
    );
    return true;
  }

  // Question patterns that reference previous information
  const questionPatterns = [
    /^what.+about.+\?/i,
    /^how.+about.+\?/i,
    /^when.+about.+\?/i,
    /^why.+about.+\?/i,
    /^tell me.+about.+\?/i,
    /^show me.+about.+\?/i,
    /^can you.+tell.+about.+\?/i,
  ];

  // If we have a question pattern AND at least one contextual match, consider it a memory query
  for (const pattern of questionPatterns) {
    if (pattern.test(query) && contextMatches > 0) {
      console.log(
        "Memory query detected through question pattern with context"
      );
      return true;
    }
  }

  // Debug logging
  console.log("Query analysis:", {
    query: queryLower,
    contextMatches,
    isMemoryQuery: false,
  });

  return false;
};
