import React from 'react';
import { Home, ShoppingBag, Car, Compass, Wrench, Package, User } from 'lucide-react';

export type TabKey = 'home' | 'ads' | 'taxi' | 'places' | 'services' | 'orders' | 'profile';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'الرئيسية', icon: Home },
    { key: 'ads' as TabKey, label: 'الإعلانات', icon: ShoppingBag },
    { key: 'taxi' as TabKey, label: 'تاكسي', icon: Car },
    { key: 'places' as TabKey, label: 'الخريطة', icon: Compass },
    { key: 'services' as TabKey, label: 'الخدمات', icon: Wrench },
    { key: 'orders' as TabKey, label: 'طلباتي', icon: Package },
    { key: 'profile' as TabKey, label: 'حسابي', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_24px_rgba(18,59,104,0.08)] pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-navy-950 font-black scale-105'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div
                className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-navy-900 to-navy-950 text-white shadow-md shadow-navy-900/25 -translate-y-0.5'
                    : 'hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 whitespace-nowrap tracking-tight ${
                  isActive ? 'text-navy-900 font-extrabold' : 'font-medium'
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
