# Pizza Club - Expo App Technical Outline

## Overview
This document provides a comprehensive technical outline of the Pizza Club React Native application running locally through Expo. This is the mobile/web app that will be adapted for a browser-based website version.

---

## Project Configuration

### Expo Setup
- **Expo SDK**: 54.0.8
- **React Native**: 0.81.4
- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Node.js**: Required (check with `node --version`)
- **Package Manager**: npm (package-lock.json present)

### Entry Point
- **Main Entry**: `expo-router/entry` (configured in `package.json`)
- **Root Layout**: `app/_layout.tsx`
- **Initial Screen**: `app/index.tsx` (splash screen with logo)

### Key Configuration Files

#### `app.json`
```json
{
  "expo": {
    "name": "Pizza Club",
    "slug": "pizza-club",
    "version": "1.0.1",
    "scheme": "pizzaclub",
    "newArchEnabled": true,
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

#### `package.json` Scripts
- `npm start` - Start Expo dev server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device
- `npm run web` - Run in web browser (Expo web)
- `npm run build` - Export static build
- `npm run build:web` - Export web build specifically
- `npm run lint` - Run ESLint

#### `tsconfig.json`
- Extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` → `./*`
- Includes all `.ts` and `.tsx` files

#### `metro.config.js`
- Uses default Expo Metro config
- Supports platforms: `ios`, `android`, `native`, `web`
- Metro bundler for JavaScript/TypeScript

---

## Project Structure

```
pizza-club/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout (font loading, global styles)
│   ├── index.tsx                # Splash/entry screen
│   ├── login.tsx                # Authentication screen
│   ├── signup.tsx               # Member registration
│   ├── frontdoor.tsx            # Main hub after login
│   ├── menu.tsx                 # Pizza selection & time slot booking
│   ├── ticket.tsx               # Order confirmation & submission
│   ├── account.tsx              # User profile management
│   ├── history.tsx              # Order history view
│   ├── about.tsx                # About page
│   ├── contact.tsx              # Contact information
│   ├── main.tsx                 # (unused/legacy)
│   ├── (tabs)/                  # Tab navigation (unused in main flow)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── admin/                   # Admin section (protected)
│       ├── _layout.tsx          # Admin tab layout
│       ├── index.tsx            # Admin dashboard
│       ├── members.tsx          # Member management
│       ├── menu.tsx             # Pizza menu management
│       ├── schedule.tsx         # Schedule/time slot management
│       └── kds.tsx              # Kitchen Display System
│
├── components/                   # Reusable React components
│   ├── BottomNav.tsx            # Bottom navigation bar
│   ├── Collapsible.tsx          # Collapsible UI component
│   ├── ExternalLink.tsx         # External link wrapper
│   ├── HapticTab.tsx            # Haptic feedback for tabs
│   ├── HelloWave.tsx            # Animated wave component
│   ├── ParallaxScrollView.tsx   # Parallax scroll effect
│   ├── ThemedText.tsx           # Themed text component
│   ├── ThemedView.tsx           # Themed view component
│   └── ui/                      # UI component library
│       ├── IconSymbol.tsx
│       └── [other UI components]
│
├── lib/                          # Core services and utilities
│   ├── supabase.ts              # Supabase client (anon key)
│   ├── supabaseAdmin.ts         # Supabase admin client (service role)
│   ├── supabaseApi.ts           # Additional Supabase utilities
│   ├── supabaseTypes.ts         # TypeScript types for Supabase
│   ├── supabaseTest.ts          # Supabase connection testing
│   ├── orderService.ts          # Order creation & management
│   ├── authUtils.ts             # Authentication utilities
│   ├── responsive.ts            # Responsive design utilities
│   ├── adminAuth.ts             # Admin authentication
│   └── geminiClient.ts          # Google Gemini AI integration
│
├── constants/                    # App-wide constants
│   ├── Colors.ts                # Color scheme definitions
│   └── TerminalStyles.ts        # Terminal/retro styling constants
│
├── hooks/                        # Custom React hooks
│   ├── useColorScheme.ts        # Theme color scheme hook
│   ├── useColorScheme.web.ts    # Web-specific color scheme
│   └── useThemeColor.ts         # Theme color hook
│
├── assets/                       # Static assets
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/                  # App icons, splash screens, etc.
│
├── scripts/                      # Utility scripts
│   └── [various .ts, .sql, .js files]
│
├── tests/                        # Test files
│   └── browser-test.spec.ts     # Playwright browser tests
│
├── dist-web/                     # Built web output (generated)
│
└── Configuration files
    ├── package.json
    ├── app.json
    ├── tsconfig.json
    ├── metro.config.js
    ├── babel.config.js
    ├── eslint.config.js
    └── eas.json                  # EAS Build configuration
```

