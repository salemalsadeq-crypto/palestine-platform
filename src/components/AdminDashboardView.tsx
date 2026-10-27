import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Trash2,
  Star,
  RefreshCw,
  Building2,
  Car,
  FileText,
  BadgeCheck,
  Ban,
  DollarSign
} from 'lucide-react';
import { AdItem, ServiceProviderItem, OrderItem } from '../types';

interface AdminDashboardViewProps {
  ads: AdItem[];
  providers: ServiceProviderItem[];
  orders: OrderItem[];
  onApproveAd?: (adId: string) => void;
  onRejectAd?: (adId: string) => void;
  onToggleFeatureAd?: (adId: string) => void;
  onVerifyProvider?: (providerId: string) => void;
}

interface DisputeTicket {
  id: string;
  orderId: string;
  complainant: string;
  respondent: string;
  issue: string;
  amount: number;
  status: 'pending' | 'resolved' | 'investigating';
  createdAt: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  ads: initialAds,
  providers: initialProviders,
  orders,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'providers' | 'disputes' | 'audit'>('overview');
  const [ads, setAds] = useState<AdItem[]>(initialAds);
  const [providers, setProviders] = useState<ServiceProviderItem[]>(initialProviders);
  const [adFilter, setAdFilter] = useState<'all' | 'featured' | 'ramallah' | 'nablus'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Disputes state
  const [disputes, setDisputes] = useState<DisputeTicket[]>([
    {
      id: 'disp-201',
      orderId: 'ord-1002',
      complainant: 'سمير قاسم (نابلس)',
      respondent: 'معرض الأمل للإلكترونيات',
      issue: 'تأخر تسليم الجهاز ولم يتم التواصل من مندوب التوصيل',
      amount: 4900,
      status: 'pending',
      createdAt: 'منذ ساعتين'
    },
    {
      id: 'disp-202',
      orderId: 'ord-1003',
      complainant: 'دعاء كنعان (رام الله)',
      respondent: 'سفريات القدس والخليل',
      issue: 'اختلاف الأجرة المتفق عليها مع السائق بزيادة 15 شيكل',
      amount: 45,
      status: 'investigating',
      createdAt: 'منذ 5 ساعات'
    }
  ]);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', admin: 'مدير المنصة (Admin)', action: 'الموافقة على توثيق الكابتن أحمد جابر', time: 'منذ 10 دقائق', badge: 'توثيق' },
    { id: 'log-2', admin: 'مدير المنصة (Admin)', action: 'تمييز إعلان شقة الطيرة برام الله كإعلان VIP', time: 'منذ 25 دقيقة', badge: 'تمييز' },
    { id: 'log-3', admin: 'فريق الرقابة الآلية', action: 'فحص تلقائي للصور والكلمات المفتاحية: سليم 100%', time: 'منذ ساعة', badge: 'أمان' },
    { id: 'log-4', admin: 'مدير المنصة (Admin)', action: 'تسوية نزاع رقم #disp-199 لصالح المشتري وإرجاع الرصيد', time: 'منذ 3 ساعات', badge: 'نزاع' },
  ]);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleApproveAd = (id: string) => {
    notify(`تمت الموافقة وتثبيت الإعلان (#${id}) بنجاح`);
    setAuditLogs((prev) => [
      { id: `log-${Date.now()}`, admin: 'المدير', action: `الموافقة على الإعلان ${id}`, time: 'الآن', badge: 'موافقة' },
      ...prev
    ]);
  };

  const handleRejectAd = (id: string) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
    notify(`تم حذف ورفض الإعلان (#${id}) لمخالفته المعايير`);
    setAuditLogs((prev) => [
      { id: `log-${Date.now()}`, admin: 'المدير', action: `حذف ورفض الإعلان ${id}`, time: 'الآن', badge: 'رفض' },
      ...prev
    ]);
  };

  const handleToggleFeature = (id: string) => {
    setAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
    );
    notify(`تم تحديث شارة التميز VIP للإعلان (#${id})`);
  };

  const handleToggleProviderVerification = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isVerified: !p.isVerified } : p))
    );
    const target = providers.find((p) => p.id === id);
    notify(`تم تعديل حالة توثيق المزود: ${target?.displayName}`);
    setAuditLogs((prev) => [
      { id: `log-${Date.now()}`, admin: 'المدير', action: `تعديل توثيق المزود ${target?.displayName}`, time: 'الآن', badge: 'توثيق' },
      ...prev
    ]);
  };

  const handleResolveDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'resolved' } : d))
    );
    notify(`تمت تسوية النزاع (#${id}) بنجاح`);
  };

  // Filtered ads
  const filteredAds = ads.filter((ad) => {
    if (adFilter === 'featured' && !ad.isFeatured) return false;
    if (adFilter === 'ramallah' && !ad.city.includes('رام الله')) return false;
    if (adFilter === 'nablus' && !ad.city.includes('نابلس')) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return ad.title.toLowerCase().includes(q) || ad.city.toLowerCase().includes(q) || ad.category.toLowerCase().includes(q);
    }
    return true;
  });

  const totalVolume = orders.reduce((acc, curr) => acc + curr.totalAmount, 0) + 128500;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {actionNotice}
          </span>
          <button onClick={() => setActionNotice(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 text-white p-5 sm:p-6 border border-slate-800 shadow-xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-palestine-red to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-900/30">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">لوحة المدير والرقابة العامة</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  Admin Master 🛡️
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                إدارة الإعلانات، توثيق الكباتن والحرفيين، حل النزاعات ومتابعة مؤشرات المنصة في فلسطين
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-700 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-slate-200">النظام يعمل بكفاءة 99.9%</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'overview', label: 'المؤشرات العامة', icon: TrendingUp },
            { id: 'ads', label: `إدارة الإعلانات (${ads.length})`, icon: ShoppingBag },
            { id: 'providers', label: `المزودين والكباتن (${providers.length})`, icon: Car },
            { id: 'disputes', label: `النزاعات (${disputes.filter(d => d.status !== 'resolved').length})`, icon: AlertTriangle },
            { id: 'audit', label: 'سجل النشاط الإداري', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* 4 Quick Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي الإعلانات النشطة</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{ads.length}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
                +18% هذا الأسبوع ↑
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مقدمو الخدمة المعتمدون</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{providers.length}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 inline-block">
                {providers.filter(p => p.isVerified).length} موثق رسمياً ✅
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">حجم التداولات المتوقع</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{totalVolume.toLocaleString()} ₪</div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 inline-block">
                شيكل في السوق الفلسطيني
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">النزاعات والشكاوى</span>
                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{disputes.length}</div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-1 inline-block">
                {disputes.filter(d => d.status === 'pending').length} بانتظار البت
              </span>
            </div>
          </div>

          {/* Quick Actions & Governance Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">إجراءات الرقابة السريعة</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setActiveTab('ads');
                  setAdFilter('featured');
                }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-right transition"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">مراجعة الإعلانات المميزة</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">فحص اشتراكات الـ VIP</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('providers')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-right transition"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">فحص وثائق السائقين الجدد</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">منح الشارات الموثقة</div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('disputes')}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-right transition"
              >
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">تسوية الشكاوى المعلقة</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">حماية حقوق المشترين</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADS MODERATION */}
      {activeTab === 'ads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث عن إعلان بالاسم أو المدينة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'featured', label: 'المميزة ⭐' },
                { id: 'ramallah', label: 'رام الله' },
                { id: 'nablus', label: 'نابلس' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAdFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
                    adFilter === f.id
                      ? 'bg-navy-900 dark:bg-navy-800 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Ads */}
          <div className="space-y-2.5">
            {filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl">
                    {ad.imageUrl ? (
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ad.category}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">📍 {ad.city}</span>
                      {ad.isFeatured && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          VIP مميز ⭐
                        </span>
                      )}
                    </div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-1">
                      {ad.title}
                    </h4>
                    <div className="text-xs font-black text-palestine-green mt-0.5">
                      {ad.price.toLocaleString()} ₪
                      {ad.userPhone && <span className="text-[11px] text-slate-400 font-normal mr-2">هاتف المعلن: {ad.userPhone}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleToggleFeature(ad.id)}
                    title="تبديل تمييز VIP"
                    className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                      ad.isFeatured
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                    <span className="hidden sm:inline">{ad.isFeatured ? 'مميز' : 'تمييز VIP'}</span>
                  </button>

                  <button
                    onClick={() => handleApproveAd(ad.id)}
                    className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">موافقة</span>
                  </button>

                  <button
                    onClick={() => handleRejectAd(ad.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">حذف</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROVIDERS & CAPTAINS */}
      {activeTab === 'providers' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
              إدارة واعتماد مقدمي الخدمات وكباتن التاكسي
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك هنا منح شارة التوثيق الرسمية أو تعليق الحسابات غير الملتزمة بمعايير المنصة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {providers.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy-100 dark:bg-navy-900/50 text-navy-800 dark:text-navy-300 flex items-center justify-center font-black text-lg">
                      {p.serviceType === 'taxi' ? '🚕' : '🔧'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{p.displayName}</h4>
                        {p.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        📍 {p.city} · {p.serviceType === 'taxi' ? 'كابتن تاكسي' : 'فني وحرفي'}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      p.isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {p.isAvailable ? 'متاح للعمل' : 'غير متصل'}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl flex items-center justify-between">
                  <span>هاتف المزود: {p.phone}</span>
                  <span className="font-bold">⭐ {p.rating} / 5</span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    حالة التوثيق: {p.isVerified ? 'معتمد رسمياً' : 'غير موثق'}
                  </span>
                  <button
                    onClick={() => handleToggleProviderVerification(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      p.isVerified
                        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>{p.isVerified ? 'إلغاء التوثيق' : 'توثيق الحساب'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES & RESOLUTION */}
      {activeTab === 'disputes' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
              مركز فض النزاعات وحماية المشترين
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              متابعة الشكاوى المفتوحة بين المشترين والمتاجر أو السائقين لحفظ حقوق الجميع.
            </p>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-navy-900 dark:text-white">
                      تذكرة نزاع #{d.id}
                    </span>
                    <span className="text-[10px] text-slate-400">مرتبطة بالطلب {d.orderId}</span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      d.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {d.status === 'resolved' ? 'تمت التسوية بنجاح ✅' : 'قيد المتابعة ⚠️'}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span><strong>الشاكي:</strong> {d.complainant}</span>
                    <span><strong>المشتكى عليه:</strong> {d.respondent}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 pt-1">
                    <strong>سبب الشكوى:</strong> {d.issue}
                  </p>
                  <div className="text-amber-600 dark:text-amber-400 font-bold pt-1">
                    المبلغ المتنازع عليه: {d.amount} ₪
                  </div>
                </div>

                {d.status !== 'resolved' && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleResolveDispute(d.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                    >
                      إقرار التسوية وإغلاق التذكرة
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
              سجل التدقيق والأمان الإداري (Audit Log)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تسجيل غير قابل للتعديل لجميع العمليات الإدارية التي تمت على المنصة.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-navy-800 dark:bg-navy-400" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white">{log.admin}</span>
                    <p className="text-slate-600 dark:text-slate-300 mt-0.5">{log.action}</p>
                  </div>
                </div>
                <div className="text-left flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {log.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
