
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Globe, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../data/translations';
import { SupportedLanguage } from '../types';

interface LanguageSelectorProps {
  placement?: 'top' | 'bottom' | 'nav';
  variant?: 'floating' | 'navbar' | 'compact';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  placement = 'top',
  variant = 'floating'
}) => {
  const { language, setLanguage, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Custom Flag Renderer to match screenshot
  const renderFlag = (flagType: 'india' | 'bangla' | 'uk', size: 'sm' | 'md' = 'md') => {
    const sizeClasses = size === 'sm' ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]';

    if (flagType === 'bangla') {
      return (
        <span className={`${sizeClasses} rounded-full bg-[#006A4E] border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative shadow-xs`}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F42A41]"></span>
        </span>
      );
    }

    if (flagType === 'uk') {
      return (
        <span className={`${sizeClasses} rounded-full bg-[#012169] border border-gray-300 flex items-center justify-center overflow-hidden shrink-0 relative shadow-xs font-bold text-white`}>
          <span className="text-[8px]">🇬🇧</span>
        </span>
      );
    }

    // India Flag Icon (Tricolor)
    return (
      <span className={`${sizeClasses} rounded-full border border-gray-300 flex flex-col items-center justify-between overflow-hidden shrink-0 relative shadow-xs`}>
        <span className="w-full h-1/3 bg-[#FF9933]"></span>
        <span className="w-full h-1/3 bg-white flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full border border-[#000080] flex items-center justify-center">
            <span className="w-0.5 h-0.5 rounded-full bg-[#000080]"></span>
          </span>
        </span>
        <span className="w-full h-1/3 bg-[#138808]"></span>
      </span>
    );
  };

  if (variant === 'navbar') {
    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer select-none"
          title="Change Language / भाषा बदलें"
          id="navbar-language-btn"
        >
          {renderFlag(currentLanguageOption.flagType, 'sm')}
          <span className="font-bold">{currentLanguageOption.nativeName}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white border-2 border-black shadow-2xl py-1.5 z-50 text-black max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-wider">
              Select Language
            </div>
            {LANGUAGE_OPTIONS.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'hover:bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {renderFlag(opt.flagType, 'sm')}
                    <span className="font-semibold">{opt.name}</span>
                    <span className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>({opt.nativeName})</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Floating Language Selector (matching the reference screenshot at bottom-left)
  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef}>
      
      {/* Dropdown Menu (Opens Upward as shown in screenshot) */}
      {isOpen && (
        <div 
          className={`absolute ${placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-0 w-44 bg-white rounded-xl shadow-2xl border border-gray-300 py-1 z-50 max-h-72 overflow-y-auto text-black`}
          style={{ minWidth: '150px' }}
        >
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                onClick={() => {
                  setLanguage(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3.5 py-2 text-xs text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                  isSelected 
                    ? 'bg-[#5B6BBF] text-white font-bold' 
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {renderFlag(opt.flagType, 'sm')}
                  <span className="font-semibold text-xs tracking-tight">{opt.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Trigger Button (e.g. 🇮🇳 HI v ) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-50 border-2 border-gray-300 text-black text-xs font-black shadow-lg transition-all hover:scale-105 cursor-pointer"
        title="Select Language / भाषा चुनें"
        id="floating-language-trigger"
      >
        {renderFlag(currentLanguageOption.flagType, 'sm')}
        <span className="tracking-wider">{currentLanguageOption.shortCode}</span>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-700 stroke-[2.5]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-700 stroke-[2.5]" />
        )}
      </button>

    </div>
  );
};
