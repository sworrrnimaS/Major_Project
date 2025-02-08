import { SignUp } from "@clerk/clerk-react";
import "./signUpPage.css";

const SignUpPage = () => {
  return (
    <div className="signUpPage">
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/" />
    </div>
  );
};

export default SignUpPage;
