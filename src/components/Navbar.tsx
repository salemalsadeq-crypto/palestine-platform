import React, { useState, useEffect } from 'react';
import {
  Bell,
  PlusCircle,
  Search,
  ShieldCheck,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  QrCode,
  Film,
  Compass,
  Wrench,
  ShoppingBag,
  Home,
  Coins
} from 'lucide-react';
import { TabKey } from './BottomNav';

interface NavbarProps {
  onOpenNewAd: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  onSearchClick: () => void;
  onOpenQrScanner: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentTab?: TabKey;
  onSelectTab?: (tab: TabKey) => void;
  pointsBalance?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewAd,
  onOpenNotifications,
  unreadCount,
  onSearchClick,
  onOpenQrScanner,
  darkMode,
  onToggleDarkMode,
  currentTab = 'home',
  onSelectTab,
  pointsBalance
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => setShowReconnectedBanner(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const quickLinks: { key: TabKey; label: string; icon: any; badge?: string }[] = [
    { key: 'home', label: 'الرئيسية', icon: Home },
    { key: 'ads', label: 'الإعلانات', icon: ShoppingBag },
    { key: 'points', label: 'النقاط والمكافآت', icon: Coins, badge: 'مكافآت' },
    { key: 'reels', label: 'الريلز', icon: Film, badge: 'فيديو' },
    { key: 'places', label: 'الخريطة', icon: Compass, badge: 'حي' },
    { key: 'provider', label: 'لوحة المزود', icon: Wrench, badge: 'إدارة' },
    { key: 'admin', label: 'لوحة المدير', icon: ShieldCheck, badge: 'Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-navy-950/95 backdrop-blur-md text-white shadow-xl border-b border-navy-800 tatreez-border-top">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white text-xs font-bold py-2 px-4 shadow-md border-b border-red-800 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-white animate-bounce flex-shrink-0" />
              <span>تنبيه: انقطع الاتصال بالإنترنت! يرجى التحقق من شبكة الواي فاي أو بيانات الهاتف.</span>
            </div>
            <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono flex-shrink-0">غير متصل</span>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {isOnline && showReconnectedBanner && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white text-xs font-bold py-2 px-4 shadow-md border-b border-emerald-800 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-white flex-shrink-0" />
              <span>تم استعادة الاتصال بالإنترنت بنجاح! المنصة متصلة الآن.</span>
            </div>
            <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded-full font-mono flex-shrink-0">متصل الآن</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab && onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Network Status Pill */}
          {!isOnline ? (
            <div
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-bold animate-pulse"
              title="لا يوجد اتصال بالإنترنت"
            >
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xs:inline">غير متصل</span>
            </div>
          ) : (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium"
              title="حالة الاتصال: متصل بالإنترنت"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold">متصل</span>
            </div>
          )}

          {/* Points Balance Pill */}
          {pointsBalance !== undefined && (
            <button
              onClick={() => onSelectTab && onSelectTab('points')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 hover:from-amber-400/30 hover:to-yellow-400/30 text-amber-300 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-400/30 text-xs font-black transition active:scale-95 shadow-xs"
              title="رصيد نقاط فلسطين واستبدال المكافآت"
            >
              <Coins className="w-4 h-4 text-amber-400 stroke-[2.2]" />
              <span>{pointsBalance.toLocaleString()}</span>
              <span className="hidden xs:inline text-[10px] text-amber-200/90 font-bold">نقطة</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
              darkMode
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/30 hover:bg-amber-400/30'
                : 'bg-white/10 text-slate-200 hover:text-white border-white/10 hover:bg-white/15'
            }`}
            title={darkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-300 transition-transform rotate-0 scale-100" />
            ) : (
              <Moon className="w-4 h-4 text-slate-200 transition-transform rotate-0 scale-100" />
            )}
          </button>

          {/* QR Code Scanner Button */}
          <button
            onClick={onOpenQrScanner}
            className="w-9 h-9 rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-400/20 hover:from-amber-400/30 hover:to-yellow-400/30 text-amber-300 flex items-center justify-center transition-all active:scale-95 border border-amber-400/30 shadow-xs"
            title="مسح رمز QR بالكاميرا"
            aria-label="ماسح رمز QR"
          >
            <QrCode className="w-4 h-4 stroke-[2.5]" />
          </button>

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

      {/* Quick Navigation Pills Sub-Bar */}
      {onSelectTab && (
        <div className="bg-navy-900/70 border-t border-navy-800/80 px-3 py-1.5 overflow-x-auto scrollbar-none">
          <div className="max-w-4xl mx-auto flex items-center gap-1.5 sm:gap-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm font-black scale-102'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-navy-900 text-white'
                          : 'bg-white/15 text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
