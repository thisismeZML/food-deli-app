import { ForgetPasswordForm } from "../components/forgetpassword";
const ForgetPasswordPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground">
            Enter your email to receive a reset link
          </p>
        </div>
        <ForgetPasswordForm />
      </div>
    </div>
  );
};

export default ForgetPasswordPage;
