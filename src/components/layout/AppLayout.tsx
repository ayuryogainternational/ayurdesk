// ====================================================================
// AyurDesk - Main Application Layout
// Organization: Ayuryoga International
// ====================================================================

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { PasswordChangeModal } from '../auth/PasswordChangeModal';

export const AppLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-100 flex flex-col antialiased">
      <PasswordChangeModal />

      <div className="flex flex-1">
        {/* Desktop Sidebar (Fixed left) */}
        <div className="hidden lg:block lg:w-64 lg:fixed lg:inset-y-0 z-40">
          <Sidebar />
        </div>

        {/* Mobile Navigation Drawer */}
        <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          <Header onToggleMobileNav={() => setMobileNavOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

