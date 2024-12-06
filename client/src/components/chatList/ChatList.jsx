import { Link } from "react-router-dom";
import { Crown, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import "./chatList.css";
import { DNA } from "react-loader-spinner";

const ChatList = () => {
  const { isPending, error, data } = useQuery({
    queryKey: ["userChats"],
    queryFn: () =>
      fetch(`${import.meta.env.VITE_API_URL}/api/chats`, {
        credentials: "include",
      }).then((res) => res.json()),
  });

  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard"></Link>
      <Link to="/">Explore BankHelp AI</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        {isPending ? (
          <DNA
            visible={true}
            height="40"
            width="40"
            ariaLabel="dna-loading"
            wrapperStyle={{}}
            wrapperClass="dna-wrapper"
          />
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
          <button className="upgradeButton">
            <Crown className="icon" />
            Upgrade Plan
          </button>
          <span>Get unlimited access to all features</span>
        </div>
      </div>
    </div>
  );
};

export default ChatList;
