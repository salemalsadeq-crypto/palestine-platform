import React, { useState } from 'react';
import { TravelPackageItem } from '../types';
import { Plane, Calendar, MapPin, Phone, CheckCircle2, ShieldCheck } from 'lucide-react';

interface TravelViewProps {
  packages: TravelPackageItem[];
}

export const TravelView: React.FC<TravelViewProps> = ({ packages }) => {
  const [selectedPkg, setSelectedPkg] = useState<TravelPackageItem | null>(null);
  const [bookedMsg, setBookedMsg] = useState(false);

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-navy-900 dark:text-white">السفر والحجوزات السياحية ✈️</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          عروض العمرة، تذاكر الطيران، وبرامج العطلات من مكاتب السياحة الفلسطينية المعتمدة
        </p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden hover:shadow-md transition-colors"
          >
            <div className="relative h-48 bg-slate-200 dark:bg-slate-800">
              <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-navy-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-white/10">
                <Plane className="w-3.5 h-3.5" />
                <span>{pkg.destination}</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/10">
                <Calendar className="w-3.5 h-3.5" />
                <span>{pkg.durationDays} أيام</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-navy-900 dark:text-white">{pkg.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{pkg.officeName}</span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-slate-400 dark:text-slate-500 block">ابتداءً من</span>
                  <span className="text-lg font-black text-palestine-green dark:text-emerald-400">{pkg.priceIls} ₪</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{pkg.description}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`tel:${pkg.phone}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-navy-800 dark:text-amber-400 hover:text-navy-900 dark:hover:text-amber-300"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{pkg.phone}</span>
                </a>

                <button
                  onClick={() => {
                    setSelectedPkg(pkg);
                    setBookedMsg(true);
                    setTimeout(() => setBookedMsg(false), 3000);
                  }}
                  className="bg-navy-800 dark:bg-emerald-600 hover:bg-navy-900 dark:hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-sm"
                >
                  طلب تفاصيل الحجز
                </button>
              </div>

              {selectedPkg?.id === pkg.id && bookedMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>تم استلام استفسارك! سيتواصل معك مكتب {pkg.officeName} هاتفياً.</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
