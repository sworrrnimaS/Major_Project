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

const ResFormat = ({ response }) => {
  if (!response) return null;

  const formatResponse = (text) => {
    return (
      text
        .replace(/\d+\.\s/g, "\n- ") // Convert numbered lists to bullet points
        .replace(/\*/g, "\n- ") // Convert asterisks (*) to bullet points
        .replace(/-\s/g, "\n- ") // Normalize hyphen lists
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold anything inside **
        .replace(
          /\b(Citizens Bank International|Nepal Bank Limited|Rastriya Banijya Bank Limited|Agriculture Development Bank Limited|Nabil Bank Limited|Nepal Investment Mega Bank Limited|Standard Chartered Bank Nepal|Himalayan Bank Limited|Nepal SBI Bank Limited|Everest Bank Limited|Prabhu Bank Limited|Laxmi Sunrise Bank Limited|Global IME Bank Limited|Prime Commercial Bank Nepal|Nepal Merchant Banking and Finance Limited|NIC Asia Bank Limited|Siddhartha Bank Limited|Sanima Bank Nepal|Machhapuchchhre Bank Limited|Kumari Bank Limited|CIBL|NBL|RBBL|ADBL|NABIL|NIMB|SCBN|HBL|NSBL|EBL|PBL|LSBL|GIME|PCBN|NMB|NIC ASIA|SBI|IME|NIC|SBL|SBNL|MBL|KBL)\b/g,
          "<strong>$1</strong>"
        )
        // .replace(
        //   /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Bank Limited\b/g,
        //   "<strong>$1 Bank Limited</strong>"
        // ) // Bold full bank names
        // .replace(
        //   /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Bank International\b/g,
        //   "<strong>$1 Bank International</strong>"
        // ) // Bold full bank names
        // .replace(
        //   /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Bank Nepal\b/g,
        //   "<strong>$1 Bank Nepal</strong>"
        // ) // Bold full bank names
        // .replace(
        //   /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Finance Limited\b/g,
        //   "<strong>$1 Finance Limited</strong>"
        // ) // Bold full bank names
        .replace(
          /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Credit Card Services\b/g,
          "<strong>$1 Credit Card Services</strong>"
        ) // Bold service names
        .replace(
          /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*) Loan\b/g,
          "<strong>$1 Loan</strong>"
        ) // Bold loan types
        .replace(
          /(Interest Rate:|Loan Amount:|Repayment Tenure:|EMI Amount:|Total Interest:|Total Payment:)/g,
          "<strong>$1</strong>"
        ) // Bold key details, including EMI
        .replace(
          /(https?:[^\s]+?)(?=[\s.,]|$)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 underline">$1</a>'
        ) // Properly show clickable links with security attributes
        .replace(
          /(Principal\(Rs\.\d+\)|Time\(\d+\syears\)|Rate\(\d+\.\d+%\)|EMI\(Rs\.\d+\)|Interest\(Rs\.\d+\)|Total Payment\(Rs\.\d+\))/g,
          "<strong>$1</strong>"
        ) // Bold numerical query parts, including EMI, interest, and total payment
        .replace(/�/g, "×") // Replace weird symbols with multiplication sign if needed
        .split("\n")
        .map((line) => (line ? `<p>${line}</p>` : ""))
        .join("")
    ); // Ensure proper line spacing
  };

  return (
    <div className="p-4 bg-gray-100 rounded-xl shadow-md">
      <p
        className="text-gray-800 text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatResponse(response) }}
      ></p>
    </div>
  );
};

export default ResFormat;
