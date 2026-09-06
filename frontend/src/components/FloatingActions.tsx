import React from 'react';
import { MessageSquare, PhoneCall, ArrowUp, Zap } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface FloatingActionsProps {
  onOpenSOS: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({ onOpenSOS }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Bottom Left Floating Language Selector (Exact match to screenshot reference) */}
      <div className="fixed bottom-6 left-6 z-40">
        <LanguageSelector placement="top" variant="floating" />
      </div>

      {/* Bottom Right Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        {/* 24/7 SOS Alert Button */}
        <button
          onClick={onOpenSOS}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-black hover:bg-gray-800 text-[#FFB800] text-xs font-black shadow-xl hover:scale-105 transition-all border-2 border-[#FFB800] cursor-pointer"
          title="24/7 Emergency Technician SOS"
          id="floating-sos-btn"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <Zap className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
          <span className="hidden sm:inline">24/7 SOS</span>
        </button>

        {/* WhatsApp Quick Chat Floating Button */}
        <a
          href="https://wa.me/919876543210?text=Hello%20MistriKhoj,%20I%20need%20help%20finding%20a%20verified%20technician"
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xl hover:scale-105 transition-all border border-emerald-600 cursor-pointer"
          id="floating-whatsapp-btn"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          <span className="hidden sm:inline">WhatsApp Help</span>
        </a>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 border-2 border-gray-300 text-black shadow-md transition-all cursor-pointer"
          title="Scroll to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </>
  );
};
