'use client'

import { Community } from "@/lib/types";
import { ModalDelete } from "@module_2/communities/components/modal-delete";
import { useState } from "react";

export default function DeleteSubcommunity({ community, subcommunity }:{ community:Community, subcommunity:Community }){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <button onClick={() => setIsOpen(true)} className="px-3 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 active:scale-95">
                Eliminar
            </button>

            <ModalDelete isOpen={isOpen} setIsOpen={setIsOpen} community={community} subcommunity={subcommunity}  />
        </>
    )
};