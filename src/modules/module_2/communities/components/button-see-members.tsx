'use client'

import { useState } from "react"
import MembersCommunity from "./get-users-profile";

import type { User } from '@/lib/types';

export default function ShowMembers({ memberCount, currentUsers, communityName }:{ memberCount:number, currentUsers:User[], communityName:string }){
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <>
            <button className="hover:underline hover:opacity-100 transition-opacity cursor-pointer text-left" 
                onClick={() => setIsOpen(true)}>
                <span className="font-candal font-normal text-tiny text-alpha-black hover:text-gray-700">
                    {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
                </span>
            </button>

            <MembersCommunity currentUsers={currentUsers} isOpen={isOpen} setIsOpen={setIsOpen} communityName={communityName} />
        </>
    );
};