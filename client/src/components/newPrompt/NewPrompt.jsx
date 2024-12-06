import { MoveUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const NewPrompt = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [question, answer]);

  const simulateStreaming = (text) => {
    const words = text.split(" ");
    let index = 0;
    const interval = setInterval(() => {
      if (index < words.length) {
        setAnswer((prev) => prev + " " + words[index++]); // Append words incrementally
      } else {
        clearInterval(interval);
      }
    }, 100); // Simulate delay
  };

  const add = async (text) => {
    try {
      setQuestion(text);
      setAnswer("");

      const response = await fetch("api_url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      simulateStreaming(data.answer || "No answer received");
      console.log(data);
    } catch (e) {
      console.error("Error fetching data", e);
      setAnswer("Failed to answer. Please try again later.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text);
    e.target.reset();
    setQuestion("");
  };

  return (
    <>
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message">{answer}</div>}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit}>
        <label htmlFor="file">
          <MoveUp />
        </label>
        <input disabled id="file" type="file" multiple={false} hidden />
        <input
          type="text"
          name="text"
          placeholder="Ask me anything about commercial banks in Nepal"
        />
        <button type="submit">
          <MoveUp className="upIcon" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
