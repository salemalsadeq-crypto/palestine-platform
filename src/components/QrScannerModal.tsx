import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  X,
  Flashlight,
  RefreshCw,
  Upload,
  Phone,
  MessageCircle,
  ShoppingCart,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Star,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { AdItem, ServiceProviderItem } from '../types';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  ads: AdItem[];
  providers: ServiceProviderItem[];
  onOpenAdDetails: (ad: AdItem) => void;
  onPlaceOrder?: (ad: AdItem) => void;
  onBookService?: (provider: ServiceProviderItem) => void;
}

interface ScanResult {
  rawText: string;
  type: 'ad' | 'provider' | 'phone' | 'url' | 'text';
  ad?: AdItem;
  provider?: ServiceProviderItem;
  phoneNumber?: string;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  ads,
  providers,
  onOpenAdDetails,
  onPlaceOrder,
  onBookService
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples' | 'generate'>('camera');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [copied, setCopied] = useState(false);

  // QR Generation state
  const [selectedGenerateType, setSelectedGenerateType] = useState<'ad' | 'provider'>('ad');
  const [selectedGenerateId, setSelectedGenerateId] = useState<string>(ads[0]?.id || '');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader-container';

  // Parse QR content
  const parseScannedText = (text: string): ScanResult => {
    const cleanText = text.trim();

    // Check if it's an ad ID or ad link
    // Examples: "ad-1", "https://palestine.app/ad-1", "ad-details.html?id=ad-1"
    let adMatch = ads.find((a) => a.id.toLowerCase() === cleanText.toLowerCase());
    if (!adMatch) {
      const matchAdUrl = cleanText.match(/(?:id=|ad\/|ad-)(\w+)/i);
      if (matchAdUrl) {
        const potentialId = matchAdUrl[0].includes('ad-') ? matchAdUrl[0] : `ad-${matchAdUrl[1]}`;
        adMatch = ads.find(
          (a) => a.id.toLowerCase() === potentialId.toLowerCase() || a.id.toLowerCase() === matchAdUrl[1].toLowerCase()
        );
      }
    }

    if (adMatch) {
      return {
        rawText: cleanText,
        type: 'ad',
        ad: adMatch
      };
    }

    // Check if it's a provider ID or link
    let providerMatch = providers.find((p) => p.id.toLowerCase() === cleanText.toLowerCase());
    if (!providerMatch) {
      const matchSpUrl = cleanText.match(/(?:id=|provider\/|sp-)(\w+)/i);
      if (matchSpUrl) {
        const potentialId = matchSpUrl[0].includes('sp-') ? matchSpUrl[0] : `sp-${matchSpUrl[1]}`;
        providerMatch = providers.find(
          (p) => p.id.toLowerCase() === potentialId.toLowerCase() || p.id.toLowerCase() === matchSpUrl[1].toLowerCase()
        );
      }
    }

    if (providerMatch) {
      return {
        rawText: cleanText,
        type: 'provider',
        provider: providerMatch
      };
    }

    // Check for phone number
    const phoneMatch = cleanText.match(/^(?:tel:)?(05\d{8}|02\d{7}|04\d{7}|08\d{7})$/);
    if (phoneMatch) {
      return {
        rawText: cleanText,
        type: 'phone',
        phoneNumber: phoneMatch[1]
      };
    }

    // Check for web URL
    if (cleanText.startsWith('http://') || cleanText.startsWith('https://')) {
      return {
        rawText: cleanText,
        type: 'url'
      };
    }

    return {
      rawText: cleanText,
      type: 'text'
    };
  };

