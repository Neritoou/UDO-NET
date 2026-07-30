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
        className="lg:hidden fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold rounded-full shadow-lg transition-all"
      >
        {title}
      </button>

      <div className="hidden lg:block">{children}</div>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto bg-gray-950 rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">{title}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white font-bold px-1">
                ✕
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}