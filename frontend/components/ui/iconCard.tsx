// components/ui/IconCard.tsx
"use client";

interface IconCardProps {
    iconSrc: string;
    label?: string;
}

export default function IconCard({ iconSrc, label }: IconCardProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden">
                <img src={iconSrc} alt={label || "icon"} className="w-10 h-10 object-contain" />
            </div>
            {label && <p className="text-sm text-white text-center">{label}</p>}
        </div>
    );
}
