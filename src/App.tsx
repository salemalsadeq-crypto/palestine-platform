import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, TabKey } from './components/BottomNav';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { CategoryGrid } from './components/CategoryGrid';
import { AdsView } from './components/AdsView';
import { TaxiBookingModal } from './components/TaxiBookingModal';
import { PlacesView } from './components/PlacesView';
import { ServicesView } from './components/ServicesView';
import { ReelsView } from './components/ReelsView';
import { OrdersView } from './components/OrdersView';
import { TravelView } from './components/TravelView';
import { NewAdModal } from './components/NewAdModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileView } from './components/ProfileView';
import { QrScannerModal } from './components/QrScannerModal';
import { ProviderDashboardView } from './components/ProviderDashboardView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { PalestinePointsView } from './components/PalestinePointsView';

import {
  INITIAL_ADS,
  INITIAL_PLACES,
  INITIAL_PROVIDERS,
  INITIAL_REELS,
  INITIAL_TRAVEL,
  INITIAL_ORDERS,
  INITIAL_REWARDS,
  INITIAL_USER_POINTS
} from './data/mockData';
import {
  AdItem,
  TaxiBooking,
  OrderItem,
  ServiceProviderItem,
  UserPointsState,
  RewardItem,
  PointTransaction,
  RedeemedReward
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');
  const [specialView, setSpecialView] = useState<'reels' | 'travel' | null>(null);

  // Dark Mode State with LocalStorage and OS Preference sync
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Core Data States
  const [ads, setAds] = useState<AdItem[]>(INITIAL_ADS);
  const [places, setPlaces] = useState(INITIAL_PLACES);
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [reels, setReels] = useState(INITIAL_REELS);
  const [travel, setTravel] = useState(INITIAL_TRAVEL);
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [favorites, setFavorites] = useState<string[]>(['ad-1', 'ad-3']);

  // Taxi bookings
  const [taxiBookings, setTaxiBookings] = useState<TaxiBooking[]>([
    {
      id: 'tax-1',
      fromLocation: 'ميدان المنارة، رام الله',
      toLocation: 'جامعة بيرزيت',
      city: 'رام الله',
      passengerCount: 2,
      fareEstimate: 30,
      status: 'accepted',
      driverName: 'خالد البرغوثي (تويوتا كامري)',
      driverPhone: '0598112233',
      createdAt: 'منذ نصف ساعة'
    }
  ]);

  // Notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'n-1',
      title: 'قبول طلب التاكسي 🚕',
      message: 'تم قبول طلب رحلتك من ميدان المنارة إلى بيرزيت بنجاح.',
      time: 'منذ نصف ساعة',
      isRead: false,
      type: 'taxi'
    },
    {
      id: 'n-2',
      title: 'تحديث حالة الشحنة 📦',
      message: 'شحنتك للآيفون 15 برو ماكس الآن مع مندوب التوصيل في رام الله.',
      time: 'منذ ساعتين',
      isRead: false,
      type: 'order'
    },
    {
      id: 'n-3',
      title: 'أهلاً بك في منصة فلسطين 🇵🇸',
      message: 'سعداء بانضمامك لمنصة فلسطين الموحدة للإعلانات والخدمات.',
      time: 'اليوم',
      isRead: true,
      type: 'system'
    }
  ]);

  // Modal Dialogs
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [selectedAdForModal, setSelectedAdForModal] = useState<AdItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // User Points State (persisted in localStorage)
  const [userPoints, setUserPoints] = useState<UserPointsState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('palestine_points');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_USER_POINTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('palestine_points', JSON.stringify(userPoints));
    }
  }, [userPoints]);

  const earnPoints = (amount: number, reason: string) => {
    setUserPoints((prev) => {
      const newPoints = prev.currentPoints + amount;
      const newTotal = prev.totalEarned + amount;
      let newLevel = prev.level;
      if (newPoints >= 1500) newLevel = 'بلاتيني';
      else if (newPoints >= 600) newLevel = 'ذهبي';
      else if (newPoints >= 200) newLevel = 'فضي';

      const newTx: PointTransaction = {
        id: `tx-${Date.now()}`,
        type: 'earn',
        amount,
        reason,
        createdAt: 'الآن'
      };

      return {
        ...prev,
        currentPoints: newPoints,
        totalEarned: newTotal,
        level: newLevel,
        transactions: [newTx, ...prev.transactions]
      };
    });
    showToast(`+${amount} نقطة فلسطين! 🇵🇸 (${reason})`);
  };

  const handleRedeemReward = (reward: RewardItem) => {
    if (userPoints.currentPoints < reward.pointsCost) {
      showToast('عفواً، رصيد نقاطك غير كافٍ لاستبدال هذه المكافأة');
      return;
    }

    const voucherCode = `${reward.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRedeemed: RedeemedReward = {
      id: `red-${Date.now()}`,
      rewardId: reward.id,
      rewardTitle: reward.title,
      voucherCode,
      pointsSpent: reward.pointsCost,
      discountValueText: reward.discountValueText,
      partnerName: reward.partnerName,
      redeemedAt: 'الآن',
      status: 'active'
    };

    const newTx: PointTransaction = {
      id: `tx-${Date.now()}`,
      type: 'redeem',
      amount: reward.pointsCost,
      reason: `استبدال مكافأة: ${reward.title}`,
      createdAt: 'الآن'
    };

    setUserPoints((prev) => ({
      ...prev,
      currentPoints: prev.currentPoints - reward.pointsCost,
      redeemedRewards: [newRedeemed, ...prev.redeemedRewards],
      transactions: [newTx, ...prev.transactions]
    }));

    showToast(`تم استبدال المكافأة بنجاح! كود القسيمة: ${voucherCode}`);
  };

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const isAdding = !prev.includes(id);
      if (isAdding) {
        earnPoints(10, 'التفاعل وحفظ إعلان بالمفضلة');
      }
      return isAdding ? [...prev, id] : prev.filter((favId) => favId !== id);
    });
  };

  const handleAddAd = (newAd: AdItem) => {
    setAds((prev) => [newAd, ...prev]);
    showToast('تم نشر إعلانك في المنصة بنجاح!');
    earnPoints(25, 'نشر إعلان جديد في المنصة');
  };

  const handleCreateTaxiBooking = (data: Omit<TaxiBooking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: TaxiBooking = {
      ...data,
      id: `tax-${Date.now()}`,
      status: 'accepted',
      createdAt: 'الآن'
    };
    setTaxiBookings((prev) => [newBooking, ...prev]);
    showToast('تم تأكيد طلب التاكسي! السائق في الطريق.');
    earnPoints(40, 'حجز وتأكيد رحلة تاكسي فورية');
  };

  const handlePlaceOrder = (ad: AdItem) => {
    const newOrder: OrderItem = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      adId: ad.id,
      adTitle: ad.title,
      customerName: 'المستخدم الفلسطيني',
      city: ad.city,
      address: ad.locationName || 'العنوان المسجل',
      quantity: 1,
      unitPrice: ad.price,
      deliveryFee: ad.deliveryFee || 15,
      totalAmount: ad.price + (ad.deliveryFee || 15),
      orderStatus: 'confirmed',
      paymentMethod: 'الدفع عند الاستلام (COD)',
      createdAt: 'الآن'
    };
    setOrders((prev) => [newOrder, ...prev]);
    showToast(`تم إنشاء طلب الشراء بنجاح للإعلان: ${ad.title}`);
    earnPoints(50, 'إتمام طلب شراء سلعة من الإعلانات');
    setCurrentTab('orders');
  };

  const handleBookService = (provider: ServiceProviderItem) => {
    showToast(`تم إرسال طلب الخدمة إلى: ${provider.displayName}`);
    earnPoints(30, 'طلب خدمة مهنية أو فنية');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors">
      {/* Top Navbar */}
      <Navbar
        onOpenNewAd={() => setIsNewAdModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        onSearchClick={() => {
          setCurrentTab('ads');
          setSpecialView(null);
        }}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSpecialView(null);
        }}
        pointsBalance={userPoints.currentPoints}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-5 pb-24">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-18 left-4 right-4 z-50 max-w-md mx-auto bg-navy-900 dark:bg-navy-800 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-200 border border-slate-700/50">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Special Views Overlay / Subscreens */}
        {specialView === 'reels' && (
          <div className="space-y-3">
            <button
              onClick={() => setSpecialView(null)}
              className="text-xs font-bold text-navy-800 dark:text-amber-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              ← العودة للرئيسية
            </button>
            <ReelsView reels={reels} />
          </div>
        )}

        {specialView === 'travel' && (
          <div className="space-y-3">
            <button
              onClick={() => setSpecialView(null)}
              className="text-xs font-bold text-navy-800 dark:text-amber-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              ← العودة للرئيسية
            </button>
            <TravelView packages={travel} />
          </div>
        )}

        {/* Core Tab Views */}
        {!specialView && currentTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <HeroSection
              onSearch={(q) => {
                setCurrentTab('ads');
              }}
              onOpenTaxi={() => setIsTaxiModalOpen(true)}
              liveTaxiCount={providers.filter((p) => p.serviceType === 'taxi' && p.isAvailable).length}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
            />

            {/* Live Stats */}
            <StatsBar
              adsCount={ads.length}
              placesCount={places.length}
              servicesCount={providers.length}
            />

            {/* Category Grid */}
            <CategoryGrid
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setSpecialView(null);
              }}
              onSelectSpecial={(type) => {
                if (type === 'reels' || type === 'travel') {
                  setSpecialView(type);
                } else if (type === 'restaurants') {
                  setCurrentTab('places');
                }
              }}
            />

            {/* Latest Ads Preview */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-navy-900 dark:text-white">أحدث الإعلانات</h2>
                <button
                  onClick={() => setCurrentTab('ads')}
                  className="text-xs font-bold text-navy-800 dark:text-amber-400 hover:underline"
                >
                  عرض جميع الإعلانات ({ads.length}) ←
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ads.slice(0, 4).map((ad) => (
                  <div
                    key={ad.id}
                    onClick={() => {
                      setSelectedAdForModal(ad);
                      setCurrentTab('ads');
                    }}
                    className="cursor-pointer bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3 flex items-center gap-3 hover:shadow-md transition"
                  >
                    <div className="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                      {ad.imageUrl ? (
                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-navy-800 dark:text-navy-300 font-bold bg-navy-800/10 dark:bg-navy-800/30 px-1.5 py-0.5 rounded">
                          {ad.category}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">📍 {ad.city}</span>
                      </div>
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate mt-1">{ad.title}</h3>
                      <div className="font-black text-xs text-palestine-green mt-1">
                        {ad.price > 0 ? `${ad.price.toLocaleString()} ₪` : 'تواصل'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!specialView && currentTab === 'ads' && (
          <AdsView
            ads={ads}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenNewAd={() => setIsNewAdModalOpen(true)}
            onPlaceOrder={handlePlaceOrder}
            selectedAdProp={selectedAdForModal}
            onSelectAd={(ad) => setSelectedAdForModal(ad)}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {!specialView && currentTab === 'taxi' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-5 rounded-2xl text-navy-900 shadow-md">
              <h2 className="text-xl font-black">حجز تاكسي فوري في فلسطين 🚕</h2>
              <p className="text-xs font-medium mt-1">
                سائقون متاحون 24/7 في القدس، رام الله، نابلس، الخليل، وكافة المحافظات.
              </p>
              <button
                onClick={() => setIsTaxiModalOpen(true)}
                className="mt-3 bg-navy-900 hover:bg-black text-amber-300 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition active:scale-95"
              >
                + إنشاء طلب تاكسي جديد
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">رحلاتك النشطة والسابقة:</h3>
              {taxiBookings.map((b) => (
                <div key={b.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-navy-900 dark:text-white">
                      من: {b.fromLocation} ← إلى: {b.toLocation}
                    </span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded">
                      {b.status === 'accepted' ? 'السائق في الطريق' : 'مكتمل'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>المدينة: {b.city} · عدد الركاب: {b.passengerCount}</span>
                    <span className="font-bold text-palestine-green text-sm">{b.fareEstimate} ₪</span>
                  </div>
                  {b.driverName && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">السائق: {b.driverName}</span>
                      {b.driverPhone && (
                        <a
                          href={`tel:${b.driverPhone}`}
                          className="bg-navy-800 dark:bg-navy-700 hover:bg-navy-900 text-white font-bold px-3 py-1 rounded-lg text-[11px]"
                        >
                          اتصال بالسائق
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!specialView && currentTab === 'places' && <PlacesView places={places} />}

        {!specialView && currentTab === 'reels' && (
          <div className="space-y-4">
            <ReelsView reels={reels} />
          </div>
        )}

        {!specialView && currentTab === 'provider' && (
          <ProviderDashboardView
            providers={providers}
            onUpdateProviderStatus={(id, available) =>
              setProviders((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isAvailable: available } : p))
              )
            }
          />
        )}

        {!specialView && currentTab === 'admin' && (
          <AdminDashboardView
            ads={ads}
            providers={providers}
            orders={orders}
            onApproveAd={(adId) => {
              showToast(`تمت الموافقة وتثبيت الإعلان ${adId} بنجاح`);
            }}
            onRejectAd={(adId) => {
              setAds((prev) => prev.filter((a) => a.id !== adId));
              showToast(`تم حذف الإعلان ${adId}`);
            }}
            onToggleFeatureAd={(adId) => {
              setAds((prev) =>
                prev.map((a) => (a.id === adId ? { ...a, isFeatured: !a.isFeatured } : a))
              );
              showToast(`تم تحديث شارة التميز للإعلان`);
            }}
            onVerifyProvider={(providerId) => {
              setProviders((prev) =>
                prev.map((p) =>
                  p.id === providerId ? { ...p, isVerified: !p.isVerified } : p
                )
              );
              showToast(`تم تحديث توثيق المزود`);
            }}
          />
        )}

        {!specialView && currentTab === 'services' && (
          <ServicesView
            providers={providers}
            onBookService={handleBookService}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
            onEarnPoints={earnPoints}
          />
        )}

        {!specialView && currentTab === 'points' && (
          <PalestinePointsView
            userPoints={userPoints}
            rewards={INITIAL_REWARDS}
            onRedeemReward={handleRedeemReward}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              setSpecialView(null);
            }}
          />
        )}

        {!specialView && currentTab === 'orders' && <OrdersView orders={orders} />}

        {!specialView && currentTab === 'profile' && (
          <ProfileView
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              setSpecialView(null);
            }}
            favoritesCount={favorites.length}
            adsCount={ads.length}
            ordersCount={orders.length}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            pointsBalance={userPoints.currentPoints}
          />
        )}
      </main>

      {/* Modals */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        ads={ads}
        providers={providers}
        onOpenAdDetails={(ad) => {
          setSelectedAdForModal(ad);
          setCurrentTab('ads');
          setSpecialView(null);
        }}
        onPlaceOrder={handlePlaceOrder}
        onBookService={handleBookService}
      />

      {/* Modals */}
      <TaxiBookingModal
        isOpen={isTaxiModalOpen}
        onClose={() => setIsTaxiModalOpen(false)}
        bookings={taxiBookings}
        onCreateBooking={handleCreateTaxiBooking}
      />

      <NewAdModal
        isOpen={isNewAdModalOpen}
        onClose={() => setIsNewAdModalOpen(false)}
        onAddAd={handleAddAd}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
          showToast('تم تعليم جميع الإشعارات كمقروءة');
        }}
      />

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSpecialView(null);
        }}
      />
    </div>
  );
}
export default App;
