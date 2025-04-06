"use client";

import { useState } from "react";

export default function WeeklyHours({ weeklyHours, setWeeklyHours, studyDays, setStudyDays }) {
    const daysOfWeek = [
        { name: "Monday", key: "isMonday" },
        { name: "Tuesday", key: "isTuesday" },
        { name: "Wednesday", key: "isWednesday" },
        { name: "Thursday", key: "isThursday" },
        { name: "Friday", key: "isFriday" },
        { name: "Saturday", key: "isSaturday" },
        { name: "Sunday", key: "isSunday" },
    ];

    const handleDayToggle = (dayKey) => {
        setStudyDays((prevDays) => ({
            ...prevDays,
            [dayKey]: !prevDays[dayKey],
        }));
    };

    return (
        <>
            <h2 className="mb-8 animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--color-gray-200),var(--color-indigo-200),var(--color-gray-50),var(--color-indigo-300),var(--color-gray-200))] bg-[length:200%_auto] bg-clip-text pb-4 font-nacelle text-3xl font-semibold text-transparent md:text-4xl text-center">
                Weekly Study Time
            </h2>
            <div className="mb-10 flex items-center justify-center space-x-3 mb-5">
                <input
                    type="number"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(Math.min(105, isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)))}
                    className="mt-2 p-3 w-24 border border-gray-600 bg-gray-700 text-white rounded-lg text-lg flex items-center"
                    placeholder="0"
                />
                <span className="text-gray-300 text-lg flex items-center h-full translate-y-1">Hours per Week</span>
            </div>

            <span className="mb-6 justify-center text-gray-300 text-lg flex items-center h-full translate-y-1">Select Weekdays</span>
            <div className="grid grid-cols-3 gap-4 text-white mt-3">
                {daysOfWeek.map(({ name, key }) => (
                    <button
                        key={key}
                        onClick={() => handleDayToggle(key)}
                        className={`px-4 py-3 rounded-lg text-lg font-semibold transition-all duration-200 w-full cursor-pointer ${studyDays[key] ? "bg-indigo-500 text-white shadow-md" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </>
    );
}
