import { Link } from "react-router-dom";
import { Crown } from "lucide-react";

const ChatList = () => {
  return (
    <div className="chatList">
      <span className="title">DASHBOARD</span>
      <Link to="/dashboard"></Link>
      <Link to="/">Explore BankHelp AI</Link>
      <hr />
      <span className="title">RECENT CHATS</span>
      <div className="list">
        <Link to="/">Recent Chats</Link>
        <Link to="/">Recent Chats</Link>
        <Link to="/">Recent Chats</Link>
        <Link to="/">Recent Chats</Link>
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