---

## Routing System (Expo Router)

### File-Based Routing
Expo Router uses file-based routing where file structure maps to URL structure.

### Route Hierarchy
```
/                    → app/index.tsx (splash)
/login               → app/login.tsx
/signup              → app/signup.tsx
/frontdoor           → app/frontdoor.tsx
/menu                → app/menu.tsx
/ticket              → app/ticket.tsx
/account             → app/account.tsx
/history             → app/history.tsx
/about               → app/about.tsx
/contact             → app/contact.tsx
/admin               → app/admin/index.tsx
/admin/members       → app/admin/members.tsx
/admin/menu          → app/admin/menu.tsx
/admin/schedule      → app/admin/schedule.tsx
/admin/kds           → app/admin/kds.tsx
```

### Navigation Patterns
- **Stack Navigation**: Default for all routes (configured in `app/_layout.tsx`)
- **Tab Navigation**: Used in admin section (`app/admin/_layout.tsx`)
- **Parameter Passing**: Uses `useLocalSearchParams()` and `router.push({ pathname, params })`
- **Deep Linking**: Supported via `pizzaclub://` scheme

### Key Navigation Hooks
- `useRouter()` - Get router instance
- `useLocalSearchParams()` - Get route parameters
- `router.push()` - Navigate to new screen
- `router.back()` - Go back
- `router.replace()` - Replace current screen

---

## Core Dependencies

### Framework & Routing
```json
{
  "expo": "^54.0.8",
  "expo-router": "~6.0.6",
  "react": "19.1.0",
  "react-native": "0.81.4",
  "react-dom": "19.1.0"
}
```

### Backend & Database
```json
{
  "@supabase/supabase-js": "^2.74.0",
  "react-native-get-random-values": "^1.11.0",
  "react-native-url-polyfill": "^2.0.0"
}
```

### UI & Styling
```json
{
  "@expo-google-fonts/vt323": "^0.4.0",
  "expo-font": "~14.0.8",
  "expo-linear-gradient": "~15.0.7",
  "expo-image": "~3.0.8",
  "expo-blur": "~15.0.7"
}
```

### Navigation & Gestures
```json
{
  "@react-navigation/native": "^7.1.6",
  "@react-navigation/bottom-tabs": "^7.3.10",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-reanimated": "~4.1.0",
  "react-native-screens": "~4.16.0",
  "react-native-safe-area-context": "~5.6.0"
}
```

### Platform Support
```json
{
  "react-native-web": "^0.21.0",
  "react-native-webview": "13.15.0"
}
```

### Development Tools
```json
{
  "typescript": "~5.8.3",
  "@types/react": "~19.1.0",
  "eslint": "^9.25.0",
  "eslint-config-expo": "~9.2.0",
  "@playwright/test": "^1.56.1"
}
```

---

## Environment Variables

