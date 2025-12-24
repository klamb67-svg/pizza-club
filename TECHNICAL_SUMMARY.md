# 🍕 Pizza Club App - Technical Summary & Architecture

> **Copy this entire document for the new AI assistant**

---

## 📐 **Technology Stack**

### **Frontend Framework**
- **React Native** (v0.81.4) with **Expo** (v54.0.8)
- **Expo Router** (v6.0.6) - File-based routing system
- **React** (v19.1.0) - Latest React with hooks
- **TypeScript** (v5.8.3) - Full type safety

### **Backend & Database**
- **Supabase** (v2.74.0) - PostgreSQL database with Row Level Security (RLS)
- **Supabase Auth** - Session management (currently using username-based auth)
- **PostgreSQL** - Relational database hosted on Supabase

### **UI/UX Libraries**
- **@expo-google-fonts/vt323** - Retro terminal font
- **expo-linear-gradient** - Gradient overlays
- **expo-image** - Optimized image loading
- **react-native-gesture-handler** - Touch interactions
- **react-native-reanimated** - Animations

### **Testing**
- **Playwright** (v1.56.1) - Browser automation testing
- **@playwright/test** - Test framework

### **Development Tools**
- **Metro Bundler** - React Native bundler
- **Babel** - JavaScript transpiler
- **ESLint** - Code linting
- **TypeScript** - Type checking

---

## 🏗️ **Application Architecture**

### **Project Structure**
```
pizza-club/
├── app/                    # Expo Router pages (file-based routing)
│   ├── _layout.tsx         # Root layout with font loading
│   ├── index.tsx           # Landing page (home)
│   ├── login.tsx           # Member login screen
│   ├── signup.tsx          # New member registration
│   ├── frontdoor.tsx       # Welcome screen after login
│   ├── menu.tsx            # Pizza selection & time slot booking
│   ├── ticket.tsx          # Order summary
│   ├── orderConfirmation.tsx # Final confirmation
│   ├── account.tsx         # Member profile management
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
│   ├── supabase.ts         # Supabase client configuration
│   ├── supabaseApi.ts      # Database API functions
│   ├── supabaseTypes.ts    # TypeScript interfaces
│   ├── orderService.ts     # Order creation & management
│   ├── adminAuth.ts        # Admin authentication logic
│   ├── authUtils.ts        # Authentication utilities
│   └── responsive.ts       # Responsive design helpers
├── components/             # Reusable React components
│   ├── BottomNav.tsx       # Bottom navigation bar
│   ├── ThemedText.tsx      # Themed text component
│   └── ThemedView.tsx      # Themed view component
├── constants/             # App constants
│   ├── Colors.ts           # Color palette
│   └── TerminalStyles.ts   # Terminal-themed styles
├── hooks/                  # Custom React hooks
│   ├── useColorScheme.ts   # Theme detection
│   └── useThemeColor.ts    # Theme color utilities
├── tests/                  # Playwright test suite
│   └── browser-test.spec.ts # E2E browser tests
└── scripts/                # Utility scripts
    ├── setup-database.ts   # Database initialization
    └── create-pizzas.sql   # Pizza data seeding
```

---

## 🔄 **User Flows & Navigation**

### **1. New Member Registration Flow**
```
index.tsx (Home)
  ↓ [Click pizza image]
login.tsx
  ↓ [Enter: "John Smith" → Username: "JohnS"]
  ↓ [Check database - NOT FOUND]
signup.tsx
  ↓ [Fill: Address, Phone, Password]
  ↓ [Submit → Create member in database]
frontdoor.tsx
  ↓ [Tap door image]
menu.tsx
  ↓ [Select pizza + time slot]
ticket.tsx
  ↓ [Review order]
orderConfirmation.tsx
  ↓ [SMS sent, order confirmed]
```

### **2. Existing Member Login Flow**
```
index.tsx (Home)
  ↓ [Click pizza image]
login.tsx
  ↓ [Enter: "John Smith" → Username: "JohnS"]
  ↓ [Check database - FOUND]
frontdoor.tsx
  ↓ [Tap door image]
menu.tsx
  ↓ [Select pizza + time slot]
ticket.tsx
  ↓ [Review order]
orderConfirmation.tsx
```

### **3. Admin Panel Flow**
```
frontdoor.tsx
  ↓ [Username === "RobertP" → Show admin button]
admin/index.tsx (Dashboard)
  ├─→ admin/orders.tsx (Order Management/KDS)
  ├─→ admin/members.tsx (Member Management)
  ├─→ admin/menu.tsx (Pizza Menu Management)
  └─→ admin/schedule.tsx (Time Slot Management)
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
  id: number (PK, auto-increment)
  member_id: number (FK → members.id)
  pizza_id: number (FK → pizzas.id)
  time_slot_id: number (FK → time_slots.id)
  night_id: number (FK → nights.id)
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  quantity: number
  total_price: number
  special_instructions?: string (nullable)
  notes?: string (nullable) // Admin notes
  created_at: timestamp
  updated_at: timestamp
}
```

