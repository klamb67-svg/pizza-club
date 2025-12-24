# Pizza Club App - Front-End Technical Summary

## Overview
Pizza Club is a React Native mobile application built with Expo Router for ordering artisan pizzas. The app features a retro terminal-style UI with a dark green-on-black aesthetic, designed for a weekend-only pizza club experience.

---

## Technology Stack

### Core Framework
- **React Native**: 0.81.4
- **Expo**: ^54.0.8 (SDK 54)
- **Expo Router**: ~6.0.6 (file-based routing)
- **React**: 19.1.0
- **TypeScript**: 5.8.3

### Key Libraries
- **@supabase/supabase-js**: ^2.74.0 (backend database & auth)
- **@expo-google-fonts/vt323**: ^0.4.0 (retro terminal font)
- **expo-linear-gradient**: ~15.0.7 (visual effects)
- **expo-image**: ~3.0.8 (optimized image loading)
- **react-native-gesture-handler**: ~2.28.0 (touch interactions)

### Platform Support
- iOS (native)
- Android (native)
- Web (via Expo web support)

---

## Application Architecture

### File Structure
```
app/
├── _layout.tsx              # Root layout with font loading
├── index.tsx                # Splash/entry screen
├── login.tsx                # Authentication entry point
├── signup.tsx               # New member registration
├── frontdoor.tsx            # Main hub after login
├── menu.tsx                 # Pizza selection & time slot booking
├── ticket.tsx               # Order confirmation & submission
├── account.tsx              # User profile management
├── history.tsx              # Order history view
├── about.tsx                # About Pizza Club story
├── contact.tsx              # Contact information
└── (tabs)/                  # Tab navigation (unused in current implementation)
    ├── _layout.tsx
    ├── index.tsx
    └── explore.tsx

components/
└── BottomNav.tsx            # Reusable bottom navigation component

lib/
├── supabase.ts              # Supabase client configuration
├── orderService.ts          # Order creation & management service
├── authUtils.ts             # Authentication utilities
└── responsive.ts            # Responsive design utilities

constants/
└── TerminalStyles.ts        # Shared styling constants
```

### Routing System
- **File-based routing** via Expo Router
- **Stack navigation** for main flow
- **Parameter passing** via route params (username, pizza selection, etc.)
- **Deep linking** support for navigation

---

## Key Features & User Flows

### 1. Authentication Flow

#### Login (`app/login.tsx`)
- **Two-step authentication**: Name → Password
- **Username generation**: `first[0] + last` (e.g., "robert paulson" → "rpaulson")
- **Member lookup**: Queries Supabase `members` table by username
- **New member detection**: Routes to signup if username not found
- **Password verification**: Plain text comparison (stored in `password_hash` field)
- **Admin detection**: Checks `admins` table for admin access
- **Terminal-style UI**: Blinking cursor, hidden text inputs, retro aesthetics

#### Signup (`app/signup.tsx`)
- **Required fields**: Address, Phone, Password
- **Username validation**: Checks for existing usernames
- **Database insertion**: Creates new member record in Supabase
- **Auto-navigation**: Routes to frontdoor upon successful signup
- **Error handling**: Network errors, RLS policy errors, validation errors

### 2. Main Navigation Hub

#### Front Door (`app/frontdoor.tsx`)
- **Entry point** after authentication
- **Visual**: Door image that's tappable to enter menu
- **Navigation**: Routes to menu page with username parameter
- **Bottom navigation**: Access to Account, History, Contact, About
- **Responsive design**: Adapts to mobile/tablet/desktop

### 3. Ordering Flow

#### Menu Page (`app/menu.tsx`)
**Pizza Selection:**
- Loads active pizzas from `pizzas` table
- Grid display with pizza images from Supabase storage
- Visual states: Available, Selected, Sold Out
- Background image: Table texture from Supabase storage

**Weekend Logic:**
- **Weekend block**: Friday + Saturday treated as single unit
- **Auto-advance**: After Saturday 7:30 PM, shows next weekend
- **Date calculation**: `getCurrentWeekend()` function determines current/next weekend
- **Day formatting**: "Friday, Jan 10" / "Saturday, Jan 11"

