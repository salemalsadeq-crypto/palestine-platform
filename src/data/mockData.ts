import { AdItem, PlaceItem, ServiceProviderItem, TravelPackageItem, ReelItem, OrderItem, ProviderReview, RewardItem, UserPointsState } from '../types';

export const INITIAL_ADS: AdItem[] = [
  {
    id: 'ad-1',
    title: 'شقة إطلالة بانورامية في الطيرة - رام الله',
    category: 'عقارات',
    price: 3500,
    city: 'رام الله',
    phone: '0599123456',
    description: 'شقة مفروشة 160م²، 3 غرف نوم، تدفئة مركزية وموقف سيارة خاص في أرقى أحياء رام الله.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
    locationName: 'حي الطيرة',
    deliveryAvailable: false,
    allowCod: true,
    createdAt: 'منذ ساعتين'
  },
  {
    id: 'ad-2',
    title: 'هيونداي توسان 2022 بحالة الوكالة',
    category: 'سيارات',
    price: 118000,
    city: 'نابلس',
    phone: '0598765432',
    description: 'محرك 1600 تيربو، فل كامل، فتحة بانوراما، فحص نخب أول ترخيص وتأمين ساري.',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600',
    locationName: 'شارع رفيديا',
    deliveryAvailable: false,
    allowCod: true,
    createdAt: 'منذ 4 ساعات'
  },
  {
    id: 'ad-3',
    title: 'آيفون 15 برو ماكس 256 جيجا تيتانيوم',
    category: 'إلكترونيات',
    price: 4200,
    city: 'القدس',
    phone: '0522114477',
    description: 'بطارية 100%، لون تيتانيوم طبيعي، مع الكرتونة وكفالة سارية 6 شهور.',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
    locationName: 'شارع صلاح الدين',
    deliveryAvailable: true,
    deliveryFee: 20,
    allowCod: true,
    createdAt: 'اليوم'
  },
  {
    id: 'ad-4',
    title: 'طقم كنب صالون تركي فاخر 8 مقاعد',
    category: 'أثاث',
    price: 3200,
    city: 'الخليل',
    phone: '0569887766',
    description: 'قماش وتر بروف قابل للغسيل مع طاولات خشب بلوط صناعة تركية ممتازة.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    locationName: 'عين سارة',
    deliveryAvailable: true,
    deliveryFee: 50,
    allowCod: true,
    createdAt: 'منذ يوم'
  },
  {
    id: 'ad-5',
    title: 'مطلوب مهندس برمجيات وتطبيقات React و Flutter',
    category: 'وظائف',
    price: 0,
    city: 'رام الله',
    phone: '0599001122',
    description: 'شركة تكنولوجيا في الماصيون تبحث عن مهندس برمجيات ذو خبرة برواتب مجزية وبيئة عمل متطورة.',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    locationName: 'الماصيون',
    deliveryAvailable: false,
    createdAt: 'منذ يومين'
  },
  {
    id: 'ad-6',
    title: 'زيت زيتون فلسطيني بكر كبيس جنين عصره أولى',
    category: 'أخرى',
    price: 380,
    city: 'جنين',
    phone: '0599443322',
    description: 'تنكة زيت زيتون بلدي عصرة على البارد إنتاج الموسم الحالي مع فحص مخبري مضمون.',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600',
    locationName: 'يعبد',
    deliveryAvailable: true,
    deliveryFee: 15,
    allowCod: true,
    createdAt: 'أمس'
  }
];

