/* eslint-disable no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DNA } from "react-loader-spinner";
import "./dashboardLayout.css";
import ChatList from "../../components/chatList/ChatList";
import { AlignJustify } from "lucide-react";

// Yo layout chai chat ko dashboard sanda related ho, authenticated user le matra chat ko dashboard access garna sakos bhanera banako yo layout

const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        toggleRef.current &&
        !menuRef.current.contains(event.target) &&
        !toggleRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // const { userId, isLoaded } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (isLoaded && !userId) {
  //     navigate("/sign-in");
  //   }
  // }, [isLoaded, userId, navigate]);

  // if (!isLoaded)
  // return (
  //   <div
  //     style={{
  //       display: "flex",
  //       justifyContent: "center",
  //       alignItems: "center",
  //       height: "80vh",
  //     }}
  //   >
  //     <DNA
  //       visible={true}
  //       height="120"
  //       width="120"
  //       ariaLabel="dna-loading"
  //       wrapperStyle={{}}
  //       wrapperClass="dna-wrapper"
  //     />
  //   </div>
  // );

  return (
    <div className="dashboardLayout">
      <button
        ref={toggleRef}
        className="mobile-menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {/* ☰ */}
        <AlignJustify />
      </button>

      <div ref={menuRef} className={`menu ${menuOpen ? "active" : ""}`}>
        <ChatList />
      </div>

      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
