package com.aistudio.palestineplatform

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.palestineplatform.data.PalestineRepository
import com.aistudio.palestineplatform.model.Ad
import com.aistudio.palestineplatform.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PalestinePlatformTheme {
                MainAppScaffold()
            }
        }
    }
}

enum class ScreenTab(val title: String, val icon: ImageVector) {
    HOME("الرئيسية", Icons.Default.Home),
    ADS("الإعلانات", Icons.Default.ShoppingCart),
    TAXI("تاكسي", Icons.Default.DirectionsCar),
    PLACES("الخريطة", Icons.Default.Place),
    SERVICES("الخدمات", Icons.Default.Handyman),
    ORDERS("طلباتي", Icons.Default.Inventory2),
    PROFILE("حسابي", Icons.Default.Person)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    var currentTab by remember { mutableStateOf(ScreenTab.HOME) }
    var searchQuery by remember { mutableStateOf("") }
    var showNewAdDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = PalestineGreen,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text("🇵🇸", fontSize = 20.sp)
                            }
                        }
                        Column {
                            Text(
                                "فلسطين بلاتفورم",
                                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                                color = Color.White
                            )
                            Text(
                                "كل فلسطين في مكان واحد",
                                style = MaterialTheme.typography.bodySmall,
                                color = Color.White.copy(alpha = 0.8f)
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = NavyPrimary,
                    titleContentColor = Color.White
                ),
                actions = {
                    IconButton(
                        onClick = { showNewAdDialog = true },
                        modifier = Modifier.testTag("action_add_ad")
                    ) {
                        Icon(Icons.Default.AddCircle, contentDescription = "إضافة إعلان", tint = Color.White)
                    }
                }
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                ScreenTab.values().take(5).forEach { tab ->
                    NavigationBarItem(
                        selected = currentTab == tab,
                        onClick = { currentTab = tab },
                        icon = { Icon(tab.icon, contentDescription = tab.title) },
                        label = { Text(tab.title, fontSize = 11.sp, fontWeight = if (currentTab == tab) FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = NavyPrimary,
                            selectedTextColor = NavyPrimary,
                            indicatorColor = NavyPrimary.copy(alpha = 0.1f)
                        ),
                        modifier = Modifier.testTag("nav_tab_${tab.name.lowercase()}")
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(SlateBackground)
        ) {
            when (currentTab) {
                ScreenTab.HOME -> HomeScreen(
                    onNavigateToTab = { currentTab = it },
                    onOpenAddAd = { showNewAdDialog = true }
                )
                ScreenTab.ADS -> AdsListScreen()
                ScreenTab.TAXI -> TaxiBookingScreen()
                ScreenTab.PLACES -> PlacesListScreen()
                ScreenTab.SERVICES -> ServicesListScreen()
                ScreenTab.ORDERS -> OrdersListScreen()
                ScreenTab.PROFILE -> ProfileScreen()
            }
        }
    }

    if (showNewAdDialog) {
        CreateAdDialog(onDismiss = { showNewAdDialog = false })
    }
}

@Composable
fun HomeScreen(
    onNavigateToTab: (ScreenTab) -> Unit,
    onOpenAddAd: () -> Unit
) {
    val ads by PalestineRepository.ads.collectAsState()
    val taxiReqs by PalestineRepository.taxiRequests.collectAsState()
    val places by PalestineRepository.places.collectAsState()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Hero Section
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = NavyDark),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        "فلسطين تجمعنا",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        "سوق إلكتروني موحد، حجز تاكسي فوري، خدمات وأماكن موثوقة في القدس والضفة وغزة.",
                        fontSize = 14.sp,
                        color = Color.White.copy(alpha = 0.85f),
                        lineHeight = 20.sp
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = { onNavigateToTab(ScreenTab.TAXI) },
                            colors = ButtonDefaults.buttonColors(containerColor = GoldAccent),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("home_hero_order_taxi")
                        ) {
                            Text("🚕 اطلب تاكسي", color = TextDark, fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = onOpenAddAd,
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.testTag("home_hero_add_ad")
                        ) {
                            Text("+ أضف إعلانك", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Live Quick Stats
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                QuickStatCard(
                    title = "إعلانات نشطة",
                    value = "${ads.size}",
                    icon = "🛒",
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    title = "سائقون حولك",
                    value = "12 متاح",
                    icon = "🚕",
                    modifier = Modifier.weight(1f)
                )
                QuickStatCard(
                    title = "أماكن مسجلة",
                    value = "${places.size}",
                    icon = "📍",
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Sections Grid
        item {
            Text(
                "الأقسام الرئيسية",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextDark
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    CategoryTile(
                        icon = "🛒",
                        title = "الإعلانات المبوبة",
                        subtitle = "بيع وشراء سيارات وعقارات",
                        onClick = { onNavigateToTab(ScreenTab.ADS) },
                        modifier = Modifier.weight(1f)
                    )
                    CategoryTile(
                        icon = "🚕",
                        title = "طلب تاكسي وتوصيل",
                        subtitle = "سائقون معتمدون في مدينتك",
                        onClick = { onNavigateToTab(ScreenTab.TAXI) },
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    CategoryTile(
                        icon = "🗺️",
                        title = "دليل الأماكن القريبة",
                        subtitle = "مطاعم، فنادق ومتاجر",
                        onClick = { onNavigateToTab(ScreenTab.PLACES) },
                        modifier = Modifier.weight(1f)
                    )
                    CategoryTile(
                        icon = "⚡",
                        title = "الخدمات والصيانة",
                        subtitle = "مهنيون وفنيون بالقرب منك",
                        onClick = { onNavigateToTab(ScreenTab.SERVICES) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Latest Ads Preview
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "أحدث الإعلانات",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextDark
                )
                TextButton(onClick = { onNavigateToTab(ScreenTab.ADS) }) {
                    Text("عرض الكل ←", color = NavyPrimary)
                }
            }
        }

        items(ads.take(3)) { ad ->
            AdListItem(ad = ad)
        }
    }
}

@Composable
fun QuickStatCard(title: String, value: String, icon: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                shape = CircleShape,
                color = SlateBackground,
                modifier = Modifier.size(40.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(icon, fontSize = 20.sp)
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(value, fontWeight = FontWeight.ExtraBold, fontSize = 16.sp, color = NavyPrimary)
            Text(title, fontSize = 11.sp, color = TextMuted, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
fun CategoryTile(
    icon: String,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.clickable { onClick() },
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = CardSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Surface(
                shape = RoundedCornerShape(12.dp),
                color = NavyPrimary.copy(alpha = 0.08f),
                modifier = Modifier.size(46.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(icon, fontSize = 24.sp)
                }
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(title, fontWeight = FontWeight.ExtraBold, fontSize = 15.sp, color = TextDark)
            Spacer(modifier = Modifier.height(2.dp))
            Text(subtitle, fontSize = 11.sp, color = TextMuted, lineHeight = 16.sp)
        }
    }
}

@Composable
fun AdListItem(ad: Ad) {
    var isFav by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = CardSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(76.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(SlateBackground),
                contentAlignment = Alignment.Center
            ) {
                Text("📷", fontSize = 26.sp)
            }
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        ad.category,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = NavyPrimary,
                        modifier = Modifier
                            .background(NavyPrimary.copy(alpha = 0.1f), RoundedCornerShape(4.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                    IconButton(
                        onClick = { isFav = !isFav },
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            if (isFav) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "المفضلة",
                            tint = if (isFav) PalestineRed else TextMuted
                        )
                    }
                }
                Text(
                    ad.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextDark,
                    maxLines = 1
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        "${ad.price.toInt()} ₪",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 15.sp,
                        color = PalestineGreen
                    )
                    Text("📍 ${ad.city}", fontSize = 12.sp, color = TextMuted)
                }
            }
        }
    }
}

@Composable
fun AdsListScreen() {
    val ads by PalestineRepository.ads.collectAsState()
    var selectedCat by remember { mutableStateOf("الكل") }
    val categories = listOf("الكل", "عقارات", "سيارات", "إلكترونيات", "أثاث", "وظائف")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("سوق الإعلانات المبوبة", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
        Spacer(modifier = Modifier.height(12.dp))

        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(categories) { cat ->
                FilterChip(
                    selected = selectedCat == cat,
                    onClick = { selectedCat = cat },
                    label = { Text(cat) }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        val filteredAds = if (selectedCat == "الكل") ads else ads.filter { it.category == selectedCat }

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredAds) { ad ->
                AdListItem(ad = ad)
            }
        }
    }
}

@Composable
fun TaxiBookingScreen() {
    var fromLocation by remember { mutableStateOf("") }
    var toLocation by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("رام الله") }
    var passengerCount by remember { mutableStateOf(1) }
    var successMsg by remember { mutableStateOf(false) }

    val taxiRequests by PalestineRepository.taxiRequests.collectAsState()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Text("طلب تاكسي فوري 🚕", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
            Text("حدد موقعك ونقطة الوصول وسيقوم أقرب سائق متاح بقبول رحلتك فوراً.", fontSize = 13.sp, color = TextMuted)
        }

        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = CardSurface)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = fromLocation,
                        onValueChange = { fromLocation = it },
                        label = { Text("نقطة الانطلاق (مكانك الحالي)") },
                        modifier = Modifier.fillMaxWidth().testTag("input_from_loc"),
                        leadingIcon = { Icon(Icons.Default.Place, contentDescription = null, tint = PalestineGreen) }
                    )

                    OutlinedTextField(
                        value = toLocation,
                        onValueChange = { toLocation = it },
                        label = { Text("الوجهة المطلوبة") },
                        modifier = Modifier.fillMaxWidth().testTag("input_to_loc"),
                        leadingIcon = { Icon(Icons.Default.Navigation, contentDescription = null, tint = NavyPrimary) }
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("عدد الركاب: $passengerCount", fontWeight = FontWeight.SemiBold)
                        Row {
                            IconButton(onClick = { if (passengerCount > 1) passengerCount-- }) {
                                Icon(Icons.Default.Remove, contentDescription = "تقليل")
                            }
                            IconButton(onClick = { if (passengerCount < 6) passengerCount++ }) {
                                Icon(Icons.Default.Add, contentDescription = "زيادة")
                            }
                        }
                    }

                    Button(
                        onClick = {
                            if (fromLocation.isNotBlank() && toLocation.isNotBlank()) {
                                PalestineRepository.requestTaxi(
                                    from = fromLocation,
                                    to = toLocation,
                                    city = city,
                                    people = passengerCount,
                                    name = "مستخدم فلسطيني",
                                    phone = "0599000111"
                                )
                                successMsg = true
                                fromLocation = ""
                                toLocation = ""
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                        modifier = Modifier.fillMaxWidth().testTag("btn_submit_taxi")
                    ) {
                        Text("تأكيد طلب التاكسي", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }

                    if (successMsg) {
                        Text(
                            "✅ تم إرسال طلبك بنجاح! يتم البحث عن أقرب سائق...",
                            color = PalestineGreen,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }
                }
            }
        }

        item {
            Text("الرحلات النشطة والسابقة", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = TextDark)
        }

        items(taxiRequests) { req ->
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CardSurface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("من: ${req.fromLocation}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        Text(
                            req.status,
                            color = if (req.status == "accepted") PalestineGreen else NavyPrimary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                    Text("إلى: ${req.toLocation}", fontSize = 13.sp, color = TextMuted)
                    if (req.driverName != null) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("السائق: ${req.driverName}", fontSize = 12.sp, color = NavyPrimary)
                    }
                }
            }
        }
    }
}

