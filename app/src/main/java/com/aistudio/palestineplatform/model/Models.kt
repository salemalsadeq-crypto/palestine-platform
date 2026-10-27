package com.aistudio.palestineplatform.model

data class Ad(
    val id: String,
    val title: String,
    val category: String,
    val description: String,
    val price: Double,
    val city: String,
    val phone: String,
    val imageUrls: List<String> = emptyList(),
    val latitude: Double? = null,
    val longitude: Double? = null,
    val locationName: String = "",
    val status: String = "active",
    val deliveryAvailable: Boolean = true,
    val deliveryFee: Double = 15.0,
    val allowCod: Boolean = true,
    val allowOnlinePayment: Boolean = true,
    val createdAt: String = "الآن"
)

data class Place(
    val id: String,
    val name: String,
    val category: String,
    val city: String,
    val address: String,
    val description: String,
    val phone: String,
    val website: String = "",
    val latitude: Double,
    val longitude: Double,
    val imageUrls: List<String> = emptyList(),
    val rating: Double = 4.8,
    val status: String = "published"
)

data class ServiceProvider(
    val id: String,
    val userId: String,
    val displayName: String,
    val serviceType: String, // taxi, delivery, home, food, transport
    val city: String,
    val contactPhone: String,
    val vehicleType: String = "",
    val vehicleNumber: String = "",
    val basePrice: Double = 15.0,
    val passengerCapacity: Int = 4,
    val rating: Double = 4.9,
    val isAvailable: Boolean = true,
    val latitude: Double = 31.7683,
    val longitude: Double = 35.2137
)

data class TaxiRequest(
    val id: String,
    val requesterName: String,
    val requesterPhone: String,
    val city: String,
    val fromLocation: String,
    val toLocation: String,
    val peopleCount: Int = 1,
    val estimatedFare: Double = 25.0,
    val status: String = "pending", // pending, accepted, in_progress, completed, cancelled
    val driverName: String? = null,
    val driverPhone: String? = null,
    val vehicleInfo: String? = null,
    val createdAt: String = "منذ قليل"
)

data class Order(
    val id: String,
    val adId: String,
    val adTitle: String,
    val customerName: String,
    val customerPhone: String,
    val city: String,
    val address: String,
    val quantity: Int = 1,
    val unitPrice: Double,
    val deliveryFee: Double = 15.0,
    val totalAmount: Double,
    val deliveryMethod: String = "delivery", // pickup, delivery
    val paymentMethod: String = "cash_on_delivery", // cash_on_delivery, online
    val orderStatus: String = "confirmed", // pending, confirmed, preparing, out_for_delivery, delivered, cancelled
    val createdAt: String = "اليوم"
)

data class TravelPackage(
    val id: String,
    val title: String,
    val officeName: String,
    val destination: String,
    val durationDays: Int,
    val priceIls: Double,
    val description: String,
    val phone: String,
    val imageUrl: String
)

data class ReelVideo(
    val id: String,
    val title: String,
    val publisherName: String,
    val city: String,
    val category: String,
    val likesCount: Int,
    val viewsCount: Int,
    val adId: String? = null
)

data class AppNotification(
    val id: String,
    val title: String,
    val message: String,
    val timeAgo: String,
    val isRead: Boolean = false,
    val type: String = "system"
)
