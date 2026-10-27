import React from 'react';
import { OrderItem } from '../types';
import { Package, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface OrdersViewProps {
  orders: OrderItem[];
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders }) => {
  const getStatusBadge = (status: OrderItem['orderStatus']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-200/50 dark:border-blue-800/40">
            <Clock className="w-3.5 h-3.5" />
            <span>تم التأكيد</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-800/40">
            <Package className="w-3.5 h-3.5" />
            <span>قيد التجهيز</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-200/50 dark:border-purple-800/40">
            <Truck className="w-3.5 h-3.5" />
            <span>في الطريق إليك</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التوصيل</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full border border-slate-200/50 dark:border-slate-700/40">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-navy-900 dark:text-white">طلباتي ومشترياتي 📦</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">تتبع الطلبات، الشحن، وحالة التوصيل في مدينتك</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 space-y-3 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                  #{order.id.toUpperCase()}
                </span>
                <h3 className="font-extrabold text-sm text-navy-900 dark:text-white mt-0.5">{order.adTitle}</h3>
              </div>
              {getStatusBadge(order.orderStatus)}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>المستلم:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>العنوان:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{order.city} - {order.address}</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة الدفع:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 font-bold text-navy-900 dark:text-white">
                <span>المجموع الكلي:</span>
                <span className="text-sm font-black text-palestine-green dark:text-emerald-400">
                  {order.totalAmount} ₪ (شامل التوصيل)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
              <span>تاريخ الطلب: {order.createdAt}</span>
              <button
                onClick={() => alert(`تتبع الشحنة #${order.id}: الشحنة مع مندوب التوصيل`)}
                className="font-bold text-navy-800 dark:text-amber-400 hover:underline"
              >
                تتبع مسار المندوب ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
