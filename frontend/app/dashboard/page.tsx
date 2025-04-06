"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/ui/header";
import CareerGoal from "@/components/dashboard/career-goal";
import LearningDuration from "@/components/dashboard/learning-duration";
import WeeklyHours from "@/components/dashboard/weekly-hours";
import StepNavigation from "@/components/dashboard/step-navigation";
import AuthProtected from "@/components/auth-protected";
import { fetchUserGoal, saveResumeFile, updateUserGoal } from "@/utils/api"; // ✅ Use API utility

export default function Dashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Setup Form States
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [exp_level, setExpLevel] = useState("");
  const [responsibility, setResponsibility] = useState("");
  const [duration, setDuration] = useState("");
  const [durationUnit, setDurationUnit] = useState("weeks");
  const [weeklyHours, setWeeklyHours] = useState("");
  const [studyDays, setStudyDays] = useState({
    isMonday: false,
    isTuesday: false,
    isWednesday: false,
    isThursday: false,
    isFriday: false,
    isSaturday: false,
    isSunday: false,
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [notReadyChecked, setNotReadyChecked] = useState(false);

  // ✅ Check if User is Authenticated and Fetch Goal
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");

    if (!token || !userId) {
      router.push("/auth/signin");
      return;
    }
    setIsAuthenticated(true);

    // ✅ Fetch User Goal
    fetchUserGoal(Number(userId))
      .then((goalData) => {
        if (goalData) {
          setIsSetupComplete(true);

        }
      })
      .catch(() => console.error("Failed to fetch goal"))
      .finally(() => setIsLoading(false));
  }, [router]);

  // ✅ Loading State
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-white text-lg">Loading...</div>;
  }

  // ✅ Handle Step Navigation
  const handleNextStep = () => {
    if (
      (step === 1 && jobTitle.trim() === "" && industry.trim() === "" && exp_level.trim() === "") ||
      (step === 2 && duration.trim() === "") ||
      (step === 3 && (String(weeklyHours).trim() === "" || Number(weeklyHours) > 105 || !Object.values(studyDays).some(Boolean))) ||
      (step === 4 && !resumeFile && !notReadyChecked)
    ) {
      return;
    }
    setStep(step + 1);
  };

  const handlePrevStep = async () => {
    setStep(step - 1);
    setResumeFile(null);
    setResumeText("");
    // ✅ Ensure file input can be used again by resetting it safely
    const fileInput = document.getElementById("resumeUploadInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // ✅ Handle Final Setup Confirmation
  const handleConfirmSetup = async () => {
    const userId = localStorage.getItem("user_id");

    const goalData = {
      target_position: jobTitle,
      industry: industry,
      exp_level: exp_level,
      responsibility: (responsibility == "") ? null : responsibility,
      duration_weeks: durationUnit === "weeks" ? Number(duration) : durationUnit === "months" ? Number(duration) * 4 : Number(duration) * 52,
      weekly_hours: Number(weeklyHours),
      resume_text: notReadyChecked ? null : resumeText,
      ...studyDays, // Spread selected weekdays
    };
    console.log(goalData);

    try {
      await updateUserGoal(Number(userId), goalData);
      if (resumeFile) {
        await saveResumeFile(Number(userId), resumeFile);
      }
      setIsSetupComplete(true);
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  return (
    <AuthProtected>
      <Header />
      <div className="relative flex flex-col items-center justify-start min-h-screen text-white overflow-hidden w-full pt-5">
        {!isSetupComplete ? (
          <section className="text-center bg-gray-800/80 bg-opacity-80 p-10 rounded-xl shadow-xl max-w-3xl w-[90%] mt-10">
            {step === 1 && <CareerGoal jobTitle={jobTitle} setJobTitle={setJobTitle} industry={industry} setIndustry={setIndustry}
              exp_level={exp_level} setExpLevel={setExpLevel} responsibility={responsibility} setResponsibility={setResponsibility} />}
            {step === 2 && <LearningDuration duration={duration} setDuration={setDuration} durationUnit={durationUnit} setDurationUnit={setDurationUnit} />}
            {step === 3 && <WeeklyHours weeklyHours={weeklyHours} setWeeklyHours={setWeeklyHours} studyDays={studyDays} setStudyDays={setStudyDays} />}
            {/* ✅ ALWAYS Render StepNavigation for Buttons */}
            <StepNavigation
              step={step}
              handlePrevStep={handlePrevStep}
              handleNextStep={handleNextStep}
              handleConfirmSetup={handleConfirmSetup}
              jobTitle={jobTitle}
              industry={industry}
              exp_level={exp_level}
              duration={duration}
              durationUnit={durationUnit}
              weeklyHours={weeklyHours}
              studyDays={studyDays}
              resumeFile={resumeFile}
              setResumeFile={setResumeFile}
              resumeText={resumeText}
              setResumeText={setResumeText}
              notReadyChecked={notReadyChecked}
              setNotReadyChecked={setNotReadyChecked}
            />
          </section>
        ) : (
          <h1 className="text-4xl font-bold mt-20">Dashboard</h1>
        )}
      </div>
    </AuthProtected>
  );
}
