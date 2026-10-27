package com.aistudio.palestineplatform.data

import com.aistudio.palestineplatform.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

object PalestineRepository {

    private val _ads = MutableStateFlow(
        listOf(
            Ad(
                id = "ad-1",
                title = "شقة إطلالة بانورامية في الطيرة",
                category = "عقارات",
                description = "شقة مفروشة 160م²، 3 غرف نوم، تدفئة مركزية وموقف سيارة خاص.",
                price = 3500.0,
                city = "رام الله",
                phone = "0599123456",
                locationName = "حي الطيرة",
                imageUrls = listOf("https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"),
                allowCod = true
            ),
            Ad(
                id = "ad-2",
                title = "هيونداي توسان 2022 بحالة الوكالة",
                category = "سيارات",
                description = "محرك 1600 تيربو، فل كامل، فتحة بانوراما، فحص نخب أول ترخيص ساري.",
                price = 118000.0,
                city = "نابلس",
                phone = "0598765432",
                locationName = "شارع رفيديا",
                imageUrls = listOf("https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600")
            ),
            Ad(
                id = "ad-3",
                title = "آيفون 15 برو ماكس 256 جيجا",
                category = "إلكترونيات",
                description = "بطارية 100%، لون تيتانيوم طبيعي، مع الكرتونة وكفالة سارية 6 شهور.",
                price = 4200.0,
                city = "القدس",
                phone = "0522114477",
                locationName = "شارع صلاح الدين",
                imageUrls = listOf("https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600")
            ),
            Ad(
                id = "ad-4",
                title = "طقم كنب صالون تركي فاخر 8 مقاعد",
                category = "أثاث",
                description = "قماش وتر بروف قابل للغسيل مع طاولات خشب بلوط صناعة تركية ممتازة.",
                price = 3200.0,
                city = "الخليل",
                phone = "0569887766",
                locationName = "عين سارة",
                imageUrls = listOf("https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600")
            ),
            Ad(
                id = "ad-5",
                title = "مطلوب مهندس برمجيات React و Kotlin",
                category = "وظائف",
                description = "شركة تقنية رائدة تبحث عن مطور متمرس بدوام كامل أو عمل عن بعد.",
                price = 0.0,
                city = "رام الله",
                phone = "0599001122",
                locationName = "شارع الإرسال"
            )
        )
    )
    val ads: StateFlow<List<Ad>> = _ads.asStateFlow()

    private val _favorites = MutableStateFlow<Set<String>>(setOf("ad-1", "ad-3"))
    val favorites: StateFlow<Set<String>> = _favorites.asStateFlow()

    private val _taxiRequests = MutableStateFlow(
        listOf(
            TaxiRequest(
                id = "tax-1",
                requesterName = "أحمد خليل",
                requesterPhone = "0599112233",
                city = "رام الله",
                fromLocation = "ميدان المنارة",
                toLocation = "جامعة بيرزيت",
                peopleCount = 2,
                estimatedFare = 30.0,
                status = "accepted",
                driverName = "خالد البرغوثي (تويوتا كامري)",
                driverPhone = "0598112233"
            )
        )
    )
    val taxiRequests: StateFlow<List<TaxiRequest>> = _taxiRequests.asStateFlow()

    private val _serviceProviders = MutableStateFlow(
        listOf(
            ServiceProvider(
                id = "sp-1",
                userId = "u-sp1",
                displayName = "تاكسي القدس السريع - أبو عمر",
                serviceType = "taxi",
                city = "القدس",
                contactPhone = "0522445566",
                vehicleType = "سكودا أوكتافيا 2023",
                basePrice = 20.0,
                passengerCapacity = 4,
                rating = 4.95
            ),
            ServiceProvider(
                id = "sp-2",
                userId = "u-sp2",
                displayName = "كابتن رام الله للتوصيل والشحن",
                serviceType = "delivery",
                city = "رام الله",
                contactPhone = "0599334455",
                vehicleType = "فان مقفل فورد",
                basePrice = 15.0,
                rating = 4.88
            ),
            ServiceProvider(
                id = "sp-3",
                userId = "u-sp3",
                displayName = "المهندس للصيانة والتكييف",
                serviceType = "home",
                city = "نابلس",
                contactPhone = "0597112244",
                basePrice = 50.0,
                rating = 4.92
            )
        )
    )
    val serviceProviders: StateFlow<List<ServiceProvider>> = _serviceProviders.asStateFlow()

