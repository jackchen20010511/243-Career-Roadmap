"use client";

import { useState } from "react";
import ScheduleGrid from "@/components/schedule/scheduleGrid";
import "react-calendar/dist/Calendar.css";
import AuthProtected from "@/components/auth-protected";
import Header from "@/components/ui/header";
import CalendarPanel from "@/components/schedule/calendarPanel";

export default function SchedulePage() {
    const [selectedDate, setSelectedDate] = useState(new Date());


    return (
        <AuthProtected>
            <Header />
            <main className="flex flex-row w-full min-h-screen p-3 gap-6">
                {/* Left: Resume */}
                <div className="pt-5 w-[25%]">
                    <CalendarPanel selectedDate={selectedDate} setSelectedDate={setSelectedDate} />

                </div>

                {/* Right: Your career goal components go here */}
                <div className="w-[75%]">
                    <ScheduleGrid selectedDate={selectedDate} />
                </div>
            </main>
        </AuthProtected>

    );
}
