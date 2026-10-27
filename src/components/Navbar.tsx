import React from 'react';
import { Bell, PlusCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenNewAd: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSearchClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewAd,
  onOpenNotifications,
  unreadCount,
  onSearchClick
}) => {
  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-md text-white shadow-xl border-b border-navy-800 tatreez-border-top">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-palestine-green via-emerald-600 to-navy-900 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-navy-950 flex items-center justify-center text-xl">
                🇵🇸
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-palestine-red rounded-full border-2 border-navy-950" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-black text-lg sm:text-xl tracking-tight">
              <span className="text-white">فلسطين</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">بلاتفورم</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 -mt-0.5 font-medium flex items-center gap-1">
              <span>كل فلسطين في مكان واحد</span>
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-white/10"
            title="بحث"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white flex items-center justify-center transition-all active:scale-95 border border-white/10"
            title="الإشعارات"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-palestine-red text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenNewAd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-palestine-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-900/30 transition-all active:scale-95 hover:shadow-lg border border-emerald-400/30"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">أضف إعلانك</span>
            <span className="sm:hidden">إعلان</span>
          </button>
        </div>
      </div>
    </header>
  );
};
