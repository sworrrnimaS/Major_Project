/* eslint-disable no-unused-vars */
import { Link, useNavigate } from "react-router-dom";
import { Crown, History, SquarePen } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import "./chatList.css";
import { DNA } from "react-loader-spinner";
import { useEffect, useState } from "react";
// import { useAuth } from "@clerk/clerk-react";
import UpgradeModal from "../upgradeModal/UpgradeModal";

// yaha chai different session id hisab le old conversation ko title dekhauna lai banako ho yo component, New Chat button hamle afai add gareko ho, Dashboard ma jastai POST request garna parcha New Chat button bata in session id generate garna

const ChatList = () => {
  const [showModal, setShowModal] = useState(false);
  const [isActive, setIsActive] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  // const { userId } = useAuth();

  const { isLoading, error, data } = useQuery({
    queryKey: ["userSessions"],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/session/getAllSessions/675d80c336b7c233034b2e02`
      );
      const data = await response.json();
      // console.log(data);
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        "http://localhost:3000/session/createSession"
      );
      if (!response.ok) {
        throw new Error("Failed to create session");
      }
      return response.json();
    },
    onSuccess: (data) => {
      const sessionId = data.session._id;
      queryClient.invalidateQueries({ queryKey: ["userSessions"] });
      navigate(`/dashboard/chats/${sessionId}`);
    },
  });
  const handleNewChat = function () {
    mutation.mutate();
  };
  const handleSessionActive = (sessionId) => {
    setIsActive(sessionId);
  };
  return (
    <div className="chatList">
      <button
        className="new-chat"
        onClick={handleNewChat}
        disabled={mutation.isLoading} // Disable until session creation is finished
      >
        {mutation.isLoading ? "Creating..." : "New Chat"}
        <SquarePen />
      </button>

      {/* <span className="title">DASHBOARD</span>

      <Link to="/dashboard">Explore BankHelp AI</Link> */}
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isLoading ? (
          <div className="loader">
            <DNA
              visible={true}
              height="60"
              width="60"
              ariaLabel="dna-loading"
              wrapperStyle={{}}
              wrapperClass="dna-wrapper"
            />
          </div>
        ) : error ? (
          "Something went wrong!"
        ) : (
          data?.sessions
            ?.slice()
            .reverse()
            .map((session) => (
              <Link
                to={`/dashboard/chats/${session._id}`}
                key={session._id}
                className={isActive === session._id ? "active" : ""}
                onClick={() => handleSessionActive(session._id)}
              >
                <History
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                  }}
                />
                {/* {session._id} */}
                {session.sessionTitle || `New Chat`}
              </Link>
            ))
        )}
      </div>
      <hr />
      <div className="upgrade">
        {/* <img src="/logo.png" alt="" /> */}
        {/* <div className="texts">
          <button className="upgrade-button" onClick={() => setShowModal(true)}>
            <Crown className="icon" />
            Upgrade Plan
          </button>
          <span>Get unlimited access to all features</span>
        </div> */}
      </div>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ChatList;
