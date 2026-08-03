'use client'

import { useState } from "react";
import ModalEditSubCommunity from "@module_2/communities/components/modal-edit";
import { Community } from "@/lib/types";

export default function EditSubcommunity({ community, subcommunity }:{ community:Community, subcommunity?:Community }){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <button onClick={() => setIsOpen(true)} className="px-3 py-1.5 rounded-full text-sm font-semibold transition flex items-center gap-2 border border-white-gray text-gray-custom hover:bg-lite-white active:scale-95">
                Editar
            </button>

            <ModalEditSubCommunity community={community} subcommunity={subcommunity} isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    );
};