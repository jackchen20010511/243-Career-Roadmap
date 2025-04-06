"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchUserData, updateUserInfo, fetchSecurityQuestion, verifySecurityAnswer } from "@/utils/api"; // ✅ Import API utility to fetch user data
import Header from "@/components/ui/header";


export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (token && userId) {
      setIsLoggedIn(true);

      // ✅ Fetch user email if logged in
      fetchUserData(userId, token)
        .then((data) => {
          if (data && data.email) {
            setEmail(data.email);
          }
        })
        .catch((err) => console.error("Failed to fetch user data:", err));
    }
  }, []);

  // ✅ Step 1: Request Security Question
  const handleRequestQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const data = await fetchSecurityQuestion(email); // ✅ Use API function
      setSecurityQuestion(data.security_question);
      setStep(2);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // ✅ Step 2: Verify Security Answer
  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await verifySecurityAnswer(email, securityAnswer); // ✅ Use API function
      setStep(3);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  // ✅ Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setMessage("❌ Error: User ID not found. Please log in again.");
      return;
    }

    try {
      await updateUserInfo(Number(userId), { new_password: newPassword }); // ✅ Use unified function
      setMessage("✅ Password reset successful! Redirecting...");

      setTimeout(() => {
        router.push(isLoggedIn ? "/dashboard/profile" : "/auth/signin");
      }, 1000);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };




  return (
    <>
      <Header />
      <section>
        <div className="max-w-3xl mx-auto p-10 bg-gray-900/80 text-white rounded-xl shadow-xl mt-10 w-[30%]">
          <div className="pb-8 text-center">
            <h1 className="text-3xl font-semibold text-indigo-300 md:text-4xl">
              Reset your password
            </h1>
          </div>

          {/* ✅ Step 1: Enter Email */}
          {step === 1 && (
            <form className="mx-auto max-w-[400px]" onSubmit={handleRequestQuestion}>
              <div>
                <label className="block text-sm font-medium text-indigo-200" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="form-input w-full cursor-text bg-gray-800 text-white"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggedIn} // ✅ Disable input if logged in
                />
              </div>
              <div className="mt-6">
                <button type="submit" className="btn w-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500">
                  Next
                </button>
              </div>
            </form>
          )}

          {/* ✅ Step 2: Answer Security Question */}
          {step === 2 && (
            <form className="mx-auto max-w-[400px]" onSubmit={handleVerifyAnswer}>
              <div>
                <label className="block text-sm font-medium text-indigo-200">
                  {securityQuestion} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="form-input w-full cursor-text bg-gray-800 text-white"
                  placeholder="Your answer"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  required
                />
              </div>
              <div className="mt-6">
                <button type="submit" className="btn w-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500">
                  Verify Answer
                </button>
              </div>
            </form>
          )}

          {/* ✅ Step 3: Reset Password */}
          {step === 3 && (
            <form className="mx-auto max-w-[400px]" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-medium text-indigo-200">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="form-input w-full cursor-text bg-gray-800 text-white"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mt-6">
                <button type="submit" className="btn w-full bg-indigo-600 text-white cursor-pointer hover:bg-indigo-500">
                  Reset Password
                </button>
              </div>
            </form>
          )}

          {message && <p className="mt-4 text-center text-white-500">{message}</p>}
        </div>
      </section>
    </>
  );
}
