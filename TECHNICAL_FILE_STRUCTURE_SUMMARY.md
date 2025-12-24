# Pizza Club - Complete Technical File Structure Summary
**Generated: December 11, 2025**

## 📁 Application Architecture

### Root Structure
```
pizza-club/
├── app/                    # Expo Router pages (file-based routing)
├── lib/                    # Core utilities and services
├── components/             # Reusable React components
├── constants/             # App-wide constants
├── hooks/                  # Custom React hooks
└── assets/                # Images, fonts, static files
```

---

## 🏠 FRONT OF HOUSE (Customer-Facing Pages)

### Entry & Authentication
**Location:** `app/`

| File | Route | Status | Purpose |
|------|-------|--------|---------|
| `index.tsx` | `/` | ✅ Working | Initial landing/redirect page |
| `login.tsx` | `/login` | ✅ **100% Functional** | Unified login for members AND admins |
| `signup.tsx` | `/signup` | ✅ **100% Functional** | New member registration with password |

**Login Flow (`app/login.tsx`):**
- Accepts "first last" name format
- Generates username: `${first[0].toLowerCase()}${last.toLowerCase()}`
- Checks `admins` table first → if admin, requires password "duck8"
- If not admin, checks `members` table → requires member password
- Routes: Admin → `/admin`, Member → `/frontdoor`

**Signup Flow (`app/signup.tsx`):**
- Collects: first_name, last_name, phone, address, password
- Creates username automatically
- Saves to `members` table
- Navigates to `/frontdoor` on success

---

### Main Customer Pages
**Location:** `app/`

| File | Route | Status | Purpose |
|------|-------|--------|---------|
| `frontdoor.tsx` | `/frontdoor?username=xxx` | ✅ **100% Functional** | Member main menu/home screen |
| `menu.tsx` | `/menu?username=xxx` | ✅ **100% Functional** | Pizza selection & time slot booking |
| `ticket.tsx` | `/ticket` | ✅ **100% Functional** | Order review & submission (merged with orderConfirmation) |
| `history.tsx` | `/history?username=xxx` | ✅ Working | Order history display |
| `account.tsx` | `/account?username=xxx` | ✅ Working | Member profile & edit |
| `about.tsx` | `/about?username=xxx` | ✅ Working | About page |
| `contact.tsx` | `/contact?username=xxx` | ✅ Working | Contact page |

**Key Features:**

**`menu.tsx`:**
- Loads pizzas from `pizzas` table
- Loads nights from `nights` table
- Shows available time slots (checks `orders.pickup_time` for taken slots)
- Passes `pickup_date` and `pickup_time` to ticket page
- Navigation: `/ticket` with params

**`ticket.tsx`:**
- Displays order details (pizza, date, time, member info)
- Two buttons: **SUBMIT ORDER** and **BACK**
- SUBMIT writes to `orders` table using:
  - `pickup_date` (YYYY-MM-DD)
  - `pickup_time` (HH:MM:SS)
  - `member_id` (from username lookup)
  - `pizza_id` (from pizza name lookup)
- Success: Shows confirmation with DONE button → `/frontdoor`
- BACK: Returns to `/menu` with username param

**`frontdoor.tsx`:**
- Main member hub
- Links to: Menu, History, Account, Contact, About
- Shows admin portal button if username === "rpaulson" (legacy check)

---

### Legacy/Unused Files
| File | Status | Notes |
|------|--------|-------|
| `orderConfirmation.tsx.backup` | ⚠️ Backup | Merged into `ticket.tsx` |
| `ticket.tsx.backup` | ⚠️ Backup | Original version before merge |
| `main.tsx` | ❓ Unknown | May be unused |
| `(tabs)/` | ❓ Unused | Expo default tabs, not used in app |

---

## 🔐 ADMIN SECTION

### Admin Layout & Routing
**Location:** `app/admin/`

| File | Route | Status | Purpose |
|------|-------|--------|---------|
| `_layout.tsx` | N/A | ✅ Working | Tab navigation wrapper for admin section |
| `index.tsx` | `/admin` | ✅ **75% Functional** | Admin dashboard (main landing) |

**Admin Layout (`_layout.tsx`):**
- Provides bottom tab navigation
- Tabs: Members, Menu, Schedule, KDS
- Dashboard (`index`) is hidden from tabs (`href: null`)

---

### Admin Pages
**Location:** `app/admin/`

