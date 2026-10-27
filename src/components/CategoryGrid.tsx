import React from 'react';
import { TabKey } from './BottomNav';
import {
  ShoppingBag,
  Car,
  Compass,
  Film,
  UtensilsCrossed,
  Package,
  Plane,
  ChevronLeft,
  Sparkles,
  Wrench,
  ShieldCheck,
  Coins
} from 'lucide-react';

interface CategoryGridProps {
  onSelectTab: (tab: TabKey) => void;
  onSelectSpecial: (type: 'reels' | 'travel' | 'restaurants') => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  onSelectTab,
  onSelectSpecial
}) => {
  const tiles = [
    {
      title: 'الإعلانات المبوبة',
      desc: 'سوق متكامل للسيارات، العقارات، والإلكترونيات',
      icon: ShoppingBag,
      accentColor: 'from-emerald-500/15 via-emerald-500/5 to-transparent dark:from-emerald-500/25',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30',
      badge: 'بيع وشراء',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      action: () => onSelectTab('ads')
    },
    {
      title: 'ريلز فلسطين',
      desc: 'فيديوهات قصيرة لعروض حية وأجواء وتراث بلادي',
      icon: Film,
      accentColor: 'from-rose-500/15 via-rose-500/5 to-transparent dark:from-rose-500/25',
      iconBg: 'bg-palestine-red text-white shadow-red-500/30',
      badge: 'فيديوهات حصرية 🎬',
      badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      action: () => onSelectTab('reels')
    },
    {
      title: 'الخريطة والأماكن',
      desc: 'دليل جغرافي حي تفاعلي للمحلات والمعالم والتاكسي',
      icon: Compass,
      accentColor: 'from-blue-500/15 via-blue-500/5 to-transparent dark:from-blue-500/25',
      iconBg: 'bg-navy-800 text-white shadow-navy-800/30',
      badge: 'الخريطة الحية 🗺️',
      badgeColor: 'bg-blue-50 dark:bg-blue-950/60 text-navy-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
      action: () => onSelectTab('places')
    },
    {
      title: 'نقاط ومكافآت فلسطين',
      desc: 'استبدل نقاطك بقسائم خصم للتاكسي، توصيل مجاني، وهدايا',
      icon: Coins,
      accentColor: 'from-amber-400/20 via-yellow-400/10 to-transparent dark:from-amber-400/30',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/30',
      badge: 'برنامج الولاء 🪙',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      action: () => onSelectTab('points')
    },
    {
      title: 'لوحة إدارة مقدمي الخدمة',
      desc: 'إدارة الطلبات، قبول المشاوير، وتحديد الأسعار والتوفر',
      icon: Wrench,
      accentColor: 'from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/25',
      iconBg: 'bg-amber-600 text-white shadow-amber-600/30',
      badge: 'بوابة المزودين 🔧',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      action: () => onSelectTab('provider')
    },
    {
      title: 'لوحة المدير والرقابة',
      desc: 'إدارة الإعلانات، توثيق الكباتن، وحل النزاعات والإحصائيات',
      icon: ShieldCheck,
      accentColor: 'from-indigo-500/15 via-indigo-500/5 to-transparent dark:from-indigo-500/25',
      iconBg: 'bg-slate-900 dark:bg-slate-800 text-emerald-400 shadow-slate-900/30 border border-emerald-500/30',
      badge: 'لوحة التحكم 🛡️',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800/60',
      action: () => onSelectTab('admin')
    },
    {
      title: 'طلب تاكسي فوري',
      desc: 'سائقون معتمدون وحساب فوري للأجرة بالشيكل',
      icon: Car,
      accentColor: 'from-yellow-500/15 via-yellow-500/5 to-transparent dark:from-yellow-500/25',
      iconBg: 'bg-amber-500 text-slate-950 shadow-amber-500/30',
      badge: 'حجز فوري 🚕',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      action: () => onSelectTab('taxi')
    },
    {
      title: 'المطاعم والحلويات',
      desc: 'الكنافة النابلسية والأكلات الفلسطينية الأصيلة',
      icon: UtensilsCrossed,
      accentColor: 'from-orange-500/15 via-orange-500/5 to-transparent dark:from-orange-500/25',
      iconBg: 'bg-orange-600 text-white shadow-orange-600/30',
      badge: 'أطايب بلادي 🍯',
      badgeColor: 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200/80 dark:border-orange-800/60',
      action: () => onSelectTab('places')
    },
    {
      title: 'طلباتي ومشترياتي',
      desc: 'تتبع الشحنات والدفع عند الاستلام (COD)',
      icon: Package,
      accentColor: 'from-teal-500/15 via-teal-500/5 to-transparent dark:from-teal-500/25',
      iconBg: 'bg-teal-600 text-white shadow-teal-600/30',
      badge: 'تتبع الشحنة 📦',
      badgeColor: 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60',
      action: () => onSelectTab('orders')
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-palestine-red rounded-full" />
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">الأقسام والخدمات الرئيسية</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>كل فلسطين في مكان واحد</span>
        </span>
      </div>

      {/* Grid of Category Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((tile, idx) => {
          const IconComponent = tile.icon;
          return (
            <button
              key={idx}
              onClick={tile.action}
              className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 text-right active:scale-[0.98] flex flex-col justify-between"
            >
              {/* Subtle Ambient Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tile.accentColor} opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              {/* Card Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl ${tile.iconBg} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${tile.badgeColor}`}
                  >
                    {tile.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-navy-800 dark:group-hover:text-emerald-400 transition-colors">
                  {tile.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tile.desc}
                </p>
              </div>

              {/* Card Bottom CTA */}
              <div className="relative z-10 mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-extrabold text-navy-800 dark:text-emerald-400">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 group-hover:text-navy-800 dark:group-hover:text-emerald-400 transition-colors">
                  تصفح القسم
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-navy-800 dark:group-hover:text-slate-950 group-hover:text-white dark:group-hover:bg-emerald-500 flex items-center justify-center transition-all duration-200 group-hover:-translate-x-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Travel Banner spanning full width with luxury gradient */}
        <button
          onClick={() => onSelectSpecial('travel')}
          className="col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 text-right flex items-center justify-between active:scale-[0.99] border border-navy-700/80 dark:border-slate-800"
        >
          {/* Subtle Glow Overlays */}
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-1/4 -top-8 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3.5 sm:gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center text-2xl shadow-lg shadow-sky-500/30 group-hover:rotate-6 transition-transform">
              <Plane className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base text-white">السفر والحجوزات السياحية</h3>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  عروض حصرية ✈️
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
                مكاتب السياحة المعتمدة، رحلات العمرة، عطلات تركيا ومصر وشرم الشيخ
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1 text-xs font-black text-amber-300 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl group-hover:bg-white/20 transition-all border border-white/10 group-hover:-translate-x-1">
            <span>عرض العروض</span>
            <ChevronLeft className="w-4 h-4" />
          </div>
        </button>
      </div>
    </div>
  );
};