  const handleSuccessfulScan = (decodedText: string) => {
    // Play light visual feedback
    const parsed = parseScannedText(decodedText);
    setScanResult(parsed);

    // Stop active camera scanning once a code is detected
    stopScanner();
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false
        });
      }

      await scannerRef.current.start(
        { facingMode: facingMode },
        {
          fps: 12,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrEdge = Math.floor(minEdge * 0.72);
            return { width: qrEdge, height: qrEdge };
          },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleSuccessfulScan(decodedText);
        },
        () => {
          // Continuous frame scan error - standard behavior while hunting for QR
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsScanning(false);
      const msg = err?.message || String(err);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError('لم يتم منح إذن الوصول إلى الكاميرا. يرجى تفعيل الإذن من إعدادات المتصفح.');
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setCameraError('لم يتم العثور على كاميرا في هذا الجهاز. يمكنك رفع صورة أو تجربة الأكواد التجريبية.');
      } else {
        setCameraError('تعذر فتح الكاميرا حالياً. يمكنك استخدام رفع صورة باركود أو الأكواد الجاهزة.');
      }
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.warn('Scanner stop error:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scanResult) {
      // Delay slightly for modal animation to mount container
      const timer = setTimeout(() => {
        startScanner();
      }, 350);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, activeTab, facingMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop();
          }
          scannerRef.current.clear();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId, false);
      }
      const decoded = await scannerRef.current.scanFile(file, true);
      handleSuccessfulScan(decoded);
    } catch (err) {
      setCameraError('لم يتم العثور على رمز QR صالح في الصورة المحددة. يرجى تجربة صورة أوضح.');
    }
  };

  const toggleCameraFacing = async () => {
    await stopScanner();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (scannerRef.current && isScanning) {
      try {
        const nextTorch = !torchOn;
        await scannerRef.current.applyVideoConstraints({
          // @ts-ignore
          advanced: [{ torch: nextTorch }]
        });
        setTorchOn(nextTorch);
      } catch (err) {
        console.warn('Torch not supported:', err);
      }
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-right">
        {/* Header */}
        <div className="bg-navy-950 text-white p-4 flex items-center justify-between border-b border-navy-800 tatreez-border-top flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-palestine-green to-emerald-600 flex items-center justify-center text-white shadow-md">
              <QrCode className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-black text-sm sm:text-base flex items-center gap-1.5">
                <span>ماسح رمز QR الذكي</span>
                <span className="text-[10px] bg-amber-400 text-navy-950 font-black px-2 py-0.5 rounded-full">
                  كاميرا فورية
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                امسح كود الإعلان أو مزود الخدمة للوصول المباشر والاتصال
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition active:scale-95"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => {
              setScanResult(null);
              setActiveTab('camera');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>مسح بالكاميرا</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('upload');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صورة كود</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('samples');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'samples'
                ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>أكواد تجريبية</span>
          </button>

          <button
            onClick={() => {
              stopScanner();
              setActiveTab('generate');
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              activeTab === 'generate'
                ? 'bg-white dark:bg-slate-900 text-navy-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>توليد كود</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              {/* Scan Result Overlay or Card */}
              {scanResult ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="font-extrabold text-sm">تم مسح الكود بنجاح!</div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {scanResult.type === 'ad'
                          ? 'تم التعرف على إعلان في المنصة'
                          : scanResult.type === 'provider'
                          ? 'تم التعرف على مزود خدمة معتمد'
                          : scanResult.type === 'phone'
                          ? 'تم التعرف على رقم هاتف للتواصل'
                          : 'تم قراءة بيانات الكود'}
                      </div>
                    </div>
                  </div>

                  {/* AD RESULT CARD */}
                  {scanResult.type === 'ad' && scanResult.ad && (
                    <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-4 space-y-3.5 shadow-sm">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                          {scanResult.ad.imageUrl ? (
                            <img
                              src={scanResult.ad.imageUrl}
                              alt={scanResult.ad.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-bold bg-navy-800/10 dark:bg-navy-800/40 text-navy-800 dark:text-navy-300 px-2 py-0.5 rounded">
                            {scanResult.ad.category}
                          </span>
                          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate mt-1">
                            {scanResult.ad.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3 text-palestine-green" />
                            <span>{scanResult.ad.city}</span>
                          </div>
                          <div className="text-base font-black text-palestine-green dark:text-emerald-400 mt-1">
                            {scanResult.ad.price > 0 ? `${scanResult.ad.price.toLocaleString()} ₪` : 'تواصل'}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                        {scanResult.ad.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (scanResult.ad) {
                              onOpenAdDetails(scanResult.ad);
                              onClose();
                            }
                          }}
                          className="bg-navy-900 hover:bg-black text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>عرض الإعلان والشراء</span>
                        </button>

                        <a
                          href={`tel:${scanResult.ad.phone}`}
                          className="bg-palestine-green hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال بالبائع</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* PROVIDER RESULT CARD */}
                  {scanResult.type === 'provider' && scanResult.provider && (
                    <div className="bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-750 p-4 space-y-3.5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-3xl font-bold">
                            {scanResult.provider.serviceType === 'taxi'
                              ? '🚕'
                              : scanResult.provider.serviceType === 'delivery'
                              ? '📦'
                              : '🛠️'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                                {scanResult.provider.displayName}
                              </h3>
                              <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span>📍 {scanResult.provider.city}</span>
                              {scanResult.provider.vehicleType && (
                                <span>· {scanResult.provider.vehicleType}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{scanResult.provider.rating}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-750 flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">السعر الأساسي:</span>
                        <span className="font-black text-palestine-green dark:text-emerald-400 text-sm">
                          يبدأ من {scanResult.provider.basePrice} ₪
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <a
                          href={`tel:${scanResult.provider.contactPhone}`}
                          className="bg-navy-900 hover:bg-black text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>اتصال مباشر</span>
                        </a>

                        <button
                          onClick={() => {
                            if (scanResult.provider && onBookService) {
                              onBookService(scanResult.provider);
                              onClose();
                            }
                          }}
                          className="bg-palestine-green hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>طلب الخدمة</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PHONE NUMBER RESULT */}
                  {scanResult.type === 'phone' && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto text-xl">
                        📞
                      </div>
                      <div className="font-extrabold text-base text-slate-900 dark:text-white" dir="ltr">
                        {scanResult.phoneNumber}
                      </div>
                      <p className="text-xs text-slate-500">تم التعرف على رقم اتصال فلسطيني.</p>
                      <a
                        href={`tel:${scanResult.phoneNumber}`}
                        className="w-full bg-palestine-green text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>اتصال بالرقم الآن</span>
                      </a>
                    </div>
                  )}

                  {/* OTHER / RAW TEXT RESULT */}
                  {(scanResult.type === 'text' || scanResult.type === 'url') && (
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-400">محتوى الكود:</div>
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-750 font-mono text-xs break-all text-slate-800 dark:text-slate-200">
                        {scanResult.rawText}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyText(scanResult.rawText)}
                          className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copied ? 'تم النسخ!' : 'نسخ النص'}</span>
                        </button>
                        {scanResult.type === 'url' && (
                          <a
                            href={scanResult.rawText}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 bg-navy-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>فتح الرابط</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Re-scan button */}
                  <button
                    onClick={() => {
                      setScanResult(null);
                      startScanner();
                    }}
                    className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>مسح رمز QR آخر</span>
                  </button>
                </div>
              ) : (
                /* LIVE VIEWFINDER */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-sm mx-auto shadow-inner border-2 border-slate-800">
                    {/* The HTML5QrCode mounts here */}
                    <div id={scannerContainerId} className="w-full h-full object-cover" />

                    {/* Laser overlay & corner targeting */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                      <div className="relative w-full h-full border-2 border-dashed border-emerald-400/50 rounded-2xl flex items-center justify-center">
                        {/* Target corners */}
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-palestine-green rounded-tr-lg" />
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-palestine-green rounded-tl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-palestine-green rounded-br-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-palestine-green rounded-bl-lg" />

                        {/* Animated Laser line */}
                        <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10B981] animate-pulse" />
                      </div>
                    </div>

                    {/* Camera Control Overlay Pill */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                      <button
                        onClick={toggleCameraFacing}
                        className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 border border-white/10 active:scale-95 transition"
                        title="تبديل الكاميرا الخلفية / الأمامية"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-[10px]">تبديل</span>
                      </button>

                      <button
                        onClick={toggleTorch}
                        className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border active:scale-95 transition ${
                          torchOn
                            ? 'bg-amber-400 text-navy-950 border-amber-300'
                            : 'bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border-white/10'
                        }`}
                        title="تشغيل / إيقاف الفلاش"
                      >
                        <Flashlight className="w-3.5 h-3.5" />
                        <span className="text-[10px]">{torchOn ? 'الفلاش يعمل' : 'فلاش'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                    وجّه كاميرا الهاتف نحو أي رمز QR لإعلان أو مزود خدمة للتعرف عليه فوراً.
                  </p>

                  {cameraError && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2 text-rose-800 dark:text-rose-300 text-xs">
                      <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <div>{cameraError}</div>
                        <button
                          onClick={() => setActiveTab('samples')}
                          className="font-bold underline text-rose-900 dark:text-rose-200 block"
                        >
                          اضغط هنا لتجربة الأكواد التجريبية الجاهزة بنقرة واحدة ←
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* UPLOAD IMAGE TAB */}
          {activeTab === 'upload' && (
            <div className="space-y-4 text-center py-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 hover:border-palestine-green transition bg-slate-50 dark:bg-slate-800/50">
                <div className="w-16 h-16 rounded-2xl bg-palestine-green/10 text-palestine-green flex items-center justify-center mx-auto text-2xl mb-3">
                  📸
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-1">
                  اختر صورة تحتوي على كود QR
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs mx-auto">
                  يمكنك التقاط صورة مسبقاً أو رفع صورة لرمز QR تم حفظه في معرض الصور بجهازك.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 bg-navy-900 hover:bg-black text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md transition active:scale-95">
                  <Upload className="w-4 h-4" />
                  <span>تحديد صورة من الجهاز</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {cameraError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-300 text-xs">
                  {cameraError}
                </div>
              )}
            </div>
          )}

          {/* SAMPLES TAB FOR INSTANT TESTING */}
          {activeTab === 'samples' && (
            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>
                  أكواد تجريبية سريعة لاختبار ميزة الماسح والوصول لتفاصيل الإعلانات دون الحاجة لطباعة رمز:
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  نماذج الإعلانات:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ads.slice(0, 4).map((ad) => (
                    <div
                      key={ad.id}
                      onClick={() => {
                        handleSuccessfulScan(ad.id);
                        setActiveTab('camera');
                      }}
                      className="cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 text-right group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy-950 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-palestine-green transition">
                        QR
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {ad.title}
                        </div>
                        <div className="text-[11px] text-palestine-green font-black">
                          {ad.price} ₪ · كود: {ad.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 pt-2">
                  نماذج مزودي الخدمات:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {providers.slice(0, 4).map((sp) => (
                    <div
                      key={sp.id}
                      onClick={() => {
                        handleSuccessfulScan(sp.id);
                        setActiveTab('camera');
                      }}
                      className="cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-750 p-3 rounded-xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-3 text-right group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-navy-950 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 group-hover:bg-palestine-green transition">
                        QR
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {sp.displayName}
                        </div>
                        <div className="text-[11px] text-amber-500 font-bold">
                          ⭐ {sp.rating} · كود: {sp.id}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GENERATE QR TAB */}
          {activeTab === 'generate' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                اختر إعلاناً أو مزود خدمة لإنشاء رمز QR قابل للمسح والمشاركة مع الأصدقاء:
              </p>

              <div className="flex justify-center gap-2 text-xs font-bold">
                <button
                  onClick={() => {
                    setSelectedGenerateType('ad');
                    setSelectedGenerateId(ads[0]?.id || '');
                  }}
                  className={`px-4 py-1.5 rounded-xl transition ${
                    selectedGenerateType === 'ad'
                      ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  إعلان من المنصة
                </button>
                <button
                  onClick={() => {
                    setSelectedGenerateType('provider');
                    setSelectedGenerateId(providers[0]?.id || '');
                  }}
                  className={`px-4 py-1.5 rounded-xl transition ${
                    selectedGenerateType === 'provider'
                      ? 'bg-navy-900 dark:bg-emerald-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  مزود خدمة
                </button>
              </div>

              {/* Selector */}
              <div className="max-w-xs mx-auto">
                <select
                  value={selectedGenerateId}
                  onChange={(e) => setSelectedGenerateId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs rounded-xl p-2.5 border border-slate-200 dark:border-slate-700"
                >
                  {selectedGenerateType === 'ad'
                    ? ads.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.title} ({a.price} ₪)
                        </option>
                      ))
                    : providers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName} ({p.city})
                        </option>
                      ))}
                </select>
              </div>

              {/* QR Image Display */}
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 dark:border-slate-700 inline-block shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    selectedGenerateId
                  )}`}
                  alt="QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
                <div className="text-[11px] font-mono font-bold text-slate-700 mt-2">
                  كود: {selectedGenerateId}
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                امسح هذا الكود بكاميرا أي هاتف آخر لفتح تفاصيل العنصر فوراً!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-palestine-green" />
            <span>ماسح معتمد وخاص بمنصة فلسطين 🇵🇸</span>
          </div>

          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition active:scale-95"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
