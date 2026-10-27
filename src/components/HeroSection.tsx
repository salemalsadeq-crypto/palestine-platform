import React, { useState } from 'react';
import { Search, Car, ChevronLeft, MapPin, Sparkles, ShieldCheck, QrCode } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onOpenTaxi: () => void;
  liveTaxiCount: number;
  onOpenQrScanner?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onOpenTaxi,
  liveTaxiCount,
  onOpenQrScanner
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
    }
  };

  const quickChips = [
    { label: '🍔 مطاعم وكنافة', query: 'مطاعم', bg: 'hover:bg-amber-500/20' },
    { label: '🚗 سيارات وتجارة', query: 'سيارات', bg: 'hover:bg-blue-500/20' },
    { label: '🏠 عقارات وشقق', query: 'عقارات', bg: 'hover:bg-emerald-500/20' },
    { label: '📱 إلكترونيات', query: 'إلكترونيات', bg: 'hover:bg-purple-500/20' },
    { label: '⚡ خدمات وصيانة', query: 'خدمات', bg: 'hover:bg-orange-500/20' },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Banner Card with Jerusalem Imagery Overlay */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-slate-950 text-white p-6 sm:p-7 shadow-2xl border border-navy-700/80">
        {/* Authentic Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-20 pointer-events-none scale-105"
          style={{ backgroundImage: "url('/hero-quds.jpg'), url('/jerusalem-home-hero.jpg')" }}
        />

        {/* Ambient Glows */}
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-palestine-green/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-palestine-red/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-emerald-300 border border-white/15 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 -mr-3 rounded-full bg-emerald-400" />
            <span>المنصة الفلسطينية الموحدة · القدس، الضفة، وغزة</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight flex items-center gap-2">
              <span>فلسطين تجمعنا</span>
              <span className="text-2xl sm:text-3xl">🇵🇸</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              سوق إلكتروني معتمد، حجز تاكسي فوري، دليل للأماكن القريبة، وخدمات مهنية في متناول يدك.
            </p>
          </div>

          {/* Elevated Search Bar */}
          <form onSubmit={handleSubmit} className="pt-1">
            <div className="relative flex items-center group">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث عن سيارة، شقة، مطعم، خدمة صيانة، تاكسي..."
                className="w-full bg-white/95 text-slate-900 placeholder-slate-400 text-sm rounded-2xl py-3.5 sm:py-4 pr-12 pl-28 shadow-xl border-2 border-transparent focus:border-palestine-green focus:bg-white focus:outline-none transition-all duration-200"
              />
              <Search className="absolute right-4 w-5 h-5 text-slate-400 group-focus-within:text-palestine-green transition-colors" />
              <button
                type="submit"
                className="absolute left-2.5 bg-gradient-to-r from-navy-800 to-navy-900 hover:from-navy-900 hover:to-black text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Interactive Chips */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {onOpenQrScanner && (
              <button
                type="button"
                onClick={onOpenQrScanner}
                className="bg-amber-400 hover:bg-yellow-300 text-navy-950 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 border border-amber-300 font-black shadow-md flex items-center gap-1.5 flex-shrink-0"
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>مسح كود QR</span>
              </button>
            )}
            {quickChips.map((chip) => (
              <button
                key={chip.query}
                onClick={() => {
                  setSearchInput(chip.query);
                  onSearch(chip.query);
                }}
                className={`bg-white/10 backdrop-blur-md text-slate-200 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 active:scale-95 border border-white/15 font-medium shadow-sm hover:text-white ${chip.bg}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Taxi CTA Banner with Luxury Amber & Gold Design */}
      <div
        onClick={onOpenTaxi}
        className="cursor-pointer group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-amber-400 to-yellow-300 p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 active:scale-[0.99] text-navy-950 flex items-center justify-between border border-amber-300/80"
      >
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-13 h-13 rounded-2xl bg-navy-950 text-amber-400 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Car className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-base sm:text-lg text-navy-950">
                اطلب تاكسي الآن 🚕
              </h2>
              <span className="bg-navy-950 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                متاح 24/7
              </span>
            </div>
            <p className="text-xs sm:text-sm text-navy-900 font-semibold mt-0.5">
              {liveTaxiCount > 0
                ? `${liveTaxiCount} سائقون متاحون بالقرب منك الآن في مدينتك`
                : 'سائقون معتمدون في القدس، رام الله، نابلس، والخليل'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 font-black text-xs sm:text-sm bg-navy-950 text-amber-300 px-4 py-2.5 rounded-xl group-hover:bg-black transition-all shadow-md group-hover:-translate-x-1">
          <span>احجز فوري</span>
          <ChevronLeft className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
