import React from 'react';
import { ShieldCheck, Heart, ShoppingBag, Car, MapPin, Share2, Award, Phone, Moon, Sun, Wrench, Film, Compass, Coins } from 'lucide-react';
import { TabKey } from './BottomNav';

interface ProfileViewProps {
  onNavigateTab: (tab: TabKey) => void;
  favoritesCount: number;
  adsCount: number;
  ordersCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  pointsBalance?: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigateTab,
  favoritesCount,
  adsCount,
  ordersCount,
  darkMode,
  onToggleDarkMode,
  pointsBalance = 380
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* User Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 text-center space-y-3.5 transition-colors">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-900 to-navy-950 text-white flex items-center justify-center text-3xl mx-auto shadow-md border-2 border-emerald-500/40">
            🇵🇸
          </div>
          <div className="absolute bottom-0 left-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">المستخدم الفلسطيني</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-palestine-green" />
            <span>القدس الشريف / رام الله · حساب موثق</span>
          </p>
          <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full mt-2 border border-amber-200 dark:border-amber-800/60">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>عضو موثوق في فلسطين بلاتفورم</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            onClick={() => onNavigateTab('ads')}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="font-black text-slate-900 dark:text-white text-base">{adsCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">إعلاناتي</div>
          </button>

          <button
            onClick={() => onNavigateTab('ads')}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="font-black text-palestine-red text-base">{favoritesCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">المفضلة</div>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <div className="font-black text-palestine-green text-base">{ordersCount}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">طلباتي</div>
          </button>
        </div>
      </div>

      {/* Palestine Points Loyalty Card */}
      <div
        onClick={() => onNavigateTab('points')}
        className="cursor-pointer bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 rounded-3xl p-4 sm:p-5 text-white border border-navy-800 shadow-md relative overflow-hidden group transition hover:shadow-xl"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md shadow-amber-500/20 group-hover:rotate-6 transition-transform">
              <Coins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white">نقاط ومكافآت فلسطين</span>
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-400/30">
                  مستوى فضي 🏅
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                لديك <strong className="text-amber-300">{pointsBalance} نقطة</strong> جاهزة للاستبدال بقسائم مجانية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-black text-amber-300 bg-white/10 px-3 py-1.5 rounded-xl group-hover:bg-white/20 transition">
            <span>استبدال</span>
            <span>←</span>
          </div>
        </div>
      </div>

      {/* Settings & Links */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 space-y-1.5 transition-colors">
        <h3 className="font-extrabold text-xs text-slate-400 dark:text-slate-500 mb-2 px-2">إعدادات المظهر والحساب</h3>

        {/* Dark Mode Toggle Item */}
        <div className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">المظهر الداكن (Dark Mode)</div>
              <div className="text-[11px] text-slate-400">
                {darkMode ? 'الوضع الليلي مفعّل حالياً' : 'الوضع النهاري مفعّل حالياً'}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleDarkMode}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
              darkMode ? 'bg-palestine-green justify-start' : 'bg-slate-300 dark:bg-slate-700 justify-end'
            }`}
            aria-label="تبديل الوضع الليلي"
          >
            <div className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
          </button>
        </div>

        <button
          onClick={() => onNavigateTab('ads')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-navy-800/10 dark:bg-navy-800/30 text-navy-800 dark:text-navy-300 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">إدارة إعلاناتي المعروضة</div>
              <div className="text-[11px] text-slate-400">تعديل أو تجديد إعلاناتك النشطة</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>

        <button
          onClick={() => onNavigateTab('taxi')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">سجل رحلات التاكسي</div>
              <div className="text-[11px] text-slate-400">عرض الرحلات السابقة وحالة السائقين</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>

        <button
          onClick={() => onNavigateTab('provider')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-amber-900 dark:text-amber-300">لوحة إدارة مقدمي الخدمة والكباتن</div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">إدارة الطلبات، الأسعار، وحالة التوفر المباشر</div>
            </div>
          </div>
          <span className="text-xs text-amber-600 font-bold">دخول ←</span>
        </button>

        <button
          onClick={() => onNavigateTab('admin')}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right bg-slate-900/5 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-slate-800 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-black text-slate-900 dark:text-white">لوحة المدير والرقابة العامة</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">مراجعة الإعلانات، توثيق الكباتن، وحل النزاعات</div>
            </div>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Admin ←</span>
        </button>

        <button
          onClick={() => {
            alert('تم نسخ رابط منصة فلسطين لمشاركته مع أصدقائك!');
          }}
          className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">مشاركة المنصة مع الأصدقاء</div>
              <div className="text-[11px] text-slate-400">شارك تطبيق فلسطين بلاتفورم</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>
      </div>
    </div>
  );
};
