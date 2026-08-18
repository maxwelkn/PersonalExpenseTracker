import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const location = useLocation();
  const path = location.pathname.split('/')[1] || 'Dashboard';
  const title = path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');

  return (
    <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
      <button
        type="button"
        className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none md:hidden hover:bg-slate-50"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex">
          <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        </div>
        <div className="ml-4 flex items-center md:ml-6">
          <button className="flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full">
            <span className="sr-only">Open user menu</span>
            <UserCircle className="h-8 w-8 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
