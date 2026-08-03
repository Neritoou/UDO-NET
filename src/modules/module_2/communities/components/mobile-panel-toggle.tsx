"use client";

import { useState } from "react";

interface MobilePanelToggleProps {
  title: string;
  children: React.ReactNode;
}

export default function MobilePanelToggle({ title, children }: MobilePanelToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-regular-blue hover:bg-dark-main-blue active:scale-95 text-pure-white text-sm font-semibold rounded-full shadow-lg transition-all"
      >
        {title}
      </button>

      <div className="hidden lg:block">{children}</div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md max-h-[85vh] bg-pure-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
              <h2 className="text-main-black font-semibold text-sm">{title}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-custom hover:text-main-black font-bold px-1">
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-4 pb-4">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}