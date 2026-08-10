"use client";

import { User } from "@/lib/types";
import React, { useState, useRef, useEffect } from "react";

export default function Dropdown({ profile }: { profile: User }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleUsers = async () => {
          
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                id={`dropdown-btn-${profile.id}`}
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none p-1.5 rounded-lg transition-colors"
                type="button"
                aria-expanded={isOpen}
            >
                <svg className="w-5 h-5" aria-hidden="true" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="3" d="M12 6h.01M12 12h.01M12 18h.01" />
                </svg>
            </button>

            {isOpen && (
                <div 
                    id={`dropdown-menu-${profile.id}`}
                    className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-48 overflow-hidden"
                >
                    <ul className="p-1 text-xs text-gray-700 font-medium space-y-1">
                        <li>
                            <button className="inline-flex items-center w-full px-3 py-2 hover:bg-red-50 text-red-600 rounded-md text-left transition-colors" onClick={handleUsers}>
                                Expulsar Miembro
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};