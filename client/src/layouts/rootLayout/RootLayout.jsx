import { Link, Outlet } from "react-router-dom";

// import { SignedIn, UserButton } from "@clerk/clerk-react";
import "./rootLayout.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Basically yo chai sabse baira ko layout ho, yaha logo, aniif logged in profile button and aru child routes render huncha

// Import your Publishable Key

const queryClient = new QueryClient();

const RootLayout = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="rootLayout">
        <header>
          <Link to="/" className="logo">
            <img src="/logo.png" alt="" />
            <span>BankHelp AI</span>
          </Link>
          <div className="user">
            {/* <SignedIn>
              <UserButton />
            </SignedIn> */}
          </div>
        </header>
        <main>
          <Outlet />
        </main>
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
    </QueryClientProvider>
  );
};

export default RootLayout;
