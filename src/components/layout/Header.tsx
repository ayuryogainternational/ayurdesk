// ====================================================================
// AyurDesk - Header Component
// Standard: Indian Ocean / Mauritius Time display & User Profile
// ====================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { Clock, User, LogOut, Menu } from 'lucide-react';
import { MAURITIUS_TIMEZONE } from '../../lib/timezone';

interface HeaderProps {
  onToggleMobileNav?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav }) => {
  const { profile, signOut, isAdmin } = useAuth();
  const [mauritiusTime, setMauritiusTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat('en-GB', {
        timeZone: MAURITIUS_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setMauritiusTime(timeStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E5E5DC] h-16 flex items-center justify-between px-4 sm:px-6">
      {/* Left Mobile Menu Toggle & Brand Subtitle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-forest-700">
              Ayuryoga International
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">Operations Control</span>
          </div>
        </div>
      </div>

      {/* Right Timezone Clock & User Info */}
      <div className="flex items-center gap-4">
        {/* Mauritius Local Time Banner */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warm-100 border border-[#E5E5DC] text-xs font-medium text-slate-700">
          <Clock className="w-3.5 h-3.5 text-forest-600" />
          <span className="text-slate-500 hidden md:inline">Mauritius (MUT UTC+4):</span>
          <span className="font-mono font-semibold text-forest-900">{mauritiusTime}</span>
        </div>

        {/* User Role Badge & Dropdown / Sign out */}
        {profile && (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-800">{profile.full_name}</span>
              <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                {profile.email}
              </span>
            </div>

            <Badge variant={isAdmin ? 'forest' : 'teal'}>
              {isAdmin ? 'Administrator' : 'Staff'}
            </Badge>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