export const INITIAL_PLACES: PlaceItem[] = [
  {
    id: 'pl-1',
    name: 'مطعم ومقهى زرياب التراثي',
    category: 'مطاعم',
    city: 'رام الله',
    address: 'البلدة القديمة، شارع يافا',
    description: 'مأكولات فلسطينية أصيلة وأجواء تراثية دافئة وجلسات عائلية في قلب رام الله القديمة.',
    phone: '022987654',
    rating: 4.9,
    latitude: 31.9038,
    longitude: 35.2034,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'
  },
  {
    id: 'pl-2',
    name: 'حلويات الأقصى ودمشق نابلس',
    category: 'حلويات ومأكولات',
    city: 'نابلس',
    address: 'خان التجار، البلدة القديمة',
    description: 'الكنافة النابلسية الشهيرة على الفحم والحطب والحلويات الشرقية الأصيلة.',
    phone: '092381234',
    rating: 4.98,
    latitude: 32.2211,
    longitude: 35.2544,
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600'
  },
  {
    id: 'pl-3',
    name: 'فندق ومطعم القناطر التراثي',
    category: 'فنادق وسياحة',
    city: 'بيت لحم',
    address: 'قرب ساحة المهد',
    description: 'إقامة فاخرة بجوار الأماكن التاريخية والمقدسة مع إطلالات ساحرة على ساحة كنيسة المهد.',
    phone: '022741122',
    rating: 4.8,
    latitude: 31.7054,
    longitude: 35.2024,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'
  },
  {
    id: 'pl-4',
    name: 'متحف وخزف الخليل الملكي',
    category: 'حرف وتراث',
    city: 'الخليل',
    address: 'شارع السلام',
    description: 'صناعة الخزف والزجاج اليدوي الشهير في الخليل وزيارات وتجارب حية للسياح والزوار.',
    phone: '022228899',
    rating: 4.92,
    latitude: 31.5326,
    longitude: 35.0998,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600'
  },
  {
    id: 'pl-5',
    name: 'مطعم القدس التراثي وسوق خان الزيت',
    category: 'مطاعم',
    city: 'القدس',
    address: 'طريق الآلام، البلدة القديمة',
    description: 'أكلات مقدسية عريقة، حمص وفلافل وفول على الأصول وجلسات تراثية مقدسة.',
    phone: '026284455',
    rating: 4.95,
    latitude: 31.7780,
    longitude: 35.2300,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'
  },
  {
    id: 'pl-6',
    name: 'منتجع قمر أريحا والواحة السياحية',
    category: 'فنادق وسياحة',
    city: 'أريحا',
    address: 'شارع قصر هشام',
    description: 'واحة أريحا الخضراء، مسابح عائلية وإطلالات على وادي القلط وتلفريك جبل قرنطل.',
    phone: '022321100',
    rating: 4.85,
    latitude: 31.8611,
    longitude: 35.4608,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600'
  },
  {
    id: 'pl-7',
    name: 'مطعم ومقهى نزهة جنين وسهل مرج بن عامر',
    category: 'مطاعم',
    city: 'جنين',
    address: 'شارع الناصرة',
    description: 'جلسات خارجية مطلة على سهل مرج بن عامر وأشهى المشاوي الفلسطينية والمسخن البلدي.',
    phone: '042503344',
    rating: 4.88,
    latitude: 32.4646,
    longitude: 35.2956,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600'
  }
];

