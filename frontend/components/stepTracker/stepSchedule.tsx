// --- StepSchedule.tsx ---
"use client";

import { useEffect, useState } from "react";
import { fetchScheduledTasks, generateScheduledTasks } from "@/utils/api";

export interface ScheduledTask {
    id: number;
    user_id: number;
    module: number;
    skill: string;
    date: string;   // string (ISO format, e.g. "2025-05-22")
    resource_name: string;
    resource_url: string;
    thumbnail_url?: string;   // optional if not always present
    start: string;       // "HH:MM" string from API
    end: string;         // "HH:MM" string from API
    status: string;
}

export default function StepSchedule({
    userId,
    onChange,
    tasks,
    setTasks
}: {
    userId: number;
    onChange: () => void;
    tasks: ScheduledTask[];
    setTasks: (tasks: ScheduledTask[]) => void;
}) {

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [generatedModules, setGeneratedModules] = useState([]);
    const [previewReady, setPreviewReady] = useState(true);

    useEffect(() => {
        fetchScheduledTasks(userId)
            .then((data) => setTasks(data))
            .catch((err) => console.error("Failed to fetch scheduled tasks:", err))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await generateScheduledTasks(userId);
            setTasks(response.tasks || []);
            setGeneratedModules(response.modules || []); // if modules returned
            setPreviewReady(true);
            if (onChange) onChange(); // enables step change in StepTracker
        } catch (err) {
            console.error("Error generating schedule:", err);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="-mt-70 flex items-center justify-center min-h-screen text-white text-lg">Loading scheduled tasks...</div>;

    console.log("Previewing tasks:", tasks.slice(0, 5));


    return (
        <div className="space-y-6">
            {generating ? (
                <div className="mt-10 flex flex-col items-center justify-center w-full h-[65vh] space-y-4 text-indigo-200">
                    <svg className="animate-spin h-8 w-8 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-lg">Generating your personalized schedule...</p>
                    <p className="text-sm text-indigo-300">This may take 20-30 seconds. Hang tight! ⏳</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="mt-10 flex flex-col items-center justify-center w-[95%] h-[65vh] aspect-[595/600] mx-auto border-2 border-dashed border-gray-400 rounded-lg text-indigo-200 text-lg p-6 space-y-4">
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer"
                    >
                        Generate Schedule
                    </button>
                </div>
            ) : (
                <>
                    {generatedModules.length > 0 && (
                        <div className="mt-6 p-4 rounded-lg bg-indigo-200 text-gray-900 shadow">
                            <h3 className="text-xl font-bold mb-2">📘 Modules Included</h3>
                            <ul className="list-disc ml-6 space-y-1 text-sm">
                                {generatedModules.map((mod, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">Module {mod.module}:</span> {mod.skills.join(", ")} {" "}
                                        <span className="text-gray-600">(Total: {mod.duration.reduce((a, b) => a + b, 0)} hrs)</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {previewReady && (
                        <div className="mt-6 p-4 rounded-lg bg-indigo-100 text-gray-800 shadow">

                            <h3 className="text-xl font-bold mb-2">📅 Your Learning Plan Preview</h3>
                            <ul className="list-disc ml-6 space-y-1 text-sm">
                                {tasks.slice(0, 5).map((task, i) => (
                                    <li key={i}>
                                        {task.date} | {task.start}–{task.end} → {task.resource_name}
                                    </li>
                                ))}
                            </ul>
                            <p className="text-sm mt-2 text-gray-600">...and more scheduled tasks</p>
                        </div>
                    )}
                </>

            )}
        </div>
    );
}
