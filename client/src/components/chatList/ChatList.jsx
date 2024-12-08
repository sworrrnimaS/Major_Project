import { Link } from "react-router-dom";
import { Crown, History, SquarePen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import "./chatList.css";
import { DNA } from "react-loader-spinner";
import { useState } from "react";
import UpgradeModal from "../upgradeModal/UpgradeModal";

const ChatList = () => {
  const [showModal, setShowModal] = useState(false);
  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatList">
      <Link to={`/dashboard/chats/newID`} className="new-chat">
        New Chat
        <SquarePen />
      </Link>
      <span className="title">DASHBOARD</span>

      <Link to="/dashboard">Explore BankHelp AI</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending ? (
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
          data?.map((chat) => (
            <Link to={`/dashboard/chats/${chat._id}`} key={chat.id}>
              <History style={{ width: "16px", height: "16px" }} />
              {chat.title}
            </Link>
          ))
        )}
      </div>
      <hr />
      <div className="upgrade">
        <img src="/logo.png" alt="" />
        <div className="texts">
          <button className="upgrade-button" onClick={() => setShowModal(true)}>
            <Crown className="icon" />
            Upgrade Plan
          </button>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default ChatList;
