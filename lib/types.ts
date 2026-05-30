
// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  weight: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Order Types
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  status: OrderStatus;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}


export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Admin Types
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

// CMS Types
export interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  updatedAt: string;
}

// Filter Types
export interface ProductFilters {
  categories: string[];
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  search: string;
  sortBy: "price-asc" | "price-desc" | "name-asc" | "name-desc" | "rating" | "newest";
}
