import React, { useState } from 'react';
import { ServiceProviderItem, ProviderReview } from '../types';
import { INITIAL_PROVIDER_REVIEWS } from '../data/mockData';
import {
  Wrench,
  Phone,
  Star,
  ShieldCheck,
  Car,
  Package,
  Utensils,
  Truck,
  QrCode,
  MessageSquare,
  CheckCircle2,
  X,
  PlusCircle,
  ThumbsUp,
  User,
  Sparkles,
  MapPin,
  Clock,
  ArrowUpDown
} from 'lucide-react';

interface ServicesViewProps {
  providers: ServiceProviderItem[];
  onBookService?: (provider: ServiceProviderItem) => void;
  onOpenQrScanner?: () => void;
  onEarnPoints?: (amount: number, reason: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({
  providers: initialProviders,
  onBookService,
  onOpenQrScanner,
  onEarnPoints
}) => {
  // Local state for providers and reviews to allow live rating updates
  const [providers, setProviders] = useState<ServiceProviderItem[]>(initialProviders);
  const [reviews, setReviews] = useState<ProviderReview[]>(INITIAL_PROVIDER_REVIEWS);

  // Filters & Sorting
  const [selectedType, setSelectedType] = useState<string>('الكل');
  const [selectedCity, setSelectedCity] = useState<string>('الكل');
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'price'>('rating');

  // Modals state
  const [selectedProviderForReviews, setSelectedProviderForReviews] = useState<ServiceProviderItem | null>(null);
  const [bookingModalProvider, setBookingModalProvider] = useState<ServiceProviderItem | null>(null);
  const [reviewModalProvider, setReviewModalProvider] = useState<ServiceProviderItem | null>(null);
  const [bookingStep, setBookingStep] = useState<'request' | 'completed_rating'>('request');

  // Review Form State
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState<string>('');
  const [newCustomerCity, setNewCustomerCity] = useState<string>('رام الله');
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const types = [
    { id: 'الكل', label: 'الكل', icon: null },
    { id: 'taxi', label: 'تاكسي', icon: Car },
    { id: 'delivery', label: 'توصيل وشحن', icon: Package },
    { id: 'home', label: 'صيانة منزلية', icon: Wrench },
    { id: 'food', label: 'مطابخ وولائم', icon: Utensils },
    { id: 'transport', label: 'نقل أثاث وبضائع', icon: Truck },
  ];

  const cities = ['الكل', 'القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'أريحا'];

  // Helper: get reviews for specific provider
  const getProviderReviews = (providerId: string) => {
    return reviews.filter((r) => r.providerId === providerId);
  };

  // Helper: calculate live average rating for a provider
  const getProviderAverage = (providerId: string, fallbackRating: number) => {
    const provReviews = getProviderReviews(providerId);
    if (provReviews.length === 0) return fallbackRating;
    const sum = provReviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((sum / provReviews.length).toFixed(1));
  };

  // Quick review suggestion tags
  const availableTags = [
    'دقيق في الموعد ⏱️',
    'أمانة عالية 🛡️',
    'مركبة نظيفة ومكيفة 🚗',
    'سعر منصف ومناسب 💰',
    'شغل احترافي ومتقن 🛠️',
    'تعامل راقي ومهذب 🤝',
    'توصيل سريع ⚡'
  ];

  const toggleQuickTag = (tag: string) => {
    if (quickTags.includes(tag)) {
      setQuickTags(quickTags.filter((t) => t !== tag));
      setNewComment((prev) => prev.replace(`${tag} `, '').trim());
    } else {
      setQuickTags([...quickTags, tag]);
      setNewComment((prev) => (prev ? `${prev} - ${tag}` : tag));
    }
  };

  // Handle submitting review
  const handleSubmitReview = (providerId: string) => {
    if (!newComment.trim() && quickTags.length === 0) {
      showToast('يرجى كتابة تعليق أو اختيار وسم لوصف تجربتك');
      return;
    }

    const reviewId = `rev-${Date.now()}`;
    const targetProvider = providers.find((p) => p.id === providerId);
    const finalComment = newComment.trim() || quickTags.join(' - ');

    const newReviewItem: ProviderReview = {
      id: reviewId,
      providerId,
      customerName: newCustomerName.trim() || 'زبون منصة فلسطين',
      customerCity: newCustomerCity,
      rating: newRating,
      comment: finalComment,
      serviceType: targetProvider?.serviceType,
      createdAt: 'الآن'
    };

    // Update reviews list
    const updatedReviews = [newReviewItem, ...reviews];
    setReviews(updatedReviews);

    // Recalculate average rating
    const provReviews = updatedReviews.filter((r) => r.providerId === providerId);
    const newAverage = Number((provReviews.reduce((acc, r) => acc + r.rating, 0) / provReviews.length).toFixed(1));

    // Update providers state
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? {
              ...p,
              rating: newAverage,
              reviewsCount: provReviews.length
            }
          : p
      )
    );

    // Reset review form
    setNewComment('');
    setNewCustomerName('');
    setQuickTags([]);
    setReviewModalProvider(null);
    setBookingModalProvider(null);

    if (onEarnPoints) {
      onEarnPoints(25, 'إضافة تقييم ومراجعة لمزود خدمة');
    }

    showToast(`شكراً لك! تم إضافة تقييمك (${newRating} ⭐) وكسبت +25 نقطة فلسطين بنجاح.`);
  };

  // Filtering & Sorting Providers
  const filteredProviders = providers
    .filter((p) => {
      const matchType = selectedType === 'الكل' || p.serviceType === selectedType;
      const matchCity = selectedCity === 'الكل' || p.city === selectedCity;
      const currentAvg = getProviderAverage(p.id, p.rating);
      const matchRating = minRatingFilter === 0 || currentAvg >= minRatingFilter;
      return matchType && matchCity && matchRating;
    })
    .sort((a, b) => {
      const avgA = getProviderAverage(a.id, a.rating);
      const avgB = getProviderAverage(b.id, b.rating);
      const countA = getProviderReviews(a.id).length;
      const countB = getProviderReviews(b.id).length;

      if (sortBy === 'rating') return avgB - avgA;
      if (sortBy === 'reviews') return countB - countA;
      if (sortBy === 'price') return a.basePrice - b.basePrice;
      return 0;
    });

  // Rating labels in Arabic
  const ratingLabels: Record<number, string> = {
    1: 'سيء جداً 😞',
    2: 'يحتاج لتحسين 😐',
    3: 'جيد ومقبول 🙂',
    4: 'ممتاز جداً 😃',
    5: 'استثنائي ومحترف 🌟'
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 left-4 right-4 z-50 max-w-md mx-auto bg-navy-900 dark:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-2xl shadow-2xl flex items-center justify-between border border-emerald-500/30 animate-in slide-in-from-top-4 duration-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white mr-2">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-navy-900 dark:text-white">
              دليل الخدمات والمهنيين المعتمدين ⚡
            </h2>
            <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              تقييمات موثقة ⭐
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            سائقو تاكسي، شحن وتوصيل، صيانة، وولائم مع نظام تقييم شفاف ومراجعات حقيقية من أبناء شعبنا
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onOpenQrScanner && (
            <button
              onClick={onOpenQrScanner}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-yellow-300 text-navy-950 text-xs font-black px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 border border-amber-500/20"
              title="مسح رمز كود مقدم خدمة"
            >
              <QrCode className="w-4 h-4 stroke-[2.5]" />
              <span>مسح QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Service Type Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {types.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`px-3 py-1.5 rounded-2xl whitespace-nowrap font-bold transition active:scale-95 flex items-center gap-1.5 ${
              selectedType === t.id
                ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t.icon && <t.icon className="w-3.5 h-3.5" />}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Filter by City & Rating & Sorting */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-100/80 dark:bg-slate-900/60 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* City Filter */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-slate-400 ml-1 flex-shrink-0">المدينة:</span>
          {cities.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                selectedCity === city
                  ? 'bg-palestine-green text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Rating & Sorting Controls */}
        <div className="flex items-center gap-1.5 text-xs self-end sm:self-center">
          {/* Rating filter chip */}
          <button
            onClick={() => setMinRatingFilter(minRatingFilter === 0 ? 4.8 : 0)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition ${
              minRatingFilter > 0
                ? 'bg-amber-400/20 border-amber-400 text-amber-900 dark:text-amber-300'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
            <span>4.8+ نجوم</span>
          </button>

          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="rating" className="dark:bg-slate-900">الأعلى تقييماً ⭐</option>
              <option value="reviews" className="dark:bg-slate-900">الأكثر مراجعات 💬</option>
              <option value="price" className="dark:bg-slate-900">الأقل سعراً ₪</option>
            </select>
          </div>
        </div>
      </div>

      {/* Providers List */}
      <div className="space-y-3.5">
        {filteredProviders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-2 border border-slate-200 dark:border-slate-800">
            <div className="text-3xl">🔍</div>
            <h3 className="font-black text-slate-800 dark:text-white text-sm">لا يوجد مزودي خدمة يطابقون خيارات البحث</h3>
            <p className="text-xs text-slate-400">جرب تغيير تصنيف الخدمة أو اختيار مدينة أخرى.</p>
          </div>
        ) : (
          filteredProviders.map((provider) => {
            const providerReviews = getProviderReviews(provider.id);
            const averageRating = getProviderAverage(provider.id, provider.rating);

            return (
              <div
                key={provider.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-3.5 hover:shadow-lg transition-all"
              >
                {/* Provider Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-navy-800/10 to-navy-900/20 dark:from-navy-800/40 dark:to-slate-800 text-navy-800 dark:text-navy-300 flex items-center justify-center text-2xl font-bold shadow-xs">
                      {provider.serviceType === 'taxi'
                        ? '🚕'
                        : provider.serviceType === 'delivery'
                        ? '📦'
                        : provider.serviceType === 'home'
                        ? '🛠️'
                        : provider.serviceType === 'food'
                        ? '🍳'
                        : '🚚'}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-black text-sm sm:text-base text-navy-900 dark:text-white">
                          {provider.displayName}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {provider.serviceType === 'taxi'
                            ? 'كابتن تاكسي'
                            : provider.serviceType === 'delivery'
                            ? 'توصيل سريع'
                            : provider.serviceType === 'home'
                            ? 'صيانة منزلية'
                            : 'مطابخ وولائم'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{provider.city}</span>
                        </span>
                        {provider.vehicleType && (
                          <span className="text-slate-400">· {provider.vehicleType}</span>
                        )}
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            provider.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="text-[11px]">
                          {provider.isAvailable ? 'متاح للطلب' : 'غير متاح'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Display Pill with Review Trigger */}
                  <button
                    onClick={() => setSelectedProviderForReviews(provider)}
                    className="flex flex-col items-end gap-0.5 bg-gradient-to-br from-amber-50 to-amber-100/60 dark:from-amber-950/40 dark:to-slate-800/80 hover:from-amber-100 hover:to-amber-200/60 dark:hover:from-amber-900/50 p-2 sm:px-3 sm:py-1.5 rounded-2xl border border-amber-200/80 dark:border-amber-700/40 transition group cursor-pointer text-right"
                    title="انقر لعرض آراء وتقييمات العملاء"
                  >
                    <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-black text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span className="text-slate-900 dark:text-white font-black">{averageRating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">/ 5</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 underline group-hover:text-amber-900">
                      {providerReviews.length} {providerReviews.length === 1 ? 'تقييم' : 'تقييمات'} 💬
                    </span>
                  </button>
                </div>

                {/* Latest Customer Review Snippet */}
                {providerReviews.length > 0 && (
                  <div
                    onClick={() => setSelectedProviderForReviews(provider)}
                    className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-2.5 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-900 dark:text-white">
                        <span>{providerReviews[0].customerName}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: providerReviews[0].rating }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-400 font-normal mr-auto">
                          {providerReviews[0].createdAt}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1 italic">
                        "{providerReviews[0].comment}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Bottom Pricing & Actions */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">التكلفة المبدئية:</span>
                    <span className="font-black text-sm text-palestine-green dark:text-emerald-400 mr-1.5">
                      تبدأ من {provider.basePrice} ₪
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add Review Button */}
                    <button
                      onClick={() => {
                        setReviewModalProvider(provider);
                        setNewRating(5);
                        setNewComment('');
                        setQuickTags([]);
                      }}
                      className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold text-xs px-3 py-2 rounded-xl transition border border-amber-200/80 dark:border-amber-800/60 active:scale-95"
                      title="تقييم المزود وكتابة مراجعة"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>تقييم</span>
                    </button>

                    {/* View Reviews Button */}
                    <button
                      onClick={() => setSelectedProviderForReviews(provider)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                      title="عرض جميع المراجعات"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    {/* Phone Call */}
                    <a
                      href={`tel:${provider.contactPhone}`}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                      title="اتصال مباشر"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {/* Request Service */}
                    <button
                      onClick={() => {
                        setBookingModalProvider(provider);
                        setBookingStep('request');
                      }}
                      className="bg-navy-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition active:scale-95 shadow-md shadow-navy-900/20"
                    >
                      طلب الخدمة ⚡
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: VIEW ALL REVIEWS FOR A PROVIDER */}
      {selectedProviderForReviews && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-right">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                  ⭐
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-navy-900 dark:text-white">
                    تقييمات ومراجعات العملاء
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedProviderForReviews.displayName} (📍 {selectedProviderForReviews.city})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProviderForReviews(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Average Rating Summary Card */}
            {(() => {
              const provReviews = getProviderReviews(selectedProviderForReviews.id);
              const avg = getProviderAverage(selectedProviderForReviews.id, selectedProviderForReviews.rating);
              const fiveStars = provReviews.filter((r) => r.rating === 5).length;
              const fourStars = provReviews.filter((r) => r.rating === 4).length;
              const threeOrLess = provReviews.filter((r) => r.rating <= 3).length;

              return (
                <div className="bg-gradient-to-br from-amber-50/80 to-amber-100/40 dark:from-slate-800 dark:to-slate-800/60 p-4 rounded-2xl border border-amber-200/60 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="text-center sm:text-right">
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1">
                      <span>{avg}</span>
                      <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
                    </div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 mt-1 inline-block">
                      بناءً على {provReviews.length} مراجعة عميل
                    </span>
                  </div>

                  {/* Rating Breakdown bars */}
                  <div className="flex-1 max-w-[200px] space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-slate-500">5 ⭐</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${provReviews.length ? (fiveStars / provReviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="w-4 text-slate-400 text-left">{fiveStars}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-slate-500">4 ⭐</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${provReviews.length ? (fourStars / provReviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="w-4 text-slate-400 text-left">{fourStars}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="w-5 text-slate-500">3-1 ⭐</span>
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{
                            width: `${provReviews.length ? (threeOrLess / provReviews.length) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="w-4 text-slate-400 text-left">{threeOrLess}</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Add Review Trigger inside modal */}
            <button
              onClick={() => {
                setReviewModalProvider(selectedProviderForReviews);
                setSelectedProviderForReviews(null);
              }}
              className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-yellow-300 text-navy-950 font-black text-xs py-2.5 rounded-xl shadow-xs transition"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>أضف تقييمك وتجربتك لهذا المزود</span>
            </button>

            {/* Reviews List */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-300">
                جميع المراجعات المعتمدة ({getProviderReviews(selectedProviderForReviews.id).length}):
              </h4>

              {getProviderReviews(selectedProviderForReviews.id).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  لا توجد مراجعات مسجلة حتى الآن. كن أول من يقيّم هذا المزود!
                </div>
              ) : (
                getProviderReviews(selectedProviderForReviews.id).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-navy-800/10 dark:bg-navy-700 text-navy-800 dark:text-navy-300 flex items-center justify-center font-bold text-xs">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-black text-xs text-slate-900 dark:text-white">
                            {rev.customerName}
                          </span>
                          {rev.customerCity && (
                            <span className="text-[10px] text-slate-400 mr-1.5 font-medium">
                              (📍 {rev.customerCity})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < rev.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 mr-2">{rev.createdAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pr-9">
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BOOK SERVICE & COMPLETE WITH IMMEDIATE REVIEW PROMPT */}
      {bookingModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-right">
            {bookingStep === 'request' ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                      ⚡
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-navy-900 dark:text-white">
                        طلب خدمة فورية
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        {bookingModalProvider.displayName} (📍 {bookingModalProvider.city})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingModalProvider(null)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>الأجرة المقدرة:</span>
                  <span className="text-base font-black text-palestine-green dark:text-emerald-400">
                    {bookingModalProvider.basePrice} ₪
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسمك الكريم:
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: يوسف إبراهيم"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      تفاصيل موقعك وملاحظات الطلب:
                    </label>
                    <textarea
                      rows={2}
                      placeholder="مثال: ميدان الساعة، عمارة الأمل الطابق الثاني..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (onBookService) onBookService(bookingModalProvider);
                      // Transition to simulated completed state to allow instant customer rating
                      setBookingStep('completed_rating');
                    }}
                    className="flex-1 bg-navy-900 hover:bg-black text-white font-black text-xs py-2.5 rounded-xl transition shadow-md"
                  >
                    تأكيد الطلب وتنفيذه 🚀
                  </button>
                  <button
                    onClick={() => setBookingModalProvider(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            ) : (
              /* Step 2: Post-Service Rating & Review Step */
              <div className="space-y-4">
                <div className="text-center space-y-1.5">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl">
                    🎉
                  </div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    تم إتمام تقديم الخدمة بنجاح!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    كيف كانت تجربتك مع <strong>{bookingModalProvider.displayName}</strong>؟ رأيك يساعدنا على دعم الكفاءات الوطنية.
                  </p>
                </div>

                {/* Star Rating Input */}
                <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl text-center space-y-2 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= (hoverRating || newRating);
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(starVal)}
                          className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                              isFilled
                                ? 'fill-amber-400 text-amber-500'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                    {ratingLabels[hoverRating || newRating]} ({newRating} من 5)
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                    وسوم سريعة مقترحة:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleQuickTag(tag)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl transition ${
                          quickTags.includes(tag)
                            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Review */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    مراجعتك وتجربتك بالتفصيل:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="اكتب ملاحظاتك عن الدقة، الأمانة، وسرعة الاستجابة..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleSubmitReview(bookingModalProvider.id)}
                    className="flex-1 bg-palestine-green hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md"
                  >
                    نشر التقييم واعتماد المراجعة ⭐
                  </button>
                  <button
                    onClick={() => {
                      setBookingModalProvider(null);
                      showToast('تم إتمام الطلب بنجاح. شكراً لثقتك!');
                    }}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    تخطي الآن
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: DIRECT REVIEW & RATING SUBMISSION */}
      {reviewModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                  ⭐
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-navy-900 dark:text-white">
                    تقييم المزود: {reviewModalProvider.displayName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    شاركنا تقييمك لمساعدة باقي المستخدمين في فلسطين
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReviewModalProvider(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Star Rating Interactive Selector */}
            <div className="bg-slate-50 dark:bg-slate-800/70 p-4 rounded-2xl text-center space-y-2 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = starVal <= (hoverRating || newRating);
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(starVal)}
                      className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-black text-amber-600 dark:text-amber-400">
                {ratingLabels[hoverRating || newRating]} ({newRating} من 5)
              </div>
            </div>

            {/* Customer Name & City */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسمك:
                </label>
                <input
                  type="text"
                  placeholder="مثال: رامي الخالدي"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المدينة:
                </label>
                <select
                  value={newCustomerCity}
                  onChange={(e) => setNewCustomerCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                >
                  {cities.filter((c) => c !== 'الكل').map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Tags Suggestions */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
                وسوم سريعة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleQuickTag(tag)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                      quickTags.includes(tag)
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                تعليقك وتقييمك النصي:
              </label>
              <textarea
                rows={3}
                placeholder="اكتب تفاصيل تجربتك الصادقة مع المزود..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleSubmitReview(reviewModalProvider.id)}
                className="flex-1 bg-palestine-green hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md"
              >
                نشر التقييم والمراجعة ⭐
              </button>
              <button
                onClick={() => setReviewModalProvider(null)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
