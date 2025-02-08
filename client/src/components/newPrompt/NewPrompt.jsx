/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoveUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./newPrompt.css";
import { useAuth } from "@clerk/clerk-react";

//esma chai user le query pathaune gareko cha, PUT garna ko karan chai, since euta session create bhayesi tesko history suru huncha even if new chat ani teta each QA pair halna we need this component

const NewPrompt = ({ data, sessionId }) => {
  // const endRef = useRef(null);
  const { getToken } = useAuth();
  const formRef = useRef(null);
  // console.log(data);

  useEffect(() => {
    if (data?.length > 0 && typeof data !== "string") {
      const lastMessage = data[data.length - 1];
      if (!lastMessage?.response) {
        scrollToBottom();
      }
    }
  }, [data]);

  const scrollToBottom = () => {
    const chatContainer = document.querySelector(".chat");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const [style, setStyle] = useState("");

  // useEffect(() => {
  //   endRef.current.scrollIntoView({ behavior: "smooth" });
  // }, [data, sessionId]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newQuery) => {
      // console.log(newQuery);
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/chat/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
    onMutate: async (newQuery) => {
      await queryClient.cancelQueries({ queryKey: ["chats", sessionId] });

      const previousChats = queryClient.getQueryData(["chats", sessionId]);

      queryClient.setQueryData(["chats", sessionId], (oldData) => [
        ...(oldData || []),
        {
          query: newQuery,
          response: null,
          isPending: true, // Add pending state
          tempId: Date.now(), // Unique identifier
        },
      ]);

      console.log(previousChats);

      return { previousChats };
    },
    onSuccess: (newResponse, variables, context) => {
      // queryClient.invalidateQueries({ queryKey: ["chats", sessionId] });
      console.log(newResponse);
      queryClient.setQueryData(["chats", sessionId], (oldData) => {
        return oldData.map((msg) =>
          msg.tempId === context.tempId
            ? { ...msg, ...newResponse, isPending: false }
            : msg
        );
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      }, 1000);
    },
    onError: (error, newQuery, context) => {
      console.log(newQuery);
      queryClient.setQueryData(["chats", sessionId], (oldData) => {
        return oldData.map((msg) =>
          msg.query === newQuery ? { ...msg, error: true } : msg
        );
      });
      alert("Error sending query, please try again!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", sessionId] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = e.target.query.value;
    console.log(query);
    if (!query) return;

    mutation.mutate(query, {
      onSuccess: () => {
        scrollToBottom();
      },
    });
    e.target.reset();
  };
  return (
    <>
      {/* <div className="endChat"></div> */}
      <form className="newForm" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          name="query"
          placeholder="Ask me anything about commercial banks in Nepal"
          onChange={(e) => setStyle(e.target.value)}
          disabled={mutation.isPending}
        />
        <button type="submit" className={style ? "active" : ""}>
          <MoveUp className="upIcon" />
        </button>
      </form>
    </>
  );
};

export default NewPrompt;
