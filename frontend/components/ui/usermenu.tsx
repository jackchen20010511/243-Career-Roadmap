"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import userIcon from "/public/images/user_logo.png"; // Ensure correct path

interface User {
    name: string;
}

export default function UserMenu({ user }: { user: User }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    // ✅ Click Outside Handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showMenu]);

    // ✅ Logout Handler
    const handleLogout = () => {
        localStorage.clear();
        setShowMenu(false);
        router.push("/auth/signin"); // Redirect after logout
    };

    return (
        <div className="relative inline-flex">
            {/* ✅ Avatar Button */}
            <button
                onClick={() => setShowMenu((prev) => !prev)}
                className="mt-1 ml-2 rounded-full hover:bg-gray-700 transition cursor-pointer"
            >
                <Image src={userIcon} alt="User Menu" width={50} height={50} />
            </button>

            {/* ✅ Dropdown Menu (uses `useRef`) */}
            {showMenu && (
                <div
                    ref={menuRef} // ✅ Attach ref here
                    className="absolute top-full right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg text-white z-50
                    opacity-100 scale-100 transition-all transform origin-top pointer-events-auto overflow-visible"
                >
                    <div className="px-4 py-2 border-b border-gray-700">
                        <p className="text-sm">{`${user.name}`}</p>
                    </div>
                    <Link
                        href="/dashboard/profile"
                        className="block text-left w-full px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                    >
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}