export const INITIAL_PROVIDER_REVIEWS: ProviderReview[] = [
  {
    id: 'rev-1',
    providerId: 'sp-1',
    customerName: 'سمير النتشة',
    customerCity: 'القدس',
    rating: 5,
    comment: 'سائق محترم وأخلاق عالية، المركبة نظيفة جداً ومكيفة ووصلنا على الموعد بدقة.',
    serviceType: 'taxi',
    createdAt: 'منذ يومين'
  },
  {
    id: 'rev-2',
    providerId: 'sp-1',
    customerName: 'مريم الصالحي',
    customerCity: 'القدس',
    rating: 5,
    comment: 'خدمة راقية وسريعة وسعر عادل جداً. أنصح بالتعامل معه دائماً في مشاوير القدس.',
    serviceType: 'taxi',
    createdAt: 'منذ 4 أيام'
  },
  {
    id: 'rev-3',
    providerId: 'sp-1',
    customerName: 'أحمد الجعبري',
    customerCity: 'رام الله',
    rating: 4,
    comment: 'سائق أمين وملتزم، رحلة مريحة وآمنة.',
    serviceType: 'taxi',
    createdAt: 'منذ أسبوع'
  },
  {
    id: 'rev-4',
    providerId: 'sp-2',
    customerName: 'ريم حسونة',
    customerCity: 'رام الله',
    rating: 5,
    comment: 'توصيل سريع جداً وصل الطرد بدون أي خدش وبتعامل قمة في الذوق والأمانة.',
    serviceType: 'delivery',
    createdAt: 'أمس'
  },
  {
    id: 'rev-5',
    providerId: 'sp-2',
    customerName: 'علاء قاسم',
    customerCity: 'بيرزيت',
    rating: 5,
    comment: 'كابتن محترف، تم شحن البضاعة في وقت قياسي وتتبع مستمر للطلب.',
    serviceType: 'delivery',
    createdAt: 'منذ 3 أيام'
  },
  {
    id: 'rev-6',
    providerId: 'sp-3',
    customerName: 'أنس التميمي',
    customerCity: 'نابلس',
    rating: 5,
    comment: 'شغل هندسي متقن، صلح المكيف بسرعة واكتشف التسريب اللي غيره ما عرف يلاقيه.',
    serviceType: 'home',
    createdAt: 'منذ يوم'
  },
  {
    id: 'rev-7',
    providerId: 'sp-3',
    customerName: 'هبة المصري',
    customerCity: 'نابلس',
    rating: 5,
    comment: 'دقة بالمواعيد ونظافة في الشغل وأسعار واضحة بدون مبالغة.',
    serviceType: 'home',
    createdAt: 'منذ 5 أيام'
  },
  {
    id: 'rev-8',
    providerId: 'sp-4',
    customerName: 'خالد السراج',
    customerCity: 'الخليل',
    rating: 5,
    comment: 'أكل خليلي أصيل على أصوله، قدرة لحم ومسخن شهي والكمية راهية والطلب سخن نار.',
    serviceType: 'food',
    createdAt: 'منذ يومين'
  },
  {
    id: 'rev-9',
    providerId: 'sp-4',
    customerName: 'فاطمة الكركي',
    customerCity: 'الخليل',
    rating: 4,
    comment: 'طعم ممتاز وخدمة وتغليف مرتب، تجربة سنكررها بكل تأكيد.',
    serviceType: 'food',
    createdAt: 'منذ أسبوع'
  }
];

export const INITIAL_PROVIDERS: ServiceProviderItem[] = [
  {
    id: 'sp-1',
    displayName: 'تاكسي القدس السريع - أبو عمر',
    serviceType: 'taxi',
    city: 'القدس',
    contactPhone: '0522445566',
    vehicleType: 'سكودا أوكتافيا 2023',
    basePrice: 20,
    rating: 4.95,
    reviewsCount: 3,
    isAvailable: true,
    isVerified: true,
    latitude: 31.7767,
    longitude: 35.2345
  },
  {
    id: 'sp-2',
    displayName: 'كابتن رام الله للتوصيل والشحن السريع',
    serviceType: 'delivery',
    city: 'رام الله',
    contactPhone: '0599334455',
    vehicleType: 'فان مقفل فورد ترانزيت',
    basePrice: 15,
    rating: 4.88,
    reviewsCount: 2,
    isAvailable: true,
    isVerified: true,
    latitude: 31.9029,
    longitude: 35.2062
  },
  {
    id: 'sp-3',
    displayName: 'المهندس لصيانة التكييف والأجهزة المنزلية',
    serviceType: 'home',
    city: 'نابلس',
    contactPhone: '0597112244',
    basePrice: 50,
    rating: 4.92,
    reviewsCount: 2,
    isAvailable: true,
    isVerified: true,
    latitude: 32.2227,
    longitude: 35.2618
  },
  {
    id: 'sp-4',
    displayName: 'مطابخ ومأكولات الخليل للولائم والتوصيل',
    serviceType: 'food',
    city: 'الخليل',
    contactPhone: '0568991122',
    basePrice: 30,
    rating: 4.85,
    reviewsCount: 2,
    isAvailable: true,
    isVerified: true,
    latitude: 31.5293,
    longitude: 35.0938
  }
];

