# Admin Login Process - Technical Summary
## Browser-Based Version of Pizza Club App

**Date**: December 23, 2025  
**Version**: Browser/Web Implementation

---

## Overview

The Pizza Club app uses a **two-step authentication process** for both regular members and administrators. Admin login follows the same initial flow as member login, but with additional admin-specific checks and routing.

---

## Authentication Flow

### Step 1: Name Entry (`app/login.tsx`)

**User Action**: User enters first and last name (e.g., "Robert Paulson")

**Process**:
1. User enters full name in the login screen
2. System extracts first name and last name from input
3. Generates username using format: `first[0] + last` (all lowercase)
   - Example: "Robert Paulson" → "rpaulson"
4. Calls `submitName()` function

**Code Location**: `app/login.tsx` lines 69-189

---

### Step 2: Username Lookup & Admin Detection

**Process**:
1. **Connection Test** (lines 87-104):
   - Tests Supabase connection by querying `members` table
   - Validates database permissions (checks for RLS errors)

2. **Admin Check** (lines 106-131):
   - Calls `adminAuth.checkAdminAccess(username)` from `lib/adminAuth.ts`
   - Queries `admins` table in Supabase:
     ```typescript
     supabase
       .from('admins')
       .select('username')
       .eq('username', username)
       .single()
     ```
   - If username exists in `admins` table:
     - Admin detected → Load admin password from `admins` table
     - Set `memberData` with `isAdmin: true` flag
     - Show password input field
     - Focus password input
   - If username NOT in `admins` table:
     - Continue to regular member lookup

3. **Member Lookup** (lines 133-170):
   - If not admin, query `members` table:
     ```typescript
     supabase
       .from('members')
       .select('id, username, password_hash')
       .eq('username', username)
       .single()
     ```
   - If member found → Show password input
   - If member NOT found → Route to `/signup` page

**Code Location**: `app/login.tsx` lines 69-189

---

### Step 3: Password Verification

**User Action**: User enters password

**Process** (lines 191-213):
1. System compares entered password with stored `password_hash` from database
2. **Plain text comparison** (no hashing - security limitation):
   ```typescript
   if (password === memberData.password_hash) {
     // Password correct
   }
   ```
3. **If password matches:**
   - Check if `memberData.isAdmin === true`
   - **If Admin**:
     - Call `adminAuth.setCurrentAdmin(memberData.username)` to set admin session
     - Route to `/admin` (admin dashboard)
   - **If Regular Member**:
     - Route to `/frontdoor` with username parameter
4. **If password incorrect:**
   - Show alert: "Wrong Password"
   - Clear password field
   - User can retry

**Code Location**: `app/login.tsx` lines 191-213

---

## Admin Authentication Service (`lib/adminAuth.ts`)

### Singleton Pattern
- Uses singleton pattern to maintain single admin session instance
- Access via `adminAuth` constant (exported singleton instance)

### Key Methods

#### `checkAdminAccess(username: string): Promise<string | null>`
- **Purpose**: Check if username exists in `admins` table
- **Returns**: Username if admin found, `null` otherwise
- **Database Query**: 
  ```typescript
  supabase
    .from('admins')
    .select('username')
    .eq('username', username)
    .single()
  ```
- **Location**: `lib/adminAuth.ts` lines 29-52

#### `setCurrentAdmin(username: string): void`
- **Purpose**: Set current admin session after successful login
- **Creates AdminUser object** with:
  - `id`: 'admin-robert' (hardcoded)
  - `username`: Provided username
  - `role`: 'super_admin' (hardcoded)
  - `permissions`: ['orders', 'members', 'menu', 'schedule', 'settings']
  - `is_active`: true
- **Stores in memory**: `this.currentAdmin`
- **Location**: `lib/adminAuth.ts` lines 55-66

#### `getCurrentAdmin(): AdminUser | null`
- **Purpose**: Get current admin session
- **Returns**: AdminUser object if logged in, `null` otherwise
- **Location**: `lib/adminAuth.ts` lines 69-71

