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
      <div className="group bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <ShoppingBag className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{adsCount}</div>
        <div className="text-[11px] text-slate-500 font-bold mt-0.5">إعلان نشط</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>

      <div className="group bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-navy-800 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <Compass className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{placesCount}</div>
        <div className="text-[11px] text-slate-500 font-bold mt-0.5">مكان ومحل</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-navy-800 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>

      <div className="group bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 shadow-2xs group-hover:scale-110 transition-transform">
          <Wrench className="w-4 h-4" />
        </div>
        <div className="font-black text-slate-900 text-lg sm:text-xl tracking-tight">{servicesCount}</div>
        <div className="text-[11px] text-slate-500 font-bold mt-0.5">مقدم خدمة</div>
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
      </div>
    </div>
  );
};
