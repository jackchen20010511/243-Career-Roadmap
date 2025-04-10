// --- StepSchedule.tsx ---
"use client";

import { useEffect, useState } from "react";
import { fetchScheduledTasks } from "@/utils/api";

interface ScheduledTask {
    id: number;
    day: string;
    start_time: string;
    end_time: string;
    resource_name: string;
    resource_url: string;
}

export default function StepSchedule({ userId, onChange }: { userId: number; onChange: () => void }) {
    const [tasks, setTasks] = useState<ScheduledTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchScheduledTasks(userId)
            .then((data) => setTasks(data))
            .catch((err) => console.error("Failed to fetch scheduled tasks:", err))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleGenerate = async () => {
        // setGenerating(true);
        // try {
        //     const newTasks = await generateScheduledTasks(userId);
        //     setTasks(newTasks);
        //     if (onChange) onChange();
        // } catch (error) {
        //     console.error("Error generating schedule:", error);
        // } finally {
        //     setGenerating(false);
        // }
    };

    if (loading) return <div className="text-center text-white">Loading scheduled tasks...</div>;

    return (
        <div className="space-y-6">
            {tasks.length === 0 ? (
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
                    <h2 className="text-xl text-white font-semibold">Generated Task Blocks</h2>
                    <ul className="space-y-4">
                        {tasks.map((task) => (
                            <li
                                key={task.id}
                                className="flex flex-col gap-1 bg-gray-800 px-4 py-3 rounded-lg text-white"
                            >
                                <span className="font-semibold">{task.day}</span>
                                <span>{task.start_time} - {task.end_time}</span>
                                <span>{task.resource_name}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