export const INITIAL_TRAVEL: TravelPackageItem[] = [
  {
    id: 'trv-1',
    title: 'رحلة العمرة المميزة جواً مع فنادق 5 نجوم',
    officeName: 'شركة القدس للسياحة والسفر',
    destination: 'مكة المكرمة والمدينة المنورة',
    durationDays: 10,
    priceIls: 3400,
    description: 'شاملة تذاكر الطيران، التأشيرة، النقل الخاص، وإقامة في فنادق مطلة مباشرة على الحرم الشريف.',
    phone: '022956789',
    imageUrl: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600'
  },
  {
    id: 'trv-2',
    title: 'عطلة إسطنبول وطرابزون الساحرة',
    officeName: 'أجنحة فلسطين للسفريات',
    destination: 'تركيا',
    durationDays: 7,
    priceIls: 2850,
    description: 'رحلة استجمام شاملة الطيران والإقامة في فنادق راقية مع جولات سياحية يومية لمرتفعات أوزنجول والبوسفور.',
    phone: '092345678',
    imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600'
  },
  {
    id: 'trv-3',
    title: 'رحلة شرم الشيخ وطابا العائلية',
    officeName: 'هلا تورز رام الله',
    destination: 'مصر',
    durationDays: 5,
    priceIls: 1650,
    description: 'إقامة في منتجع شامل كلياً (All Inclusive)، ألعاب مائية، ورحلات سفاري في صحراء سيناء.',
    phone: '022961122',
    imageUrl: 'https://images.unsplash.com/photo-1544885935-98dd03b09034?w=600'
  }
];

export const INITIAL_REELS: ReelItem[] = [
  {
    id: 'reel-1',
    title: 'أجواء باب العمود والبلدة القديمة في القدس',
    publisherName: 'القدس عاصمة القلوب',
    city: 'القدس',
    category: 'سياحة وتراث',
    likesCount: 1420,
    viewsCount: 12500,
    thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'
  },
  {
    id: 'reel-2',
    title: 'سر الكنافة النابلسية على أصولها في خان التجار',
    publisherName: 'حلويات دمشق نابلس',
    city: 'نابلس',
    category: 'مطاعم',
    likesCount: 980,
    viewsCount: 8400,
    thumbnailUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600'
  },
  {
    id: 'reel-3',
    title: 'تجربة قيادة واستعراض هيونداي توسان 2022',
    publisherName: 'معرض فلسطين للسيارات',
    city: 'رام الله',
    category: 'سيارات',
    likesCount: 650,
    viewsCount: 5200,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600'
  }
];

