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
            <button onClick={() => setIsOpen(true)} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition">
                Crear Subcomunidad
            </button>

            <FormCreateSubCommunity isOpen={isOpen} setIsOpen={setIsOpen} parentId={parentId} parentSlug={parentSlug} parentName={parentName} />
        </>
    );
};