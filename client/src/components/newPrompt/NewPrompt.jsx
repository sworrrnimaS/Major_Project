/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoveUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";

const NewPrompt = ({ data }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const endRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, question, answer]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      return await fetch(
        `${import.meta.env.VITE_API_URL}/api/chats/${data._id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question.length ? question : undefined,
            answer,
          }),
        }
      ).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: ["chat", data._id] })
        .then(() => {
          formRef.current.reset();
          setQuestion("");
          setAnswer("");
        });
    },
    onError: (error) => {
      console.log(error);
    },
  });

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

  const add = async (text, isInitial) => {
    if (!isInitial) setQuestion(text);

    try {
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
      mutation.mutate(text);
    } catch (e) {
      console.error("Error fetching data", e);
      setAnswer("Failed to answer. Please try again later.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.text.value;
    if (!text) return;
    add(text, false);
    e.target.reset();
  };

  // No need hasRun in production
  const hasRun = useRef(false);
  useEffect(() => {
    if (!hasRun.current) {
      if (data?.history?.length === 1) {
        add(data.history[0].parts[0].text, true);
      }
    }
    hasRun.current = true;
  }, []);

  return (
    <>
      {question && <div className="message user">{question}</div>}
      {answer && <div className="message">{answer}</div>}
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <label htmlFor="file">
          <MoveUp />
        </label>
        <input disabled id="file" type="file" multiple={false} hidden />
        <input
          type="text"
          name="text"
          placeholder="Ask me anything about commercial banks in Nepal"
        />
        <button type="submit" disabled={mutation.isLoading}>
          <MoveUp className="upIcon" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
