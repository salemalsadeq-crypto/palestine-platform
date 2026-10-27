import React, { useState } from 'react';
import { AdItem } from '../types';
import { X, Plus, Upload, CheckCircle2 } from 'lucide-react';

interface NewAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAd: (ad: AdItem) => void;
}

export const NewAdModal: React.FC<NewAdModalProps> = ({ isOpen, onClose, onAddAd }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('عقارات');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('رام الله');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const categories = ['عقارات', 'سيارات', 'إلكترونيات', 'أثاث', 'وظائف', 'أخرى'];
  const cities = ['القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'طولكرم', 'قلقيلية', 'أريحا', 'غزة'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !phone.trim()) return;

    const newAd: AdItem = {
      id: `ad-${Date.now()}`,
      title: title.trim(),
      category,
      price: parseFloat(price) || 0,
      city,
      phone: phone.trim(),
      description: description.trim(),
      deliveryAvailable,
      deliveryFee: deliveryAvailable ? 15 : 0,
      allowCod: true,
      imageUrl:
        category === 'سيارات'
          ? 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600'
          : category === 'عقارات'
          ? 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600'
          : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
      createdAt: 'الآن'
    };

    onAddAd(newAd);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        <div className="sticky top-0 bg-navy-800 text-white p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-400" />
            <h2 className="font-extrabold text-base">إضافة إعلان جديد</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-navy-700 text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="text-base font-extrabold text-slate-800">تم نشر إعلانك بنجاح!</h3>
              <p className="text-xs text-slate-500">إعلانك متاح الآن لجميع زوار المنصة في فلسطين.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الإعلان *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: شقة للبيع في الطيرة، تويوتا كورولا 2021..."
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl py-2.5 px-3 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">القسم</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl py-2.5 px-3 border border-slate-200 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">السعر (شيكل ₪)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0 إذا كان مجاني أو راتب"
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl py-2.5 px-3 border border-slate-200 focus:bg-white"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl py-2.5 px-3 border border-slate-200 focus:bg-white"
                  >
                    {cities.map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف للتواصل *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="059xxxxxxx"
                    className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl py-2.5 px-3 border border-slate-200 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل ووصف الإعلان</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب مواصفات المنتج، الحالة، المزايا..."
                  className="w-full bg-slate-50 text-slate-900 text-sm rounded-xl p-3 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-800"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="deliveryChk"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-navy-800 focus:ring-navy-800"
                />
                <label htmlFor="deliveryChk" className="text-xs text-slate-700 font-medium">
                  يتوفر توصيل وشحن للمشتري مع الدفع عند الاستلام (COD)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-palestine-green hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md transition active:scale-95 text-sm"
              >
                نشر الإعلان فوراً 📢
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
