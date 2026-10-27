import React from 'react';
import { Bell, Check, X, Info, Car, ShoppingBag } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
    type: string;
  }>;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="sticky top-0 bg-navy-800 text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-base">مركز الإشعارات</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllRead}
              className="text-[11px] font-bold text-slate-300 hover:text-white"
            >
              تعليم الكل كمقروء
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-navy-700 text-slate-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border text-right transition ${
                n.isRead
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-blue-50/70 border-blue-200 text-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-navy-900">{n.title}</span>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
