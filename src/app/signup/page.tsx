"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    gender: "",
    dateOfBirth: "",
    height: "",
    weight: "",
    familyHistory: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const onSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);
      console.log(user);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup Success", response.data);
      toast.success("Signup Success");
      router.push("/login");
    } catch (error: any) {
      console.log("Signup Failed");
      toast.error("Signup Failed");
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
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-slate-100 via-blue-50 to-blue-100 p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_#e5e7eb_1px,_transparent_1px),linear-gradient(to_bottom,_#e5e7eb_1px,_transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none z-0" />

      <div className="z-10 relative shadow-input w-full max-w-md bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Welcome to Jeev Veda
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Start caring for your health
        </p>

        <div className="w-full max-w-4xl mx-auto">
          <form className="my-8 space-y-6" onSubmit={onSignup}>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                type="text"
                onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                required
                className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                onChange={(e) => setUser({ ...user, email: e.target.value })}
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
                type="password"
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                required
                className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
              />
            </LabelInputContainer>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  name="gender"
                  onChange={(e) => setUser({ ...user, gender: e.target.value })}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-black dark:text-white dark:border-neutral-700"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  onChange={(e) =>
                    setUser({ ...user, dateOfBirth: e.target.value })
                  }
                  required
                  className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </LabelInputContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabelInputContainer>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  onChange={(e) => setUser({ ...user, height: e.target.value })}
                  placeholder="170"
                  required
                  className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  onChange={(e) => setUser({ ...user, weight: e.target.value })}
                  placeholder="65"
                  required
                  className="placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                />
              </LabelInputContainer>
            </div>

            <LabelInputContainer className="mb-4">
              <Label htmlFor="familyHistory">
                Any Family History of Cancer?
              </Label>
              <div className="flex items-center space-x-4 mt-1">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="familyHistory"
                    value="true"
                    onChange={(e) =>
                      setUser({ ...user, familyHistory: e.target.value })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Yes
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="familyHistory"
                    value="false"
                    onChange={(e) =>
                      setUser({ ...user, familyHistory: e.target.value })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    No
                  </span>
                </label>
              </div>
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
                  Sign up &rarr;
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
