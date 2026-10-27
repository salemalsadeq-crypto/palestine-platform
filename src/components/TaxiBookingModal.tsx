import React, { useState } from 'react';
import { TaxiBooking } from '../types';
import { Car, MapPin, Navigation, Users, Clock, CheckCircle2, Phone, X } from 'lucide-react';

interface TaxiBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: TaxiBooking[];
  onCreateBooking: (booking: Omit<TaxiBooking, 'id' | 'createdAt' | 'status'>) => void;
}

export const TaxiBookingModal: React.FC<TaxiBookingModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onCreateBooking
}) => {
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [selectedCity, setSelectedCity] = useState('رام الله');
  const [passengers, setPassengers] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!isOpen) return null;

  const cities = ['القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'أريحا'];

  const estimatedFare = 20 + passengers * 5;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLoc || !toLoc) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onCreateBooking({
        fromLocation: fromLoc,
        toLocation: toLoc,
        city: selectedCity,
        passengerCount: passengers,
        fareEstimate: estimatedFare,
        driverName: 'أبو خليل النتشة (تويوتا كامري 2023)',
        driverPhone: '0599112244',
        vehicle: 'تويوتا كامري بيضاء'
      });
      setIsSubmitting(false);
      setOrderPlaced(true);
      setFromLoc('');
      setToLoc('');
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-navy-800 dark:bg-navy-950 text-white p-4 flex items-center justify-between z-10 border-b border-navy-700 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400 text-navy-900">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">خدمة طلب تاكسي فلسطين 🚕</h2>
              <p className="text-[11px] text-slate-300">سائقون معتمدون وعداد دقيق وسرعة في الوصول</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-navy-700 dark:hover:bg-slate-800 text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {orderPlaced && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-4 text-emerald-800 dark:text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">تم تأكيد طلب التاكسي بنجاح!</p>
                <p>تم تعيين أقرب سائق وهو في الطريق إليك الآن (3-5 دقائق).</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* City Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المدينة</label>
              <div className="grid grid-cols-4 gap-1.5">
                {cities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`py-1.5 text-xs rounded-lg font-medium transition ${
                      selectedCity === city
                        ? 'bg-navy-800 dark:bg-emerald-600 text-white font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* From Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                مكان الانطلاق (موقعك الحالي)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fromLoc}
                  onChange={(e) => setFromLoc(e.target.value)}
                  placeholder="مثال: ميدان المنارة، رام الله"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl py-2.5 pr-10 pl-3 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-emerald-500"
                />
                <MapPin className="absolute right-3 top-3 w-4 h-4 text-palestine-green" />
              </div>
            </div>

            {/* To Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوجهة المقصودة</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={toLoc}
                  onChange={(e) => setToLoc(e.target.value)}
                  placeholder="مثال: مستشفى الاستشاري، ضاحية الريحان"
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl py-2.5 pr-10 pl-3 border border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-emerald-500"
                />
                <Navigation className="absolute right-3 top-3 w-4 h-4 text-navy-800 dark:text-emerald-400" />
              </div>
            </div>

            {/* Passenger Count & Fare Estimation */}
            <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>عدد الركاب: {passengers}</span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">سيارة تاكسي مكيفة وخاصة</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  -
                </button>
                <span className="font-bold text-sm px-1 text-slate-900 dark:text-white">{passengers}</span>
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(6, passengers + 1))}
                  className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fare Summary */}
            <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-3 border border-amber-200 dark:border-amber-800/40 flex items-center justify-between text-amber-900 dark:text-amber-300">
              <span className="text-xs font-bold">الأجرة التقديرية للرحلة:</span>
              <span className="text-lg font-black">{estimatedFare} ₪</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-navy-800 dark:bg-emerald-600 hover:bg-navy-900 dark:hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Car className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري البحث عن أقرب سائق...' : 'تأكيد طلب التاكسي الآن'}</span>
            </button>
          </form>

          {/* Active Bookings History */}
          {bookings.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">طلباتك الأخيرة:</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy-900 dark:text-white">
                        من: {b.fromLocation} ← إلى: {b.toLocation}
                      </span>
                      <span className="bg-palestine-green/10 dark:bg-emerald-950/40 text-palestine-green dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        {b.status === 'accepted' ? 'في الطريق إليك' : 'مكتمل'}
                      </span>
                    </div>
                    {b.driverName && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span>السائق: {b.driverName}</span>
                        {b.driverPhone && (
                          <a
                            href={`tel:${b.driverPhone}`}
                            className="text-navy-800 dark:text-amber-400 font-bold flex items-center gap-1 hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            <span>اتصال</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
