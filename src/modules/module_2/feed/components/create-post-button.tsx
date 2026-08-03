'use client'

import { useCreatePost } from "@module_3/exports";

interface ICREATEPOSTBUTTON {
    communityId: string;
    disabled?: boolean;
}

export default function CreatePostButton({ communityId, disabled = false }: ICREATEPOSTBUTTON) {
    const { open } = useCreatePost();

    return (
        <button
        type="button"
        disabled={disabled}
        onClick={() => open({ communityId })}
        title={disabled ? "Únete para poder publicar" : undefined}
        className="px-5 py-2 bg-regular-blue hover:bg-dark-main-blue disabled:bg-white-gray disabled:text-gray-custom disabled:cursor-not-allowed text-pure-white font-candal font-normal text-tiny rounded-full transition-all cursor-pointer border-0 active:scale-95"
        >
        + Crear Publicación
        </button>
    );
}