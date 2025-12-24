# 🍕 Pizza Club App - Complete Specification

## 📋 **Project Overview**

**Pizza Dojo** is a secret society pizza club app with a retro/cyberpunk theme. The app operates on Friday & Saturday nights only, featuring a neon-lit digital underground aesthetic with VT323 font and green (#00FF66) on dark background (#001a00).

---

## 🎯 **Core Features & User Flows**

### **1. Member Authentication Flow**
```
index.tsx → login.tsx → signup.tsx → frontdoor.tsx
```

**Login Process:**
- Users enter full name (e.g., "Robert Paulson")
- System converts to username (e.g., "RobertP")
- Checks database for existing member
- **If exists**: Routes to frontdoor with username
- **If new**: Routes to signup form

**Signup Process:**
- Collects: first_name, last_name, username, phone, address, password_hash
- Validates username availability
- Creates new member in database
- Routes to frontdoor upon success

### **2. Main App Flow**
```
frontdoor.tsx → menu.tsx → ticket.tsx → orderConfirmation.tsx
```

**Front Door:**
- Welcome screen with pizza door image
- Admin portal button (RobertP only)
- Tap door to enter menu

**Menu Selection:**
- Pizza grid with images and descriptions
- Time slot selection (5:15 PM - 7:30 PM, 15-min intervals)
- Order submission with special instructions

**Order Confirmation:**
- Order summary display
- SMS confirmation (Twilio/Supabase Edge Function)
- Order tracking capabilities

### **3. Admin Panel Flow**
```
admin/orders → admin/members → admin/menu → admin/schedule
```

**Admin Features:**
- Order management (pending, in_progress, completed, cancelled)
- Member management (view, edit, delete)
- Menu management (add, edit, toggle availability)
- Schedule management (time slots, capacity)

---

## 🗄️ **Database Schema**

### **Core Tables:**

**Members Table:**
```sql
- id (number, primary key)
- first_name (string)
- last_name (string) 
- username (string, unique)
- phone (string)
- address (string, optional)
- password_hash (string)
- created_at (timestamp)
- updated_at (timestamp)
```

**Orders Table:**
```sql
- id (number, primary key)
- member_id (number, foreign key)
- pizza_id (number, foreign key)
- time_slot_id (number, foreign key)
- night_id (number, foreign key)
- status ('pending' | 'in_progress' | 'completed' | 'cancelled')
- quantity (number)
- total_price (number)
- special_instructions (string, optional)
- notes (string, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

**Pizzas Table:**
```sql
- id (number, primary key)
- name (string)
- description (string)
- price (number)
- image_url (string, optional)
- available (boolean)
- category ('classic' | 'specialty' | 'veggie' | 'meat_lovers')
- ingredients (string[])
- size_options ('small' | 'medium' | 'large')[]
- is_featured (boolean)
- preparation_time (number, minutes)
- created_at (timestamp)
- updated_at (timestamp)
```

**Time Slots Table:**
```sql
- id (number, primary key)
- night_id (number, foreign key)
- start_time (string, "HH:MM")
- end_time (string, "HH:MM")
- is_available (boolean)
- max_orders (number)
- current_orders (number)
- assigned_member_id (number, optional)
- order_id (number, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

**Nights Table:**
```sql
- id (number, primary key)
- date (string, "YYYY-MM-DD")
- day_of_week ('Friday' | 'Saturday')
- is_active (boolean)
- max_capacity (number)
- current_bookings (number)
- start_time (string, "HH:MM")
- end_time (string, "HH:MM")
- notes (string, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🔧 **Technical Implementation**

### **Authentication & Security:**
- **RLS Policies**: Allow anonymous signup, authenticated read, public profile updates
- **Admin Check**: Currently hardcoded (`username === "RobertP"`)
- **Password Hashing**: Required for member creation
- **Session Management**: Supabase auth integration

### **API Structure:**
- **Supabase Client**: Configured with environment variables
- **API Modules**: membersApi, ordersApi, menuApi, scheduleApi, nightsApi, settingsApi
- **Error Handling**: Comprehensive logging and user feedback
- **Type Safety**: Full TypeScript interfaces for all database tables

### **UI/UX Design:**
- **Theme**: Retro cyberpunk with VT323 font
- **Colors**: Green (#00FF66) on dark (#001a00) background
- **Responsive**: Mobile-first design with tablet support
- **Navigation**: Expo Router with tab-based admin panel

---

## 🚨 **Critical Issues to Resolve**

### **1. Database RLS Policies (BLOCKING)**
- **Issue**: Row Level Security prevents member creation (error 42501)
- **Impact**: Signup form hangs on "Saving..." indefinitely
- **Solution**: Apply `final_rls_cleanup.sql` to fix policies

### **2. Database Schema Mismatch**
- **Issue**: Some TypeScript types reference non-existent columns
- **Impact**: Potential runtime errors
- **Solution**: Update types to match actual database schema

### **3. Admin Authentication**
- **Issue**: Hardcoded username check instead of proper role-based auth
- **Impact**: Security vulnerability
- **Solution**: Implement proper admin role system

### **4. Missing Database Tables**
- **Issue**: Some referenced tables may not exist in database
- **Impact**: API calls will fail
- **Solution**: Create missing tables or update API calls

---

## 📱 **Screen Specifications**

### **Public Screens:**
- **index.tsx**: Landing page with pizza image
- **login.tsx**: Name input with username conversion
- **signup.tsx**: Member registration form
- **frontdoor.tsx**: Welcome screen with admin access
- **menu.tsx**: Pizza selection and time slot booking
- **ticket.tsx**: Order summary and confirmation
- **orderConfirmation.tsx**: Final confirmation with SMS

### **Admin Screens:**
- **admin/orders.tsx**: Order management dashboard
- **admin/members.tsx**: Member list and management
- **admin/menu.tsx**: Pizza menu management
- **admin/schedule.tsx**: Time slot and capacity management

### **Utility Screens:**
- **account.tsx**: Member profile management
- **about.tsx**: Pizza Dojo story and information
- **contact.tsx**: Contact information
- **history.tsx**: Order history (future feature)

---

## 🎯 **Acceptance Criteria**

### **Phase 1 - Foundation (COMPLETE)**
- ✅ App structure analyzed
- ✅ Navigation flow validated
- ✅ Database schema documented
- ✅ Critical issues identified

### **Phase 2 - Member Flow (IN PROGRESS)**
- [ ] Fix RLS policies to allow signup
- [ ] Complete login → signup → order flow
- [ ] Implement SMS confirmation
- [ ] Add data validation (duplicates, availability)

### **Phase 3 - Admin Panel (PENDING)**
- [ ] Implement admin authentication
- [ ] Complete order management system
- [ ] Add member management features
- [ ] Implement KDS (Kitchen Display System)

### **Phase 4 - Polish & Delivery (PENDING)**
- [ ] Add error handling and notifications
- [ ] Test all API routes and database operations
- [ ] Implement proper authentication system
- [ ] Prepare for production deployment

---

## 🔄 **Data Flow**

### **Member Registration:**
1. User enters name → Username generated
2. Check database for existing member
3. If new → Route to signup form
4. Collect member data → Validate → Insert to database
5. Route to frontdoor with username

### **Order Process:**
1. Select pizza from menu
2. Choose available time slot
3. Add special instructions
4. Submit order → Create order record
5. Send SMS confirmation
6. Display confirmation screen

### **Admin Operations:**
1. Access admin panel (RobertP only)
2. View/manage orders by status
3. Edit member information
4. Manage menu items and availability
5. Control time slots and capacity

---

## 📊 **Testing Requirements**

### **Unit Tests:**
- API functions for all CRUD operations
- Authentication and authorization
- Data validation and error handling

### **Integration Tests:**
- Complete user registration flow
- Order creation and confirmation
- Admin panel functionality
- Database operations and RLS policies

### **End-to-End Tests:**
- Login → Signup → Order → Confirmation flow
- Admin panel access and operations
- SMS confirmation system
- Cross-platform compatibility (iOS, Android, Web)

---

## 🚀 **Deployment Requirements**

### **Environment Setup:**
- Supabase project with proper RLS policies
- Twilio account for SMS notifications
- Environment variables for API keys
- Build scripts for mobile and web deployment

### **Production Checklist:**
- [ ] Database schema finalized and tested
- [ ] RLS policies properly configured
- [ ] SMS integration working
- [ ] Admin authentication secure
- [ ] Error handling comprehensive
- [ ] Performance optimized
- [ ] Cross-platform tested

---

**Last Updated**: December 28, 2024
**Status**: Phase 1 Complete - Ready for Phase 2 Implementation

























