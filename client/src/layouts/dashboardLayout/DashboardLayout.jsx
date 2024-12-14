/* eslint-disable no-unused-vars */
import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { DNA } from "react-loader-spinner";
import "./dashboardLayout.css";
import ChatList from "../../components/chatList/chatList";

// Yo layout chai chat ko dashboard sanda related ho, authenticated user le matra chat ko dashboard access garna sakos bhanera banako yo layout

const DashboardLayout = () => {
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
      <div className="menu">
        <ChatList />
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
