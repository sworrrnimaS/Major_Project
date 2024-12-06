import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="homepage">
      <div className="left">
        <h1>BANKHELP AI</h1>
        <h2>The Commercial Banking Assistant of Nepal</h2>
        <h3>
          Intelligent banking assistant chatbot that leverages advanced natural
          language processing and semantic search capabilities to provide users
          with accurate and contextual information about banking services, such
          as account details, loan options, and bank-specific inquiries.
        </h3>
        <Link to="/dashboard">Get Started</Link>
      </div>
      <div className="right"></div>
    </div>
  );
};

export default Homepage;
