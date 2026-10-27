import React, { useState } from 'react';
import {
  Wrench,
  Car,
  Package,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Settings,
  DollarSign,
  UserCheck,
  ChevronLeft
} from 'lucide-react';
import { ServiceProviderItem } from '../types';

interface ServiceRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: 'taxi' | 'delivery' | 'home';
  fromLocation: string;
  toLocation?: string;
  city: string;
  price: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

interface ProviderDashboardViewProps {
  providers: ServiceProviderItem[];
  onUpdateProviderStatus?: (providerId: string, isAvailable: boolean) => void;
}

export const ProviderDashboardView: React.FC<ProviderDashboardViewProps> = ({
  providers,
  onUpdateProviderStatus
}) => {
  // Select active provider profile (defaults to first provider, e.g. Abu Omar or Captain Ramallah)
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || 'sp-1');
  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];

  const [isAvailable, setIsAvailable] = useState<boolean>(currentProvider?.isAvailable ?? true);
  const [basePrice, setBasePrice] = useState<number>(currentProvider?.basePrice ?? 25);
  const [activeTab, setActiveTab] = useState<'requests' | 'settings' | 'history'>('requests');

  // Provider's incoming requests state
  const [requests, setRequests] = useState<ServiceRequest[]>([
    {
      id: 'req-101',
      customerName: 'طارق الزغير',
      customerPhone: '0599223344',
      serviceType: 'taxi',
      fromLocation: 'ميدان المنارة، رام الله',
      toLocation: 'جامعة بيرزيت - البوابة الرئيسية',
      city: 'رام الله',
      price: 35,
      status: 'pending',
      createdAt: 'منذ 5 دقائق',
      notes: 'راكبان، الدفع كاش عند الوصول'
    },
    {
      id: 'req-102',
      customerName: 'مكتب هندسة نابلس',
      customerPhone: '0598776655',
      serviceType: 'delivery',
      fromLocation: 'شارع رفيديا، نابلس',
      toLocation: 'المنطقة الصناعية الشرقية',
      city: 'نابلس',
      price: 20,
      status: 'accepted',
      createdAt: 'منذ 18 دقيقة',
      notes: 'طرد مستندات ومخططات هندسية مستعجل'
    },
    {
      id: 'req-103',
      customerName: 'سارة الخالدي',
      customerPhone: '0522119988',
      serviceType: 'home',
      fromLocation: 'بيت حنينا، القدس',
      city: 'القدس',
      price: 80,
      status: 'in_progress',
      createdAt: 'منذ 45 دقيقة',
      notes: 'صيانة مكيف سبليت وفحص الغاز'
    },
    {
      id: 'req-104',
      customerName: 'أحمد التميمي',
      customerPhone: '0569334411',
      serviceType: 'taxi',
      fromLocation: 'دوار ابن رشد، الخليل',
      toLocation: 'حلحول، الشارع العام',
      city: 'الخليل',
      price: 25,
      status: 'completed',
      createdAt: 'منذ ساعتين'
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStatus = (reqId: string, newStatus: ServiceRequest['status']) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: newStatus } : r))
    );
    if (newStatus === 'accepted') showToast('تم قبول الطلب! العميل في انتظار وصولك.');
    if (newStatus === 'in_progress') showToast('تم بدء تنفيذ الخدمة / الرحلة بنجاح.');
    if (newStatus === 'completed') showToast('تم إكمال الطلب وإضافة الأجر لمحفظتك! 💰');
    if (newStatus === 'cancelled') showToast('تم إلغاء الطلب.');
  };

  const toggleAvailability = () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    if (onUpdateProviderStatus) {
      onUpdateProviderStatus(currentProvider.id, nextVal);
    }
    showToast(nextVal ? 'أنت الآن متاح لاستقبال الطلبات الفورية 🟢' : 'تم تغيير حالتك إلى غير متاح 🔴');
  };

  // KPIs
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const completedTrips = requests.filter((r) => r.status === 'completed').length;
  const todayEarnings = requests
    .filter((r) => r.status === 'completed' || r.status === 'in_progress')
    .reduce((sum, r) => sum + r.price, 0);

  return (
    <div className="space-y-4 pb-20">
      {/* Toast */}
      {toastMessage && (
        <div className="p-3 bg-navy-900 text-white text-xs font-bold rounded-xl shadow-lg border border-slate-700 flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400">✕</button>
        </div>
      )}

      {/* Provider Header Profile Card */}
      <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-navy-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center text-3xl font-black shadow-md">
              {currentProvider.serviceType === 'taxi'
                ? '🚕'
                : currentProvider.serviceType === 'delivery'
                ? '📦'
                : '🛠️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">{currentProvider.displayName}</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>📍 {currentProvider.city}</span>
                {currentProvider.vehicleType && <span>· {currentProvider.vehicleType}</span>}
                <span className="text-amber-400 font-bold">⭐ {currentProvider.rating}</span>
              </p>
            </div>
          </div>

          {/* Availability Toggle Button */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
            <div className="text-right">
              <div className="text-[11px] text-slate-300">حالة الاستقبال:</div>
              <div className={`text-xs font-black ${isAvailable ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isAvailable ? 'متاح للعمل الآن' : 'غير متاح حالياً'}
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              className="p-1 text-white hover:text-amber-300 transition"
              title="تغيير حالة الاستقبال"
            >
              {isAvailable ? (
                <ToggleRight className="w-8 h-8 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-rose-400" />
              )}
            </button>
          </div>
        </div>

        {/* Switch Profile Dropdown if multiple exist */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">تبديل حساب السائق / المزود:</span>
          <select
            value={selectedProviderId}
            onChange={(e) => {
              setSelectedProviderId(e.target.value);
              const p = providers.find((x) => x.id === e.target.value);
              if (p) {
                setIsAvailable(p.isAvailable);
                setBasePrice(p.basePrice);
              }
            }}
            className="bg-navy-900 text-white text-xs rounded-xl px-2.5 py-1.5 border border-white/20 focus:outline-none"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} ({p.serviceType})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <div className="text-slate-400 text-[11px] font-bold">أرباح اليوم التقديرية</div>
          <div className="text-xl font-black text-palestine-green dark:text-emerald-400 mt-1">
            {todayEarnings} ₪
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <div className="text-slate-400 text-[11px] font-bold">طلبات بانتظار الرد</div>
          <div className="text-xl font-black text-amber-500 mt-1">{pendingCount} طلبات</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <div className="text-slate-400 text-[11px] font-bold">الرحلات المنفذة</div>
          <div className="text-xl font-black text-navy-900 dark:text-white mt-1">{completedTrips} رحلة</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 shadow-sm text-right">
          <div className="text-slate-400 text-[11px] font-bold">السعر الأساسي</div>
          <div className="text-xl font-black text-navy-800 dark:text-amber-400 mt-1">{basePrice} ₪</div>
        </div>
      </div>

      {/* Sub-Tabs: Requests vs Settings */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`py-2 px-4 rounded-xl transition ${
            activeTab === 'requests'
              ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          الطلبات الواردة والرحلات ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 rounded-xl transition ${
            activeTab === 'settings'
              ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
          }`}
        >
          إعدادات التسعير والمركبة ⚙️
        </button>
      </div>

      {/* TAB 1: REQUESTS LIST */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-3 shadow-sm text-right transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-navy-900 dark:text-white">
                      {req.customerName}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                      {req.serviceType === 'taxi'
                        ? '🚕 تاكسي'
                        : req.serviceType === 'delivery'
                        ? '📦 توصيل'
                        : '🛠️ صيانة'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-palestine-green" />
                    <span>من: {req.fromLocation}</span>
                    {req.toLocation && <span> ← إلى: {req.toLocation}</span>}
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-sm font-black text-palestine-green dark:text-emerald-400 block">
                    {req.price} ₪
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      req.status === 'pending'
                        ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                        : req.status === 'accepted'
                        ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300'
                        : req.status === 'in_progress'
                        ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300'
                        : req.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {req.status === 'pending'
                      ? 'بانتظار موافقتك'
                      : req.status === 'accepted'
                      ? 'تم قبولك للطلب'
                      : req.status === 'in_progress'
                      ? 'قيد التنفيذ'
                      : req.status === 'completed'
                      ? 'مكتمل بنجاح'
                      : 'ملغي'}
                  </span>
                </div>
              </div>

              {req.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                  ملاحظات الزبون: {req.notes}
                </div>
              )}

              {/* Action Buttons for Provider */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <a
                  href={`tel:${req.customerPhone}`}
                  className="flex items-center gap-1.5 font-bold text-navy-800 dark:text-amber-400 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>اتصال بالزبون: {req.customerPhone}</span>
                </a>

                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold"
                      >
                        اعتذار
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accepted')}
                        className="px-3.5 py-1.5 rounded-lg bg-palestine-green hover:bg-emerald-700 text-white font-bold shadow-sm"
                      >
                        قبول الطلب
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'in_progress')}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
                    >
                      بدء الرحلة / التنفيذ 🚀
                    </button>
                  )}

                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'completed')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                    >
                      إنهاء وتسليم بنجاح ✅
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 text-right">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            <span>تحديث إعدادات وبيانات مزود الخدمة</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                السعر الأساسي للخدمة (شيكل ₪):
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                المدينة ونطاق التغطية:
              </label>
              <input
                type="text"
                defaultValue={currentProvider.city}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع وطراز المركبة:
              </label>
              <input
                type="text"
                defaultValue={currentProvider.vehicleType || 'مركبة معتمدة'}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                رقم هاتف الاتصال المباشر:
              </label>
              <input
                type="tel"
                defaultValue={currentProvider.contactPhone}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={() => showToast('تم حفظ تحديثات مزود الخدمة بنجاح!')}
            className="w-full py-3 bg-palestine-green hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            حفظ التغييرات
          </button>
        </div>
      )}
    </div>
  );
};
