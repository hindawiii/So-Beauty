export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProductCategory = "fragrance" | "hair" | "makeup" | "skincare";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: ProductCategory;
  is_active: boolean;
  stock: number;
  created_at: string;
  name_en?: string | null;
  description_en?: string | null;
  gallery_images?: string[];
};

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  total: number;
  status: OrderStatus;
  full_name: string;
  phone: string;
  shipping_address: string;
  city: string;
  notes?: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type UserProfile = {
  id: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
};

export type ReviewRecord = {
  id: string;
  name: string;
  rating: number;
  body: string;
  is_approved: boolean;
  product_id: string | null;
  product_name: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Enums: {
      product_category: ProductCategory;
      order_status: OrderStatus;
    };
    Tables: {
      products: {
        Row: Product;
        Insert: Partial<Product> & {
          name: string;
          price: number;
          category: ProductCategory;
        };
        Update: Partial<Product>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "created_at"> & { created_at?: string };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "created_at"> & { created_at?: string };
        Update: Partial<OrderItem>;
      };
      profiles: {
        Row: UserProfile;
        Insert: Partial<UserProfile> & { id: string; full_name: string };
        Update: Partial<UserProfile>;
      };
      reviews: {
        Row: ReviewRecord;
        Insert: Omit<ReviewRecord, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<ReviewRecord>;
      };
    };
  };
};
