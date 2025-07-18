"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const onLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      e.preventDefault();
      const response = await axios.post("/api/users/login", user);
      console.log("Login Success", response.data);
      toast.success("Login Success");
      router.push("/dashboard");
    } catch (error: any) {
      console.log("Login Failed");
      toast.error("Login Failed");
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 0) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return (
    <div className="light grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_#e5e7eb_1px,_transparent_1px),linear-gradient(to_bottom,_#e5e7eb_1px,_transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none z-0" />

      <div className="z-10 relative shadow-input w-full max-w-md bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Login to Jeev Veda
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          We missed you!
        </p>

        <div className="w-full max-w-4xl mx-auto">
          <form className="my-8 space-y-6" onSubmit={onLogin}>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                type="email"
                required
                className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                placeholder="••••••••"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                type="password"
                required
                className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
            </LabelInputContainer>

            <button
              className="cursor-pointer group/btn relative flex items-center justify-center h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
              type="submit"
              disabled={loading} // Optional: disable while loading
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Login &rarr;
                  <BottomGradient />
                </>
              )}
            </button>
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
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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
