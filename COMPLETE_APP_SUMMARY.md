# 🍕 Pizza Club App - Complete Technical & Flow Summary

> **For AI Assistant Daily Memory Refresh**  
> This document provides complete context about the Pizza Club app architecture, flows, and current state.

---

## 📋 **Table of Contents**

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [Database Schema](#database-schema)
5. [Front of House Flows](#front-of-house-flows)
6. [Back of House Flows](#back-of-house-flows)
7. [Key Files & Their Purpose](#key-files--their-purpose)
8. [Current Bugs & Issues](#current-bugs--issues)
9. [Environment Setup](#environment-setup)
10. [Development Workflow](#development-workflow)

---

## 🎯 **Project Overview**

**Pizza Dojo** is a secret society pizza club ordering application with a retro/cyberpunk aesthetic. The app operates **exclusively on Saturday nights only** (not Friday and Saturday).

### **Core Purpose**
- Members-only pizza ordering system
- Time slot-based pickup scheduling (1 order per 15-minute slot)
- Admin panel for order management and kitchen operations
- Retro terminal/Matrix-style UI design

### **Operating Schedule**
- **Days**: Saturday only
- **Time Slots**: 5:15 PM - 7:30 PM Central Time (15-minute intervals)
- **Pickup Location**: 349 Eagle Dr (Hot Box by mailbox)

### **Design Theme**
- **Style**: Retro cyberpunk / terminal aesthetic
- **Font**: VT323 (monospace, retro terminal font)
- **Primary Color**: `#00FF66` (neon green)
- **Background**: `#001a00` (dark green/black)
- **Text Shadow**: Green glow effect for terminal feel

---

## 🛠️ **Technology Stack**

### **Frontend Framework**
- **React Native** 0.81.4 - Cross-platform mobile framework
- **Expo** 54.0.8 - Development platform and tooling
- **Expo Router** 6.0.6 - File-based routing system
- **React** 19.1.0 - UI library
- **TypeScript** 5.8.3 - Type safety

### **Backend & Database**
- **Supabase** - PostgreSQL database + Auth + Storage
- **Row Level Security (RLS)** - Database security policies
- **Supabase JS Client** 2.74.0 - Database client library

### **UI/UX Libraries**
- **Expo Linear Gradient** - Gradient overlays
- **Expo Image** - Optimized image loading
- **VT323 Font** - Retro monospace font
- **React Navigation** - Navigation system

### **Development Tools**
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **TSX** - TypeScript execution

---

## 🏗️ **Application Architecture**

### **Project Structure**
```
pizza-club/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx         # Root layout with font loading
│   ├── index.tsx           # Landing page
│   ├── login.tsx           # Member login
│   ├── signup.tsx          # New member registration
│   ├── frontdoor.tsx       # Welcome screen after login
│   ├── menu.tsx            # Pizza selection & time slot booking
│   ├── ticket.tsx          # Order summary
│   ├── orderConfirmation.tsx # Final confirmation
│   ├── account.tsx         # Member profile
│   ├── history.tsx         # Order history
│   ├── about.tsx           # About page
│   ├── contact.tsx         # Contact information
│   └── admin/              # Admin panel routes
│       ├── _layout.tsx     # Admin navigation layout
│       ├── index.tsx       # Admin dashboard
│       ├── orders.tsx      # Order management (KDS)
│       ├── members.tsx     # Member management
│       ├── menu.tsx        # Pizza menu management
│       ├── schedule.tsx    # Time slot management
│       └── kds.tsx         # Kitchen Display System
├── lib/                    # Core business logic
│   ├── supabase.ts         # Supabase client initialization
│   ├── supabaseApi.ts      # Database API functions
│   ├── supabaseTypes.ts    # TypeScript type definitions
│   ├── supabaseAdmin.ts    # Admin client (bypasses RLS)
│   ├── orderService.ts    # Order creation + SMS logic
│   ├── authUtils.ts       # Authentication utilities
│   ├── adminAuth.ts        # Admin authentication
│   └── responsive.ts      # Responsive design utilities
├── components/             # Reusable UI components
│   ├── BottomNav.tsx       # Navigation component
│   └── ui/                 # UI primitives
├── scripts/                # Database setup & utilities
│   ├── populate-schedule.ts  # Create nights & time slots
│   └── setup-database.ts    # Database schema setup
└── constants/              # App constants
    ├── Colors.ts           # Color palette
    └── TerminalStyles.ts   # Styling constants
```

### **Data Flow Architecture**
```
1. User Input (React Native Components)
   ↓
2. Business Logic (lib/orderService.ts, lib/supabaseApi.ts)
   ↓
3. Supabase Client (lib/supabase.ts)
   ↓
4. PostgreSQL Database (with RLS policies)
   ↓
5. Response → UI Update
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **members**
```typescript
{
  id: number (PK, auto-increment)
  first_name: string
  last_name: string
  username: string (UNIQUE) // Format: "FirstName" + "LastInitial" (e.g., "JohnS")
  phone: string
  address?: string (nullable)
  password_hash: string // TODO: Implement proper hashing
  created_at: timestamp
  updated_at: timestamp
}
```

#### **orders**
```typescript
{
  id: string (PK, UUID)
  member_id: string (FK → members.id, UUID)
  pizza_id: string (FK → pizzas.id, UUID)
  time_slot_id: string (FK → time_slots.id, UUID)
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  delivery_or_pickup: 'pickup' | 'delivery'
  special_instructions?: string (nullable)
  notes?: string (nullable) // Admin notes
  created_at: timestamp
  updated_at: timestamp
}
```

#### **pizzas**
```typescript
{
  id: string (PK, UUID)
  name: string // e.g., "Cheese", "Pepperoni"
  description: string
  price: number
  image_url?: string (nullable) // Supabase Storage URL
  is_active: boolean
  category: 'classic' | 'specialty' | 'veggie' | 'meat_lovers'
  ingredients: string[] // JSON array
  size_options: ('small' | 'medium' | 'large')[] // JSON array
  is_featured: boolean
  preparation_time: number // Minutes
  created_at: timestamp
  updated_at: timestamp
}
```

#### **time_slots**
```typescript
{
  id: string (PK, UUID)
  night_id: string (FK → nights.id, UUID)
  starts_at: timestamptz // ISO timestamp (e.g., "2025-11-16T17:45:00Z")
  is_available: boolean
  max_orders: number // Default: 1 (1 order per slot)
  current_orders: number // Default: 0
  created_at: timestamptz
}
```

#### **nights**
```typescript
{
  id: string (PK, UUID)
  date: string // "YYYY-MM-DD"
  day_of_week: 'Saturday' // ONLY Saturday (not Friday)
  is_active: boolean
  max_capacity: number
  nightly_capacity: number
  start_time: string // "HH:MM" (e.g., "17:15")
  end_time: string // "HH:MM" (e.g., "19:30")
  notes?: string (nullable)
  created_at: timestamp
  updated_at: timestamp
}
```

### **Row Level Security (RLS) Policies**
- **members**: Anonymous INSERT allowed for signup, authenticated SELECT/UPDATE
- **orders**: Members can INSERT their own orders, SELECT their own orders
- **pizzas**: Public SELECT, admin-only INSERT/UPDATE/DELETE
- **time_slots**: Public SELECT, admin-only INSERT/UPDATE/DELETE
- **nights**: Public SELECT, admin-only INSERT/UPDATE/DELETE

---

## 🚪 **Front of House Flows**

### **1. New Member Registration Flow**

```
index.tsx (Landing Page)
  ↓ [User clicks pizza image]
login.tsx
  ↓ [User enters: "John Smith"]
  ↓ [System generates username: "JohnS"]
  ↓ [Check database - NOT FOUND]
signup.tsx
  ↓ [User fills: Address, Phone, Password]
  ↓ [Submit → Create member in database]
frontdoor.tsx
  ↓ [Tap door image]
menu.tsx
  ↓ [Select pizza → Select Saturday → Select time slot]
ticket.tsx
  ↓ [Review order → Confirm]
orderConfirmation.tsx
  ↓ [Order created → SMS sent → Confirmation displayed]
```

**Key Steps:**
1. **Login** (`app/login.tsx`):
   - User enters full name (e.g., "John Smith")
   - System converts to username: `firstName + lastInitial.toUpperCase()` → "JohnS"
   - Queries `members` table for existing username
   - If found → Navigate to `frontdoor.tsx`
   - If not found → Navigate to `signup.tsx` with params

2. **Signup** (`app/signup.tsx`):
   - Receives: `first`, `last`, `username` from login
   - Collects: `address`, `phone`, `password`
   - Validates username availability
   - Creates member record in database
   - Routes to `frontdoor.tsx` on success

3. **Front Door** (`app/frontdoor.tsx`):
   - Welcome screen with pizza door image
   - Admin portal button (if username === "RobertP")
   - Tap door to enter menu

4. **Menu** (`app/menu.tsx`):
   - **Pizza Selection**: Grid of 4 pizzas (Cheese, Pepperoni, Sausage, Special)
   - **Day Selection**: Shows active Saturday nights (from today onwards)
   - **Time Selection**: Shows available time slots for selected Saturday
   - Time slots: 5:15 PM - 7:30 PM (15-minute intervals)
   - Each slot shows availability (taken slots are grayed out)
   - Navigates to `ticket.tsx` with order params

5. **Ticket** (`app/ticket.tsx`):
   - Displays order summary
   - User confirms order details
   - Navigates to `orderConfirmation.tsx` on confirmation

6. **Order Confirmation** (`app/orderConfirmation.tsx`):
   - Calls `orderService.createOrder()`
   - Creates order record in database
   - Increments `time_slots.current_orders` (via `supabaseAdmin`)
   - Sends SMS confirmation (mock currently)
   - Displays success message

### **2. Existing Member Login Flow**

```
index.tsx (Landing Page)
  ↓ [User clicks pizza image]
login.tsx
  ↓ [User enters: "John Smith" → Username: "JohnS"]
  ↓ [Check database - FOUND]
frontdoor.tsx
  ↓ [Tap door image]
menu.tsx
  ↓ [Select pizza → Select Saturday → Select time slot]
ticket.tsx
  ↓ [Review order → Confirm]
orderConfirmation.tsx
```

**Key Difference**: Skips signup, goes directly to frontdoor after login.

### **3. Order Creation Process**

**Detailed Flow:**
1. User selects pizza + time slot on `menu.tsx`
2. Navigate to `ticket.tsx` with params: `pizza`, `time`, `timeSlotId`, `username`, `name`, `phone`, `date`
3. User confirms order
4. Navigate to `orderConfirmation.tsx` with all params
5. `orderService.createOrder()` called:
   - Lookup member by username → Get `member_id`
   - Lookup pizza by name → Get `pizza_id`
   - Lookup time slot by time → Get `time_slot_id`
   - Create order record in `orders` table
   - Increment `time_slots.current_orders` (via `supabaseAdmin` to bypass RLS)
   - Send SMS confirmation (MockSMSService currently)
6. Display confirmation screen

---

## 🏢 **Back of House Flows**

### **1. Admin Authentication**

**Current Implementation:**
- Hardcoded check: `username === "RobertP"`
- Admin button shown on `frontdoor.tsx` and `menu.tsx` when `isAdmin === true`
- Admin access checked in `lib/adminAuth.ts`

**TODO**: Replace with proper role-based system

### **2. Admin Dashboard Flow**

```
frontdoor.tsx
  ↓ [Username === "RobertP" → Show admin button]
admin/index.tsx (Dashboard)
  ├─→ admin/orders.tsx (Order Management/KDS)
  ├─→ admin/members.tsx (Member Management)
  ├─→ admin/menu.tsx (Pizza Menu Management)
  ├─→ admin/schedule.tsx (Time Slot Management)
  └─→ admin/kds.tsx (Kitchen Display System)
```

### **3. Admin Panel Features**

#### **Admin Dashboard** (`app/admin/index.tsx`)
- Overview statistics:
  - Total orders
  - Pending orders
  - Active orders
  - Completed today
  - Total members
  - Revenue
- Quick actions to all admin sections

#### **Order Management** (`app/admin/orders.tsx`)
- View orders by status (pending, in_progress, completed, cancelled)
- Update order status
- Filter and search orders
- Order details view

#### **Member Management** (`app/admin/members.tsx`)
- View all members
- Edit member information
- Delete members
- Search members

#### **Menu Management** (`app/admin/menu.tsx`)
- Add/edit pizzas
- Toggle pizza availability
- Set prices and descriptions
- Upload pizza images

#### **Schedule Management** (`app/admin/schedule.tsx`)
- View nights and time slots
- Create new Saturday nights
- Manage time slot capacity
- View slot assignments

#### **Kitchen Display System** (`app/admin/kds.tsx`)
- Real-time order display for kitchen
- Order status updates
- Time slot tracking

### **4. Admin Operations**

**Key Admin Functions:**
- **Order Status Updates**: Change order status (pending → in_progress → completed)
- **Time Slot Management**: Create nights, manage capacity, view bookings
- **Member Management**: View, edit, delete members
- **Menu Management**: Add/edit pizzas, toggle availability
- **Schedule Population**: Run `scripts/populate-schedule.ts` to create Saturday nights

---

## 📁 **Key Files & Their Purpose**

### **Entry Points**
- `app/_layout.tsx` - Root layout, font loading, global styles
- `app/index.tsx` - Landing page with pizza image
- `app/login.tsx` - Authentication entry point

### **Member-Facing Pages**
- `app/login.tsx` - Name input, username generation, member lookup
- `app/signup.tsx` - New member registration form
- `app/frontdoor.tsx` - Welcome screen, admin portal button
- `app/menu.tsx` - Pizza selection, Saturday night selection, time slot booking
- `app/ticket.tsx` - Order summary and confirmation
- `app/orderConfirmation.tsx` - Order creation, SMS sending, success display
- `app/account.tsx` - Member profile management
- `app/history.tsx` - Order history (future feature)
- `app/about.tsx` - Pizza Dojo story
- `app/contact.tsx` - Contact information

### **Admin Pages**
- `app/admin/index.tsx` - Admin dashboard with statistics
- `app/admin/orders.tsx` - Order management (KDS)
- `app/admin/members.tsx` - Member management
- `app/admin/menu.tsx` - Pizza menu management
- `app/admin/schedule.tsx` - Time slot management
- `app/admin/kds.tsx` - Kitchen Display System

### **Core Libraries**
- `lib/supabase.ts` - Supabase client initialization with env vars
- `lib/supabaseApi.ts` - All database CRUD operations
- `lib/supabaseTypes.ts` - TypeScript interfaces for all database tables
- `lib/supabaseAdmin.ts` - Admin client (uses service role key, bypasses RLS)
- `lib/orderService.ts` - Order creation logic, pizza/time lookup, SMS sending
- `lib/authUtils.ts` - Authentication utilities, account navigation
- `lib/adminAuth.ts` - Admin authentication checks
- `lib/responsive.ts` - Responsive design utilities

### **Database Scripts**
- `scripts/populate-schedule.ts` - Creates Saturday nights and time slots
- `scripts/setup-database.ts` - Database schema setup
- `scripts/setup-nights-schema.sql` - SQL for nights/time_slots columns

---

## 🐛 **Current Bugs & Issues**

### **🚨 CRITICAL: Menu Date Generation Bug**

**Issue**: `app/menu.tsx` should generate and show the next Saturday, but dates are wrong.

**Current Behavior:**
- Menu fetches nights from database with query:
  ```typescript
  .from('nights')
  .select('id, date, day_of_week')
  .gte('date', todayStr)
  .eq('is_active', true)
  .order('date', { ascending: true })
  .limit(2)
  ```
- **Problem**: Does not filter for `day_of_week === 'Saturday'`
- **Problem**: May show wrong dates if schedule population is incorrect

**Expected Behavior:**
- Should only show Saturday nights
- Should show the next available Saturday(s)
- Dates should be correct (Saturday only, not Friday)

**Files Involved:**
- `app/menu.tsx` (lines 99-131) - `fetchNights()` function
- `scripts/populate-schedule.ts` - Schedule population script

**Fix Needed:**
1. Update `menu.tsx` to filter for `day_of_week === 'Saturday'`
2. Ensure `populate-schedule.ts` only creates Saturdays (not Fridays)
3. Verify date calculation logic for next Saturday

### **Other Known Issues**

1. **Password Hashing**: Passwords stored as plain text (should use `expo-crypto`)
2. **Admin Authentication**: Hardcoded username check (should use role system)
3. **SMS Integration**: Using MockSMSService (should integrate Twilio)
4. **Time Slot Availability**: May not update correctly after orders (check RLS policies)
5. **Order History**: UI exists but functionality pending

---

## 🔧 **Environment Setup**

### **Required Environment Variables**
```bash
EXPO_PUBLIC_SUPABASE_URL=https://bvmwcswddbepelgctybs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key] # For admin operations
```

### **Database Setup**
1. Run `scripts/setup-database.ts` to create tables
2. Run `scripts/populate-schedule.ts` to create Saturday nights and time slots
3. Apply RLS policies (see `RLS_FIX_INSTRUCTIONS.md`)

### **Running the App**
```bash
# Start Expo dev server
npm start

# Run on web (localhost:8081)
npm run web

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

---

## 🔄 **Development Workflow**

### **Code Patterns**

**Username Generation:**
```typescript
// Pattern: firstName + lastInitial.toUpperCase()
// Example: "John Smith" → "JohnS"
const username = `${first}${(last[0] || "").toUpperCase()}`;
```

**Navigation with Params:**
```typescript
// Expo Router navigation
router.push({ 
  pathname: "/frontdoor", 
  params: { username } 
});
```

**Supabase Query Pattern:**
```typescript
const { data, error } = await supabase
  .from("members")
  .select("id, username")
  .eq("username", username)
  .single();
```

**Error Handling Pattern:**
```typescript
if (error) {
  if (error.code === 'PGRST116') {
    // No rows found - handle as new member
  } else if (error.code === '42501') {
    // RLS permission denied
  } else {
    // Other database error
  }
}
```

### **Testing**
```bash
# Run Playwright tests
npx playwright test

# Run specific test
npx playwright test --grep "New member flow"

# Run with browser visible
npx playwright test --headed
```

---

## 📊 **Current Status**

### **✅ Completed Features**
- Member authentication flow (login → signup → frontdoor)
- Pizza selection UI with images
- Time slot selection (Saturday + time)
- Order creation in database
- Time slot update logic (increment current_orders)
- Menu page focus effect (refetch on focus)
- Admin panel structure
- Database schema setup
- RLS policies (mostly fixed)
- supabaseAdmin.ts with crash-proof fallbacks

### **🔧 In Progress**
- Menu date generation bug (should show next Saturday)
- Time slot availability not updating correctly after orders

### **❌ Pending Features**
- Real SMS integration (currently using MockSMSService)
- Proper admin role system (currently hardcoded "RobertP" check)
- Order history full implementation
- Kitchen Display System (KDS) real-time updates
- Order status tracking

---

## 🎯 **Key Implementation Details**

1. **Time Slots**: Use UUIDs (not serial numbers)
2. **Time Slot starts_at**: Full ISO timestamp (timestamptz)
3. **Night start_time/end_time**: TIME type (HH:MM format)
4. **supabaseAdmin.ts**: Uses service role key to bypass RLS
5. **orderService.ts**: Increments current_orders after successful order creation
6. **menu.tsx**: Uses `useFocusEffect` to refetch time slots when screen comes into focus
7. **Operating Days**: **Saturday only** (not Friday and Saturday)
8. **Time Slot Range**: 5:15 PM - 7:30 PM Central Time (15-minute intervals)
9. **Pickup Location**: 349 Eagle Dr (Hot Box by mailbox)

---

## 📝 **Quick Reference for New AI Assistant**

1. **Start here**: `app/index.tsx` → `app/login.tsx` → `app/signup.tsx`
2. **Database**: All queries in `lib/supabaseApi.ts`
3. **Types**: All interfaces in `lib/supabaseTypes.ts`
4. **Admin**: Check `lib/adminAuth.ts` for admin logic
5. **Orders**: Order creation in `lib/orderService.ts`
6. **Testing**: E2E tests in `tests/browser-test.spec.ts`
7. **Current Bug**: Menu should show next Saturday only (see [Current Bugs](#current-bugs--issues))

---

**Last Updated**: Current Session  
**Status**: Active Development  
**Primary Bug**: Menu date generation (should show next Saturday only)

---

🍕 **Pizza Dojo - "In the Dojo, we don't just make pizza. We craft experiences."** 🍕