#### **pizzas**
```typescript
{
  id: number (PK, auto-increment)
  name: string // e.g., "Cheese", "Pepperoni"
  description: string
  price: number
  image_url?: string (nullable) // Supabase Storage URL
  available: boolean
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
  starts_at: timestamptz // ISO timestamp
  is_available: boolean
  max_orders: number
  current_orders: number
  assigned_member_id?: number (nullable, FK → members.id)
  order_id?: number (nullable, FK → orders.id)
  created_at: timestamp
  updated_at: timestamp
}
```

#### **nights**
```typescript
{
  id: string (PK, UUID)
  date: string // "YYYY-MM-DD"
  day_of_week: 'Friday' | 'Saturday'
  is_active: boolean
  max_capacity: number
  current_bookings: number
  start_time: string // "HH:MM"
  end_time: string // "HH:MM"
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

## 🔐 **Authentication & Authorization**

### **Current Implementation**
- **Username-based authentication** (not using Supabase Auth yet)
- **Admin check**: Hardcoded `username === "RobertP"` (⚠️ TODO: Replace with proper role system)
- **Session**: Username passed via URL params through navigation
- **Password**: Stored as plain text (⚠️ TODO: Implement bcrypt/expo-crypto hashing)

### **Authentication Flow**
1. User enters full name on `login.tsx`
2. System generates username: `firstName + lastInitial.toUpperCase()`
3. Query `members` table for existing username
4. **If found**: Navigate to `frontdoor.tsx` with username param
5. **If not found**: Navigate to `signup.tsx` with first/last/username params
6. After signup: Create member record, navigate to `frontdoor.tsx`

### **Admin Access**
- Checked in `lib/adminAuth.ts` via `checkAdminAccess(username)`
- Currently queries hardcoded admin usernames
- Admin button shown on `frontdoor.tsx` and `menu.tsx` when `isAdmin === true`

---

## 📡 **API Layer**

### **Supabase Client**
- **Location**: `lib/supabase.ts`
- **Configuration**: Environment variables (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- **Fallback**: Hardcoded values for development (⚠️ Remove in production)

### **API Functions** (`lib/supabaseApi.ts`)
- `getMembers()` - Fetch all members
- `getMemberByUsername(username)` - Get single member
- `createMember(data)` - Insert new member
- `updateMember(id, data)` - Update member info
- `getOrders()` - Fetch all orders (with filters)
- `createOrder(data)` - Create new order
- `updateOrderStatus(id, status)` - Update order status
- `getPizzas()` - Fetch available pizzas
- `getTimeSlots(nightId)` - Get time slots for a night
- `getNights()` - Fetch active nights

### **Order Service** (`lib/orderService.ts`)
- `createOrder(memberId, pizzaId, timeSlotId, quantity, instructions)` - Main order creation
- Handles order validation, price calculation, time slot availability
- Returns order object with member/pizza/time slot details

---

## 🎨 **UI/UX Design System**

### **Theme**
- **Style**: Retro cyberpunk / terminal aesthetic
- **Font**: VT323 (monospace, retro terminal font)
- **Primary Color**: `#00FF66` (neon green)
- **Background**: `#001a00` (dark green/black)
- **Text Shadow**: Green glow effect for terminal feel

### **Components**
- **ThemedText**: Text with terminal styling
- **ThemedView**: Container with dark background
- **BottomNav**: Navigation bar with account/history/contact/about links

### **Responsive Design**
- **Mobile-first**: Optimized for phones
- **Tablet support**: Responsive breakpoints via `lib/responsive.ts`
- **Touch targets**: Minimum 44px for accessibility

---

## 🔄 **State Management**

### **Local State**
- React `useState` hooks for component-level state
- Form inputs, loading states, UI toggles

### **Navigation State**
- Username passed via Expo Router `params` through navigation
- No global state management library (Redux/Zustand) - keeping it simple

### **Database State**
- Direct Supabase queries with React hooks
- No caching layer (queries run on each render/action)

---

## 🧪 **Testing**

### **Playwright E2E Tests** (`tests/browser-test.spec.ts`)
- **Status**: 11/13 tests passing
- **Coverage**:
  - ✅ Home screen loading
  - ✅ Member login flows (test_pizza_1, test_member_2, qa_user_3)
  - ✅ Stress tests (empty names, long names, special chars, double-clicks, navigation, refresh)
  - ❌ New member flow (signup → frontdoor navigation issue)
  - ❌ Existing member flow (frontdoor navigation timeout)

