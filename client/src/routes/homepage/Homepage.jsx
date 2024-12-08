import { Link } from "react-router-dom";
import "./homepage.css";
import { TypeAnimation } from "react-type-animation";
import { useState } from "react";

const Homepage = () => {
  const [typingStatus, setTypingStatus] = useState("human1");
  return (
    <div className="homepage">
      <div className="left">
        <h2>BANKHELP AI</h2>
        <h3>The Commercial Banking Assistant Chatbot System</h3>
        <h5 style={{ color: "gray" }}>
          Intelligent banking assistant chatbot that leverages advanced NLP and
          semantic search capabilities to provide users with accurate
          information about banking services and inquiries.
        </h5>
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
                  : "/bankbot.png"
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
                "Bot: Oldest commercial bank in Nepal is Nepal Bank Limited.",
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
      {/* if we keep the banks logo */}
      {/* <div className="sponsor section">
        <div className="sponsor__container container grid">
          <img src="assets/img/sponsor1.png" alt="" className="sponsor__img" />
          <img src="assets/img/sponsor1.png" alt="" className="sponsor__img" />
          <img src="assets/img/sponsor1.png" alt="" className="sponsor__img" />
          <img src="assets/img/sponsor1.png" alt="" className="sponsor__img" />
          <img src="assets/img/sponsor1.png" alt="" className="sponsor__img" />
        </div>
      </div> */}
      <div className="terms">
        <img src="/logo.png" alt="" />
        <div className="links">
          <Link to="/" className="terms__link">
            Terms of Service
          </Link>
          <Link to="/" className="privacy__link">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
