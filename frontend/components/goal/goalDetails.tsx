"use client";

import { useEffect, useState } from "react";
import { fetchUserGoal, updateUserGoal } from "@/utils/api";

const weekdays = [
    "isMonday",
    "isTuesday",
    "isWednesday",
    "isThursday",
    "isFriday",
    "isSaturday",
    "isSunday",
];

const weekdayLabels = {
    isMonday: "M",
    isTuesday: "T",
    isWednesday: "W",
    isThursday: "T",
    isFriday: "F",
    isSaturday: "S",
    isSunday: "S",
};

export default function GoalDetails() {
    const [goal, setGoal] = useState(null);
    const [editedGoal, setEditedGoal] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        if (userId) {
            fetchUserGoal(Number(userId))
                .then((data) => {
                    setGoal(data);
                    setEditedGoal(data);
                })
                .catch((err) => console.error("Failed to fetch goal:", err))
                .finally(() => setLoading(false));
            console.log("start", editedGoal)
        }
    }, []);

    const handleChange = (field: string, value: any) => {
        setEditedGoal((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const toggleDay = (day: string) => {
        setEditedGoal((prev) => ({
            ...prev,
            [day]: !prev[day],
        }));
    };

    const handleSave = async () => {
        const userId = localStorage.getItem("user_id");
        try {
            await updateUserGoal(Number(userId), editedGoal);
            setGoal(editedGoal);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save goal:", error);
        }
    };

    const handleCancel = () => {
        setEditedGoal(goal);
        setIsEditing(false);
    };

    if (loading || !editedGoal) return <div className="flex items-center justify-center min-h-screen text-white text-lg">Loading...</div>;
    if (!goal) return <div className="text-red-400 p-10">No goal data found.</div>;

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="mb-5 pt-2 px-3">
                {/* Flex row: title on left, buttons + message on right */}
                <div className="flex items-start justify-between w-full">
                    <h2 className="mb-8 text-3xl font-bold text-indigo-200">Your Goal</h2>
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
                </div>

                {/* Job Title + Industry */}
                <div className="mb-5 flex gap-4">
                    <div className="w-1/2">
                        <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Career Position</p>
                        <input
                            type="text"
                            value={editedGoal.target_position}
                            onChange={(e) => handleChange("target_position", e.target.value)}
                            readOnly={!isEditing}
                            className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 rounded-lg text-lg text-white"
                        />
                    </div>
                    <div className="w-1/2">
                        <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Industry</p>
                        <input
                            type="text"
                            value={editedGoal.industry}
                            onChange={(e) => handleChange("industry", e.target.value)}
                            readOnly={!isEditing}
                            className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 rounded-lg text-lg text-white"
                        />
                    </div>
                </div>

                {/* Exp Level + Weekly Hours + Duration */}
                <div className="mb-5 flex gap-4">
                    <div className="w-1/3">
                        <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Experience Level</p>
                        <select
                            value={editedGoal.exp_level}
                            onChange={(e) => handleChange("exp_level", e.target.value)}
                            disabled={!isEditing}
                            className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 rounded-lg text-lg text-white cursor-pointer"
                        >
                            <option value="" disabled hidden>Choose Experience Level</option>
                            <option value="Internship level">Internship level</option>
                            <option value="Entry level">Entry level</option>
                            <option value="Junior level">Junior level</option>
                            <option value="Junior-Mid level">Junior-Mid level</option>
                            <option value="Mid level">Mid level</option>
                            <option value="Mid-Senior level">Mid-Senior level</option>
                            <option value="Senior level">Senior level</option>
                            <option value="Executive level">Executive level</option>
                            <option value="Professional level">Professional level</option>
                            <option value="Other levels">Other levels</option>
                        </select>
                    </div>

                    <div className="w-1/3">
                        <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Weekly Hours</p>
                        <input
                            type="number"
                            value={editedGoal.weekly_hours}
                            onChange={(e) => handleChange("weekly_hours", Number(e.target.value))}
                            readOnly={!isEditing}
                            className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 rounded-lg text-lg text-white"
                        />
                    </div>

                    <div className="w-1/3">
                        <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Duration Weeks</p>
                        <input
                            type="number"
                            value={editedGoal.duration_weeks}
                            onChange={(e) => handleChange("duration_weeks", Number(e.target.value))}
                            readOnly={!isEditing}
                            className="mb-6 mt-2 p-4 w-full border border-gray-600 bg-gray-700 rounded-lg text-lg text-white"
                        />
                    </div>
                </div>

                {/* Weekdays */}
                <p className="mb-8 text-center px-3 mb-1 block text-lg text-indigo-200">Study Weekdays</p>
                <div className="mb-5 flex justify-center gap-2 mb-6">
                    {weekdays.map((day) => (
                        <button
                            key={day}
                            onClick={() => isEditing && toggleDay(day)}
                            className={`px-6 py-4 rounded-full text-lg font-medium border transition cursor-pointer ${editedGoal[day]
                                ? "bg-indigo-500 text-white border-indigo-400"
                                : "bg-gray-700 text-gray-300 border-gray-600"
                                } ${isEditing ? "hover:bg-indigo-400 hover:text-white" : "cursor-default"}`}
                        >
                            {weekdayLabels[day]}
                        </button>
                    ))}
                </div>

                {/* Responsibility */}
                <p className="text-left px-3 mb-1 block text-lg text-indigo-200">Responsibilities</p>
                <textarea
                    value={editedGoal.responsibility}
                    onChange={(e) => handleChange("responsibility", e.target.value)}
                    readOnly={!isEditing}
                    className="mt-2 p-4 w-full h-30 border border-gray-600 bg-gray-700 text-white rounded-lg text-lg resize-none"
                    placeholder="Empty"
                />
            </div>
        </div>
    );
}
