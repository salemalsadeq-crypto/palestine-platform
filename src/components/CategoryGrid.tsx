import React from 'react';
import { TabKey } from './BottomNav';
import { ShoppingBag, Car, Compass, Film, UtensilsCrossed, Package, Plane, ChevronLeft, Sparkles } from 'lucide-react';

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
      emoji: '🛒',
      accentColor: 'from-emerald-500/15 via-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/30',
      badge: 'بيع وشراء',
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      action: () => onSelectTab('ads')
    },
    {
      title: 'طلب تاكسي وتوصيل',
      desc: 'سائقون معتمدون وحساب فوري للأجرة بالشيكل',
      icon: Car,
      emoji: '🚕',
      accentColor: 'from-amber-500/15 via-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500 text-slate-950 shadow-amber-500/30',
      badge: 'حجز فوري',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200/80',
      action: () => onSelectTab('taxi')
    },
    {
      title: 'الخريطة والأماكن',
      desc: 'دليل جغرافي حي للمحلات والمطاعم والمعالم',
      icon: Compass,
      emoji: '🗺️',
      accentColor: 'from-blue-500/15 via-blue-500/5 to-transparent',
      iconBg: 'bg-navy-800 text-white shadow-navy-800/30',
      badge: 'حولك الآن',
      badgeColor: 'bg-blue-50 text-navy-800 border-blue-200/80',
      action: () => onSelectTab('places')
    },
    {
      title: 'ريلز فلسطين',
      desc: 'فيديوهات قصيرة لعروض حية وأجواء تراثية',
      icon: Film,
      emoji: '🎬',
      accentColor: 'from-rose-500/15 via-rose-500/5 to-transparent',
      iconBg: 'bg-palestine-red text-white shadow-red-500/30',
      badge: 'فيديوهات حصرية',
      badgeColor: 'bg-rose-50 text-rose-800 border-rose-200/80',
      action: () => onSelectSpecial('reels')
    },
    {
      title: 'المطاعم والحلويات',
      desc: 'الكنافة النابلسية والأكلات الفلسطينية الأصيلة',
      icon: UtensilsCrossed,
      emoji: '🍔',
      accentColor: 'from-orange-500/15 via-orange-500/5 to-transparent',
      iconBg: 'bg-amber-600 text-white shadow-amber-600/30',
      badge: 'أطايب بلادي',
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200/80',
      action: () => onSelectSpecial('restaurants')
    },
    {
      title: 'طلباتي ومشترياتي',
      desc: 'تتبع الشحنات والدفع عند الاستلام (COD)',
      icon: Package,
      emoji: '📦',
      accentColor: 'from-indigo-500/15 via-indigo-500/5 to-transparent',
      iconBg: 'bg-indigo-600 text-white shadow-indigo-600/30',
      badge: 'تتبع المندوب',
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
      action: () => onSelectTab('orders')
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 bg-palestine-red rounded-full" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">الأقسام والخدمات</h2>
        </div>
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>خدمات شاملة</span>
        </span>
      </div>

      {/* Grid of Category Tiles */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {tiles.map((tile, idx) => {
          const IconComponent = tile.icon;
          return (
            <button
              key={idx}
              onClick={tile.action}
              className={`group relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 text-right active:scale-[0.98] flex flex-col justify-between`}
            >
              {/* Subtle Ambient Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tile.accentColor} opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              {/* Card Top */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${tile.iconBg} flex items-center justify-center text-xl shadow-md group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-2xs ${tile.badgeColor}`}
                  >
                    {tile.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-navy-800 transition-colors">
                  {tile.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {tile.desc}
                </p>
              </div>

              {/* Card Bottom CTA */}
              <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-extrabold text-navy-800">
                <span className="text-[11px] text-slate-400 group-hover:text-navy-800 transition-colors">
                  تصفح الآن
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-navy-800 group-hover:text-white flex items-center justify-center transition-all duration-200 group-hover:-translate-x-1">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          );
        })}

        {/* Travel Banner spanning full width with luxury gradient */}
        <button
          onClick={() => onSelectSpecial('travel')}
          className="col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 text-right flex items-center justify-between active:scale-[0.99] border border-navy-700/80"
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
