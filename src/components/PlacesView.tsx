import React, { useState, useEffect, useRef } from 'react';
import { PlaceItem } from '../types';
import {
  MapPin,
  Navigation,
  Star,
  Phone,
  LocateFixed,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  Map as MapIcon,
  List,
  Search,
  X
} from 'lucide-react';
import L from 'leaflet';

interface PlacesViewProps {
  places: PlaceItem[];
}

export const PlacesView: React.FC<PlacesViewProps> = ({ places }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [activePlaceId, setActivePlaceId] = useState<string | null>(null);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [mapTileStyle, setMapTileStyle] = useState<'standard' | 'humanitarian'>('standard');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const markerMapRef = useRef<{ [id: string]: L.Marker }>({});

  const categories = ['الكل', 'مطاعم', 'حلويات ومأكولات', 'فنادق وسياحة', 'حرف وتراث'];
  const cities = ['الكل', 'القدس', 'رام الله', 'نابلس', 'الخليل', 'بيت لحم', 'جنين', 'أريحا'];

  const filteredPlaces = places.filter((p) => {
    const matchCity = selectedCity === 'الكل' || p.city === selectedCity;
    const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchSearch =
      query === '' ||
      p.name.toLowerCase().includes(query) ||
      p.city.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);
    return matchCity && matchCat && matchSearch;
  });

  // Calculate distance from user coordinates
  const calculateDistance = (lat: number, lng: number): string => {
    if (!userCoords) return '';
    const R = 6371; // km
    const dLat = ((lat - userCoords.lat) * Math.PI) / 180;
    const dLon = ((lng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return `${d.toFixed(1)} كم`;
  };

  // Helper for category emoji and colors
  const getCategoryDetails = (category: string) => {
    switch (category) {
      case 'مطاعم':
        return { emoji: '🍔', bg: '#E4312B', color: '#ffffff' }; // Palestine red
      case 'حلويات ومأكولات':
        return { emoji: '🍰', bg: '#D4AF37', color: '#123B68' }; // Gold
      case 'فنادق وسياحة':
        return { emoji: '🏨', bg: '#123B68', color: '#ffffff' }; // Navy
      case 'حرف وتراث':
        return { emoji: '🏺', bg: '#007A3D', color: '#ffffff' }; // Palestine green
      default:
        return { emoji: '📍', bg: '#0A223E', color: '#ffffff' };
    }
  };

  // Create customized HTML div icon for Leaflet
  const createCustomMarkerIcon = (place: PlaceItem, isActive: boolean) => {
    const { emoji, bg } = getCategoryDetails(place.category);
    const size = isActive ? 44 : 36;

    const html = `
      <div class="custom-map-pin" style="width: ${size}px; height: ${size}px; position: relative;">
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bg};
          border: ${isActive ? '3px solid #ffffff' : '2px solid #ffffff'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        ">
          <span style="
            transform: rotate(45deg);
            font-size: ${isActive ? '18px' : '15px'};
            line-height: 1;
            user-select: none;
          ">${emoji}</span>
        </div>
        ${
          isActive
            ? `<div style="
                position: absolute;
                bottom: -22px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(18, 59, 104, 0.95);
                color: white;
                font-size: 11px;
                font-weight: 700;
                padding: 2px 8px;
                border-radius: 6px;
                white-space: nowrap;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              ">${place.name}</div>`
            : ''
        }
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-div-icon',
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size],
      popupAnchor: [0, -size - 4]
    });
  };

  // Create popup HTML
  const createPopupContent = (place: PlaceItem) => {
    const { bg } = getCategoryDetails(place.category);
    return `
      <div style="min-width: 240px; max-width: 280px; direction: rtl; text-align: right; font-family: inherit;">
        ${
          place.imageUrl
            ? `<div style="height: 110px; width: 100%; overflow: hidden; background: #e2e8f0;">
                <img src="${place.imageUrl}" alt="${place.name}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>`
            : ''
        }
        <div style="padding: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: start; gap: 8px;">
            <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0F172A; line-height: 1.3;">${place.name}</h4>
            <span style="background: #FEF3C7; color: #B45309; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 6px; display: inline-flex; align-items: center; gap: 2px; flex-shrink: 0;">
              ⭐ ${place.rating}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 11px; color: #64748B;">
            <span>📍 ${place.city} - ${place.address}</span>
          </div>

          <p style="margin: 6px 0 10px 0; font-size: 11px; color: #475569; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${place.description}
          </p>

          <div style="display: flex; gap: 6px; border-top: 1px solid #F1F5F9; padding-top: 8px;">
            <a href="tel:${place.phone}" style="
              flex: 1;
              background: #123B68;
              color: white;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 0;
              border-radius: 8px;
              text-align: center;
              display: inline-block;
            ">
              📞 اتصال: ${place.phone}
            </a>
            <a href="https://maps.google.com/?q=${place.latitude},${place.longitude}" target="_blank" rel="noreferrer" style="
              background: #F1F5F9;
              color: #123B68;
              text-decoration: none;
              font-size: 11px;
              font-weight: 700;
              padding: 6px 10px;
              border-radius: 8px;
              text-align: center;
              display: inline-block;
            ">
              🧭 مسار
            </a>
          </div>
        </div>
      </div>
    `;
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on West Bank / Jerusalem / Palestine
    const map = L.map(mapContainerRef.current, {
      center: [31.9038, 35.2034], // Ramallah / Jerusalem center
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true
    });

    const tileUrl =
      mapTileStyle === 'standard'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Group for place markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Change Tile Layer if style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileUrl =
      mapTileStyle === 'standard'
        ? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

    const newLayer = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapTileStyle]);

  // 3. Populate Markers when filteredPlaces changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markerMapRef.current = {};

    const bounds = L.latLngBounds([]);

    filteredPlaces.forEach((place) => {
      const isSelected = activePlaceId === place.id;
      const markerIcon = createCustomMarkerIcon(place, isSelected);

      const marker = L.marker([place.latitude, place.longitude], {
        icon: markerIcon,
        title: place.name
      });

      marker.bindPopup(createPopupContent(place), {
        closeButton: true,
        autoPan: true
      });

      marker.on('click', () => {
        setActivePlaceId(place.id);
      });

      marker.addTo(markersLayer);
      markerMapRef.current[place.id] = marker;
      bounds.extend([place.latitude, place.longitude]);
    });

    // If we have markers and user didn't explicitly select a single place, fit bounds
    if (filteredPlaces.length > 0 && !activePlaceId) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredPlaces, activePlaceId]);

  // 4. Handle resize when map is expanded
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 250);
    }
  }, [isMapExpanded]);

  // Handle focusing on a place from the list
  const focusPlaceOnMap = (place: PlaceItem) => {
    setActivePlaceId(place.id);
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([place.latitude, place.longitude], 14, {
      duration: 1.2
    });

    const marker = markerMapRef.current[place.id];
    if (marker) {
      marker.openPopup();
    }

    // Scroll smoothly to map on mobile if needed
    if (mapContainerRef.current && window.innerWidth < 640) {
      mapContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Reset Map View to encompass all places
  const handleResetView = () => {
    setActivePlaceId(null);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (filteredPlaces.length > 0) {
      const bounds = L.latLngBounds(filteredPlaces.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([31.9038, 35.2034], 10);
    }
  };

  // User location handling
  const handleLocateMe = () => {
    setLocating(true);
    const successCallback = (lat: number, lng: number) => {
      setUserCoords({ lat, lng });
      setLocating(false);

      const map = mapInstanceRef.current;
      if (!map) return;

      // Remove existing user marker
      if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
      if (userCircleRef.current) map.removeLayer(userCircleRef.current);

      // Create animated pulsing user location icon
      const userHtml = `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: #007A3D; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #007A3D; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: userHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const uMarker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      uMarker.bindPopup(
        `<div style="padding: 8px; direction: rtl; text-align: center; font-weight: 700; font-size: 12px; color: #007A3D;">
          📍 موقعك الحالي التقريبي
        </div>`
      );

      const uCircle = L.circle([lat, lng], {
        radius: 400,
        color: '#007A3D',
        fillColor: '#007A3D',
        fillOpacity: 0.1,
        weight: 1.5
      }).addTo(map);

      userMarkerRef.current = uMarker;
      userCircleRef.current = uCircle;

      map.flyTo([lat, lng], 13, { duration: 1.5 });
      uMarker.openPopup();
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          successCallback(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Default to Ramallah if permission is denied
          successCallback(31.9038, 35.2034);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      successCallback(31.9038, 35.2034);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-navy-900 dark:text-white flex items-center gap-2">
            <span>دليل الأماكن والخريطة الجغرافية</span>
            <MapIcon className="w-5 h-5 text-palestine-green" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            استكشف المطاعم، المقاهي، المعالم، والمحلات التراثية في فلسطين
          </p>
        </div>

        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-1.5 bg-palestine-green hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm transition active:scale-95"
          title="تحديد موقعك لعرض أقرب الأماكن إليك"
        >
          <LocateFixed className="w-4 h-4" />
          <span>{locating ? 'جارٍ التحديد...' : 'موقعي الآن'}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setActivePlaceId(null);
          }}
          placeholder="ابحث بالاسم أو المدينة (مثال: زرياب، القدس، رام الله، نابلس...)"
          className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm rounded-2xl py-3 pr-11 pl-10 border border-slate-200/90 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-emerald-500 transition"
        />
        <Search className="absolute right-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
        {searchQuery ? (
          <button
            onClick={() => {
              setSearchQuery('');
              setActivePlaceId(null);
            }}
            className="absolute left-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="مسح البحث"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <span className="absolute left-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md pointer-events-none">
            {filteredPlaces.length} نتيجة
          </span>
        )}
      </div>

      {/* Interactive Geographical Leaflet Map */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 transition-all duration-300">
        {/* Map Header Toolbar overlay */}
        <div className="absolute top-3 right-3 left-3 z-[15] pointer-events-none flex items-center justify-between">
          <div className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-navy-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-palestine-green animate-pulse" />
            <span>خريطة فلسطين الحية ({filteredPlaces.length} موقع)</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-1.5">
            <button
              onClick={() =>
                setMapTileStyle((prev) => (prev === 'standard' ? 'humanitarian' : 'standard'))
              }
              className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition"
              title="تغيير نمط الخريطة"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetView}
              className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition"
              title="إعادة ضبط نطاق الخريطة"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMapExpanded((prev) => !prev)}
              className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 p-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 transition"
              title={isMapExpanded ? 'تصغير الخريطة' : 'تكبير الخريطة'}
            >
              {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div
          ref={mapContainerRef}
          style={{ height: isMapExpanded ? '520px' : '360px' }}
          className="w-full transition-all duration-300 z-0"
        />

        {/* Map Legend Footer overlay */}
        <div className="absolute bottom-2 right-2 left-2 z-[15] pointer-events-none flex items-center justify-between text-[10px]">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-sm border border-slate-200 flex items-center gap-3 text-slate-700">
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-palestine-red inline-block" /> مطاعم
            </span>
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-gold inline-block" /> حلويات
            </span>
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-navy-800 inline-block" /> فنادق
            </span>
            <span className="flex items-center gap-1 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-palestine-green inline-block" /> تراث
            </span>
          </div>

          {userCoords && (
            <div className="pointer-events-auto bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-bold shadow-sm">
              تم تحديد موقعك بدقة
            </div>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setActivePlaceId(null);
            }}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap font-medium transition active:scale-95 ${
              selectedCategory === cat
                ? 'bg-navy-800 text-white shadow-sm font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* City Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <span className="text-slate-400 font-bold whitespace-nowrap">المدينة:</span>
        {cities.map((city) => (
          <button
            key={city}
            onClick={() => {
              setSelectedCity(city);
              setActivePlaceId(null);
            }}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition ${
              selectedCity === city
                ? 'bg-palestine-green text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Places Cards List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-navy-900 dark:text-white flex items-center gap-1.5">
            <List className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>قائمة الأماكن المعروضة ({filteredPlaces.length})</span>
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">انقر على المكان لتحديده على الخريطة</span>
        </div>

        {filteredPlaces.map((place) => {
          const dist = calculateDistance(place.latitude, place.longitude);
          const isSelected = activePlaceId === place.id;
          const { emoji } = getCategoryDetails(place.category);

          return (
            <div
              key={place.id}
              onClick={() => focusPlaceOnMap(place)}
              className={`cursor-pointer rounded-2xl border transition-all duration-200 p-4 space-y-3 ${
                isSelected
                  ? 'bg-blue-50/70 dark:bg-slate-850 border-navy-800 dark:border-emerald-500 shadow-md ring-2 ring-navy-800/20 dark:ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                    {emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-navy-900 dark:text-white">{place.name}</h4>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-bold">
                        {place.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>
                        {place.city} - {place.address}
                      </span>
                      {dist && (
                        <span className="text-palestine-green dark:text-emerald-400 font-bold mr-1.5">
                          (تبعد {dist})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800/40">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{place.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{place.description}</p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={`tel:${place.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-xs font-bold text-navy-800 dark:text-amber-400 hover:text-navy-900 dark:hover:text-amber-300"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{place.phone}</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      focusPlaceOnMap(place);
                    }}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
                      isSelected
                        ? 'bg-navy-800 dark:bg-emerald-600 text-white'
                        : 'bg-navy-800/10 dark:bg-slate-800 text-navy-800 dark:text-slate-200 hover:bg-navy-800/20 dark:hover:bg-slate-750'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>تحديد على الخريطة</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPlaces.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 space-y-2 border border-slate-200 dark:border-slate-800">
            <div className="text-4xl">🗺️</div>
            <p className="font-bold text-sm text-slate-800 dark:text-slate-200">لا توجد أماكن مطابقة لهذا التصنيف في المدينة المحددة</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">يرجى اختيار مدينة أخرى أو عرض "الكل".</p>
          </div>
        )}
      </div>
    </div>
  );
};
