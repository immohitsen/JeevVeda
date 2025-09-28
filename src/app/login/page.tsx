"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { StartButton } from "@/components/ui/start-button";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  }); // Add field-specific errors

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      setFieldErrors({ email: "", password: "" }); // Clear field errors
      
      const response = await axios.post("/api/users/login", user);
      console.log("Login Success", response.data);
      toast.success("Login successful! Redirecting...");
      router.push("/dashboard");
      
    } catch (error: unknown) {
      console.log("Login Failed", error);
      
      // Handle different types of errors
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data?: { error?: string }; status: number } };
        // Server responded with error status
        const errorMessage = axiosError.response.data?.error || "Login failed";
        const statusCode = axiosError.response.status;
        
        // Handle specific error cases
        if (statusCode === 400) {
          if (errorMessage === "User does not exist") {
            setFieldErrors(prev => ({ ...prev, email: "No account found with this email" }));
            setError("Please check your email address or sign up for a new account.");
          } else if (errorMessage === "Invalid credentials") {
            setFieldErrors(prev => ({ ...prev, password: "Incorrect password" }));
            setError("Password is incorrect. Please try again.");
          } else {
            setError(errorMessage);
          }
        } else if (statusCode === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(errorMessage);
        }
        
        toast.error(errorMessage);
      } else if (error && typeof error === 'object' && 'request' in error) {
        // Network error
        setError("Network error. Please check your internet connection.");
        toast.error("Connection failed");
      } else {
        // Other error
        setError("An unexpected error occurred. Please try again.");
        toast.error("Login failed");
      }
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  // Clear field errors when user starts typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, email: e.target.value });
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: "" }));
    }
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, password: e.target.value });
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: "" }));
    }
    if (error) setError("");
  };

  return (
    <div className="light grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_#e5e7eb_1px,_transparent_1px),linear-gradient(to_bottom,_#e5e7eb_1px,_transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none z-0" />

      <div className="z-10 relative shadow-input w-full max-w-md bg-white p-4 md:p-8 dark:bg-black shadow-lg">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Login to Jeev Veda
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          We missed you!
        </p>

        {/* Display general error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="w-full max-w-4xl mx-auto">
          <form className="my-8 space-y-6" onSubmit={onLogin}>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleEmailChange}
                type="email"
                required
                className={cn(
                  "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
                  fieldErrors.email && "border-red-500 focus:border-red-500"
                )}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
              )}
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                onChange={handlePasswordChange}
                type="password"
                required
                className={cn(
                  "placeholder:text-neutral-500 dark:placeholder:text-neutral-400",
                  fieldErrors.password && "border-red-500 focus:border-red-500"
                )}
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
              )}
            </LabelInputContainer>

            <StartButton
              className="cursor-pointer group/btn relative flex items-center justify-center h-10 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={buttonDisabled || loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Login &rarr;
                  <BottomGradient />
                </>
              )}
            </StartButton>
          </form>
        </div>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