@Composable
fun PlacesListScreen() {
    val places by PalestineRepository.places.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("دليل فلسطين والأماكن القريبة 🗺️", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
        Text("استكشف المطاعم، المقاهي، المحلات والمعالم التراثية في مختلف المدن.", fontSize = 13.sp, color = TextMuted)
        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(places) { place ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(place.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextDark)
                            Text("⭐ ${place.rating}", color = GoldAccent, fontWeight = FontWeight.Bold)
                        }
                        Text("📍 ${place.city} - ${place.address}", fontSize = 12.sp, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(place.description, fontSize = 13.sp, color = TextDark, lineHeight = 18.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("📞 ${place.phone}", fontSize = 12.sp, color = NavyPrimary, fontWeight = FontWeight.SemiBold)
                            Text("تصنيف: ${place.category}", fontSize = 12.sp, color = PalestineGreen)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ServicesListScreen() {
    val providers by PalestineRepository.serviceProviders.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("دليل الخدمات والمهنيين ⚡", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
        Text("توصيل، صيانة، أعمال منزلية، ونقل بأسعار شفافة وفنيين معتمدين.", fontSize = 13.sp, color = TextMuted)
        Spacer(modifier = Modifier.height(14.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(providers) { provider ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = NavyPrimary.copy(alpha = 0.1f),
                            modifier = Modifier.size(50.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(if (provider.serviceType == "taxi") "🚕" else if (provider.serviceType == "delivery") "📦" else "🛠️", fontSize = 24.sp)
                            }
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(provider.displayName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextDark)
                            Text("📍 ${provider.city} · ${if (provider.isAvailable) "🟢 متاح الآن" else "مغلق"}", fontSize = 12.sp, color = TextMuted)
                            Text("يبدأ من ${provider.basePrice.toInt()} ₪", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = PalestineGreen)
                        }
                        Button(
                            onClick = { },
                            colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text("تواصل", fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun OrdersListScreen() {
    val orders by PalestineRepository.orders.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text("طلباتي ومشترياتي 📦", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextDark)
        Spacer(modifier = Modifier.height(12.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            items(orders) { order ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = CardSurface),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(order.adTitle, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                            Text(
                                "قيد التوصيل",
                                color = PalestineGreen,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                        Text("العميل: ${order.customerName} - ${order.city}", fontSize = 12.sp, color = TextMuted)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            "المجموع: ${order.totalAmount.toInt()} ₪ (شامل التوصيل)",
                            fontWeight = FontWeight.Bold,
                            color = NavyPrimary
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Surface(
            shape = CircleShape,
            color = NavyPrimary,
            modifier = Modifier.size(80.dp)
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("🇵🇸", fontSize = 40.sp)
            }
        }
        Text("المستخدم الفلسطيني", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("القدس الشريف / رام الله · حساب موثق", fontSize = 13.sp, color = TextMuted)

        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = CardSurface),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("إعلاناتي النشطة")
                    Text("3 إعلانات", fontWeight = FontWeight.Bold, color = NavyPrimary)
                }
                Divider()
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("المفضلة المحفوظة")
                    Text("2 عناصر", fontWeight = FontWeight.Bold, color = NavyPrimary)
                }
                Divider()
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("حالة السائق / مقدم الخدمة")
                    Text("مقدم خدمة معتمد", fontWeight = FontWeight.Bold, color = PalestineGreen)
                }
            }
        }
    }
}

@Composable
fun CreateAdDialog(onDismiss: () -> Unit) {
    var title by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("عقارات") }
    var price by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("رام الله") }
    var phone by remember { mutableStateOf("") }
    var desc by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("إضافة إعلان جديد", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("عنوان الإعلان") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("السعر بالشيكل (₪)") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("رقم الهاتف للتواصل") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = desc,
                    onValueChange = { desc = it },
                    label = { Text("وصف مختصر") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        PalestineRepository.addAd(
                            Ad(
                                id = "ad-" + System.currentTimeMillis(),
                                title = title,
                                category = category,
                                description = desc,
                                price = price.toDoubleOrNull() ?: 0.0,
                                city = city,
                                phone = phone
                            )
                        )
                        onDismiss()
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = NavyPrimary)
            ) {
                Text("نشر الإعلان")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("إلغاء")
            }
        }
    )
}
