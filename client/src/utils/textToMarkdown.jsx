/* eslint-disable no-unused-vars */

import React from "react";

export const convertToMarkdown = (text) => {
  if (!text) return null;

  // Split text into paragraphs
  const paragraphs = text.split("\n\n");

  return paragraphs.map((paragraph, pIndex) => {
    // Handle code blocks (text between ```)
    if (paragraph.includes("```")) {
      const [before, code, ...after] = paragraph.split("```");
      return (
        <React.Fragment key={pIndex}>
          {before && <p>{before}</p>}
          {code && (
            <pre className="code-block">
              <code>{code}</code>
            </pre>
          )}
          {after.length > 0 && <p>{after.join("")}</p>}
        </React.Fragment>
      );
    }

    // Handle lists (lines starting with - or *)
    if (
      paragraph
        .split("\n")
        .some(
          (line) => line.trim().startsWith("-") || line.trim().startsWith("*")
        )
    ) {
      const listItems = paragraph
        .split("\n")
        .map((line) => line.trim().replace(/^[-*]\s+/, ""))
        .filter(Boolean);

      return (
        <ul key={pIndex} className="markdown-list">
          {listItems.map((item, i) => (
            <li key={`${pIndex}-${i}`}>{item}</li>
          ))}
        </ul>
      );
    }

    // Process inline markdown
    const processInlineMarkdown = (text) => {
      const parts = [];
      let lastIndex = 0;
      let index = 0;

      // Bold text
      const boldPattern = /\*\*(.*?)\*\*/g;
      // Italic text
      const italicPattern = /\*(.*?)\*/g;
      // Inline code
      const codePattern = /`([^`]+)`/g;

      // Process all patterns
      const patterns = [
        {
          regex: boldPattern,
          wrapper: (content, i) => <strong key={i}>{content}</strong>,
        },
        {
          regex: italicPattern,
          wrapper: (content, i) => <em key={i}>{content}</em>,
        },
        {
          regex: codePattern,
          wrapper: (content, i) => (
            <code key={i} className="inline-code">
              {content}
            </code>
          ),
        },
      ];

      const matches = [];
      patterns.forEach((pattern) => {
        let match;
        while ((match = pattern.regex.exec(text)) !== null) {
          matches.push({
            index: match.index,
            length: match[0].length,
            content: match[1],
            wrapper: pattern.wrapper,
          });
        }
      });

      // Sort matches by index
      matches.sort((a, b) => a.index - b.index);

      // Build the result
      matches.forEach((match, i) => {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(match.wrapper(match.content, `inline-${i}`));
        lastIndex = match.index + match.length;
      });

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    };

    // Return paragraph with processed inline markdown
    return <p key={pIndex}>{processInlineMarkdown(paragraph)}</p>;
  });
};

// const MarkdownConverter = ({ text }) => {
//   if (!text) return null;

//   // Parse code blocks
//   const parseCodeBlock = (block, index) => {
//     const [before, code, ...after] = block.split("```");
//     return (
//       <div key={`code-block-${index}`} className="space-y-4">
//         {before && <p className="text-gray-700">{parseInlineStyles(before)}</p>}
//         {code && (
//           <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
//             <code className="text-sm font-mono">{code.trim()}</code>
//           </pre>
//         )}
//         {after.length > 0 && (
//           <p className="text-gray-700">{parseInlineStyles(after.join(""))}</p>
//         )}
//       </div>
//     );
//   };

//   // Check if block is a list
//   const isListBlock = (block) => {
//     return block.split("\n").some((line) => /^[-*]\s+/.test(line.trim()));
//   };

//   // Parse lists
//   const parseList = (block, index) => {
//     const items = block
//       .split("\n")
//       .filter((line) => line.trim())
//       .map((line) => line.trim().replace(/^[-*]\s+/, ""));

//     return (
//       <ul key={`list-${index}`} className="list-disc pl-6 space-y-2">
//         {items.map((item, itemIndex) => (
//           <li key={`item-${index}-${itemIndex}`} className="text-gray-700">
//             {parseInlineStyles(item)}
//           </li>
//         ))}
//       </ul>
//     );
//   };

//   // Parse paragraphs with inline styles
//   const parseParagraph = (block, index) => {
//     return (
//       <p key={`paragraph-${index}`} className="text-gray-700">
//         {parseInlineStyles(block)}
//       </p>
//     );
//   };

//   // Parse inline markdown styles
//   const parseInlineStyles = (text) => {
//     const patterns = [
//       {
//         pattern: /\*\*(.*?)\*\*/g,
//         replacement: (_, content) => (
//           <strong key={`bold-${content}`} className="font-bold">
//             {content}
//           </strong>
//         ),
//       },
//       {
//         pattern: /\*(.*?)\*/g,
//         replacement: (_, content) => (
//           <em key={`italic-${content}`} className="italic">
//             {content}
//           </em>
//         ),
//       },
//       {
//         pattern: /`([^`]+)`/g,
//         replacement: (_, content) => (
//           <code
//             key={`code-${content}`}
//             className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm"
//           >
//             {content}
//           </code>
//         ),
//       },
//       {
//         pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
//         replacement: (_, text, url) => (
//           <a
//             key={`link-${url}`}
//             href={url}
//             className="text-blue-600 hover:text-blue-800 underline"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             {text}
//           </a>
//         ),
//       },
//     ];

//     let result = text;
//     let elements = [];
//     let lastIndex = 0;

//     // Process each pattern
//     patterns.forEach(({ pattern, replacement }) => {
//       const matches = [...result.matchAll(pattern)];

//       matches.forEach((match) => {
//         const [fullMatch, ...groups] = match;
//         const element = replacement(...groups);

//         if (match.index > lastIndex) {
//           elements.push(result.slice(lastIndex, match.index));
//         }

//         elements.push(element);
//         lastIndex = match.index + fullMatch.length;
//       });
//     });

//     if (lastIndex < result.length) {
//       elements.push(result.slice(lastIndex));
//     }

//     return elements.length ? elements : text;
//   };

//   // Parse the markdown content
//   const parseMarkdown = () => {
//     // Split content into blocks (paragraphs, lists, code blocks)
//     const blocks = text.split("\n\n").filter(Boolean);

//     return blocks.map((block, blockIndex) => {
//       // Check block type and parse accordingly
//       if (block.includes("```")) {
//         return parseCodeBlock(block, blockIndex);
//       } else if (isListBlock(block)) {
//         return parseList(block, blockIndex);
//       } else {
//         return parseParagraph(block, blockIndex);
//       }
//     });
//   };

//   const parsedContent = parseMarkdown();

//   return <div className="space-y-6">{parsedContent}</div>;
// };

// export default MarkdownConverter;
