"use client";

import { User } from "@/lib/types";
import React, { useState, useRef, useEffect, useTransition } from "react";
import { removeMemberSubCommunityAction } from "@module_2/communities/actions/community.actions";
import { useRouter } from "next/navigation";

interface AlertState {
    type: 'success' | 'error';
    message: string;
};

export default function Dropdown({ profile, communityId }: { profile: User, communityId:string }) {
    const [alert, setAlert] = useState<AlertState | null>(null)
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleUsers = () => {
        setAlert(null);

        startTransition(async () => {
            try {
                const success = await removeMemberSubCommunityAction(communityId, profile.id);

                if (!success) {
                    setAlert({
                        type: 'error',
                        message: "No tienes permisos para expulsar al usuario o no existe",
                    });
                    return;
                };

                setAlert({
                    type: 'success',
                    message: "Usuario eliminado con exito!",
                });
                router.refresh();
            } catch (e:unknown) {
                setAlert({
                    type: 'error',
                    message: e instanceof Error ? e.message : 'Ocurrió un error inesperado al salirse.',
                });
            }
        });
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
        <>
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
                                <button disabled={isPending} className="inline-flex items-center w-full px-3 py-2 hover:bg-red-50 text-red-600 rounded-md text-left transition-colors" onClick={handleUsers}>
                                    {isPending ? "Expulsando..." : "Expulsar Miembro"}
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>

        {alert && (
            <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-200">
                <div
                    className={`flex items-start justify-between gap-3 p-4 rounded-xl shadow-lg border ${
                    alert.type === 'error'
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                    }`}>
                    <div className="flex items-start gap-2.5">
                        {alert.type === 'error' ? (
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    )}

                        <p className="text-sm font-medium leading-snug">{alert.message}</p>
                    </div>

                    <button
                    type="button"
                    onClick={() => setAlert(null)}
                    className={`p-1 rounded-lg transition-colors ${
                        alert.type === 'error'
                        ? "text-red-500 hover:bg-red-100"
                        : "text-emerald-600 hover:bg-emerald-100"
                    }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    </button>
                </div>
            </div>
            )}
        </>
    );
};