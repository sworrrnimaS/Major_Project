/* eslint-disable react-hooks/exhaustive-deps */
import { MoveUp } from "lucide-react";
import "./dashboardPage.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

//Yo page ma chai naya chat creation part huncha naya session create garna POST request pathako cha server lai, since paila chai New Chat button thenna, naya chat ko lagi session create garna euta query pathauna parthyo which is done by this page, natra QA pairs is handled by NewPrompt and dekhaune part is ChatPage

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // New chat session banaune part handle garne ho yaha bata
  const mutation = useMutation({
    mutationFn: async () => {
      return await fetch(
        `${import.meta.env.VITE_API_URL}/session/createSession`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test: "" }),
        }
      ).then((res) => res.json());
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["userChats"] });
      navigate(`/dashboard/chats/${id}`);
    },
  });

  useEffect(() => {
    // Create a session when component mounts
    mutation.mutate();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = e.target.query.value;
    if (!text) return;

    console.log("Query submitted:", text);
  };
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
        </div>
      </div>
      <div className="formContainer">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask me anything about commercial banks in Nepal"
            name="query"
          />
          <button>
            <MoveUp className="upIcon" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;
