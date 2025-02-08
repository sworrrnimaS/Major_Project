import { Link, Outlet } from "react-router-dom";

// import { SignedIn, UserButton } from "@clerk/clerk-react";
import "./rootLayout.css";
import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
// import { SignedOut, SignedIn, UserButton, useAuth } from "@clerk/clerk-react";
import { SignedOut, SignedIn, UserButton } from "@clerk/clerk-react";

// Basically yo chai sabse baira ko layout ho, yaha logo, aniif logged in profile button and aru child routes render huncha

// Import your Publishable Key

const RootLayout = () => {
  // const { getToken } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  //for token checking purposes
  // useEffect(() => {
  //   getToken().then((token) => console.log(token));
  // });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark-mode");
    }
    localStorage.setItem("theme", theme);
  }, [theme]); // Runs whenever `theme` changes

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className="rootLayout">
      <header>
        <Link to="/" className="logo">
          <img
            src="/bankhelps.png"
            alt=""
            style={{ width: "190px", height: "55px" }}
          />

          {/* <img src="/logo.png" alt="" /> */}
          {/* <span>BankHelp AI</span> */}
        </Link>
        <div className="user">
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{ marginRight: "40px" }}
          >
            {theme === "dark" ? (
              <SunMedium style={{ color: "white" }} />
            ) : (
              <Moon />
            )}
          </button>

          <SignedOut>
            <Link to="/sign-in" className="sign-button">
              Login
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
