/* eslint-disable no-unused-vars */
// /* eslint-disable react/prop-types */

// const ResFormat = ({ response }) => {
//   if (!response) return null;

//   const formatResponse = (text) => {
//     return text
//       .replace(/\d+\.\s/g, "\n- ") // Convert numbered lists to bullet points
//       .replace(/\*/g, "\n- ") // Convert asterisks (*) to bullet points
//       .replace(/-\s/g, "\n- ") // Normalize hyphen lists
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold anything inside **
//       .replace(
//         /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Bank Limited\b/g,
//         "<strong>$1 Bank Limited</strong>"
//       ) // Bold full bank names
//       .replace(
//         /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Credit Card Services\b/g,
//         "<strong>$1 Credit Card Services</strong>"
//       ) // Bold service names
//       .replace(
//         /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Loan\b/g,
//         "<strong>$1 Loan</strong>"
//       ) // Bold loan types
//       .replace(
//         /(Interest Rate:|Loan Amount:|Repayment Tenure:|EMI Amount:|Amortization Schedule:|Total Interest:|Total Payment:)/g,
//         "<strong>$1</strong>"
//       ) // Bold key details, including EMI and amortization terms
//       .replace(
//         /(https?:[^\s]+?)(?=[\s.,]|$)/g,
//         '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
//       ) // Properly show clickable links with security attributes
//       .replace(
//         /(Principal\(Rs\.\d+\)|Time\(\d+\syears\)|Rate\(\d+\.\d+%\)|EMI\(Rs\.\d+\)|Interest\(Rs\.\d+\)|Total Payment\(Rs\.\d+\))/g,
//         "<strong>$1</strong>"
//       ) // Bold numerical query parts, including EMI, interest, and total payment
//       .replace(/�/g, "×") // Replace weird symbols with multiplication sign if needed
//       .split("\n")
//       .map((line) => (line ? `<p>${line}</p>` : ""))
//       .join(""); // Ensure proper line spacing
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-xl shadow-md">
//       <p
//         className="text-gray-800 text-lg leading-relaxed"
//         dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
//       ></p>
//     </div>
//   );
// };

// export default ResFormat;

/* eslint-disable react/prop-types */
// const ResFormat = ({ response }) => {
//   if (!response) return null;

//   const formatResponse = (text) => {
//     // Pre-process the text to handle explicit "\n" strings
//     const processedText = text.replace(/\\n/g, "\n"); // Convert "\n" string to actual newlines

//     return (
//       processedText
//         .replace(/\d+\.\s/g, "<li>") // Convert numbered lists to list items
//         .replace(/\*\s/g, "<li>") // Convert asterisks (*) to list items
//         .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold anything inside **
//         // Bold bank names
//         .replace(
//           /\b(Citizens Bank International|Nepal Bank Limited|Rastriya Banijya Bank Limited|Agriculture Development Bank Limited|Nabil Bank Limited|Nepal Investment Mega Bank Limited|Standard Chartered Bank Nepal|Himalayan Bank Limited|Nepal SBI Bank Limited|Everest Bank Limited|Prabhu Bank Limited|Laxmi Sunrise Bank Limited|Global IME Bank Limited|Prime Commercial Bank Nepal|Nepal Merchant Banking and Finance Limited|NIC Asia Bank Limited|Siddhartha Bank Limited|Sanima Bank Nepal|Machhapuchchhre Bank Limited|Kumari Bank Limited|CIBL|NBL|RBBL|ADBL|NABIL|NIMB|SCBN|HBL|NSBL|EBL|PBL|LSBL|GIME|PCBN|NMB|NIC ASIA|SBI|IME|NIC|SBL|SBNL|MBL|KBL)\b/g,
//           "<strong>$1</strong>"
//         )
//         // Bold service names
//         .replace(
//           /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Credit Card Services\b/g,
//           "<strong>$1 Credit Card Services</strong>"
//         )
//         // Bold loan types
//         .replace(
//           /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Loan\b/g,
//           "<strong>$1 Loan</strong>"
//         )
//         // Bold key details, including EMI
//         .replace(
//           /(Interest Rate:|Loan Amount:|Repayment Tenure:|EMI Amount:|Total Interest:|Total Payment:)/g,
//           "<strong>$1</strong>"
//         )
//         // Properly display clickable links with security attributes - fixed
//         .replace(
//           /(https?:\/\/[^\s]+?)(?=[\s.,]|$)/g,
//           '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline hover:text-blue-700">$1</a>'
//         )
//         // Bold numerical query parts, including EMI, interest, and total payment
//         .replace(
//           /(Principal\(Rs\.\d+\)|Time\(\d+\syears\)|Rate\(\d+\.\d+%\)|EMI\(Rs\.\d+\)|Interest\(Rs\.\d+\)|Total Payment\(Rs\.\d+\))/g,
//           "<strong>$1</strong>"
//         )
//         .replace(/�/g, "×") // Replace weird symbols with multiplication sign
//         .split("\n")
//         .map((line, index) => {
//           // Check if line contains list items
//           if (line.includes("<li>")) {
//             const items = line.split("<li>").filter(Boolean);
//             return `<ul class="list-disc pl-5 my-2">${items
//               .map((item) => `<li>${item}</li>`)
//               .join("")}</ul>`;
//           }
//           return line ? `<p class="mb-2">${line}</p>` : "";
//         })
//         .join("")
//     );
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-xl shadow-md">
//       <div
//         className="text-gray-800 text-lg leading-relaxed"
//         dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
//       ></div>
//     </div>
//   );
// };

