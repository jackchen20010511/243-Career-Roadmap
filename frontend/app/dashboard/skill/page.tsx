"use client";
import { useEffect, useState } from "react";

import StepTracker from "@/components/stepTracker/stepTracker";
import Header from "@/components/ui/header";
import AuthProtected from "@/components/auth-protected";

export default function SkillPage() {
    const [userId, setUserId] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedId = localStorage.getItem("user_id");
            if (storedId) {
                setUserId(Number(storedId));
            }
        }
    }, []);

    if (userId === null) return <div>Loading...</div>;

    return (
        <AuthProtected>
            <Header />
            <StepTracker userId={userId} />
        </AuthProtected>
    );
}
