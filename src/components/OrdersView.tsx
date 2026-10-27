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
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>تم التأكيد</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <Package className="w-3.5 h-3.5" />
            <span>قيد التجهيز</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <Truck className="w-3.5 h-3.5" />
            <span>في الطريق إليك</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>تم التوصيل</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>قيد المراجعة</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-xl font-black text-navy-900">طلباتي ومشترياتي 📦</h2>
        <p className="text-xs text-slate-500">تتبع الطلبات، الشحن، وحالة التوصيل في مدينتك</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{order.id.toUpperCase()}
                </span>
                <h3 className="font-extrabold text-sm text-navy-900 mt-0.5">{order.adTitle}</h3>
              </div>
              {getStatusBadge(order.orderStatus)}
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>المستلم:</span>
                <span className="font-bold text-slate-800">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>العنوان:</span>
                <span className="font-bold text-slate-800">{order.city} - {order.address}</span>
              </div>
              <div className="flex justify-between">
                <span>طريقة الدفع:</span>
                <span className="font-bold text-slate-800">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/60 font-bold text-navy-900">
                <span>المجموع الكلي:</span>
                <span className="text-sm font-black text-palestine-green">
                  {order.totalAmount} ₪ (شامل التوصيل)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>تاريخ الطلب: {order.createdAt}</span>
              <button
                onClick={() => alert(`تتبع الشحنة #${order.id}: الشحنة مع مندوب التوصيل`)}
                className="font-bold text-navy-800 hover:underline"
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