| File | Route | Status | Purpose |
|------|-------|--------|---------|
| `index.tsx` | `/admin` | ✅ **75% Functional** | Dashboard with stats & quick actions |
| `members.tsx` | `/admin/members` | ✅ **100% Functional** | Member management (view, search, delete) |
| `kds.tsx` | `/admin/kds` | ✅ **100% Functional** | Kitchen Display System - order workflow |
| `menu.tsx` | `/admin/menu` | ⚠️ **20% Functional** | Menu management (UI exists, uses mock data) |
| `schedule.tsx` | `/admin/schedule` | ⚠️ **20% Functional** | Schedule management (UI exists, uses mock data) |

**Admin Dashboard (`index.tsx`):**
- **Authentication:** Checks admin session on load
- **Session Restoration:** If no session in memory, queries `admins` table for "rpaulson" and restores
- **Stats:** Currently reads from `members.address` field (legacy - needs update to `orders` table)
- **Quick Actions:** Links to all admin pages
- **Status:** Working but needs real data from `orders` table

**Members Management (`members.tsx`):**
- Reads from `members` table
- Displays: name, username, phone, address, created date
- Features: Search, delete member
- **Status:** Fully functional

**KDS - Kitchen Display System (`kds.tsx`):**
- **Data Source:** `orders` table with JOINs to `members` and `pizzas`
- **Fields Used:** `pickup_date`, `pickup_time` (NOT `time_slots` join)
- **Features:**
  - Real-time updates via Supabase subscription
  - Status filters: PENDING, PREPARING, READY, ALL
  - Status updates: pending → preparing → ready → picked_up
  - Delete orders (red trash icon, no confirmation)
  - Manual refresh button
- **Status:** ✅ **100% Functional**

**Menu Management (`menu.tsx`):**
- **Current:** Uses `sampleMenuItems` mock data
- **UI:** Edit modal, delete, toggle availability
- **Needs:** Connect to `pizzas` table for CRUD operations
- **Status:** ⚠️ **20% Functional** (UI only)

**Schedule Management (`schedule.tsx`):**
- **Current:** Uses `sampleSchedule` mock data
- **UI:** Time slot grid, assignment modal
- **Needs:** Connect to `time_slots` and `nights` tables
- **Status:** ⚠️ **20% Functional** (UI only)

---

## 🔧 LIBRARY & UTILITIES

### Core Services
**Location:** `lib/`

| File | Purpose | Status |
|------|---------|--------|
| `supabase.ts` | Main Supabase client (anon key) | ✅ Working |
| `supabaseAdmin.ts` | Admin Supabase client (service role) | ✅ Working |
| `supabaseTypes.ts` | TypeScript interfaces for all tables | ✅ Working |
| `supabaseApi.ts` | API wrapper functions | ⚠️ Partial (some TODOs) |
| `supabaseTest.ts` | Testing utilities | ❓ Unknown |

**Authentication & Auth Utils:**
| File | Purpose | Status |
|------|---------|--------|
| `adminAuth.ts` | Admin authentication service (singleton) | ✅ **100% Functional** |
| `authUtils.ts` | Member auth utilities | ✅ Working |

**Order & Business Logic:**
| File | Purpose | Status |
|------|---------|--------|
| `orderService.ts` | Order creation service | ⚠️ Uses `time_slot_id` (needs update) |
| `geminiClient.ts` | AI integration (Gemini) | ❓ Unknown usage |

**UI & Responsive:**
| File | Purpose | Status |
|------|---------|--------|
| `responsive.ts` | Responsive design utilities | ✅ Working |

**Test Files:**
| File | Purpose | Status |
|------|---------|--------|
| `supabaseTest.ts` | Supabase testing | ❓ Unknown |
| `testJules.ts` | Test utilities | ❓ Unknown |

---

## 🧩 COMPONENTS

### Reusable Components
**Location:** `components/`

| Component | Purpose | Status |
|-----------|---------|--------|
| `BottomNav.tsx` | Bottom navigation bar | ✅ Working |
| `ThemedText.tsx` | Themed text component | ✅ Working |
| `ThemedView.tsx` | Themed view component | ✅ Working |
| `HapticTab.tsx` | Haptic feedback for tabs | ✅ Working |
| `Collapsible.tsx` | Collapsible UI component | ✅ Working |
| `ExternalLink.tsx` | External link handler | ✅ Working |
| `ParallaxScrollView.tsx` | Parallax scroll effect | ✅ Working |
| `HelloWave.tsx` | Animated wave component | ✅ Working |

**UI Components (`components/ui/`):**
- `IconSymbol.tsx` - Icon component
- `IconSymbol.ios.tsx` - iOS-specific icons
- `TabBarBackground.ios.tsx` - iOS tab bar styling
- `TabBarBackground.tsx` - Tab bar background

---

## 🗄️ DATABASE SCHEMA

### Tables & Current State

**`members` table:**
- Fields: `id`, `first_name`, `last_name`, `username`, `phone`, `address`, `password_hash`, `created_at`, `updated_at`
- RLS: **ENABLED** ✅
- Status: Fully functional

