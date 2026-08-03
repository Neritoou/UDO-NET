'use client'

import { useState } from "react";
import FormCreateSubCommunity from "@module_2/communities/components/form";

interface IADDSUBCOMMUNITY {
    parentId: string;
    parentSlug: string;
    parentName: string;
}

export default function AddSubCommunity({ parentId, parentSlug, parentName }: IADDSUBCOMMUNITY){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return(
        <>
            <button onClick={() => setIsOpen(true)} className="bg-regular-blue text-pure-white px-4 py-2 rounded-full hover:bg-dark-main-blue transition">
                Crear Subcomunidad
            </button>

            <FormCreateSubCommunity isOpen={isOpen} setIsOpen={setIsOpen} parentId={parentId} parentSlug={parentSlug} parentName={parentName} />
        </>
    );
};