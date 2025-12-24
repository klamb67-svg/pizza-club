// lib/supabaseTypes.ts
// TypeScript interfaces for Pizza Club Supabase database tables
// 🔧 TODO: Add foreign key relationships and constraints once database schema is finalized

// ==============================================
// MEMBERS TABLE
// ==============================================

export interface Member {
  id: number;
  first_name: string;           // ✅ Updated to match actual database schema
  last_name: string;            // ✅ Updated to match actual database schema
  username: string;             // ✅ Updated to match actual database schema
  phone: string;
  address?: string;
  password_hash: string;        // ✅ Added to match actual database schema
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}

// ==============================================
// ORDERS TABLE
// ==============================================

export interface Order {
  id: number;
  member_id: number; // 🔧 TODO: Foreign key to members table
  pizza_id: number; // 🔧 TODO: Foreign key to pizzas table
  time_slot_id: number; // 🔧 TODO: Foreign key to time_slots table
  night_id: number; // 🔧 TODO: Foreign key to nights table
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  quantity: number;
  total_price: number;
  special_instructions?: string;
  notes?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// PIZZAS TABLE (MENU)
// ==============================================

export interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  available: boolean;
  category: 'classic' | 'specialty' | 'veggie' | 'meat_lovers';
  ingredients: string[]; // Array of ingredient names
  size_options: ('small' | 'medium' | 'large')[];
  is_featured: boolean;
  preparation_time: number; // Minutes
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// TIME_SLOTS TABLE (SCHEDULE)
// ==============================================

export interface TimeSlot {
  id: string; // uuid
  night_id: string; // uuid - Foreign key to nights table
  starts_at: string; // timestamptz - ISO timestamp (e.g., "2025-11-16T17:45:00Z")
  is_available: boolean;
  created_at: string; // timestamptz - ISO timestamp
}

// ==============================================
// NIGHTS TABLE
// ==============================================

export interface Night {
  id: number;
  date: string; // ISO date string (YYYY-MM-DD)
  day_of_week: 'Friday' | 'Saturday';
  is_active: boolean;
  max_capacity: number;
  current_bookings: number;
  starts_at: string; // timestamptz - ISO timestamp
  notes?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// SETTINGS TABLE
// ==============================================

export interface Setting {
  id: number;
  key: string; // Unique setting identifier
  value: string; // Setting value (stored as string, parsed as needed)
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: 'general' | 'pricing' | 'schedule' | 'notifications' | 'system';
  is_public: boolean; // Whether setting can be accessed by non-admin users
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// ADMINS TABLE
// ==============================================

export interface Admin {
  id: number;
  user_id: string; // 🔧 TODO: Foreign key to Supabase auth.users
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'kitchen_staff';
  permissions: string[]; // Array of permission strings
  is_active: boolean;
  last_login?: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// INVITES TABLE
// ==============================================

export interface Invite {
  id: number;
  email: string;
  name?: string;
  invite_code: string; // Unique invite code
  invited_by: number; // 🔧 TODO: Foreign key to admins table
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expires_at: string; // ISO timestamp
  accepted_at?: string; // ISO timestamp
  member_id?: number; // 🔧 TODO: Foreign key to members table (if accepted)
  notes?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ==============================================
// JOINED/COMPOSITE TYPES
// ==============================================

// Order with joined member and pizza data
export interface OrderWithDetails extends Order {
  member_name: string;
  member_phone: string;
  pizza_name: string;
  pizza_price: number;
  time_slot_starts_at: string; // ISO timestamp from time_slots.starts_at
  night_date: string;
  night_day: string;
}

// Time slot with assigned order details
export interface TimeSlotWithOrder extends TimeSlot {
  order?: OrderWithDetails;
  member_name?: string;
  pizza_name?: string;
}

// Night with time slots
export interface NightWithSlots extends Night {
  time_slots: TimeSlot[];
}

// Member with order history
export interface MemberWithOrders extends Member {
  orders: Order[];
  total_orders: number;
  last_order_date?: string;
}

// ==============================================
// API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==============================================
// FORM INPUT TYPES
// ==============================================

export interface CreateMemberInput {
  first_name: string;           // ✅ Updated to match signup form
  last_name: string;            // ✅ Updated to match signup form
  username: string;             // ✅ Updated to match signup form
  email?: string;               // ✅ Made optional (not collected in signup yet)
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  password_hash: string;        // ✅ Added to match signup form
  user_id?: string;             // ✅ Added for auth integration
  notes?: string;
}

export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  is_active?: boolean;
}

// ==============================================
// SIGNUP FORM SPECIFIC TYPE
// ==============================================

export interface SignupFormData {
  first_name: string;
  last_name: string;
  username: string;
  address: string;
  phone: string;
  password_hash: string;
  // Note: email will be added later when signup form is updated
}

// ==============================================
// COMPATIBILITY HELPER FUNCTIONS
// ==============================================

export function createMemberFromSignup(signupData: SignupFormData): CreateMemberInput {
  return {
    first_name: signupData.first_name,
    last_name: signupData.last_name,
    username: signupData.username,
    phone: signupData.phone,
    address: signupData.address,
    password_hash: signupData.password_hash,
    // email will be added when signup form is updated
  };
}

export function getDisplayName(member: Member): string {
  return `${member.first_name} ${member.last_name}`;
}

export function getInitials(member: Member): string {
  return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
}

export interface CreateOrderInput {
  member_id: number;
  pizza_id: number;
  time_slot_id: number;
  night_id: number;
  quantity: number;
  special_instructions?: string;
  notes?: string;
}

export interface CreatePizzaInput {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  available: boolean;
  category: Pizza['category'];
  ingredients: string[];
  size_options: Pizza['size_options'];
  is_featured: boolean;
  preparation_time: number;
}

export interface UpdatePizzaInput extends Partial<CreatePizzaInput> {}

export interface CreateTimeSlotInput {
  night_id: string; // uuid
  starts_at: string; // timestamptz - ISO timestamp
  is_available: boolean;
}

export interface CreateNightInput {
  date: string;
  day_of_week: Night['day_of_week'];
  max_capacity: number;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface CreateSettingInput {
  key: string;
  value: string;
  data_type: Setting['data_type'];
  description?: string;
  category: Setting['category'];
  is_public: boolean;
}

// ==============================================
// EXPORT ALL TYPES
// ==============================================
// Note: Types are already exported above with their declarations