#### `isAdmin(): boolean`
- **Purpose**: Check if current user is admin
- **Returns**: `true` if `currentAdmin` is set, `false` otherwise
- **Location**: `lib/adminAuth.ts` lines 80-82

#### `logout(): void`
- **Purpose**: Clear admin session
- **Sets**: `this.currentAdmin = null`
- **Location**: `lib/adminAuth.ts` lines 90-93

---

## Admin Session Management

### Session Storage
- **Storage Type**: In-memory only (React state/singleton)
- **Persistence**: No persistent storage (session lost on page refresh)
- **Session Recovery**: Admin dashboard attempts to restore session on load

### Session Recovery (`app/admin/index.tsx`)
- **On Admin Dashboard Load** (lines 41-49):
  1. Calls `checkAdminAccess()` function
  2. Checks if `adminAuth.getCurrentAdmin()` returns admin
  3. If no admin session found:
     - Attempts to restore session by querying `admins` table
     - Hardcoded check for username: `'rpaulson'`
     - If found, calls `adminAuth.setCurrentAdmin()`
  4. If still no admin session → Redirects to `/login`

**Code Location**: `app/admin/index.tsx` lines 51-80

---

## Admin Route Protection

### Admin Dashboard Entry (`app/admin/index.tsx`)
- **Access Check**: `checkAdminAccess()` function runs on component mount
- **Fallback**: If no admin session, redirects to `/login`
- **No Route Guards**: Expo Router doesn't have built-in route guards - protection is component-level

### Admin Layout (`app/admin/_layout.tsx`)
- **No Authentication Check**: Layout doesn't check admin status
- **Tab Navigation**: Provides tab bar for admin sections:
  - Members
  - Menu
  - Schedule
  - KDS (Kitchen Display System)

---

## Database Schema

### `admins` Table
```sql
- id (UUID, primary key)
- username (text, unique)
- password_hash (text)  # Note: Currently stores plain text
- email (text)
- role (text: 'super_admin' | 'admin' | 'kitchen_staff')
- permissions (array of text)
- is_active (boolean)
- last_login (timestamp, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

**Queries Used**:
- Lookup admin by username: `SELECT username FROM admins WHERE username = ?`
- Load admin password: `SELECT username, password_hash FROM admins WHERE username = ?`

---

## Security Considerations

### Current Implementation (Not Secure)
1. **Plain Text Passwords**: Passwords stored and compared in plain text
2. **No Hashing**: No bcrypt or similar password hashing
3. **In-Memory Session**: Session lost on page refresh
4. **No JWT Tokens**: No token-based authentication
5. **No Session Expiry**: No automatic logout after inactivity
6. **Hardcoded Admin Check**: Fallback uses hardcoded username `'rpaulson'`

### Recommended Improvements
1. Implement password hashing (bcrypt, argon2)
2. Add JWT token-based sessions
3. Implement persistent session storage (localStorage/sessionStorage)
4. Add session expiry/timeout
5. Add route guards at router level
6. Remove hardcoded admin username from recovery logic

---

## Code Flow Diagram

```
User enters "Robert Paulson"
         ↓
Generate username: "rpaulson"
         ↓
Test Supabase connection
         ↓
Check admin table for "rpaulson"
         ↓
    [Found in admins?]
         ↓
    ┌────┴────┐
   YES       NO
    ↓         ↓
Load admin  Check members
password    table for "rpaulson"
    ↓         ↓
Show pass   [Found in members?]
input          ↓
    ↓       ┌──┴──┐
    ↓      YES   NO
    ↓       ↓     ↓
    ↓    Show   Route to
    ↓    pass   /signup
    ↓    input
    ↓       ↓
User enters password
         ↓
Compare with password_hash
         ↓
    [Match?]
         ↓
    ┌────┴────┐
   YES       NO
    ↓         ↓
