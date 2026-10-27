import React from 'react';
import { ShieldCheck, Heart, ShoppingBag, Car, MapPin, Share2, Award, Phone } from 'lucide-react';
import { TabKey } from './BottomNav';

interface ProfileViewProps {
  onNavigateTab: (tab: TabKey) => void;
  favoritesCount: number;
  adsCount: number;
  ordersCount: number;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigateTab,
  favoritesCount,
  adsCount,
  ordersCount
}) => {
  return (
    <div className="space-y-4 pb-20">
      {/* User Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 text-center space-y-3">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full bg-navy-800 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            🇵🇸
          </div>
          <div className="absolute bottom-0 left-0 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-black text-navy-900">المستخدم الفلسطيني</h2>
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>القدس الشريف / رام الله · حساب موثق</span>
          </p>
          <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-full mt-2 border border-amber-200">
            <Award className="w-3.5 h-3.5" />
            <span>عضو موثوق في فلسطين بلاتفورم</span>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
          <button
            onClick={() => onNavigateTab('ads')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
          >
            <div className="font-black text-navy-900 text-base">{adsCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">إعلاناتي</div>
          </button>

          <button
            onClick={() => onNavigateTab('ads')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
          >
            <div className="font-black text-palestine-red text-base">{favoritesCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">المفضلة</div>
          </button>

          <button
            onClick={() => onNavigateTab('orders')}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
          >
            <div className="font-black text-palestine-green text-base">{ordersCount}</div>
            <div className="text-[11px] text-slate-500 font-medium">طلباتي</div>
          </button>
        </div>
      </div>

      {/* Profile Sections Links */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-2">
        <h3 className="font-bold text-xs text-slate-400 mb-2">إدارة الحساب</h3>

        <button
          onClick={() => onNavigateTab('ads')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-navy-800/10 text-navy-800">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-900">إدارة إعلاناتي المعروضة</div>
              <div className="text-[11px] text-slate-400">تعديل أو تجديد إعلاناتك النشطة</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>

        <button
          onClick={() => onNavigateTab('taxi')}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-900">سجل رحلات التاكسي</div>
              <div className="text-[11px] text-slate-400">عرض الرحلات السابقة وحالة السائقين</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>

        <button
          onClick={() => {
            alert('تم نسخ رابط منصة فلسطين لمشاركته مع أصدقائك!');
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-right"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-navy-900">مشاركة المنصة مع الأصدقاء</div>
              <div className="text-[11px] text-slate-400">شارك تطبيق فلسطين بلاتفورم</div>
            </div>
          </div>
          <span className="text-xs text-slate-400">←</span>
        </button>
      </div>
    </div>
  );
};
