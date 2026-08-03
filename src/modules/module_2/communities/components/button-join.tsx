'use client'

import { joinCommunityAction } from "@module_2/communities/actions/community.actions";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface AlertState {
    type: 'success' | 'error';
    message: string;
};

export default function JoinCommunityComponent({ communityId }: { communityId:string }){
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const joinCommunityOrSubcommunity = () =>{
        setAlert(null);
        startTransition(async () => {
        try {
            const result = await joinCommunityAction(communityId);
            if (result.error) {
                setAlert({ type: 'error', message: result.error });
                return;
            };
            if(result.data){
                setAlert({ type: 'success', message: '¡Te has unido exitosamente a la comunidad!' });
                router.refresh();
            };
        } catch (e: unknown) {
            setAlert({
                type: 'error',
                message: e instanceof Error ? e.message : 'Ocurrió un error inesperado al unirse.',
            });
        };
        });
    };

    return(
        <>
            <button
                type="button"
                onClick={joinCommunityOrSubcommunity}
                disabled={isPending}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
                    isPending
                    ? "bg-main-blue/50 text-pure-white cursor-wait"
                    : "bg-regular-blue hover:bg-dark-main-blue text-pure-white active:scale-95"
                }`}>
                {isPending ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uniéndose...
                </>
                ) : (
                    "Unirse"
                )}
            </button>

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