"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/ui/header"; // Keep the Header component
import { registerUser } from "@/utils/api"; // ✅ Use API function


// TypeScript interface for form data
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  security_question: string;
  security_answer: string;
}

// Security Questions List (Dropdown)
const securityQuestions = [
  "What was the name of your first pet?",
  "What is the name of the city where you were born?",
  "What is your favorite book?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is your favorite food?",
  "What was the name of your first school?",
  "Who was your childhood best friend?",
];

export default function SignUp() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    security_question: "",
    security_answer: "",
  });

  const [message, setMessage] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await registerUser(formData); // ✅ Use API function

      setMessage("✅ Account created successfully! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/auth/signin"; // ✅ Redirect to login page
      }, 2000);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };


  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto p-10 bg-gray-900/80 text-white rounded-xl shadow-xl mt-10 w-[30%]">

        <div className="pb-12 text-center">
          <h1 className="text-3xl font-semibold text-indigo-200 md:text-4xl">
            Create an account
          </h1>
        </div>

        {/* Signup Form */}
        <form className="mx-auto max-w-[400px]" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-indigo-200" htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                className="form-input w-full cursor-text"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                className="form-input w-full cursor-text"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200" htmlFor="password">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                className="form-input w-full cursor-text"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Security Question Dropdown */}
            <div>
              <label className="block text-sm font-medium text-indigo-200" htmlFor="security_question">
                Security Question <span className="text-red-500">*</span>
              </label>
              <select
                id="security_question"
                className="form-input w-full cursor-pointer"
                value={formData.security_question}
                onChange={handleChange}
                required
              >
                <option value="">Select a security question</option>
                {securityQuestions.map((question, index) => (
                  <option key={index} value={question}>{question}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200" htmlFor="security_answer">
                Security Answer <span className="text-red-500">*</span>
              </label>
              <input
                id="security_answer"
                type="text"
                className="form-input w-full cursor-text"
                placeholder="Your answer"
                value={formData.security_answer}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Submit Button with Hover Cursor Effect */}
          <div className="mt-6 space-y-5">
            <button
              type="submit"
              className="btn w-full bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
            >
              Register
            </button>
          </div>
        </form>

        {message && <p className="mt-4 text-center text-white-500">{message}</p>}

        <div className="mt-6 text-center text-sm text-indigo-200">
          Already have an account?{" "}
          <Link className="font-medium text-indigo-500" href="/auth/signin">
            Sign in
          </Link>
        </div>
      </div>


    </>
  );
}
