import { SignIn } from "@clerk/clerk-react";
import "./signInPage.css";

const SignInPage = () => {
  return (
    <div className="signInPage">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;
