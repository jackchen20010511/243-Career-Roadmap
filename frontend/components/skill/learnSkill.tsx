// --- learnSkill.tsx ---
"use client";

import { useEffect, useState } from "react";
import { fetchLearnSkill, updateLearnSkill } from "@/utils/api";
import { skillCardColors } from "@/public/colors/skillCardColors";

interface LearnSkill {
    skill_name: string;
    focus_score: number;
    confidence_score: number;
}

export default function LearnSkill({ userId, step }: { userId: number; step: number }) {
    const [skills, setSkills] = useState<LearnSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalSkills, setOriginalSkills] = useState<LearnSkill[]>([]);

    useEffect(() => {
        if (step === 3) {
            fetchLearnSkill(userId)
                .then((data) => {
                    const cloned = data.map((skill) => ({ ...skill }));
                    setSkills(cloned);
                    setOriginalSkills(cloned);
                })
                .catch((err) => console.error("Failed to fetch skills:", err))
                .finally(() => setLoading(false));
        }
    }, [userId, step]);

    const handleGenerate = async () => {
        // future logic for generation
    };

    const handleFocusChange = (index: number, value: number) => {
        setSkills((prev) =>
            prev.map((skill, i) => (i === index ? { ...skill, focus_score: value } : skill))
        );
    };

    const handleConfidenceChange = (index: number, value: number) => {
        setSkills((prev) =>
            prev.map((skill, i) => (i === index ? { ...skill, confidence_score: value } : skill))
        );
    };

    const handleCancel = () => {
        const reset = originalSkills.map((skill) => ({ ...skill }));
        setSkills(reset);
        setIsEditing(false);
    };

    const normalizeFocusScores = (skills: LearnSkill[]): LearnSkill[] => {
        const total = skills.reduce((sum, skill) => sum + skill.focus_score, 0);
        if (total === 0) return skills;

        return skills.map((skill) => ({
            ...skill,
            focus_score: parseFloat((skill.focus_score / total).toFixed(4)),
        }));
    };

    const handleSave = async () => {
        try {
            const normalized = normalizeFocusScores(skills);
            await updateLearnSkill(userId, normalized);
            setSkills(normalized.map((s) => ({ ...s })));
            setOriginalSkills(normalized.map((s) => ({ ...s })));
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving skills:", error);
        }
    };

    const handleDelete = (index: number) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
    };

    if (loading) return <div className="text-center text-white">Loading skills...</div>;
    if (step < 3) return null;

    return (
        <div className="flex justify-center w-full">
            <div className="space-y-6 max-w-[1600px] px-6">
                <div className="flex items-start justify-between">
                    <h2 className="mb-2 text-3xl font-bold text-indigo-200">Learning Skills</h2>
                    <div className="flex gap-3 pr-3">
                        {isEditing && (
                            <button
                                onClick={handleCancel}
                                className="cursor-pointer px-4 py-2 rounded-lg text-white font-semibold bg-gray-500 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                            className="cursor-pointer px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-semibold"
                        >
                            {isEditing ? "Save" : "Edit"}
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="w-[240px] h-[270px] rounded-xl overflow-hidden flex flex-col
                                    transform transition duration-300 ease-in-out
                                    shadow-md hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]
                                    hover:scale-[1.03]
                                    hover:ring-2 hover:ring-indigo-400 hover:ring-opacity-50 cursor-pointer"
                        >
                            {/* Fix: Ensure the image covers and overlaps cleanly */}
                            <div
                                className="h-[230px] relative bg-cover bg-center overflow-hidden"
                                style={{
                                    backgroundImage: `url(/images/skills/${index % 20 + 1}.jpg)`,
                                }}
                            >
                                {/* Fix: Remove subtle padding from the top */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/90 via-black/20 to-transparent flex items-start justify-center pt-4 px-2">
                                    <h3 className="mt-2 text-xl font-bold text-indigo-100 capitalize text-center drop-shadow w-[80%]">
                                        {skill.skill_name}
                                    </h3>
                                </div>

                                {/* Delete icon */}
                                {isEditing && (
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="absolute top-1 right-2.5 text-red-400 text-base font-bold hover:text-white z-10 cursor-pointer"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Info section */}
                            <div className="flex-1 px-4 py-2 flex flex-col justify-between bg-indigo-300">
                                {/* Label row */}
                                <div className="mb-1 flex pl-[21px] justify-start gap-14 text-sm text-gray-700 font-bold">
                                    <span>Focus</span>
                                    <span>Confidence</span>
                                </div>

                                {/* Input row */}
                                <div className="mb-1 flex pl-[18px] justify-start gap-5">
                                    <input
                                        type="number"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={Number(skill.focus_score)}
                                        onChange={(e) => handleFocusChange(index, parseFloat(e.target.value))}
                                        readOnly={!isEditing}
                                        className="w-[40%] px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                    <input
                                        type="number"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={Number(skill.confidence_score)}
                                        onChange={(e) => handleConfidenceChange(index, parseFloat(e.target.value))}
                                        readOnly={!isEditing}
                                        className="w-[40%] px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>

    );
}
