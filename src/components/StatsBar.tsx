import React from 'react';
import { ShoppingBag, Compass, Wrench } from 'lucide-react';

interface StatsBarProps {
  adsCount: number;
  placesCount: number;
  servicesCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  adsCount,
  placesCount,
  servicesCount
}) => {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      <div className="group bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">{adsCount}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">إعلان نشط</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>

      <div className="group bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-navy-800 dark:text-blue-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <Compass className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">{placesCount}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">مكان ومحل</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-navy-800 dark:bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>

      <div className="group bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <Wrench className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 dark:text-white text-lg sm:text-xl tracking-tight">{servicesCount}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">مقدم خدمة</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>
    </div>
  );
};