// export default ResFormat;

const ResFormat = ({ response }) => {
  if (!response) return null;

  const formatResponse = (text) => {
    // Pre-process the text to handle explicit "\n" strings
    const processedText = text.replace(/\\n/g, "\n"); // Convert "\n" string to actual newlines

    // First, let's protect URLs to prevent them from being broken by other transformations
    const urlPlaceholders = [];
    const textWithUrlPlaceholders = processedText.replace(
      /(https?:\/\/[^\s]+)(?=[\s.,]|$)/g,
      (match) => {
        const placeholder = `__URL_PLACEHOLDER_${urlPlaceholders.length}__`;
        urlPlaceholders.push(match);
        return placeholder;
      }
    );

    let formattedText = textWithUrlPlaceholders
      // Convert numbered lists to list items
      .replace(/\d+\.\s/g, "<li>")
      // Convert asterisks (*) to list items (with proper spacing)
      .replace(/\*\s/g, "<li>")
      // Bold anything inside ** (already works)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      // Bold bank names - improved pattern to catch more variations
      .replace(
        /\b(Citizens Bank International|Nepal Bank Limited|Rastriya Banijya Bank Limited|Agriculture Development Bank Limited|Nabil Bank Limited|Nepal Investment Mega Bank Limited|Standard Chartered Bank Nepal|Himalayan Bank Limited|Nepal SBI Bank Limited|Everest Bank Limited|Prabhu Bank Limited|Laxmi Sunrise Bank Limited|Global IME Bank Limited|Prime Commercial Bank Nepal|Nepal Merchant Banking and Finance Limited|NIC Asia Bank Limited|Siddhartha Bank Limited|Sanima Bank Nepal|Machhapuchchhre Bank Limited|Kumari Bank Limited|Nepal Bangladesh Bank|Nepal Credit and Commerce Bank Ltd|Global IME Bank Ltd|CIBL|NBL|RBBL|ADBL|NABIL|NIMB|SCBN|HBL|NSBL|EBL|PBL|LSBL|GIME|PCBN|NMB|NIC ASIA|SBI|IME|NIC|SBL|SBNL|MBL|KBL|NICA)\b/gi,
        "<strong>$1</strong>"
      )
      // Additional bank name handling - catches variations like "Everest Bank" without "Limited"
      .replace(
        /\b(Everest|Nabil|Prabhu|Kumari|Sanima|Siddhartha|Machhapuchchhre|Rastriya Banijya|Himalayan|Global IME|NIC Asia)\s+Bank\b/gi,
        "<strong>$1 Bank</strong>"
      )
      // Bold service names
      .replace(
        /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Credit Card Services\b/g,
        "<strong>$1 Credit Card Services</strong>"
      )
      // Bold loan types
      .replace(
        /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Loan\b/g,
        "<strong>$1 Loan</strong>"
      )
      // Bold key details
      .replace(
        /(Interest Rate:|Loan Amount:|Repayment Tenure:|EMI Amount:|Total Interest:|Total Payment:)/g,
        "<strong>$1</strong>"
      )
      // Bold numerical query parts
      .replace(
        /(Principal\(Rs\.\d+\)|Time\(\d+\syears\)|Rate\(\d+\.\d+%\)|EMI\(Rs\.\d+\)|Interest\(Rs\.\d+\)|Total Payment\(Rs\.\d+\))/g,
        "<strong>$1</strong>"
      )
      .replace(/�/g, "×"); // Replace weird symbols

    // Now, replace the URL placeholders with properly formatted links
    urlPlaceholders.forEach((url, index) => {
      formattedText = formattedText.replace(
        `__URL_PLACEHOLDER_${index}__`,
        `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline hover:text-blue-700 transition-colors">${url}</a>`
      );
    });

    // Process the text into paragraphs and lists
    return formattedText
      .split("\n")
      .map((line, index) => {
        // Check if line contains list items
        if (line.includes("<li>")) {
          const items = line.split("<li>").filter(Boolean);
          return `<ul class="list-disc pl-5 my-2">${items
            .map((item) => `<li class="mb-1">${item}</li>`)
            .join("")}</ul>`;
        }
        return line ? `<p class="mb-2">${line}</p>` : "";
      })
      .join("");
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md">
      <div
        className="text-gray-800 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
      ></div>
    </div>
  );
};

export default ResFormat;