export const INITIAL_ORDERS: OrderItem[] = [
  {
    id: 'ord-101',
    adId: 'ad-3',
    adTitle: 'آيفون 15 برو ماكس 256 جيجا تيتانيوم',
    customerName: 'سامر المصري',
    city: 'رام الله',
    address: 'الماصيون، عمارة القدس ط4',
    quantity: 1,
    unitPrice: 4200,
    deliveryFee: 20,
    totalAmount: 4220,
    orderStatus: 'out_for_delivery',
    paymentMethod: 'الدفع عند الاستلام (COD)',
    createdAt: 'اليوم 11:30 ص'
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: 'خصم 30 شيكل على مشاوير التاكسي',
    pointsCost: 200,
    category: 'taxi',
    description: 'قسيمة خصم فورية بقيمة 30 ₪ صالحة مع كافة كباتن التاكسي المعتمدين في جميع المحافظات.',
    partnerName: 'كباتن فلسطين الموحد',
    city: 'كافة المحافظات',
    discountValueText: '30 ₪ خصم',
    codePrefix: 'PAL-TAXI',
    badge: 'الأكثر طلباً 🔥',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600'
  },
  {
    id: 'rew-2',
    title: 'توصيل مجاني لطلبك القادم',
    pointsCost: 150,
    category: 'delivery',
    description: 'إعفاء كامل من رسوم التوصيل والشحن لأي سلعة تطلبها من سوق الإعلانات والمتاجر.',
    partnerName: 'أجنحة التوصيل السريع',
    city: 'الضفة والقدس',
    discountValueText: 'شحن مجاني 100%',
    codePrefix: 'PAL-SHIP',
    badge: 'توفير فوري ⚡',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600'
  },
  {
    id: 'rew-3',
    title: 'سدر كنافة نابلسية خشنة/ناعمة لشخصين',
    pointsCost: 280,
    category: 'food',
    description: 'ضيافة فلسطينية أصيلة من حلويات الأقصى ودمشق نابلس بالسمن البلدي والجبنة البلدية الفاخرة.',
    partnerName: 'حلويات دمشق والأقصى',
    city: 'نابلس / رام الله',
    discountValueText: 'وجبة كنافة مجانية',
    codePrefix: 'PAL-KNFE',
    badge: 'ضيافة بلدنا 🍯',
    imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600'
  },
  {
    id: 'rew-4',
    title: 'قسيمة شراء 50 شيكل إلكترونيات وملحقات',
    pointsCost: 350,
    category: 'shopping',
    description: 'خصم 50 ₪ على أي سماعات، شواحن، إكسسوارات أو هواتف ذكية من متاجر الإلكترونيات المعتمدة.',
    partnerName: 'معرض الأمل للتكنولوجيا',
    city: 'رام الله / الخليل',
    discountValueText: '50 ₪ كاش باك',
    codePrefix: 'PAL-TECH',
    badge: 'قسيمة نقدية 📱',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600'
  },
  {
    id: 'rew-5',
    title: 'سلة زيت زيتون وصابون غار نابلسي بلدي',
    pointsCost: 450,
    category: 'shopping',
    description: 'هدية تراثية مكونة من قنينة زيت زيتون بكر كبيس جنين وصابون نابلسي بلدي أصلي بزيت الزيتون.',
    partnerName: 'تعاونية خيرات فلسطين',
    city: 'جنين / نابلس',
    discountValueText: 'هدية تراثية كاملة',
    codePrefix: 'PAL-HERIT',
    badge: 'تراث الأرض 🌿',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600'
  },
  {
    id: 'rew-6',
    title: 'تبرع باسمك بقيمة 25 شيكل لصندوق الطالب المحتاج',
    pointsCost: 180,
    category: 'charity',
    description: 'حوّل نقاطك لعمل خير مباشر يساند طالب جامعي فلسطيني متفوق في دراسته، مع إرسال إشعار تبرع باسمك.',
    partnerName: 'صندوق التكافل الطلابي الفلسطيني',
    city: 'جامعات فلسطين',
    discountValueText: 'تبرع 25 ₪ صدقة جارية',
    codePrefix: 'PAL-CHAR',
    badge: 'تكافل وطني 🤝',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb9?w=600'
  }
];

export const INITIAL_USER_POINTS: UserPointsState = {
  currentPoints: 380,
  totalEarned: 530,
  level: 'فضي',
  transactions: [
    {
      id: 'tx-1',
      type: 'earn',
      amount: 100,
      reason: 'هدية ترحيبية للانضمام لمنصة فلسطين 🇵🇸',
      createdAt: 'منذ أسبوع'
    },
    {
      id: 'tx-2',
      type: 'earn',
      amount: 50,
      reason: 'إتمام طلب شراء آيفون 15 برو ماكس',
      createdAt: 'منذ 3 أيام'
    },
    {
      id: 'tx-3',
      type: 'earn',
      amount: 40,
      reason: 'إتمام رحلة تاكسي من المنارة إلى بيرزيت',
      createdAt: 'منذ يومين'
    },
    {
      id: 'tx-4',
      type: 'earn',
      amount: 25,
      reason: 'إضافة تقييم ومراجعة لكابتن تاكسي القدس',
      createdAt: 'أمس'
    },
    {
      id: 'tx-5',
      type: 'earn',
      amount: 15,
      reason: 'التفاعل ومشاركة إعلان شقة الطيرة',
      createdAt: 'اليوم'
    },
    {
      id: 'tx-6',
      type: 'redeem',
      amount: 150,
      reason: 'استبدال قسيمة توصيل مجاني',
      createdAt: 'منذ يومين'
    }
  ],
  redeemedRewards: [
    {
      id: 'red-101',
      rewardId: 'rew-2',
      rewardTitle: 'توصيل مجاني لطلبك القادم',
      voucherCode: 'PAL-SHIP-9942',
      pointsSpent: 150,
      discountValueText: 'شحن مجاني 100%',
      partnerName: 'أجنحة التوصيل السريع',
      redeemedAt: 'منذ يومين',
      status: 'active'
    }
  ]
};
