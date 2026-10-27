export interface AdItem {
  id: string;
  title: string;
  category: string;
  price: number;
  city: string;
  phone: string;
  description: string;
  imageUrl?: string;
  locationName?: string;
  deliveryAvailable?: boolean;
  deliveryFee?: number;
  allowCod?: boolean;
  createdAt?: string;
}

export interface PlaceItem {
  id: string;
  name: string;
  category: string;
  city: string;
  address: string;
  description: string;
  phone: string;
  rating: number;
  latitude: number;
  longitude: number;
  imageUrl?: string;
}

export interface ServiceProviderItem {
  id: string;
  displayName: string;
  serviceType: 'taxi' | 'delivery' | 'home' | 'food' | 'transport';
  city: string;
  contactPhone: string;
  vehicleType?: string;
  basePrice: number;
  rating: number;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
}

export interface TaxiBooking {
  id: string;
  fromLocation: string;
  toLocation: string;
  city: string;
  passengerCount: number;
  fareEstimate: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  driverName?: string;
  driverPhone?: string;
  vehicle?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  adId: string;
  adTitle: string;
  customerName: string;
  city: string;
  address: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
  totalAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
  paymentMethod: string;
  createdAt: string;
}

export interface TravelPackageItem {
  id: string;
  title: string;
  officeName: string;
  destination: string;
  durationDays: number;
  priceIls: number;
  description: string;
  phone: string;
  imageUrl: string;
}

export interface ReelItem {
  id: string;
  title: string;
  publisherName: string;
  city: string;
  category: string;
  likesCount: number;
  viewsCount: number;
  videoUrl?: string;
  thumbnailUrl: string;
}
