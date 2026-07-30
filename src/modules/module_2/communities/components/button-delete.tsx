'use client'

import { ModalDelete } from "@module_2/communities/components/modal-delete";
import { useState } from "react";

export default function DeleteSubcommunity(){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <button onClick={() => setIsOpen(true)} className="bg-rose-700 text-white px-4 py-2 rounded-md hover:bg-rose-800 transition">
                Delete Subcomunidad
            </button>

            <ModalDelete isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
    )
};