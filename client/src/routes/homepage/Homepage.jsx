import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");
  return (
    <div className="homepage">
      <div className="left">
        <h1>BANKHELP AI</h1>
        <h2>The Commercial Banking Assistant of Nepal</h2>
        <h3>
          Intelligent banking assistant chatbot that leverages advanced NLP and
          semantic search capabilities to provide users with accurate
          information about banking services and inquiries.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right">
        <div className="imgContainer">
          <div className="bgContainer">
            <div className="bg"></div>
          </div>
          <img src="/bot.png" alt="pig bot" />
          <div className="chat">
            <img
              src={
                typingStatus === "human1"
                  ? "/human1.jpeg"
                  : typingStatus === "human2"
                  ? "/human2.jpeg"
                  : "/bot.png"
              }
              alt=""
            />
            <TypeAnimation
              sequence={[
                // Same substring at the start will only be typed out once, initially
                "Human1: How many commercial banks in Nepal?",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: There are 20 commercial banks in Nepal.",
                2000,
                () => {
                  setTypingStatus("human2");
                },
                "Human2: What is oldest commercial bank in Nepal?",
                2000,
                () => {
                  setTypingStatus("bot");
                },
                "Bot: Oldest commercial bank in Nepal is Nepal Rastra Bank.",
                2000,
                () => {
                  setTypingStatus("human1");
                },
              ]}
              wrapper="span"
              repeat={Infinity}
              cursor={true}
              omitDeletionAnimation={true}
            />
          </div>
        </div>
      </div>
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/">Terms of Service</Link>
          <Link to="/">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
