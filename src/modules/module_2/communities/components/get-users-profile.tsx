'use client'

import { IMAGE_PRESETS } from '@/lib/storage/presets';
import type { User } from '@/lib/types';
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction } from 'react';

export default function ModalMembersCommunity({ currentUsers, isOpen, setIsOpen, communityName }:{ currentUsers:User[], isOpen:boolean, setIsOpen:Dispatch<SetStateAction<boolean>>, communityName:string }){
    if(!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 font-sans">
                <div className="flex justify-between items-center px-8 pt-6 pb-2">
                    <h2 className="text-xl font-bold text-gray-900 mx-auto pl-6">
                        Miembros de {communityName}
                    </h2>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100" onClick={() => setIsOpen(false)} >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                    
                <hr className="h-1 bg-gray-200 border-0"></hr>

                <div className="p-6 h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {currentUsers.length > 0 
                            ?
                                currentUsers.map((profile:User) => (
                                <article
                                    key={profile.id}
                                    className="flex items-start gap-3 rounded-xl border border-[#777d85] bg-white p-3"
                                >
                                    <Image
                                        src={profile.avatar_url || IMAGE_PRESETS.avatar.defaultUrl}
                                        alt={`Foto de perfil de ${profile.username}`}
                                        width={44}
                                        height={44}
                                        className="h-11 w-11 shrink-0 rounded-full border border-[#e8eff8] object-cover"
                                    />

                                    <div className="flex min-w-0 flex-col">
                                        <Link
                                            href={`/profile/${profile.username}`}
                                            className="truncate text-sm font-semibold text-[#0f2748] hover:text-[#2563eb] hover:underline"
                                        >
                                            {profile.username}
                                        </Link>
                                    <p className="text-xs text-[#6b7280]">
                                        {profile.role} · {profile.reputation} pts
                                    </p>

                                    {profile.bio ? (
                                        <p className="mt-1 text-xs text-[#111827] line-clamp-2">{profile.bio}</p>
                                    ) : null}
                                    </div>
                                </article>
                            ))
                        :
                            <p className="text-sm text-[#6b7280]">Esta comunidad aún no posee miembros, ¡únete!</p>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};