**`orders` table:**
- Fields: `id`, `member_id`, `pizza_id`, `pickup_date`, `pickup_time`, `delivery_or_pickup`, `status`, `created_at`
- **Note:** Uses `pickup_date` and `pickup_time` (NOT `time_slot_id` or `night_id`)
- RLS: **DISABLED** ⚠️ (required for admin delete)
- Status: Fully functional

**`pizzas` table:**
- Fields: `id`, `name`, `image_url`, `is_active`, `created_at`, `preparation_time`
- **Note:** No `price` field (removed)
- RLS: **ENABLED** ✅
- Status: Functional

**`admins` table:**
- Fields: `id`, `username`, `password_hash`
- Current admin: `username: 'rpaulson'`, `password_hash: 'duck8'` (plain text)
- RLS: **DISABLED** ⚠️ (required for admin auth)
- Status: Functional

**`time_slots` table:**
- Fields: `id` (uuid), `night_id`, `starts_at`, `is_available`, `created_at`
- RLS: **UNRESTRICTED** ⚠️
- Status: Exists but not used in order flow

**`nights` table:**
- Fields: `id`, `date`, `day_of_week`, `is_active`, `max_capacity`, `current_bookings`, `starts_at`, `notes`, `created_at`, `updated_at`
- RLS: **UNRESTRICTED** ⚠️
- Status: Used in menu for date selection

---

## 🔄 AUTHENTICATION FLOWS

### Member Authentication
1. User enters "first last" → `login.tsx`
2. System generates username → checks `members` table
3. If found → show password field
4. Password verified → navigate to `/frontdoor?username=xxx`
5. If not found → navigate to `/signup` with pre-filled name

### Admin Authentication
1. User enters "robert paulson" → `login.tsx`
2. System generates username "rpaulson" → checks `admins` table
3. If admin → show password field (requires "duck8")
4. Password verified → `adminAuth.setCurrentAdmin('rpaulson')` → navigate to `/admin`
5. Admin dashboard checks session → if missing, restores from database

**Admin Session Management:**
- Stored in memory via `AdminAuthService` singleton
- Persists during navigation
- Restores from database on page refresh/navigation

---

## 📊 CURRENT IMPLEMENTATION STATUS

### Front of House: **100% Functional** ✅
- ✅ Login/Signup
- ✅ Menu selection
- ✅ Order placement
- ✅ Order history
- ✅ Account management
- ✅ All navigation working

### Admin Section: **~75% Functional** ⚠️
- ✅ Admin login with password
- ✅ Dashboard (needs real data)
- ✅ Members management
- ✅ KDS (fully functional)
- ⚠️ Menu management (mock data)
- ⚠️ Schedule management (mock data)

---

## 🚨 KNOWN ISSUES & TECHNICAL DEBT

1. **Password Storage:** Plain text in `password_hash` column (not secure for production)
2. **RLS Disabled:** `orders` and `admins` tables have RLS disabled
3. **Hardcoded Admin:** Admin restoration hardcodes "rpaulson" (needs dynamic lookup)
4. **Dashboard Stats:** Reads from legacy `members.address` field instead of `orders` table
5. **Menu/Schedule:** Using mock data, need database integration
6. **Order Service:** Still references `time_slot_id` in some places (should use `pickup_date`/`pickup_time`)

---

## 🔗 KEY NAVIGATION FLOWS

### Customer Order Flow
```
/login → /frontdoor → /menu → /ticket → (success) → /frontdoor
```

### Admin Flow
```
/login (admin) → /admin → /admin/kds (or other admin pages)
```

### Admin Session Restoration
```
/admin → checkAdminAccess() → if no session → query admins table → restore session
```

---

## 📝 FILE DEPENDENCIES

**Critical Dependencies:**
- All pages depend on `lib/supabase.ts` for database access
- Admin pages depend on `lib/adminAuth.ts` for authentication
- Customer pages use `lib/authUtils.ts` for member navigation
- Order creation uses `lib/orderService.ts` (but should be updated)

**Component Usage:**
- `BottomNav.tsx` used in customer pages
- `ThemedText`/`ThemedView` used throughout
- Responsive utilities from `lib/responsive.ts`

---

## 🎯 NEXT PRIORITIES

1. **Dashboard:** Update to read from `orders` table instead of `members.address`
2. **Menu Management:** Connect to `pizzas` table for CRUD
3. **Schedule Management:** Connect to `time_slots`/`nights` tables
4. **KDS Auto-refresh:** Add 30-second interval refresh
5. **Admin Session:** Make restoration dynamic (not hardcoded "rpaulson")

---

**End of Technical File Structure Summary**