**Time Slot Selection:**
- **Available slots**: 17:15, 17:30, 17:45, 18:00, 18:15, 18:30, 18:45, 19:00, 19:15, 19:30
- **Taken slot detection**: Queries `orders` table for existing `pickup_time` values
- **Real-time updates**: Refetches slots when screen regains focus
- **Visual states**: Available (green), Taken (grayed out), Past (disabled)
- **Time validation**: `isTimeSlotPast()` and `isDayPast()` prevent booking past slots
- **Auto-refresh**: Updates every minute to reflect current time

**Navigation to Ticket:**
- Passes: pizza name, time slot, pickup date, username, formatted date
- Routes to `/ticket` with all order parameters

#### Ticket/Order Confirmation (`app/ticket.tsx`)
**Order Display:**
- Terminal-style ticket format
- Shows: Ticket number, Customer name, Phone, Date, Time, Pizza, Pickup location
- **Ticket numbering**: Pizza prefix + counter (e.g., "MA001" for Margherita)
- **Time formatting**: Converts 24-hour to 12-hour format for display

**Order Creation:**
- **Member lookup**: Finds member by username to get `member_id`
- **Pizza lookup**: Matches pizza name to `pizzas` table (multiple fallback strategies)
- **Database insert**: Creates order in `orders` table with:
  - `member_id` (from members table)
  - `pizza_id` (from pizzas table)
  - `pickup_date` (YYYY-MM-DD format)
  - `pickup_time` (HH:MM:SS format)
  - `delivery_or_pickup`: 'pickup'
  - `status`: 'pending'
- **Error handling**: Comprehensive validation and error messages
- **Success state**: Shows order confirmation with order ID

**Navigation:**
- Back button: Returns to menu
- Done button: Returns to frontdoor after order creation

### 4. Account Management

#### Account Page (`app/account.tsx`)
**Profile Display:**
- Shows: First Name, Last Name, Username, Member Since date
- Contact info: Phone, Address
- **Data source**: Fetches from `members` table by username

**Edit Mode:**
- **Editable fields**: First Name, Last Name, Phone, Address, Password
- **Password update**: Optional (only updates if new password provided)
- **Database update**: Uses Supabase `.update()` with username filter
- **Validation**: Required fields, error handling

**Actions:**
- Edit button: Enters edit mode
- Save button: Updates database and exits edit mode
- Cancel button: Discards changes
- Logout button: Routes to login screen

### 5. Order History

#### History Page (`app/history.tsx`)
**Order Display:**
- **Data source**: Queries `orders` table filtered by `member_id`
- **Related data**: Joins with `members`, `pizzas`, `time_slots`, `nights` tables
- **Display format**: Card-based layout showing:
  - Pizza name
  - Night indicator (Friday/Saturday badge)
  - Status badge (pending/preparing/ready/picked_up/cancelled)
  - Pickup time
  - Order date
  - Total price
- **Status colors**: Green (completed), Orange (pending/active), Red (cancelled)
- **Empty state**: Message when no orders exist

**Features:**
- **Responsive grid**: 1 column on mobile, 2+ on larger screens
- **Scrollable list**: FlatList for performance
- **Loading states**: Activity indicator during data fetch

### 6. Information Pages

#### About Page (`app/about.tsx`)
- **Content**: Pizza journey story, Fight Club-inspired rules
- **Features**: Amazon wishlist donation link
- **Layout**: Scrollable card-based design

#### Contact Page (`app/contact.tsx`)
- **Email**: Opens mailto link to info@pizzadojo2go.com
- **Hours**: Displays Friday & Saturday 5:15 PM - 7:30 PM
- **Layout**: Card-based with touchable email button

---

## UI/UX Design System

### Color Scheme
- **Primary Green**: `#00FF66` (terminal green)
- **Background**: `#001a00` (dark green-black)
- **Dark Gray**: `#1a1a1a` (card backgrounds)
- **Text Shadow**: Green glow effect for retro terminal look

