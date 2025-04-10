// --- stepTracker.tsx ---
"use client";

import { useEffect, useState } from "react";
import StepProgressBar from "@/components/stepTracker/stepProgressBar";
import StepResume from "@/components/stepTracker/stepResume";
import StepSkill from "@/components/stepTracker/stepSkill";
import StepSchedule from "@/components/stepTracker/stepSchedule";
import {
    fetchUserGoal,
    fetchLearnSkill,
    fetchScheduledTasks,
} from "@/utils/api";

export default function StepTracker({ userId }: { userId: number }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasResume, setHasResume] = useState(false);
    const [hasSkills, setHasSkills] = useState(false);
    const [hasTasks, setHasTasks] = useState(false);

    useEffect(() => {
        async function initializeStep() {
            try {
                const goal = await fetchUserGoal(userId);
                const resume = goal?.resume_text && goal.resume_text.trim() !== "";
                setHasResume(resume);

                const skills = await fetchLearnSkill(userId);
                const hasLearnedSkills = skills && skills.length > 0;
                setHasSkills(hasLearnedSkills);

                const tasks = await fetchScheduledTasks(userId);
                const hasScheduledTasks = tasks && tasks.length > 0;
                setHasTasks(hasScheduledTasks);

                if (!resume) return setStep(1);
                if (!hasLearnedSkills) return setStep(2);
                if (!hasScheduledTasks) return setStep(3);
                setStep(4);
            } catch (error) {
                console.error("StepTracker init failed:", error);
            } finally {
                setLoading(false);
            }
        }

        initializeStep();
    }, [userId]);

    const handleNext = () => setStep((prev) => Math.min(prev + 1, 4));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    if (loading) {
        return <div className="text-white text-center py-10">Checking setup progress...</div>;
    }

    if (step === 4) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto pb-28 space-y-8">
            <StepProgressBar currentStep={step - 1} />

            {step === 1 && <StepResume userId={userId} onChange={() => setHasResume(true)} />}
            {step === 2 && <StepSkill userId={userId} onChange={() => setHasSkills(true)} />}
            {step === 3 && <StepSchedule userId={userId} onChange={() => setHasTasks(true)} />}

            {/* Button group fixed to bottom right */}
            <div className="absolute bottom-20 right-3 flex gap-4">
                {step > 1 && (
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg cursor-pointer"
                    >
                        Back
                    </button>
                )}
                {step < 4 && (
                    <button
                        onClick={handleNext}
                        className={`px-4 py-2 rounded-lg font-semibold ${(step === 1 && !hasResume)
                                || (step === 2 && !hasSkills)
                                || (step === 3 && !hasTasks) ? "bg-gray-500 cursor-not-allowed" : "bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"}`}
                        disabled={
                            (step === 1 && !hasResume) ||
                            (step === 2 && !hasSkills) ||
                            (step === 3 && !hasTasks)
                        }
                    >
                        Next
                    </button>
                )}
            </div>
        </div >
    );
}
