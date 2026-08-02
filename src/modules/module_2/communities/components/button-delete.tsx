'use client'

import { Community } from "@/lib/types";
import { ModalDelete } from "@module_2/communities/components/modal-delete";
import { useState } from "react";

export default function DeleteSubcommunity({ community, subcommunity }:{ community:Community, subcommunity:Community }){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <button onClick={() => setIsOpen(true)} className={`px-3 py-1.5 rounded-full text-sm font-semibold transition flex items-center 
            gap-2 border border-gray-700 text-gray-300 hover:bg-gray-800 active:scale-95`}>
                Eliminar
            </button>

            <ModalDelete isOpen={isOpen} setIsOpen={setIsOpen} community={community} subcommunity={subcommunity}  />
        </>
    )
};