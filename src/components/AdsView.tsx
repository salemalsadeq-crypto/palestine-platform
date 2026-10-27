import React, { useState, useEffect } from 'react';
import { AdItem } from '../types';
import {
  Heart,
  MapPin,
  Phone,
  MessageCircle,
  ShoppingCart,
  Tag,
  Filter,
  X,
  PlusCircle,
  CheckCircle2,
  QrCode
} from 'lucide-react';

interface AdsViewProps {
  ads: AdItem[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenNewAd: () => void;
  onPlaceOrder: (ad: AdItem) => void;
  selectedAdProp?: AdItem | null;
  onSelectAd?: (ad: AdItem | null) => void;
  onOpenQrScanner?: () => void;
}

export const AdsView: React.FC<AdsViewProps> = ({
  ads,
  favorites,
  onToggleFavorite,
  onOpenNewAd,
  onPlaceOrder,
  selectedAdProp,
  onSelectAd,
  onOpenQrScanner
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedCity, setSelectedCity] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [internalSelectedAd, setInternalSelectedAd] = useState<AdItem | null>(null);
  const [showAdQr, setShowAdQr] = useState(false);

  const selectedAd = selectedAdProp !== undefined ? selectedAdProp : internalSelectedAd;
  const setSelectedAd = (ad: AdItem | null) => {
    if (onSelectAd) onSelectAd(ad);
    setInternalSelectedAd(ad);
    setShowAdQr(false);
  };

  const categories = ['الكل', 'عقارات', 'سيارات', 'إلكترونيات', 'أثاث', 'وظائف', 'أخرى'];
  const cities = ['الكل', 'القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 'أريحا', 'غزة'];

  const filteredAds = ads.filter((ad) => {
    const matchCategory = selectedCategory === 'الكل' || ad.category === selectedCategory;
    const matchCity = selectedCity === 'الكل' || ad.city === selectedCity;
    const matchSearch =
      searchQuery === '' ||
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchCity && matchSearch;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>سوق الإعلانات المبوبة</span>
            <span className="text-lg">🛒</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">بيع وشراء مباشر وموثوق في كافة المحافظات الفلسطينية</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-yellow-300 text-navy-950 text-xs font-black px-3 py-2.5 rounded-xl shadow-sm transition active:scale-95"
              title="مسح رمز QR بكاميرا الجهاز"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">مسح QR</span>
            </button>
          )}
          <button
            onClick={onOpenNewAd}
            className="flex items-center gap-1.5 bg-gradient-to-r from-palestine-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-md shadow-emerald-900/20 transition-all active:scale-95 hover:shadow-lg"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>أضف إعلانك</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث في الإعلانات (سيارة، شقة، هاتف، وظيفة)..."
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-2xl py-3 pr-11 pl-4 border border-slate-200/90 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-emerald-500 transition"
        />
        <Filter className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-3 p-0.5 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills with smooth active style */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition-all active:scale-95 ${
              selectedCategory === cat
                ? 'bg-navy-950 dark:bg-emerald-600 text-white shadow-md shadow-navy-950/20 dark:shadow-emerald-950/40 scale-102'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* City Dropdown Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 dark:text-slate-500 font-extrabold whitespace-nowrap">المدينة:</span>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-bold transition-all ${
              selectedCity === city
                ? 'bg-palestine-green text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Ads Count */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between px-1">
        <span>
          تم العثور على <strong className="text-slate-900 dark:text-white">{filteredAds.length}</strong> إعلان
        </span>
        {favorites.length > 0 && (
          <span className="text-[11px] text-palestine-red font-bold flex items-center gap-1">
            <Heart className="w-3 h-3 fill-current" />
            <span>{favorites.length} في المفضلة</span>
          </span>
        )}
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredAds.map((ad) => {
          const isFav = favorites.includes(ad.id);
          return (
            <div
              key={ad.id}
              onClick={() => setSelectedAd(ad)}
              className="cursor-pointer group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              {/* Image banner */}
              <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 text-4xl">
                    🛍️
                  </div>
                )}
                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-navy-950/85 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                    {ad.category}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(ad.id);
                  }}
                  className={`absolute top-2.5 left-2.5 p-2 rounded-full backdrop-blur-md transition-all active:scale-90 ${
                    isFav
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/40'
                      : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                  title="المفضلة"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>

                {ad.deliveryAvailable && (
                  <div className="absolute bottom-2.5 right-2.5">
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>شحن متاح (COD)</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white line-clamp-1 group-hover:text-navy-800 dark:group-hover:text-emerald-400 transition-colors">
                    {ad.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {ad.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    {ad.price > 0 ? (
                      <span className="font-black text-base sm:text-lg text-palestine-green dark:text-emerald-400 tracking-tight">
                        {ad.price.toLocaleString()} ₪
                      </span>
                    ) : (
                      <span className="font-extrabold text-xs text-navy-800 dark:text-emerald-400 bg-navy-800/10 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                        راتب / تواصل
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ad.city}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAds.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center text-slate-500 dark:text-slate-400 space-y-2 border border-slate-200/90 dark:border-slate-800 shadow-sm">
          <div className="text-4xl">🔍</div>
          <p className="font-extrabold text-base text-slate-800 dark:text-white">لا توجد إعلانات مطابقة لمعايير البحث</p>
          <p className="text-xs text-slate-400">جرّب اختيار مدينة أخرى أو تغيير التصنيف.</p>
        </div>
      )}

      {/* Ad Details Modal */}
      {selectedAd && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAd(null)}
              className="absolute top-3 left-3 z-10 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Image */}
            <div className="relative h-64 bg-slate-900">
              {selectedAd.imageUrl ? (
                <img
                  src={selectedAd.imageUrl}
                  alt={selectedAd.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">🛍️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 right-3 bg-navy-950/90 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-xl">
                {selectedAd.category}
              </div>
            </div>

            {/* Modal Details */}
            <div className="p-5 space-y-4 text-right">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedAd.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-palestine-green" />
                      {selectedAd.city} {selectedAd.locationName ? `· ${selectedAd.locationName}` : ''}
                    </span>
                    <span>· {selectedAd.createdAt || 'الآن'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-palestine-green dark:text-emerald-400">
                    {selectedAd.price > 0 ? `${selectedAd.price.toLocaleString()} ₪` : 'تواصل'}
                  </div>
                  {selectedAd.deliveryAvailable && (
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-black border border-emerald-200 dark:border-emerald-800/60">
                      توصيل (15 ₪)
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">تفاصيل الإعلان:</div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {selectedAd.description}
                </p>
              </div>

              {/* QR Code Toggle for Ad */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdQr(!showAdQr)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <QrCode className="w-3.5 h-3.5 text-amber-500" />
                  <span>{showAdQr ? 'إخفاء رمز QR للإعلان' : 'عرض رمز QR لمشاركة الإعلان ومسحه'}</span>
                </button>

                {showAdQr && (
                  <div className="mt-2.5 p-3.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-2 animate-in fade-in">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        selectedAd.id
                      )}`}
                      alt="Ad QR"
                      className="w-36 h-36 mx-auto object-contain bg-white p-1.5 rounded-xl border border-slate-200 dark:border-slate-600 shadow-sm"
                    />
                    <div className="text-[11px] font-mono font-bold text-navy-800 dark:text-amber-400">
                      كود الإعلان: #{selectedAd.id}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      امسح هذا الرمز بكاميرا أي هاتف لفتح تفاصيل الإعلان والطلب فوراً
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`tel:${selectedAd.phone}`}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-navy-900 to-navy-950 hover:from-black hover:to-navy-950 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-95 text-xs shadow-md"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال: {selectedAd.phone}</span>
                </a>

                <a
                  href={`https://wa.me/972${selectedAd.phone.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-palestine-green to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-extrabold py-3.5 rounded-xl transition-all active:scale-95 text-xs shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>واتساب فوري</span>
                </a>
              </div>

              {selectedAd.price > 0 && (
                <button
                  onClick={() => {
                    const ad = selectedAd;
                    setSelectedAd(null);
                    onPlaceOrder(ad);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-900 via-navy-900 to-slate-900 hover:from-indigo-950 hover:to-black text-white font-black py-3.5 rounded-xl shadow-lg transition-all active:scale-95 text-xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>شراء أونلاين / طلب توصيل للمنزل</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
