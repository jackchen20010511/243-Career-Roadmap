"use client";

import React, { useEffect, useState } from "react";
import { ScheduledTask } from "@/components/stepTracker/stepSchedule";

export default function ScheduleGrid({
    selectedDate,
    tasks
}: {
    selectedDate: Date;
    tasks: ScheduledTask[];
}) {
    const [timeOffset, setTimeOffset] = useState<number | null>(null);
    const hourHeight = 60; // px per hour

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();

            if (hour >= 8 && hour < 21) {
                const minutesSinceStart = (hour - 8) * 60 + minute;
                const offset = (minutesSinceStart / 60) * hourHeight;
                setTimeOffset(offset);
            } else {
                setTimeOffset(null);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    function getTodayColumnIndex() {
        const day = new Date().getDay();
        return day === 0 ? 6 : day - 1;
    }

    function isTodayInSameWeek(selectedDate: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        const selectedDay = selected.getDay();
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - (selectedDay === 0 ? 6 : selectedDay - 1));

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return today >= weekStart && today <= weekEnd;
    }

    function getStartOfWeek(date: Date) {
        const day = date.getDay();
        const offset = day === 0 ? -6 : 1 - day;
        const start = new Date(date);
        start.setDate(date.getDate() + offset);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    function getEndOfWeek(start: Date) {
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        end.setHours(0, 0, 0, 0);
        return end;
    }

    function parseLocalDateOnly(dateStr: string): Date {
        const [year, month, day] = dateStr.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    const filterTasksForWeek = (
        tasks: ScheduledTask[] = [],    // default to empty array
        selectedDate: Date
    ): ScheduledTask[] => {
        const weekStart = getStartOfWeek(selectedDate);
        const weekEnd = getEndOfWeek(weekStart);

        return tasks
            .filter((task) => {
                const taskDate = parseLocalDateOnly(task.date);
                return taskDate >= weekStart && taskDate < weekEnd;
            });
    };

    const weekTasks = filterTasksForWeek(tasks ?? [], selectedDate);

    return (
        <div className="flex w-full">
            {/* Time Labels */}
            <div className="flex flex-col items-end pr-2 w-[60px] text-sm text-gray-300 font-medium">
                {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="h-[60px] flex items-start -mt-[0.3px] pt-[39px] pr-2">{8 + i}:00</div>
                ))}
            </div>

            {/* Grid Columns + Tasks */}
            <div className="flex-1">

                {/* Headers */}
                <div className="grid grid-cols-7 text-center text-indigo-200 text-lg font-semibold mb-1">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                        <div key={i} className="py-2">{day}</div>
                    ))}
                </div>

                {/* Grid + Overlay */}
                <div className="relative h-[780px]">
                    {/* Grid Base */}
                    <div className="absolute inset-0 grid grid-cols-7 z-10">
                        {Array.from({ length: 7 }).map((_, dayIdx) => (
                            <div key={dayIdx} className="flex flex-col">
                                {Array.from({ length: 13 }).map((_, hourIdx) => (
                                    <div
                                        key={hourIdx}
                                        className="h-[60px] border border-gray-400 bg-white/30"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Task Blocks */}
                    {weekTasks.map((task, idx) => {
                        const taskDate = parseLocalDateOnly(task.date);
                        const [sh, sm] = task.start.split(":").map(Number);
                        const [eh, em] = task.end.split(":").map(Number);

                        const startMins = (sh - 8) * 60 + sm;
                        const endMins = (eh - 8) * 60 + em;
                        const topPx = (startMins / 60) * hourHeight;
                        const heightPx = ((endMins - startMins) / 60) * hourHeight;
                        const dayColIndex = (taskDate.getDay() + 6) % 7;

                        return (
                            <a
                                key={idx}
                                href={task.resource_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute w-[calc(100%/7)] px-1 z-30"
                                style={{
                                    top: `${topPx}px`,
                                    left: `calc((100% / 7) * ${dayColIndex})`,
                                    height: `${heightPx}px`,
                                }}
                            >
                                <div
                                    className="h-full w-full rounded-md text-white text-xs p-1 shadow-lg overflow-hidden hover:opacity-90 transition-all duration-200 flex flex-col justify-end relative"
                                >
                                    {/* Background thumbnail at 60% opacity and top-center aligned */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-no-repeat bg-top opacity-80"
                                        style={{
                                            backgroundImage: `url(${task.thumbnail_url})`,
                                        }}
                                    />

                                    {/* Overlay content */}
                                    <div className="relative z-10 bg-black/60 rounded p-1">
                                        <div className="font-semibold truncate" title={task.resource_name}>
                                            {task.resource_name}
                                        </div>
                                        <div className="text-[10px]">
                                            {task.start.slice(0, 5)} - {task.end.slice(0, 5)}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                    {/* Current Time Line */}
                    {timeOffset !== null && isTodayInSameWeek(selectedDate) && (
                        <div
                            className="
                                        absolute
                                        w-[calc(100%/7)]
                                        border-t-3 border-red-400
                                        z-50
                                        transition-all duration-300 ease-in-out
                                        "
                            style={{
                                top: `${timeOffset}px`,
                                left: `calc((100% / 7) * ${getTodayColumnIndex()})`
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
