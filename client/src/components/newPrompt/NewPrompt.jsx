/* eslint-disable react/prop-types */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoveUp } from "lucide-react";
import { useEffect, useRef } from "react";
import "./newPrompt.css";

//esma chai user le query pathaune gareko cha, PUT garna ko karan chai, since euta session create bhayesi tesko history suru huncha even if new chat ani teta each QA pair halna we need this component

const NewPrompt = ({ data, sessionId }) => {
  const endRef = useRef(null);
  const formRef = useRef(null);
  console.log(data);

  useEffect(() => {
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [data, sessionId]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newQuery) => {
      const response = await fetch(`http://localhost:3000/chat/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: newQuery,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send query");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", sessionId] });
    },
    onError: (error) => {
      console.log(error);
      alert("Error sending query, please try again!");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    console.log(query);
    if (!query) return;
    mutation.mutate(query);
    e.target.reset();
  };
  return (
    <>
      <div className="endChat" ref={endRef}></div>
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          name="query"
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