### Typography
- **Primary Font**: VT323 (retro monospace, Google Fonts)
- **Font Loading**: Expo Google Fonts + web fallback
- **Sizes**: Responsive via `useResponsiveValues()` hook
- **Style**: Terminal/retro aesthetic throughout

### Components

#### BottomNav (`components/BottomNav.tsx`)
- **Reusable navigation**: HOME, ACCOUNT, HISTORY, CONTACT, ABOUT
- **Current page exclusion**: Hides button for active page
- **Username preservation**: Passes username through all navigation
- **Responsive**: Adapts button sizes for mobile/tablet

### Responsive Design
- **Hook**: `useResponsiveValues()` from `lib/responsive.ts`
- **Breakpoints**: Mobile, Tablet, Desktop
- **Adaptive**: Font sizes, padding, margins, touch targets
- **Grid system**: Responsive column counts for order history

---

## State Management

### Local State
- **React Hooks**: `useState`, `useEffect`, `useCallback`
- **Route params**: `useLocalSearchParams()` for passing data between screens
- **Focus effects**: `useFocusEffect()` for refetching data on screen focus

### Data Fetching
- **Supabase queries**: Direct `.from().select()` calls
- **Real-time updates**: Manual refetching (no subscriptions in front-end)
- **Error handling**: Try-catch blocks with user-friendly alerts
- **Loading states**: Activity indicators during async operations

### Session Management
- **Username-based**: Username passed via route params throughout app
- **No global context**: Each page receives username as parameter
- **Persistence**: Relies on navigation state, not local storage

---

## Database Integration

### Supabase Client
- **Configuration**: `lib/supabase.ts`
- **Environment variables**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Connection testing**: `testSupabaseConnection()` function
- **Error handling**: Network error detection and user messaging

### Database Tables Used

#### `members`
- **Fields**: `id`, `username`, `first_name`, `last_name`, `phone`, `address`, `password_hash`, `created_at`
- **Queries**: Lookup by username, update profile, create new member

#### `pizzas`
- **Fields**: `id`, `name`, `image_url`, `is_active`
- **Queries**: Load active pizzas, match pizza name to ID

#### `orders`
- **Fields**: `id`, `member_id`, `pizza_id`, `pickup_date`, `pickup_time`, `delivery_or_pickup`, `status`, `created_at`
- **Queries**: Create order, fetch order history, check taken time slots

#### `time_slots`
- **Fields**: `id`, `starts_at`
- **Queries**: Lookup time slot details for display

#### `nights`
- **Fields**: `id`, `day_of_week`, `date`
- **Queries**: Determine Friday/Saturday dates for weekend display

### Row Level Security (RLS)
- **Policy-based access**: Supabase RLS policies control data access
- **Error handling**: Detects RLS permission errors and shows user-friendly messages
- **Username-based filtering**: Queries filtered by username for member-specific data

---

## Key Business Logic

### Weekend Time Slot System
- **Weekend definition**: Friday + Saturday as single booking unit
- **Time slots**: 10 slots per day (5:15 PM - 7:30 PM, 15-minute intervals)
- **Availability**: Real-time checking against existing orders
- **Auto-advance**: Automatically shows next weekend after Saturday 7:30 PM
- **Past slot prevention**: Disables slots that have already passed

### Order Creation Flow
1. User selects pizza from menu
2. User selects weekend (Friday/Saturday)
3. User selects available time slot
4. System validates: member exists, pizza exists, slot available
5. Order created in database with `pending` status
6. Order confirmation displayed with order ID

### Username Generation
- **Format**: First initial + Last name (lowercase)
- **Example**: "Robert Paulson" → "rpaulson"
- **Uniqueness**: Enforced at database level
- **Case sensitivity**: All lowercase

---

## Error Handling

### Network Errors
- **Detection**: Checks for "Network request failed", "fetch failed", "ECONNREFUSED"
- **User messaging**: Provides troubleshooting steps (Wi-Fi, internet, Supabase access)
- **Graceful degradation**: Shows error messages instead of crashing

