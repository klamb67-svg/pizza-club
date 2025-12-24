# Save Point - Time Slot & Date Issues
**Date:** January 2025  
**Status:** Timezone fix applied, but new issues discovered

## ✅ What's Working
- **Time display is now correct** - Times show in Central Time (Chicago) properly
- **2 days displaying** - Added `.limit(2)` to nights query, working correctly

## 🐛 Current Issues

### 1. Dates Displaying Incorrectly
- **Problem:** The dates shown for the nights are wrong
- **Location:** `app/menu.tsx` - `formatNightDate()` function
- **Context:** User can see 2 days, but the dates don't match what they should be

### 2. Console Error on Order Submission
- **Problem:** When submitting an order, there's a console error with a call stack
- **Location:** Likely in `app/orderConfirmation.tsx` or `lib/orderService.ts`
- **Context:** Order submission is failing or throwing an error
- **Action Needed:** Need to check the console error details next session

## 📝 Recent Changes Made

### Timezone Fix (Applied)
- Changed `formatTime12Hour()` to parse timestamp directly (no timezone conversion)
- Changed `getTimeString()` to parse timestamp directly
- **Note:** User reverted my `toLocaleString` solution and implemented a simpler string parsing approach

### Nights Query
- Added `.limit(2)` to nights query to show only 2 days
- Query: `.order('date', { ascending: true }).limit(2)`

## 🔍 Next Steps

1. **Fix date display:**
   - Check `formatNightDate()` function in `app/menu.tsx`
   - Verify how dates are stored in database vs how they're displayed
   - May need similar parsing approach as time fix

2. **Debug order submission error:**
   - Check browser/device console for full error message
   - Review `app/orderConfirmation.tsx` order creation flow
   - Check `lib/orderService.ts` for any errors
   - Verify timeSlotId is being passed correctly through the flow

3. **Test complete flow:**
   - Select pizza → Select day → Select time → Submit order
   - Verify no console errors
   - Verify dates display correctly
   - Verify times display correctly (already working)

## 📁 Files to Review Next Session
- `app/menu.tsx` - `formatNightDate()` function (line ~67)
- `app/orderConfirmation.tsx` - Order submission logic
- `lib/orderService.ts` - Order creation logic
- Browser/device console logs for error details

## 💡 Notes
- User implemented a simpler time parsing solution (string splitting) instead of `toLocaleString`
- This approach works but may need adjustment for date parsing too
- Need to see the actual console error to diagnose order submission issue














