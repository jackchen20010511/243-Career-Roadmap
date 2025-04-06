"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/ui/header"; // Keep the Header component
import { loginUser } from "@/utils/api"; // ✅ Use API function

export default function SignIn() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const data = await loginUser(formData.email, formData.password);
      console.log(data);
      // ✅ Clear Old User Data
      localStorage.clear();

      // ✅ Store New User Info
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("user_email", data.user_email);
      localStorage.setItem("user_name", data.user_name);
      console.log(data);
      setMessage("✅ Login successful! Redirecting...");
      router.push("/dashboard");
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };



  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-10 bg-gray-900/80 text-white rounded-xl shadow-xl mt-10 w-[30%]">
        {/* Section header */}
        <div className="pb-12 text-center">
          <h1 className="text-3xl font-semibold text-indigo-200 md:text-4xl">
            Welcome back
          </h1>
        </div>
        {/* Login Form */}
        <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-indigo-200" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input w-full"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-indigo-200" htmlFor="password">
                  Password
                </label>
                <Link className="text-sm text-gray-600 hover:underline" href="/auth/reset-password">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                className="form-input w-full"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="mt-6 space-y-5">
            <button
              type="submit"
              className="btn w-full bg-indigo-600 text-white transition-all duration-300 hover:bg-indigo-700 hover:shadow-lg cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-white-500">{message}</p>}

        <div className="mt-6 text-center text-sm text-indigo-200/65">
          Don't have an account?{" "}
          <Link className="font-medium text-indigo-500" href="/auth/signup">
            Sign Up
          </Link>
        </div>
      </div>

    </>
  );
}
