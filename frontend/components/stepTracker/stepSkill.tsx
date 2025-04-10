// --- StepSkill.tsx ---
"use client";

import { useEffect, useState } from "react";
import { fetchLearnSkill, updateLearnSkill } from "@/utils/api";
import FlowButton from "../ui/flowButton";

interface LearnSkill {
    skill_name: string;
    focus_score: number;
    confidence_score: number;
}

export default function StepSkill({ userId, onChange }: { userId: number; onChange: () => void }) {
    const [skills, setSkills] = useState<LearnSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [originalSkills, setOriginalSkills] = useState<LearnSkill[]>([]);

    useEffect(() => {
        fetchLearnSkill(userId)
            .then((data) => {
                const cloned = data.map((skill) => ({ ...skill }));
                setSkills(cloned);
                setOriginalSkills(cloned); // clean backup
            })
            .catch((err) => console.error("Failed to fetch skills:", err))
            .finally(() => setLoading(false));
    }, [userId]);
    const handleGenerate = async () => {
        // setGenerating(true);
        // try {
        //     const newSkills = await generateLearnSkill(userId);
        //     await updateLearnSkill(userId, newSkills);
        //     setSkills(newSkills);
        //     if (onChange) onChange();
        // } catch (error) {
        //     console.error("Error generating skills:", error);
        // } finally {
        //     setGenerating(false);
        // }
    };

    const handleFocusChange = (index: number, value: number) => {
        setSkills((prev) =>
            prev.map((skill, i) =>
                i === index ? { ...skill, focus_score: value } : skill
            )
        );
    };

    const handleConfidenceChange = (index: number, value: number) => {
        setSkills((prev) =>
            prev.map((skill, i) =>
                i === index ? { ...skill, confidence_score: value } : skill
            )
        );
    };

    const handleCancel = () => {
        const reset = originalSkills.map((skill) => ({ ...skill }));
        setSkills(reset);
        setIsEditing(false);
    };

    const normalizeFocusScores = (skills: LearnSkill[]): LearnSkill[] => {
        const total = skills.reduce((sum, skill) => sum + skill.focus_score, 0);
        if (total === 0) return skills; // avoid division by zero

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
            if (onChange) onChange();
        } catch (error) {
            console.error("Error saving skills:", error);
        }
    };

    const handleDelete = (index: number) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
    };

    if (loading) return <div className="text-center text-white">Loading skills...</div>;

    return (
        <div className="space-y-6">
            {skills.length === 0 ? (

                <div className="mt-10 flex flex-col items-center justify-center w-[95%] h-[65vh] aspect-[595/600] mx-auto border-2 border-dashed border-gray-400 rounded-lg text-indigo-200 text-lg p-6 space-y-4">
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"
                    >
                        Analyze Skills
                    </button>
                </div>

            ) : (
                <>
                    <div className="flex items-start justify-between">
                        <h2 className="text-xl text-white font-semibold">Edit Suggested Skills</h2>
                        <div className="flex gap-3">
                            {isEditing && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-lg text-sm cursor-pointer"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm cursor-pointer"
                            >
                                {isEditing ? "Save" : "Edit"}
                            </button>
                        </div>
                    </div>                    <ul className="space-y-4">
                        {skills.map((skill, index) => (
                            <li key={index} className="flex items-center gap-3 bg-gray-800 px-4 py-3 rounded-lg">
                                <span className="flex-1 text-white">{skill.skill_name}</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={isNaN(skill.focus_score) ? "" : parseFloat(skill.focus_score.toFixed(2))}
                                    onChange={(e) => handleFocusChange(index, parseFloat(e.target.value))}
                                    className="w-24 rounded border-gray-500 bg-gray-700 text-white"
                                    readOnly={!isEditing}
                                />

                                <input
                                    type="number"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={isNaN(skill.confidence_score) ? "" : parseFloat(skill.confidence_score.toFixed(2))}
                                    onChange={(e) => handleConfidenceChange(index, parseFloat(e.target.value))}
                                    className="w-24 rounded border-gray-500 bg-gray-700 text-white"
                                    readOnly={!isEditing}
                                />

                                {isEditing && (
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        ✕
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
