# Supabase Edge Functions Implementation

## Overview
Created secure server-side Edge Functions to handle admin operations that require bypassing RLS policies. The service role key is now only used server-side, never exposed to the client.

## Edge Functions Created

### 1. `/functions/admin/lock-slot`
**Purpose:** Lock or unlock time slots for admin users

**Endpoint:** `https://bvmwcswddbepelgctybs.supabase.co/functions/v1/admin/lock-slot`

**Request:**
```json
{
  "adminUsername": "string",
  "pickupDate": "YYYY-MM-DD",
  "pickupTime": "HH:MM:SS",
  "action": "lock" | "unlock"
}
```

**Response:**
```json
{
  "success": true,
  "error": "optional error message"
}
```

**Security:**
- Verifies admin exists in `admins` table before allowing operation
- Uses service role key server-side only
- Returns 401 if admin verification fails

### 2. `/functions/admin/delete-order`
**Purpose:** Delete orders for admin users

**Endpoint:** `https://bvmwcswddbepelgctybs.supabase.co/functions/v1/admin/delete-order`

**Request:**
```json
{
  "adminUsername": "string",
  "orderId": "number"
}
```

**Response:**
```json
{
  "success": true,
  "error": "optional error message"
}
```

**Security:**
- Verifies admin exists in `admins` table before allowing operation
- Uses service role key server-side only
- Returns 401 if admin verification fails

## Client-Side Changes

### `app/admin/schedule.tsx`
- **Removed:** `supabaseAdmin` import (security risk)
- **Added:** Fetch call to `lock-slot` Edge Function
- **Changed:** `toggleLock()` now calls Edge Function instead of direct database operation
- **Security:** Admin username passed from `adminAuth.getCurrentAdmin()`

### `app/admin/kds.tsx`
- **Removed:** `supabaseAdmin` import (security risk)
- **Added:** Fetch call to `delete-order` Edge Function
- **Changed:** `deleteOrder()` now calls Edge Function instead of direct database operation
- **Security:** Admin username passed from `adminAuth.getCurrentAdmin()`

## Deployment Steps

### 1. Deploy Edge Functions to Supabase
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref bvmwcswddbepelgctybs

# Deploy the functions
supabase functions deploy admin/lock-slot
supabase functions deploy admin/delete-order
```

### 2. Set Environment Variables in Supabase
The Edge Functions need these environment variables set in Supabase Dashboard:
- `SUPABASE_URL` (should be auto-set)
- `SUPABASE_SERVICE_ROLE_KEY` (set this in Supabase Dashboard → Settings → Edge Functions → Secrets)

### 3. Deploy Client Code
The client code changes are ready to commit and push.

## Security Improvements

✅ **Service role key never exposed to client**
- Service role key only exists in Edge Functions (server-side)
- Client code uses anon key only

✅ **Admin verification on every request**
- Each Edge Function verifies admin exists in `admins` table
- Returns 401 if admin verification fails

✅ **Proper error handling**
- Edge Functions return structured error responses
- Client code handles errors appropriately

## Testing Checklist

- [ ] Deploy Edge Functions to Supabase
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` secret in Supabase Dashboard
- [ ] Test lock slot functionality on schedule page
- [ ] Test unlock slot functionality on schedule page
- [ ] Test delete order functionality on KDS page
- [ ] Verify 401 errors when non-admin tries to use functions
- [ ] Verify operations actually persist in database

## Files Created/Modified

### Created:
- `supabase/functions/admin/lock-slot/index.ts`
- `supabase/functions/admin/delete-order/index.ts`
- `EDGE_FUNCTIONS_IMPLEMENTATION.md` (this file)

### Modified:
- `app/admin/schedule.tsx` - Updated to call Edge Function
- `app/admin/kds.tsx` - Updated to call Edge Function