    private val _places = MutableStateFlow(
        listOf(
            Place(
                id = "pl-1",
                name = "مطعم ومقهى زرياب",
                category = "مطاعم",
                city = "رام الله",
                address = "البلدة القديمة، شارع يافا",
                description = "مأكولات فلسطينية أصيلة وأجواء تراثية دافئة وجلسات عائلية.",
                phone = "022987654",
                latitude = 31.9038,
                longitude = 35.2034,
                rating = 4.9
            ),
            Place(
                id = "pl-2",
                name = "حلويات الأقصى ودمشق نابلس",
                category = "حلويات ومطاعم",
                city = "نابلس",
                address = "خان التجار، البلدة القديمة",
                description = "الكنافة النابلسية الشهيرة على الحطب والحلوى التراثية.",
                phone = "092381234",
                latitude = 32.2211,
                longitude = 35.2544,
                rating = 4.98
            ),
            Place(
                id = "pl-3",
                name = "فندق ومطعم القناطر التراثي",
                category = "فنادق وسياحة",
                city = "بيت لحم",
                address = "قرب ساحة المهد",
                description = "إقامة فاخرة بجوار الأماكن التاريخية والمقدسة.",
                phone = "022741122",
                latitude = 31.7054,
                longitude = 35.2024,
                rating = 4.7
            )
        )
    )
    val places: StateFlow<List<Place>> = _places.asStateFlow()

    private val _orders = MutableStateFlow(
        listOf(
            Order(
                id = "ord-101",
                adId = "ad-3",
                adTitle = "آيفون 15 برو ماكس 256 جيجا",
                customerName = "سامر المصري",
                customerPhone = "0599554433",
                city = "رام الله",
                address = "الماصيون، عمارة القدس ط4",
                quantity = 1,
                unitPrice = 4200.0,
                deliveryFee = 20.0,
                totalAmount = 4220.0,
                deliveryMethod = "delivery",
                paymentMethod = "cash_on_delivery",
                orderStatus = "out_for_delivery"
            )
        )
    )
    val orders: StateFlow<List<Order>> = _orders.asStateFlow()

    private val _travelPackages = MutableStateFlow(
        listOf(
            TravelPackage(
                id = "trv-1",
                title = "رحلة العمرة المميزة جواً مع إقامة 5 نجوم",
                officeName = "شركة القدس للسياحة والسفر",
                destination = "مكة المكرمة والمدينة المنورة",
                durationDays = 10,
                priceIls = 3400.0,
                description = "شاملة تذاكر الطيران، التأشيرة، النقل الخاص بفنادق مطلة على الحرم الشريف.",
                phone = "022956789",
                imageUrl = "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600"
            ),
            TravelPackage(
                id = "trv-2",
                title = "عطلة إسطنبول وطرابزون الساحرة",
                officeName = "أجنحة فلسطين للسفريات",
                destination = "تركيا",
                durationDays = 7,
                priceIls = 2800.0,
                description = "جولات سياحية يومية في البوسفور وأوزنجول مع مرشد سياحي وإفطار بوفيه.",
                phone = "092345678",
                imageUrl = "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600"
            )
        )
    )
    val travelPackages: StateFlow<List<TravelPackage>> = _travelPackages.asStateFlow()

    fun toggleFavorite(adId: String) {
        val current = _favorites.value.toMutableSet()
        if (current.contains(adId)) {
            current.remove(adId)
        } else {
            current.add(adId)
        }
        _favorites.value = current
    }

    fun addAd(ad: Ad) {
        _ads.value = listOf(ad) + _ads.value
    }

    fun requestTaxi(from: String, to: String, city: String, people: Int, name: String, phone: String) {
        val newReq = TaxiRequest(
            id = "tax-" + UUID.randomUUID().toString().take(6),
            requesterName = name,
            requesterPhone = phone,
            city = city,
            fromLocation = from,
            toLocation = to,
            peopleCount = people,
            estimatedFare = 20.0 + (people * 5.0),
            status = "pending",
            driverName = "جاري تعيين سائق قريب...",
            createdAt = "الآن"
        )
        _taxiRequests.value = listOf(newReq) + _taxiRequests.value
    }
}
