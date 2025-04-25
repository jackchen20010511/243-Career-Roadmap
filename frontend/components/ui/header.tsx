"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./logo";
import UserMenu from "@/components/ui/userMenu";
import { usePathname } from "next/navigation";


export default function Header() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Goal", href: "/dashboard/goal" },
    { label: "Skill", href: "/dashboard/skill" },
    { label: "Schedule", href: "/dashboard/schedule" },
  ];

  useEffect(() => {
    const userName = localStorage.getItem("user_name");

    setUser(userName ? { name: userName } : null);
  }, []);



  return (
    <header className="z-50 w-full bg-gray-500/10 backdrop-blur-md shadow-md overflow-visible">
      <div className="mx-auto px-4 sm:px-6">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Logo />
          </div>

          {!user ? (
            <ul className="flex flex-1 items-center justify-end gap-3">
              <li>
                <Link href="/auth/signin" className="btn-sm bg-gray-700 text-gray-300 px-4 py-2 rounded hover:bg-gray-900 transition cursor-pointer">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="btn-sm bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition cursor-pointer">
                  Register
                </Link>
              </li>
            </ul>
          ) : (
            <>
              <nav className="absolute left-1/2 transform -translate-x-1/2">
                <ul className="flex space-x-8 text-lg font-semibold">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`px-4 py-2 block rounded-md transition ${isActive
                            ? "bg-indigo-600 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex items-center space-x-2 relative z-50">
                <span className="ml-2 text-white font-semibold">{`Welcome, ${user.name}`}</span>
                <UserMenu user={user} />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}