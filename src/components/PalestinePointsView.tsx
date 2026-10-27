import React, { useState } from 'react';
import {
  RewardItem,
  RedeemedReward,
  PointTransaction,
  UserPointsState
} from '../types';
import {
  Award,
  Gift,
  Coins,
  Ticket,
  CheckCircle2,
  Copy,
  Clock,
  Sparkles,
  TrendingUp,
  Car,
  Package,
  Utensils,
  ShoppingBag,
  HeartHandshake,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  Info,
  ShieldCheck,
  Check
} from 'lucide-react';

interface PalestinePointsViewProps {
  userPoints: UserPointsState;
  rewards: RewardItem[];
  onRedeemReward: (reward: RewardItem) => void;
  onNavigateTab?: (tab: any) => void;
}

export const PalestinePointsView: React.FC<PalestinePointsViewProps> = ({
  userPoints,
  rewards,
  onRedeemReward,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'vouchers' | 'history' | 'guide'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRewardToRedeem, setSelectedRewardToRedeem] = useState<RewardItem | null>(null);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);
  const [justRedeemedVoucher, setJustRedeemedVoucher] = useState<RedeemedReward | null>(null);

  // Category filter items
  const categories = [
    { id: 'all', label: 'كافة المكافآت', icon: Gift },
    { id: 'taxi', label: 'مشاوير تاكسي', icon: Car },
    { id: 'delivery', label: 'توصيل مجاني', icon: Package },
    { id: 'food', label: 'مطاعم وحلويات', icon: Utensils },
    { id: 'shopping', label: 'هدايا وتسوق', icon: ShoppingBag },
    { id: 'charity', label: 'تبرعات خيرية', icon: HeartHandshake },
  ];

  const filteredRewards = rewards.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.category === selectedCategory;
  });

  // Calculate tier info & next level
  const points = userPoints.currentPoints;
  let currentTier = 'برونزي';
  let nextTier = 'فضي';
  let nextTierPoints = 600;
  let tierProgress = Math.min(100, Math.round((points / 600) * 100));

  if (points >= 1500) {
    currentTier = 'بلاتيني';
    nextTier = 'القمة';
    nextTierPoints = 2000;
    tierProgress = 100;
  } else if (points >= 600) {
    currentTier = 'ذهبي';
    nextTier = 'بلاتيني';
    nextTierPoints = 1500;
    tierProgress = Math.min(100, Math.round(((points - 600) / (1500 - 600)) * 100));
  } else if (points >= 200) {
    currentTier = 'فضي';
    nextTier = 'ذهبي';
    nextTierPoints = 600;
    tierProgress = Math.min(100, Math.round(((points - 200) / (600 - 200)) * 100));
  }

  const handleCopyCode = (code: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedVoucherId(id);
    setTimeout(() => setCopiedVoucherId(null), 3000);
  };

  const handleConfirmRedeem = () => {
    if (!selectedRewardToRedeem) return;
    if (userPoints.currentPoints < selectedRewardToRedeem.pointsCost) return;

    onRedeemReward(selectedRewardToRedeem);

    // Simulated new redeemed voucher preview
    const newVoucher: RedeemedReward = {
      id: `red-${Date.now()}`,
      rewardId: selectedRewardToRedeem.id,
      rewardTitle: selectedRewardToRedeem.title,
      voucherCode: `${selectedRewardToRedeem.codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`,
      pointsSpent: selectedRewardToRedeem.pointsCost,
      discountValueText: selectedRewardToRedeem.discountValueText,
      partnerName: selectedRewardToRedeem.partnerName,
      redeemedAt: 'الآن',
      status: 'active'
    };

    setJustRedeemedVoucher(newVoucher);
    setSelectedRewardToRedeem(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-20">
      {/* Hero Points Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white p-5 sm:p-6 border border-navy-800 shadow-xl">
        {/* Decorative Ambient Background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-navy-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Coins className="w-8 h-8 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">نقاط فلسطين</h1>
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                    مستوى {currentTier} 🏅
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  اكسب نقاطاً وطنية مع كل طلب وتفاعل واستبدلها بخصومات وقسائم مجانية
                </p>
              </div>
            </div>

            {/* Total Points Big Display */}
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 text-center self-start sm:self-auto min-w-[140px]">
              <span className="text-[11px] text-slate-300 font-bold block">رصيدك الحالي</span>
              <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-white">
                {userPoints.currentPoints.toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-300 font-extrabold">نقطة فلسطين 🇵🇸</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="bg-black/30 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>التقدم نحو المستوى {nextTier}:</span>
              </span>
              <span className="text-amber-300">
                {userPoints.currentPoints} / {nextTierPoints} نقطة
              </span>
            </div>

            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${tierProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>المستوى الحالي: {currentTier}</span>
              <span>متبقي {Math.max(0, nextTierPoints - userPoints.currentPoints)} نقطة للترقية</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Chips */}
        <div className="relative z-10 flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'rewards', label: `المكافآت المتاحة (${rewards.length})`, icon: Gift },
            { id: 'vouchers', label: `قسائمي (${userPoints.redeemedRewards.length})`, icon: Ticket },
            { id: 'history', label: `سجل الحركات (${userPoints.transactions.length})`, icon: TrendingUp },
            { id: 'guide', label: 'كيف تكسب النقاط؟', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-slate-950 shadow-md scale-102'
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

      {/* SUCCESS MODAL: JUST REDEEMED VOUCHER */}
      {justRedeemedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center space-y-4 text-right">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-3xl animate-bounce">
              🎉
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                مبروك! تم استبدال المكافأة بنجاح
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {justRedeemedVoucher.rewardTitle}
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100/50 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-2xl border-2 border-dashed border-amber-400 dark:border-amber-600 space-y-2">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-extrabold block">
                كود القسيمة الخاص بك:
              </span>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-300 dark:border-slate-700">
                <code className="text-base font-mono font-black text-navy-950 dark:text-amber-300 tracking-wider">
                  {justRedeemedVoucher.voucherCode}
                </code>
                <button
                  onClick={() => handleCopyCode(justRedeemedVoucher.voucherCode, justRedeemedVoucher.id)}
                  className="flex items-center gap-1 bg-amber-400 hover:bg-yellow-300 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold transition"
                >
                  {copiedVoucherId === justRedeemedVoucher.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-right">
                أظهر هذا الكود للسائق أو المندوب أو المتجر عند الشراء للاستفادة من: {justRedeemedVoucher.discountValueText}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setJustRedeemedVoucher(null);
                  setActiveTab('vouchers');
                }}
                className="flex-1 bg-navy-900 dark:bg-emerald-600 hover:bg-black dark:hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md"
              >
                عرض قسائمي المستبدلة
              </button>
              <button
                onClick={() => setJustRedeemedVoucher(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION REDEEM MODAL */}
      {selectedRewardToRedeem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl">
                  🎁
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-navy-900 dark:text-white">
                    تأكيد استبدال المكافأة
                  </h3>
                  <span className="text-[11px] text-slate-400">{selectedRewardToRedeem.partnerName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedRewardToRedeem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  {selectedRewardToRedeem.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedRewardToRedeem.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs font-bold">
                  <span className="text-slate-500">القيمة:</span>
                  <span className="text-palestine-green dark:text-emerald-400 font-black">
                    {selectedRewardToRedeem.discountValueText}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-300">
                  <span>تكلفة النقاط:</span>
                  <span className="text-sm font-black">{selectedRewardToRedeem.pointsCost} نقطة</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>رصيدك بعد الاستبدال:</span>
                  <span className="font-bold">
                    {userPoints.currentPoints - selectedRewardToRedeem.pointsCost} نقطة
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleConfirmRedeem}
                className="flex-1 bg-palestine-green hover:bg-emerald-700 text-white font-black text-xs py-2.5 rounded-xl transition shadow-md active:scale-95"
              >
                تأكيد الاستبدال الآن 🎁
              </button>
              <button
                onClick={() => setSelectedRewardToRedeem(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: REWARDS CATALOG */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl whitespace-nowrap font-bold transition active:scale-95 ${
                    isSelected
                      ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredRewards.map((reward) => {
              const canAfford = userPoints.currentPoints >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-lg transition-all"
                >
                  <div>
                    {/* Top Partner & Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {reward.partnerName}
                      </span>
                      {reward.badge && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {reward.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                      {reward.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  {/* Card Bottom: Points cost & Redeem Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs">
                        🪙
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 dark:text-white block">
                          {reward.pointsCost} نقطة
                        </span>
                        <span className="text-[10px] text-palestine-green font-bold">
                          {reward.discountValueText}
                        </span>
                      </div>
                    </div>

                    <button
                      disabled={!canAfford}
                      onClick={() => setSelectedRewardToRedeem(reward)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition active:scale-95 flex items-center gap-1 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>{canAfford ? 'استبدال الآن' : `متبقي ${reward.pointsCost - userPoints.currentPoints}`}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY REDEEMED VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
              قسائمي المستبدلة والنشطة ({userPoints.redeemedRewards.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              يمكنك إظهار هذه القسائم للسائق أو مندوب التوصيل أو المتجر عند الشراء للحصول على الخصم الفوري.
            </p>
          </div>

          {userPoints.redeemedRewards.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center space-y-2 border border-slate-200 dark:border-slate-800">
              <div className="text-3xl">🎟️</div>
              <h4 className="font-black text-sm text-slate-800 dark:text-white">لم تستبدل أي قسائم بعد</h4>
              <p className="text-xs text-slate-400">تصفح المكافآت المتاحة واستبدل نقاطك بكوبونات حصرية.</p>
              <button
                onClick={() => setActiveTab('rewards')}
                className="mt-2 bg-navy-900 text-white font-bold text-xs px-4 py-2 rounded-xl"
              >
                تصفح المكافآت الآن
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {userPoints.redeemedRewards.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 space-y-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400">{voucher.partnerName}</span>
                      <h4 className="font-black text-sm text-navy-900 dark:text-white">
                        {voucher.rewardTitle}
                      </h4>
                      <span className="text-xs font-black text-palestine-green dark:text-emerald-400">
                        {voucher.discountValueText}
                      </span>
                    </div>

                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      قسيمة سارية ✅
                    </span>
                  </div>

                  {/* Code Card */}
                  <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">كود القسيمة:</span>
                      <code className="text-sm font-mono font-black text-slate-900 dark:text-amber-300">
                        {voucher.voucherCode}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopyCode(voucher.voucherCode, voucher.id)}
                      className="flex items-center gap-1 bg-amber-400 hover:bg-yellow-300 text-slate-950 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      {copiedVoucherId === voucher.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-800" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>استبدلت في: {voucher.redeemedAt}</span>
                    <span>استهلكت {voucher.pointsSpent} نقطة</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">
              سجل كسب واستبدال النقاط
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              تفاصيل العمليات والنقاط المضافة والمستهلكة لحسابك.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
            {userPoints.transactions.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      tx.type === 'earn'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {tx.type === 'earn' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">
                      {tx.reason}
                    </span>
                    <span className="text-[10px] text-slate-400">{tx.createdAt}</span>
                  </div>
                </div>

                <div
                  className={`text-sm font-black ${
                    tx.type === 'earn'
                      ? 'text-palestine-green dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {tx.type === 'earn' ? `+${tx.amount}` : `-${tx.amount}`} نقطة
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HOW TO EARN GUIDE */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-right space-y-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              طرق كسب نقاط فلسطين 🇵🇸
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              تم تصميم نظام نقاط فلسطين لمكافأة كل مستخدم يشارك في تنشيط الاقتصاد الوطني ويدعم المنتجات والخدمات المحلية.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: ShoppingBag,
                title: 'إتمام طلب شراء من الإعلانات',
                points: '+50 نقطة',
                desc: 'عند شراء أي سلعة من سوق الإعلانات والمتاجر واستلامها بنجاح.',
                color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50'
              },
              {
                icon: Car,
                title: 'حجز رحلة تاكسي أو توصيل',
                points: '+40 نقطة',
                desc: 'مع كل رحلة تنفذها مع كباتن التاكسي وسيارات التوصيل المعتمدة.',
                color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50'
              },
              {
                icon: Award,
                title: 'تقييم وكتابة مراجعة لمزود خدمة',
                points: '+25 نقطة',
                desc: 'مساعدة المجتمع الفلسطيني بتقييم نزيه ومراجعة للخدمات المقدمة.',
                color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50'
              },
              {
                icon: HeartHandshake,
                title: 'مشاركة المنصة أو حفظ في المفضلة',
                points: '+15 نقطة',
                desc: 'التفاعل مع الإعلانات والمحتوى الوطني ونشر المنصة لأصدقائك.',
                color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/50'
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3.5"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <span className="text-xs font-black text-palestine-green dark:text-emerald-400">
                        {item.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