### **Test Configuration**
- **Browser**: Chromium (headless/headed)
- **Base URL**: `http://localhost:8081`
- **Timeout**: 120 seconds for full flows

---

## 🚨 **Known Issues & TODOs**

### **Critical Issues**
1. **RLS Policies**: Some policies may block member creation (error 42501)
   - **Fix**: Apply `final_rls_cleanup.sql` or update policies in Supabase dashboard
2. **Password Hashing**: Passwords stored as plain text
   - **Fix**: Implement `expo-crypto` or `bcrypt` hashing before insert
3. **Admin Authentication**: Hardcoded username check
   - **Fix**: Implement proper role-based system with `admin_roles` table or Supabase Auth roles

### **Technical Debt**
- Font loading returns `null` initially (fixed in signup/frontdoor, but check other pages)
- Multiple Supabase client instances warning (GoTrueClient)
- Environment variables fallback to hardcoded values
- No error boundary components
- No loading states for async operations in some components

### **Feature TODOs**
- SMS confirmation via Twilio/Supabase Edge Function
- Order history page functionality
- KDS (Kitchen Display System) real-time updates
- Member profile editing
- Password reset flow
- Email notifications

---

## 🚀 **Development Workflow**

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

### **Testing**
```bash
# Run Playwright tests
npx playwright test

# Run specific test
npx playwright test --grep "New member flow"

# Run with browser visible
npx playwright test --headed
```

### **Database Setup**
```bash
# Run database setup script
npx tsx scripts/setup-database.ts

# Create pizza data
# Execute scripts/create-pizzas.sql in Supabase SQL editor
```

---

## 📦 **Build & Deployment**

### **Web Build**
```bash
npm run build:web
# Output: dist-web/ directory
```

### **Mobile Build**
```bash
# iOS
npm run ios

# Android
npm run android

# EAS Build (production)
npm run build:mobile
```

### **Environment Variables**
Required in `.env` or Expo config:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_TWILIO_*` (for SMS, if implemented)

---

## 🔗 **Key File Reference**

### **Entry Points**
- `app/_layout.tsx` - Root layout, font loading
- `app/index.tsx` - Landing page
- `app/login.tsx` - Authentication entry point

### **Core Logic**
- `lib/supabase.ts` - Database client
- `lib/supabaseApi.ts` - All database operations
- `lib/orderService.ts` - Order creation logic
- `lib/adminAuth.ts` - Admin access control

### **Type Definitions**
- `lib/supabaseTypes.ts` - All TypeScript interfaces for database tables

### **Navigation**
- `app/frontdoor.tsx` - Post-login welcome screen
- `app/menu.tsx` - Main ordering interface
- `app/admin/_layout.tsx` - Admin panel navigation

---

## 📝 **Code Patterns**

### **Username Generation**
```typescript
// Pattern: firstName + lastInitial.toUpperCase()
// Example: "John Smith" → "JohnS"
const username = `${first}${(last[0] || "").toUpperCase()}`;
```

### **Navigation with Params**
```typescript
// Expo Router navigation
router.push({ 
  pathname: "/frontdoor", 
  params: { username } 
});
```

### **Supabase Query Pattern**
```typescript
const { data, error } = await supabase
  .from("members")
  .select("id, username")
  .eq("username", username)
  .single();
```

### **Error Handling Pattern**
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

---

## 🎯 **Current Status**

- ✅ **Foundation**: App structure, navigation, database schema
- ✅ **Member Flow**: Login, signup, frontdoor navigation (mostly working)
- ✅ **UI/UX**: Terminal theme, responsive design
- ⚠️ **Testing**: 11/13 E2E tests passing
- ⚠️ **Admin Panel**: Basic structure, needs completion
- ❌ **SMS Integration**: Not yet implemented
- ❌ **Order History**: UI exists, functionality pending

---

**Last Updated**: Current session
**Version**: 1.0.0
**Status**: Active Development

---

## 📋 **Quick Reference for New AI Assistant**

1. **Start here**: `app/index.tsx` → `app/login.tsx` → `app/signup.tsx`
2. **Database**: All queries in `lib/supabaseApi.ts`
3. **Types**: All interfaces in `lib/supabaseTypes.ts`
4. **Admin**: Check `lib/adminAuth.ts` for admin logic
5. **Orders**: Order creation in `lib/orderService.ts`
6. **Testing**: E2E tests in `tests/browser-test.spec.ts`
7. **Issues**: Check `BROWSER_TESTING_PROGRESS.md` for current blockers

---

**End of Technical Summary**


