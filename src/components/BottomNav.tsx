import React from 'react';
import { Home, ShoppingBag, Film, Compass, Wrench, ShieldCheck, User, Coins } from 'lucide-react';

export type TabKey =
  | 'home'
  | 'ads'
  | 'points'
  | 'reels'
  | 'places'
  | 'taxi'
  | 'services'
  | 'provider'
  | 'admin'
  | 'orders'
  | 'profile';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'الرئيسية', icon: Home },
    { key: 'ads' as TabKey, label: 'الإعلانات', icon: ShoppingBag },
    { key: 'points' as TabKey, label: 'النقاط', icon: Coins },
    { key: 'reels' as TabKey, label: 'الريلز', icon: Film, highlight: 'text-rose-500' },
    { key: 'places' as TabKey, label: 'الخريطة', icon: Compass, highlight: 'text-blue-500' },
    { key: 'provider' as TabKey, label: 'لوحة المزود', icon: Wrench, highlight: 'text-amber-500' },
    { key: 'admin' as TabKey, label: 'لوحة المدير', icon: ShieldCheck, highlight: 'text-emerald-500' },
    { key: 'profile' as TabKey, label: 'حسابي', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-8px_24px_rgba(18,59,104,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.4)] pb-safe transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between sm:justify-around px-2 py-1.5 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded-2xl transition-all duration-300 flex-shrink-0 min-w-[50px] sm:min-w-[58px] ${
                isActive
                  ? 'text-navy-950 dark:text-white font-black scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-navy-900 to-navy-950 dark:from-navy-800 dark:to-slate-800 text-white shadow-md shadow-navy-900/25 -translate-y-0.5'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </div>
              <span
                className={`text-[9px] sm:text-[10px] mt-1 whitespace-nowrap tracking-tight ${
                  isActive ? 'text-navy-900 dark:text-white font-extrabold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