### Database Errors
- **RLS errors**: Detects permission denied (code 42501)
- **Not found errors**: Handles PGRST116 (no rows found)
- **Validation errors**: Username taken, missing fields
- **User feedback**: Alert dialogs with specific error messages

### Validation
- **Form validation**: Required fields, format checking
- **Business logic**: Time slot availability, pizza availability
- **Pre-submission checks**: Validates all data before database operations

---

## Performance Optimizations

### Image Loading
- **Expo Image**: Optimized image component for Supabase storage URLs
- **Lazy loading**: Images load as needed in pizza grid
- **Caching**: Expo Image handles caching automatically

### List Rendering
- **FlatList**: Used for order history (virtualized scrolling)
- **Key extraction**: Proper key props for React reconciliation
- **Pagination**: Not implemented (loads all orders)

### Data Fetching
- **Focus refetching**: Only refetches when screen comes into focus
- **Debouncing**: Not implemented (could be added for search/filter)
- **Caching**: No explicit caching (relies on React state)

---

## Platform-Specific Considerations

### Web Support
- **Font loading**: Google Fonts fallback for VT323
- **Styling**: Web-compatible styles (no platform-specific code)
- **Navigation**: Expo Router handles web routing
- **Input handling**: Web keyboard events supported

### Mobile (iOS/Android)
- **Native components**: Uses React Native components
- **Touch targets**: Minimum 44px for accessibility
- **Keyboard handling**: KeyboardAvoidingView for form inputs
- **Safe areas**: SafeAreaView for notch/status bar handling

---

## Security Considerations

### Authentication
- **Password storage**: Plain text in `password_hash` field (not hashed)
- **Username-based auth**: No JWT tokens, username passed via params
- **Session management**: No persistent sessions, username required on each navigation

### Data Access
- **RLS policies**: Supabase Row Level Security controls access
- **Username filtering**: All queries filtered by username for member data
- **Input validation**: Client-side validation before database operations

---

## Known Limitations & Future Improvements

### Current Limitations
1. **No persistent sessions**: Username must be passed through all routes
2. **Plain text passwords**: Passwords stored unhashed
3. **No real-time updates**: Manual refetching required
4. **No offline support**: Requires active internet connection
5. **No push notifications**: Order status updates not pushed to users
6. **Limited error recovery**: Some errors require app restart

### Potential Improvements
1. **Global state management**: Context API or Redux for username/session
2. **Password hashing**: Implement bcrypt or similar
3. **Real-time subscriptions**: Supabase real-time for order updates
4. **Offline mode**: Local storage + sync when online
5. **Push notifications**: Expo Notifications for order status
6. **Image optimization**: Lazy loading, progressive images
7. **Search/filter**: For pizza menu and order history
8. **Pagination**: For order history if it grows large

---

## Development & Build

### Development Commands
- `npm start`: Start Expo dev server
- `npm run android`: Run on Android
- `npm run ios`: Run on iOS
- `npm run web`: Run in web browser
- `npm run build`: Export static build

### Environment Setup
- **Required**: `.env` file with Supabase credentials
- **Variables**: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- **Fallback**: Hardcoded values in `lib/supabase.ts` (development only)

### Build Configuration
- **app.json**: Expo configuration (icon, splash, etc.)
- **eas.json**: EAS Build configuration for production builds
- **TypeScript**: Strict type checking enabled

---

## Summary

The Pizza Club front-end is a well-structured React Native application with a unique retro terminal aesthetic. It provides a complete ordering experience from authentication through order placement and history viewing. The app uses Supabase as its backend, with username-based authentication and a weekend-focused time slot booking system. The codebase is organized with clear separation of concerns, reusable components, and responsive design patterns.

**Key Strengths:**
- Clean file-based routing
- Consistent UI/UX design system
- Comprehensive error handling
- Responsive design
- Type-safe with TypeScript

**Areas for Enhancement:**
- Session management
- Security (password hashing)
- Real-time updates
- Offline support
- Performance optimizations

