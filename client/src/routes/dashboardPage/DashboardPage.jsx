/* eslint-disable react-hooks/exhaustive-deps */
import { MoveUp } from "lucide-react";
import "./dashboardPage.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { DNA } from "react-loader-spinner";

//Yo page ma chai naya chat creation part huncha naya session create garna POST request pathako cha server lai, since paila chai New Chat button thenna, naya chat ko lagi session create garna euta query pathauna parthyo which is done by this page, natra QA pairs is handled by NewPrompt and dekhaune part is ChatPage

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // New chat session banaune part handle garne ho yaha bata
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `http://localhost:3000/session/createSession`
      );
      if (!response.ok) {
        throw new Error("Failed to create session");
      }
      return response.json();
    },

    onSuccess: (data) => {
      const sessionId = data.session._id;
      queryClient.invalidateQueries({ queryKey: ["userSessions"] }); // Update all session queries
      navigate(`/dashboard/chats/${sessionId}`); //Navigate to ChatPage
    },

    onError: (error) => {
      console.error("Error creating session:", error);
      setLoading(false); // Set loading to false if an error occurs
    },
  });

  useEffect(() => {
    // Create a session when component mounts
    mutation.mutate();
  }, []);

  if (loading) {
    return (
      <DNA
        visible={true}
        height="80"
        width="80"
        ariaLabel="dna-loading"
        wrapperStyle={{}}
        wrapperClass="dna-wrapper"
      />
    );
  }
  return (
    <div className="dashboardPage">
      <div className="texts">
        <div className="logo">
          <img src="/logo.png" alt="" />
        </div>
      </div>
      <div className="formContainer">
        <form>
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
