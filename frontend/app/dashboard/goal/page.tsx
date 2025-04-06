"use client";

import { useState } from "react";
import ResumePreview from "@/components/goal/resumePreview";
import Header from "@/components/ui/header";
import AuthProtected from "@/components/auth-protected";
import GoalDetails from "@/components/goal/goalDetails";
import { updateUserGoal } from "@/utils/api";

export default function Goal() {
    const handleSaveGoal = async (updatedGoal) => {
        const userId = localStorage.getItem("user_id");
        try {
            // await updateUserGoal(Number(userId), updatedGoal);
            // setGoalData(updatedGoal); // update local state
        } catch (error) {
            console.error("Failed to save goal:", error);
        }
    };

    return (

        <AuthProtected>
            <Header />
            <main className="flex flex-row w-full min-h-screen p-3 gap-6">
                {/* Left: Resume */}
                <div className="w-[50%]">
                    <ResumePreview />
                </div>

                {/* Right: Your career goal components go here */}
                <div className="w-[50%]">
                    <GoalDetails goal={{}} onSave={handleSaveGoal} />
                </div>
            </main>
        </AuthProtected>


    );
}