### Required Variables
The app expects these environment variables (with fallback hardcoded values in `lib/supabase.ts`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://bvmwcswddbepelgctybs.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[anon key]
SUPABASE_SERVICE_ROLE_KEY=[service role key]  # For admin operations
```

### Environment Loading
- Expo automatically loads `.env` files
- Variables prefixed with `EXPO_PUBLIC_` are exposed to client code
- Fallback values are hardcoded in `lib/supabase.ts` and `lib/supabaseAdmin.ts` for development

### Current Configuration
- **Supabase URL**: `https://bvmwcswddbepelgctybs.supabase.co`
- **Anon Key**: Present in code (for development)
- **Service Role Key**: Present in `lib/supabaseAdmin.ts` (for admin operations)

---

## Core Services & Utilities

### 1. Supabase Client (`lib/supabase.ts`)
**Purpose**: Main database client for user-facing operations

**Features**:
- Creates Supabase client with anon key
- Connection testing function
- Network error detection
- Environment variable fallbacks
- Session persistence enabled

**Key Functions**:
```typescript
export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true }
});

export async function testSupabaseConnection(): Promise<{ success: boolean; error?: string }>
```

### 2. Supabase Admin Client (`lib/supabaseAdmin.ts`)
**Purpose**: Admin operations that bypass Row Level Security (RLS)

**Features**:
- Uses service role key
- No session persistence
- Bypasses RLS policies
- Used for admin operations and time slot updates

**Usage**: Import `supabaseAdmin` for operations requiring elevated permissions

### 3. Order Service (`lib/orderService.ts`)
**Purpose**: Order creation and management

**Key Features**:
- Member lookup (by ID or phone)
- Pizza name matching (multiple fallback strategies)
- Time slot validation and booking
- Order creation in database
- Time slot counter updates
- SMS notification support (mock/Twilio)

**Main Function**:
```typescript
async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }>
```

**Order Data Structure**:
```typescript
interface OrderData {
  member_id: string;
  pizza_name: string;
  pizza_price: number;
  time_slot: string;
  time_slot_id?: string;
  date: string;
  phone: string;
  special_instructions?: string;
}
```

### 4. Auth Utilities (`lib/authUtils.ts`)
**Purpose**: Authentication state management

**Features**:
- Username-based authentication (not Supabase Auth)
- Session checking
- Navigation helpers

**Key Functions**:
```typescript
checkAuthStatus(currentUsername?: string): Promise<AuthResult>
handleAccountNavigation(router: any, currentUsername?: string): Promise<void>
```

### 5. Responsive Utilities (`lib/responsive.ts`)
**Purpose**: Responsive design system

**Features**:
- Breakpoint definitions (mobile, tablet, desktop, largeDesktop)
- Responsive typography scale
- Responsive spacing scale
- Touch target size helpers
- Grid column helpers

**Key Hook**:
```typescript
useResponsiveValues(): {
  padding: { xs, sm, md, lg, xl },
  margin: { xs, sm, md, lg, xl },
  fontSize: { xs, sm, md, lg, xl, xxl, xxxl, title },
  gridColumns: number,
  touchTarget: number,
  isMobile: boolean,
  isTablet: boolean,
  isDesktop: boolean,
  screenSize: ScreenSize
}
```

**Breakpoints**:
- Mobile: < 480px
- Tablet: 480px - 1024px
- Desktop: 1024px - 1200px
- Large Desktop: ≥ 1200px

---

## UI/UX Design System

### Color Scheme
Defined in `constants/TerminalStyles.ts`:

```typescript
TERMINAL_COLORS = {
  green: "#00FF66",      // Primary terminal green
  bg: "#001a00",         // Dark green-black background
  glow: "#00ff66",       // Glow effect color
  shadow: "#00aa44"      // Text shadow color
}
```

### Typography
- **Primary Font**: VT323 (retro monospace)
- **Loading**: `@expo-google-fonts/vt323`
- **Web Fallback**: Google Fonts CDN + IBM Plex Mono
- **Font Family Constant**: `VT323_400Regular`

### Text Effects
```typescript
TERMINAL_TEXT_SHADOW = {
  textShadowColor: "#00ff66",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 8
}
```

### Component Styling Pattern
- Uses StyleSheet.create() for performance
- Responsive values via `useResponsiveValues()` hook
- Terminal aesthetic throughout
- Green glow effects on text

---

## Screen-by-Screen Breakdown

### 1. Splash Screen (`app/index.tsx`)
- **Route**: `/`
- **Purpose**: Initial entry point
- **Features**:
  - Displays app icon/logo
  - Tappable to navigate to login
- **Navigation**: → `/login`

### 2. Login Screen (`app/login.tsx`)
- **Route**: `/login`
- **Purpose**: User authentication
- **Features**:
  - Two-step login: Name → Password
  - Username generation: `first[0] + last` (e.g., "robert paulson" → "rpaulson")
  - Member lookup in Supabase `members` table
  - New member detection → routes to signup
  - Admin detection → routes to admin section
  - Terminal-style UI with blinking cursor
- **Navigation**: 
  - Success → `/frontdoor?username={username}`
  - New member → `/signup`
  - Admin → `/admin`

### 3. Signup Screen (`app/signup.tsx`)
- **Route**: `/signup`
- **Purpose**: New member registration
- **Features**:
  - Required fields: Address, Phone, Password
  - Username validation (checks for duplicates)
  - Creates member record in Supabase
  - Error handling for RLS, network, validation
- **Navigation**: Success → `/frontdoor?username={username}`

### 4. Front Door (`app/frontdoor.tsx`)
- **Route**: `/frontdoor`
- **Purpose**: Main navigation hub
- **Features**:
  - Tappable door image to enter menu
  - Bottom navigation (HOME, ACCOUNT, HISTORY, CONTACT, ABOUT)
  - Username passed via route params
- **Navigation**: 
  - Door tap → `/menu?username={username}`
  - Bottom nav → various pages

### 5. Menu Screen (`app/menu.tsx`)
- **Route**: `/menu`
- **Purpose**: Pizza selection and time slot booking
- **Features**:
  - **Pizza Grid**: Loads active pizzas from `pizzas` table
  - **Images**: Pizza images from Supabase storage
  - **Weekend Logic**: 
    - Friday + Saturday treated as single unit
    - Auto-advances after Saturday 7:30 PM
    - Shows next weekend automatically
  - **Time Slots**: 
    - Available slots: 17:15, 17:30, 17:45, 18:00, 18:15, 18:30, 18:45, 19:00, 19:15, 19:30
    - Checks `orders` table for taken slots
    - Real-time updates on screen focus
    - Visual states: Available (green), Taken (grayed), Past (disabled)
  - **Validation**: Prevents booking past slots
  - **Auto-refresh**: Updates every minute
- **Navigation**: 
  - Pizza + time slot selected → `/ticket` with order params

### 6. Ticket/Order Confirmation (`app/ticket.tsx`)
- **Route**: `/ticket`
- **Purpose**: Order review and submission
- **Features**:
  - Terminal-style ticket display
  - Shows: Ticket number, Customer name, Phone, Date, Time, Pizza, Location
  - Ticket numbering: Pizza prefix + counter (e.g., "MA001")
  - Time formatting: 24-hour → 12-hour
  - **Order Creation**:
    - Member lookup by username
    - Pizza lookup by name (multiple fallback strategies)
    - Time slot validation
    - Database insert into `orders` table
    - Time slot counter increment
  - Error handling with user-friendly messages
- **Navigation**: 
  - Back → `/menu`
  - Done → `/frontdoor` (after order creation)

### 7. Account Screen (`app/account.tsx`)
- **Route**: `/account`
- **Purpose**: User profile management
- **Features**:
  - **Display Mode**: Shows First Name, Last Name, Username, Member Since, Phone, Address
  - **Edit Mode**: 
    - Editable: First Name, Last Name, Phone, Address, Password
    - Password update optional
    - Database update via Supabase
  - **Actions**: Edit, Save, Cancel, Logout
- **Navigation**: 
  - Logout → `/login`
  - Other nav via BottomNav

### 8. History Screen (`app/history.tsx`)
- **Route**: `/history`
- **Purpose**: Order history view
- **Features**:
  - Queries `orders` table filtered by `member_id`
  - Joins with `members`, `pizzas`, `time_slots`, `nights` tables
  - Card-based layout
  - Status badges (pending/preparing/ready/picked_up/cancelled)
  - Status colors: Green (completed), Orange (pending), Red (cancelled)
  - Responsive grid (1 col mobile, 2+ larger screens)
  - FlatList for performance
  - Empty state message

### 9. About Screen (`app/about.tsx`)
- **Route**: `/about`
- **Purpose**: Pizza Club story and information
- **Features**:
  - Pizza journey story
  - Fight Club-inspired rules
  - Amazon wishlist donation link
  - Scrollable card-based design

### 10. Contact Screen (`app/contact.tsx`)
- **Route**: `/contact`
- **Purpose**: Contact information
- **Features**:
  - Email: `info@pizzadojo2go.com` (mailto link)
  - Hours: Friday & Saturday 5:15 PM - 7:30 PM
  - Card-based layout with touchable email button

### 11. Admin Section (`app/admin/`)
- **Route**: `/admin/*`
- **Purpose**: Administrative functions
- **Layout**: Tab-based navigation
- **Screens**:
  - **index.tsx**: Admin dashboard
  - **members.tsx**: Member management
  - **menu.tsx**: Pizza menu management
  - **schedule.tsx**: Schedule/time slot management
  - **kds.tsx**: Kitchen Display System
- **Authentication**: Uses `lib/adminAuth.ts` and admin client

---

## Database Schema (Supabase)

### Tables Used

#### `members`
```sql
- id (UUID, primary key)
- username (text, unique)
- first_name (text)
- last_name (text)
- phone (text)
- address (text)
- password_hash (text)  # Note: Currently stores plain text
- created_at (timestamp)
```

#### `pizzas`
```sql
- id (UUID, primary key)
- name (text)
- image_url (text, Supabase storage URL)
- is_active (boolean)
```

#### `orders`
```sql
- id (integer, primary key, auto-increment)
- member_id (UUID, foreign key → members.id)
- pizza_id (UUID, foreign key → pizzas.id)
- time_slot_id (UUID, foreign key → time_slots.id)
- pickup_date (date)
- pickup_time (time)
- delivery_or_pickup (text, default: 'pickup')
- status (text: 'pending' | 'preparing' | 'ready' | 'picked_up' | 'cancelled')
- created_at (timestamp)
- updated_at (timestamp)
```

#### `time_slots`
```sql
- id (UUID, primary key)
- starts_at (time)
- is_available (boolean)
- current_orders (integer)
- max_orders (integer)
```

#### `nights`
```sql
- id (UUID, primary key)
- day_of_week (text: 'friday' | 'saturday')
- date (date)
```

#### `admins`
```sql
- id (UUID, primary key)
- username (text, unique)
- [other admin fields]
```

### Row Level Security (RLS)
- RLS policies control data access
- Admin operations use `supabaseAdmin` client (bypasses RLS)
- User operations use `supabase` client (subject to RLS)

### Storage Buckets
- Pizza images stored in Supabase Storage
- Images referenced via `image_url` in `pizzas` table

---

## Key Business Logic

### Weekend Time Slot System
- **Weekend Definition**: Friday + Saturday as single booking unit
- **Time Slots**: 10 slots per day (5:15 PM - 7:30 PM, 15-minute intervals)
- **Availability**: Real-time checking against existing orders
- **Auto-Advance**: Shows next weekend after Saturday 7:30 PM
- **Past Slot Prevention**: Disables slots that have already passed

### Username Generation
- **Format**: `first[0] + last` (lowercase)
- **Example**: "Robert Paulson" → "rpaulson"
- **Uniqueness**: Enforced at database level
- **Case Sensitivity**: All lowercase

### Order Creation Flow
1. User selects pizza from menu
2. User selects weekend (Friday/Saturday)
3. User selects available time slot
4. System validates: member exists, pizza exists, slot available
5. Order created in database with `pending` status
6. Time slot `current_orders` incremented
7. Order confirmation displayed with order ID

### Pizza Name Matching
Multiple fallback strategies in `orderService.ts`:
1. Exact match (case insensitive)
2. Reverse contains (search term contains DB name)
3. Contains match (DB name contains search term)
4. First word match

---

## State Management

### Local State
- **React Hooks**: `useState`, `useEffect`, `useCallback`, `useMemo`
- **Route Params**: `useLocalSearchParams()` for passing data between screens
- **Focus Effects**: `useFocusEffect()` for refetching data on screen focus

### Data Fetching
- **Supabase Queries**: Direct `.from().select()` calls
- **Real-time Updates**: Manual refetching (no subscriptions in front-end)
- **Error Handling**: Try-catch blocks with user-friendly alerts
- **Loading States**: Activity indicators during async operations

### Session Management
- **Username-based**: Username passed via route params throughout app
- **No Global Context**: Each page receives username as parameter
- **Persistence**: Relies on navigation state, not local storage
- **No JWT Tokens**: Custom authentication via `members` table

---

## Error Handling

### Network Errors
- **Detection**: Checks for "Network request failed", "fetch failed", "ECONNREFUSED"
- **User Messaging**: Provides troubleshooting steps
- **Graceful Degradation**: Shows error messages instead of crashing

### Database Errors
- **RLS Errors**: Detects permission denied (code 42501)
- **Not Found**: Handles PGRST116 (no rows found)
- **Validation Errors**: Username taken, missing fields
- **Foreign Key Errors**: Code 23503
- **Null Value Errors**: Code 23502
- **User Feedback**: Alert dialogs with specific error messages

### Validation
- **Form Validation**: Required fields, format checking
- **Business Logic**: Time slot availability, pizza availability
- **Pre-submission Checks**: Validates all data before database operations

---

## Performance Optimizations

### Image Loading
- **Expo Image**: Optimized image component for Supabase storage URLs
- **Lazy Loading**: Images load as needed in pizza grid
- **Caching**: Expo Image handles caching automatically

### List Rendering
- **FlatList**: Used for order history (virtualized scrolling)
- **Key Extraction**: Proper key props for React reconciliation
- **Pagination**: Not implemented (loads all orders)

### Data Fetching
- **Focus Refetching**: Only refetches when screen comes into focus
- **Debouncing**: Not implemented (could be added for search/filter)
- **Caching**: No explicit caching (relies on React state)

---

## Platform-Specific Considerations

### Web Support
- **Font Loading**: Google Fonts fallback for VT323 (in `app/_layout.tsx`)
- **Styling**: Web-compatible styles (no platform-specific code)
- **Navigation**: Expo Router handles web routing
- **Input Handling**: Web keyboard events supported
- **Global Styles**: Injected via `<style>` tag in root layout

### Mobile (iOS/Android)
- **Native Components**: Uses React Native components
- **Touch Targets**: Minimum 44px for accessibility
- **Keyboard Handling**: KeyboardAvoidingView for form inputs
- **Safe Areas**: SafeAreaView for notch/status bar handling

### Responsive Design
- **Breakpoints**: Mobile (<480px), Tablet (480-1024px), Desktop (≥1024px)
- **Adaptive Layouts**: Grid columns, font sizes, spacing
- **Touch Targets**: Minimum 44px, comfortable 48px

---

## Development Workflow

### Local Development Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables** (optional, has fallbacks):
   ```bash
   # Create .env file (optional)
   EXPO_PUBLIC_SUPABASE_URL=...
   EXPO_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Start Dev Server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Platform**:
   ```bash
   npm run web      # Web browser
   npm run android  # Android
   npm run ios      # iOS
   ```

### Development Server
- **Metro Bundler**: JavaScript/TypeScript bundler
- **Hot Reload**: Automatic on file changes
- **Fast Refresh**: React component hot reload
- **Dev Tools**: Expo DevTools available

### Testing
- **Playwright**: Browser testing (`tests/browser-test.spec.ts`)
- **Test Command**: `npm test` (configured but may need setup)

### Linting
- **ESLint**: Configured with `eslint-config-expo`
- **Lint Command**: `npm run lint`
- **Config**: `eslint.config.js`

---

## Build & Deployment

### Web Build
```bash
npm run build:web
# Output: dist-web/
```

### Mobile Build
```bash
npm run build:mobile
# Uses EAS Build (configured in eas.json)
```

### Build Configuration
- **EAS Project ID**: `a480cfdd-1279-4e9f-8d31-b930d2733434`
- **Android Package**: `com.nimix.pizzaclub`
- **Android Version Code**: 2
- **iOS**: Supports tablet

### Static Export
- **Output Format**: Static HTML/CSS/JS
- **Bundler**: Metro
- **Output Directory**: `dist-web/`

---

## Key Components

### BottomNav (`components/BottomNav.tsx`)
**Purpose**: Reusable bottom navigation bar

**Features**:
- Shows: HOME, ACCOUNT, HISTORY, CONTACT, ABOUT
- Excludes current page from buttons
- Preserves username through navigation
- Responsive button sizes
- Terminal styling

**Props**:
```typescript
interface BottomNavProps {
  currentPage: 'account' | 'history' | 'contact' | 'about' | 'frontdoor' | 'home';
  username?: string;
}
```

### Responsive Hook (`lib/responsive.ts`)
**Usage**:
```typescript
const responsive = useResponsiveValues();
// Access: responsive.padding.md, responsive.fontSize.lg, etc.
```

---

## Security Considerations

### Authentication
- **Password Storage**: Plain text in `password_hash` field (⚠️ not hashed)
- **Username-based Auth**: No JWT tokens, username passed via params
- **Session Management**: No persistent sessions, username required on each navigation

### Data Access
- **RLS Policies**: Supabase Row Level Security controls access
- **Username Filtering**: All queries filtered by username for member data
- **Input Validation**: Client-side validation before database operations
- **Admin Access**: Uses service role key (bypasses RLS)

---

## Known Limitations

1. **No Persistent Sessions**: Username must be passed through all routes
2. **Plain Text Passwords**: Passwords stored unhashed
3. **No Real-time Updates**: Manual refetching required
4. **No Offline Support**: Requires active internet connection
5. **No Push Notifications**: Order status updates not pushed to users
6. **Limited Error Recovery**: Some errors require app restart

---

## Migration Notes for Browser Version

### Key Differences to Consider
1. **Navigation**: Expo Router → Browser routing (React Router, Next.js, etc.)
2. **Components**: React Native → Web components (div, span, etc.)
3. **Styling**: StyleSheet → CSS/CSS-in-JS
4. **Images**: Expo Image → img tag or Next.js Image
5. **Fonts**: Expo Google Fonts → Web font loading
6. **Responsive**: React Native Dimensions → CSS media queries
7. **Touch Events**: TouchableOpacity → button/onClick
8. **Platform Detection**: Platform.OS → User agent or CSS

### Preserve These Patterns
1. **Terminal Aesthetic**: Green-on-black color scheme
2. **Username-based Auth**: Same authentication flow
3. **Order Flow**: Menu → Time Slot → Ticket → Confirmation
4. **Weekend Logic**: Friday/Saturday booking system
5. **Error Handling**: User-friendly error messages
6. **Responsive Design**: Mobile-first approach

---

## Additional Resources

### Documentation Files in Project
- `PIZZA_CLUB_FRONTEND_TECHNICAL_SUMMARY.md` - Detailed feature documentation
- `README.md` - Project overview
- `SPEC.md` - Project specifications
- Various session summaries and fix documentation

### External Dependencies
- **Supabase**: Backend database and storage
- **Google Fonts**: VT323 font for web
- **Expo**: Development platform and tooling

---

## Summary

The Pizza Club Expo app is a well-structured React Native application with:
- **File-based routing** via Expo Router
- **Terminal/retro aesthetic** with VT323 font
- **Username-based authentication** (not Supabase Auth)
- **Weekend-focused time slot booking** system
- **Responsive design** with mobile/tablet/desktop support
- **Admin section** with tab navigation
- **Comprehensive error handling**
- **Type-safe** with TypeScript

The app is ready for adaptation to a browser-based website, with the main work being:
1. Converting React Native components to web components
2. Adapting navigation from Expo Router to web routing
3. Converting styling from StyleSheet to CSS
4. Maintaining the same business logic and user flows

