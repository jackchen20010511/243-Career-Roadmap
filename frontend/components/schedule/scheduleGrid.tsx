"use client";

import React, { useEffect, useState } from "react";

export default function ScheduleGrid({ selectedDate }: { selectedDate: Date }) {

    const [timeOffset, setTimeOffset] = useState<number | null>(null);

    useEffect(() => {
        const startHour = 8;
        const endHour = 21;
        const hourHeight = 60; // px

        const updateTime = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            console.log(hour, minute)

            if (hour >= startHour && hour <= endHour) {
                const totalMinutes = (hour - startHour) * 60 + minute;
                const offset = (totalMinutes / 60) * hourHeight + hourHeight - 12;
                setTimeOffset(offset);
            } else {
                setTimeOffset(null);
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 60000); // Update every minute

        return () => clearInterval(interval);
    }, []);


    function getTodayColumnIndex() {
        const day = new Date().getDay();
        return day === 0 ? 6 : day - 1; // Sunday=6, Mon=0, ..., Sat=5
    }

    function isTodayInSameWeek(selectedDate: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selected = new Date(selectedDate);
        selected.setHours(0, 0, 0, 0);

        // Get the start of the week (Monday)
        const selectedDay = selected.getDay();
        const weekStart = new Date(selected);
        weekStart.setDate(selected.getDate() - (selectedDay === 0 ? 6 : selectedDay - 1));

        // Get end of the week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Check if today's date is between weekStart and weekEnd
        return today >= weekStart && today <= weekEnd;
    }

    return (
        <div className="flex w-full">
            {/* Time Labels Column */}
            <div className="flex flex-col items-end pr-2 w-[60px] text-sm text-gray-300 font-medium">
                {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="h-[60px] flex items-start -mt-[0.3px] pt-[39px] pr-2">{8 + i}:00</div>
                ))}
            </div>

            {/* Grid Column */}
            <div className="flex-1">
                {/* Current Time Line */}
                {timeOffset !== null && isTodayInSameWeek(selectedDate) && (
                    <div
                        className="relative w-[calc(100%/7)] border-t-3 border-red-400 z-20 transition-all duration-300 ease-in-out"
                        style={{
                            top: `${timeOffset}px`,
                            left: `calc((100% / 7) * ${getTodayColumnIndex()})`
                        }}
                    />
                )}
                {/* Weekday headers */}
                <div className="grid grid-cols-7 text-center text-indigo-200 text-lg font-semibold mb-1">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, i) => (
                        <div key={i} className="py-2">{day}</div>
                    ))}
                </div>

                {/* Schedule Grid */}
                <div className="grid grid-cols-7">
                    {Array.from({ length: 7 }).map((_, dayIdx) => (
                        <div key={dayIdx} className="flex flex-col">
                            {Array.from({ length: 13 }).map((_, hourIdx) => (
                                <div
                                    key={hourIdx}
                                    className="h-[60px] border border-gray-400 bg-white/20 hover:bg-white/10 cursor-pointer"
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
}
