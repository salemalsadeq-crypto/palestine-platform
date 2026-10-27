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
        <h2 className="text-xl font-black text-navy-900">السفر والحجوزات السياحية ✈️</h2>
        <p className="text-xs text-slate-500">
          عروض العمرة، تذاكر الطيران، وبرامج العطلات من مكاتب السياحة الفلسطينية المعتمدة
        </p>
      </div>

      <div className="space-y-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="relative h-48 bg-slate-200">
              <img src={pkg.imageUrl} alt={pkg.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 bg-navy-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Plane className="w-3.5 h-3.5" />
                <span>{pkg.destination}</span>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{pkg.durationDays} أيام</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-navy-900">{pkg.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-700">{pkg.officeName}</span>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs text-slate-400 block">ابتداءً من</span>
                  <span className="text-lg font-black text-palestine-green">{pkg.priceIls} ₪</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{pkg.description}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${pkg.phone}`}
                  className="flex items-center gap-1.5 text-xs font-bold text-navy-800 hover:text-navy-900"
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
                  className="bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition active:scale-95"
                >
                  طلب تفاصيل الحجز
                </button>
              </div>

              {selectedPkg?.id === pkg.id && bookedMsg && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-3 rounded-xl flex items-center gap-2 border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
