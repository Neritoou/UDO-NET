'use client'

import { ChangeEvent, Dispatch, SetStateAction, useState, useTransition } from "react"
import { deleteSubcommunityAction } from "@module_2/communities/actions/community.actions";
import { ErrAlert } from "@module_2/communities/components/alert";
import { Community } from "@/lib/types";
import { useRouter } from "next/navigation";

interface IMODALDELETE{
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    community: Community;
    subcommunity: Community;
};

export function ModalDelete({ isOpen, setIsOpen, community, subcommunity }: IMODALDELETE){
    const [confirmInput, setConfirmInput] = useState<string>("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        startTransition(async () => {
            setErrorMsg("");

            const isValidDelete:boolean = confirmInput.trim() === subcommunity.slug;

            if(!isValidDelete){
                setErrorMsg("Asegurese de escribir correctamente lo pedido para eliminar");
                return;
            };

            const result = await deleteSubcommunityAction(subcommunity.id);

            if (result.error) {
                setErrorMsg(result.error);
                return;
            };

            if(result.data){
                router.push(`/communities/${community.slug}`);
            };
        });
    };

    if (!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 font-sans">
                <div className="flex justify-between items-center px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Eliminar Subcomunidad
                        </h2>
                    </div>

                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" onClick={() => { setIsOpen(false); setConfirmInput("") }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <hr className="border-gray-100" />

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Esta acción <strong className="text-red-600 font-semibold">no se puede deshacer</strong>. Se eliminarán permanentemente todos los datos, publicaciones y configuraciones de <span className="font-semibold text-gray-900">{subcommunity.name}</span>.
                    </p>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-700">
                            Escribe <span className="font-bold text-red-600">{subcommunity.slug}</span> para confirmar:
                        </label>
                        <input
                            type="text"
                            value={confirmInput}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmInput(e.target.value)}
                            placeholder="Example-here"
                            disabled={isPending}
                            className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:bg-gray-50"
                        />
                    </div>

                    {errorMsg && (
                        <ErrAlert msg={errorMsg} />
                    )}

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            disabled={isPending}
                            className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className={`font-semibold px-6 py-2 rounded-full text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                            isPending
                            ? 'bg-red-200 cursor-not-allowed text-white shadow-none'
                            : 'bg-red-600 hover:bg-red-700 cursor-pointer active:scale-95 text-white'
                        }`}
                        >
                        {isPending ? (
                            <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};