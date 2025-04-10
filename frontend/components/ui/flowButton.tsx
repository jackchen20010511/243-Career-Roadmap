// components/ui/FlowButton.tsx
"use client";

import IconCard from "@/components/ui/iconCard";

interface FlowButtonProps {
    title: string;
    iconGroups: {
        left: { iconSrc: string; label?: string }[];
        right: { iconSrc: string; label?: string }[];
    };
    buttonText: string;
    onClick: () => void;
}

export default function FlowButton({ title, iconGroups, buttonText, onClick }: FlowButtonProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold text-white mb-8">{title}</h2>

            <div className="flex items-center justify-center gap-10 flex-wrap mb-10">
                {/* Left side icons */}
                <div className="flex flex-col gap-4">
                    {iconGroups.left.map((item, i) => (
                        <IconCard key={`left-${i}`} iconSrc={item.iconSrc} label={item.label} />
                    ))}
                </div>

                {/* Central CTA Button */}
                <div className="flex flex-col items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-white text-black font-bold flex items-center justify-center shadow-lg">
                        <span>API</span>
                    </div>
                    <button
                        onClick={onClick}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
                    >
                        {buttonText}
                    </button>
                </div>

                {/* Right side icons */}
                <div className="flex flex-col gap-4">
                    {iconGroups.right.map((item, i) => (
                        <IconCard key={`right-${i}`} iconSrc={item.iconSrc} label={item.label} />
                    ))}
                </div>
            </div>
        </div>
    );
}
