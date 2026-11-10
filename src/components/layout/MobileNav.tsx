// ====================================================================
// AyurDesk - Mobile Navigation Slide-Over Drawer
// ====================================================================

import React from 'react';
import { Sidebar } from './Sidebar';
import { X } from 'lucide-react';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-forest-900 shadow-2xl z-10">
        <div className="absolute top-3 right-3">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-forest-300 hover:text-white hover:bg-forest-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar onCloseMobile={onClose} />
      </div>
    </div>
  );
};

