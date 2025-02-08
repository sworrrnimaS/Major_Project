// Advanced Title Extraction Function
export default function extractAdvancedTitle(paragraph) {
  // List of common stop words to ignore
  const stopWords = [
    "is",
    "a",
    "the",
    "for",
    "of",
    "and",
    "to",
    "in",
    "it",
    "on",
    "with",
    "used",
    "both",
    "who",
    "what",
    "are",
    "when",
    "was",
  ];

  // Split paragraph into words and filter out stop words
  const words = paragraph
    .replace(/[.,!?]/g, "") // Remove punctuation
    .split(" ") // Split into words
    .filter((word) => !stopWords.includes(word.toLowerCase()));

  // Count word frequency to prioritize important words
  const wordFrequency = {};
  words.forEach((word) => {
    const lowerWord = word.toLowerCase();
    wordFrequency[lowerWord] = (wordFrequency[lowerWord] || 0) + 1;
  });

  // Sort words by frequency and select the top 4-5
  const sortedWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map((entry) => entry[0]);

  // Capitalize the selected words
  const title = sortedWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return title;
}

// Example usage
// const paragraph =
//   "JavaScript is a versatile language used for web development. It powers both frontend and backend applications.";
// const title = extractAdvancedTitle(paragraph);

// console.log(title); // Output: "Javascript Versatile Language Web Development"
