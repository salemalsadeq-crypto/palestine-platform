import React, { useState } from 'react';
import { ServiceProviderItem } from '../types';
import { Wrench, Phone, Star, ShieldCheck, Car, Package, Utensils, Truck } from 'lucide-react';

interface ServicesViewProps {
  providers: ServiceProviderItem[];
  onBookService: (provider: ServiceProviderItem) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ providers, onBookService }) => {
  const [selectedType, setSelectedType] = useState<string>('الكل');
  const [selectedCity, setSelectedCity] = useState<string>('الكل');

  const types = [
    { id: 'الكل', label: 'الكل', icon: null },
    { id: 'taxi', label: 'تاكسي', icon: Car },
    { id: 'delivery', label: 'توصيل وشحن', icon: Package },
    { id: 'home', label: 'صيانة منزلية', icon: Wrench },
    { id: 'food', label: 'مطابخ وولائم', icon: Utensils },
    { id: 'transport', label: 'نقل أثاث وبضائع', icon: Truck },
  ];

  const cities = ['الكل', 'القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين'];

  const filteredProviders = providers.filter((p) => {
    const matchType = selectedType === 'الكل' || p.serviceType === selectedType;
    const matchCity = selectedCity === 'الكل' || p.city === selectedCity;
    return matchType && matchCity;
  });

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-navy-900">دليل الخدمات والمهنيين ⚡</h2>
        <p className="text-xs text-slate-500">
          توصيل، صيانة، أعمال منزلية، ونقل بأسعار شفافة وفنيين معتمدين في فلسطين
        </p>
      </div>

      {/* Service Type Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition active:scale-95 flex items-center gap-1 ${
              selectedType === t.id
                ? 'bg-navy-800 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {t.icon && <t.icon className="w-3.5 h-3.5" />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* City Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
              selectedCity === city
                ? 'bg-palestine-green text-white font-bold'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Providers List */}
      <div className="space-y-3">
        {filteredProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-navy-800/10 text-navy-800 flex items-center justify-center text-2xl font-bold">
                  {provider.serviceType === 'taxi'
                    ? '🚕'
                    : provider.serviceType === 'delivery'
                    ? '📦'
                    : provider.serviceType === 'home'
                    ? '🛠️'
                    : '🍳'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-navy-900">{provider.displayName}</h3>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>📍 {provider.city}</span>
                    {provider.vehicleType && <span>· {provider.vehicleType}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{provider.rating}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500">السعر الأساسي:</span>
                <span className="font-extrabold text-sm text-palestine-green mr-1.5">
                  يبدأ من {provider.basePrice} ₪
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${provider.contactPhone}`}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="اتصال"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <button
                  onClick={() => onBookService(provider)}
                  className="bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs px-3 py-2 rounded-lg transition active:scale-95"
                >
                  طلب الخدمة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