Check isAdmin Show "Wrong
flag         Password"
    ↓
[isAdmin = true?]
    ↓
┌───┴───┐
YES     NO
 ↓       ↓
Set    Route to
admin  /frontdoor
session
 ↓
Route to /admin
```

---

## Browser-Specific Considerations

### Web Platform Code (`app/login.tsx`)
- **Autofill Prevention** (lines 291-295, 320-324):
  - Uses `autoComplete="off"` for name input
  - Uses `autoComplete="new-password"` for password input (trick to prevent autofill)
  - Platform-specific props for web

### Keyboard Handling
- **Keyboard Events**: Listens for keyboard show/hide events
- **Dynamic Padding**: Adjusts layout padding when keyboard appears
- **Focus Management**: Auto-focuses input fields after state changes

### Form Clearing
- **On Screen Focus**: Clears form when login screen regains focus
- **Reset Function**: Allows user to go back and change name
- **Use Focus Effect**: `useFocusEffect()` hook clears form on navigation

---

## Error Handling

### Network Errors
- **Detection**: Checks for "Network request failed", "fetch failed", "ECONNREFUSED"
- **User Message**: Provides troubleshooting steps
- **Location**: `app/login.tsx` lines 171-188

### Database Errors
- **RLS Errors**: Detects permission denied (code 42501)
- **Not Found**: Handles PGRST116 (no rows found) - routes to signup
- **Other Errors**: Shows generic error alert with error code and message

### Admin-Specific Errors
- **Admin Not Found**: If admin check succeeds but password load fails
- **Message**: "Admin account error. Please contact support."

---

## Key Files

### Main Login Screen
- **File**: `app/login.tsx`
- **Purpose**: Handles both member and admin login
- **Key Functions**: `submitName()`, `submitPassword()`, `resetLogin()`

### Admin Authentication Service
- **File**: `lib/adminAuth.ts`
- **Purpose**: Manages admin session and provides admin utilities
- **Key Methods**: `checkAdminAccess()`, `setCurrentAdmin()`, `getCurrentAdmin()`

### Admin Dashboard
- **File**: `app/admin/index.tsx`
- **Purpose**: Main admin dashboard entry point
- **Key Function**: `checkAdminAccess()` - session validation on load

### Admin Layout
- **File**: `app/admin/_layout.tsx`
- **Purpose**: Tab navigation for admin sections
- **Tabs**: Members, Menu, Schedule, KDS

---

## Testing Admin Login

### Test Case 1: Admin Login Flow
1. Navigate to `/login`
2. Enter admin name (e.g., "Robert Paulson")
3. Press "ENTER" button
4. System should detect admin and show password field
5. Enter admin password
6. Press "SUBMIT" button
7. Should redirect to `/admin` dashboard

### Test Case 2: Non-Admin Login
1. Navigate to `/login`
2. Enter regular member name
3. System should query `members` table (not `admins`)
4. Show password field
5. Enter password
6. Should redirect to `/frontdoor` (not `/admin`)

### Test Case 3: Admin Session Persistence
1. Log in as admin → `/admin`
2. Refresh page (F5)
3. System should attempt to restore admin session
4. If session lost, should check `admins` table for hardcoded username
5. If found, restore session; if not, redirect to `/login`

---

## Summary

The admin login process is integrated into the main login flow:
- Same entry point as member login (`/login`)
- Admin detection happens automatically during username lookup
- Admin password stored in separate `admins` table
- Admin session managed via singleton service (in-memory)
- Route protection handled at component level (not router level)
- Session recovery attempted on admin dashboard load

**Key Points**:
- ✅ Admin and member login share same UI flow
- ✅ Admin detection automatic (no separate admin login page)
- ⚠️ Plain text password storage (security issue)
- ⚠️ In-memory session only (lost on refresh)
- ⚠️ No persistent session tokens

---

*End of Technical Summary*

