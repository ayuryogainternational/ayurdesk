// ====================================================================
// AyurDesk - Sidebar Navigation Component
// Palette: Dark Forest Green (#103B37), Teal (#23675B), Warm (#F7F7EF)
// ====================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  TableProperties,
  BarChart3,
  FileSpreadsheet,
  Users,
  History,
  Settings,
  LogOut,
  Shield,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { profile, isAdmin, signOut } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/daily-entry', label: 'Add Daily Report', icon: PlusCircle },
    { to: '/records', label: 'All Records', icon: TableProperties },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    // Admin only sections
    { to: '/reports', label: 'Reports Export', icon: FileSpreadsheet, adminOnly: true },
    { to: '/users', label: 'User Management', icon: Users, adminOnly: true },
    { to: '/audit-logs', label: 'Audit Logs', icon: History, adminOnly: true },
    // General
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-forest-900 text-white flex flex-col h-full border-r border-forest-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-forest-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-inner">
          <Layers className="w-5 h-5 text-warm-100" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">
            AyurDesk
          </h1>
          <p className="text-[11px] font-medium text-forest-300 uppercase tracking-wider">
            Ayuryoga Int'l
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-forest-400 uppercase tracking-wider">
          Operations
        </div>

        {navItems.map((item) => {
          if (item.adminOnly && !isAdmin) {
            return null;
          }

          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'text-forest-200 hover:text-white hover:bg-forest-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-forest-300" />
                <span>{item.label}</span>
              </div>
              {item.adminOnly && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-forest-800/90 text-forest-300 border border-forest-700/60 font-semibold">
                  Admin
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-forest-800/80 bg-forest-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-forest-700 flex items-center justify-center text-xs font-semibold text-white">
              {profile?.full_name ? profile.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-white truncate">{profile?.full_name}</p>
              <div className="flex items-center gap-1 text-[10px] text-forest-300">
                <Shield className="w-2.5 h-2.5 text-teal-light" />
                <span className="capitalize">{profile?.role || 'Staff'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Log out"
            className="p-1.5 rounded-lg text-forest-400 hover:text-rose-400 hover:bg-forest-800 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

