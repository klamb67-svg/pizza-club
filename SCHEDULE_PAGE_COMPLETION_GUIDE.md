# Schedule Page - Complete Technical Implementation Guide
**For Claude - December 11, 2025**

---

## 📋 INTENDED FUNCTIONALITY

The Schedule page (`app/admin/schedule.tsx`) is an admin tool for **visualizing and managing order assignments to time slots**. It displays a grid of time slots (5:00 PM - 9:00 PM in 15-minute increments) for Friday and Saturday nights, showing which orders are assigned to which time slots.

### Core Features:
1. **Day Selection:** Toggle between Friday and Saturday
2. **Time Slot Grid:** Display all time slots (5:00 PM - 9:00 PM, 15-minute intervals)
3. **Visual Status:** Show which slots are:
   - **AVAILABLE** (green border, dark background)
   - **ASSIGNED** (green background with member name and pizza type)
4. **Assignment Management:**
   - Click empty slot → Open modal to assign an order
   - Click assigned slot → Remove assignment (with confirmation)
5. **Real-time Data:** Load actual orders from database and match them to time slots

---

## 🎯 CURRENT STATE

### ✅ What's Working (UI Layer):
- **100% Complete UI/UX:**
  - Day selector (Friday/Saturday toggle)
  - Time slot grid generation (5:00 PM - 9:00 PM, 15-min intervals)
  - Visual styling (green theme, assigned vs available states)
  - Assignment modal with quick-assign buttons
  - Remove assignment confirmation dialog
  - All React Native components styled and functional

### ❌ What's Missing (Data Layer):
- **0% Database Integration:**
  - Currently uses `sampleSchedule` mock data (hardcoded array)
  - No connection to `nights` table
  - No connection to `time_slots` table
  - No connection to `orders` table
  - Assignment functions (`assignOrder`, `removeFromSlot`) only update local state

### 🔧 TODOs in Code:
1. Line 45-52: `sampleSchedule` mock data needs replacement
2. Line 87-104: `loadScheduleData()` function has commented-out Supabase queries
3. Line 127: `removeFromSlot()` needs database DELETE operation
4. Line 138: `assignOrder()` needs database INSERT/UPDATE operation
5. Line 225-244: Assignment modal has hardcoded quick-assign buttons (Kelli, Nimix, Alex)

---

## 🗄️ DATABASE SCHEMA CONTEXT

### Critical Understanding: **Orders Don't Use `time_slot_id` Anymore**

**IMPORTANT:** The current order system uses `pickup_date` and `pickup_time` directly in the `orders` table. The `time_slots` table exists but is **NOT currently used** in the order creation flow.

**Orders Table Structure:**
```typescript
{
  id: number;
  member_id: number;
  pizza_id: number;
  pickup_date: string;        // YYYY-MM-DD format
  pickup_time: string;         // HH:MM:SS format (e.g., "17:15:00")
  delivery_or_pickup: string;
  status: 'pending' | 'preparing' | 'ready' | 'picked_up';
  created_at: string;
}
```

**Time Slots Table Structure:**
```typescript
{
  id: string;                  // uuid
  night_id: string;             // uuid (foreign key to nights)
  starts_at: string;            // timestamptz ISO timestamp
  is_available: boolean;
  created_at: string;
}
```

**Nights Table Structure:**
```typescript
{
  id: number;
  date: string;                // YYYY-MM-DD format
  day_of_week: 'Friday' | 'Saturday';
  is_active: boolean;
  max_capacity: number;
  current_bookings: number;
  starts_at: string;           // timestamptz ISO timestamp
  notes?: string;
  created_at: string;
  updated_at: string;
}
```

### Relationship Mapping:
- **Orders → Time Slots:** Match by `pickup_date` + `pickup_time` (NOT by foreign key)
- **Time Slots → Nights:** Match by `night_id` (uuid) → `nights.id`
- **Nights → Orders:** Match by `date` (YYYY-MM-DD) → `orders.pickup_date`

---

## 🔄 HOW IT SHOULD WORK

### Data Flow:

1. **Load Nights:**
   - Query `nights` table for active nights (`is_active = true`)
   - Filter by `day_of_week` matching selected day (Friday/Saturday)
   - Get the next upcoming Friday/Saturday night

2. **Load Time Slots:**
   - Query `time_slots` table for slots belonging to the selected night
   - Match by `night_id` (convert `nights.id` to uuid if needed)
   - Order by `starts_at` ascending

3. **Load Orders:**
   - Query `orders` table for orders matching:
     - `pickup_date` = selected night's date
     - `status` != 'cancelled'
   - JOIN with `members` table to get member names
   - JOIN with `pizzas` table to get pizza names

4. **Match Orders to Time Slots:**
   - For each time slot, find matching order by:
     - `time_slots.starts_at` (extract time portion) === `orders.pickup_time`
     - Example: `time_slots.starts_at = "2025-12-13T17:15:00Z"` → `"17:15:00"`
     - Match to `orders.pickup_time = "17:15:00"`

5. **Display:**
   - Show time slot as **ASSIGNED** if matching order found
   - Show member name and pizza name from joined order data
   - Show time slot as **AVAILABLE** if no matching order

---

## 🛠️ TECHNICAL IMPLEMENTATION REQUIREMENTS

### 1. Replace Mock Data Loading

**Current Code (Lines 87-104):**
```typescript
const loadScheduleData = async () => {
  try {
    setLoading(true);
    // 🔧 TODO: Replace with real Supabase queries
    setSchedule(sampleSchedule);  // ← MOCK DATA
  } catch (error) {
    console.error('Error loading schedule data:', error);
    setSchedule(sampleSchedule);  // ← MOCK DATA
  } finally {
    setLoading(false);
  }
};
```

**Needs:**
- Query `nights` table for active Friday/Saturday nights
- Query `time_slots` table filtered by `night_id`
- Query `orders` table filtered by `pickup_date` matching night date
- JOIN orders with `members` and `pizzas` tables
- Transform data to match `ScheduleEntry` type

### 2. Update `getSlotAssignment()` Function

**Current Code (Lines 108-110):**
```typescript
const getSlotAssignment = (slotId: string, day: string) => {
  return schedule.find(entry => entry.slotId === slotId && entry.day === day);
};
```

**Needs:**
- Match time slot's `starts_at` time portion to order's `pickup_time`
- Handle time format conversion (ISO timestamp → HH:MM:SS)
- Return order with member name and pizza name

### 3. Implement `assignOrder()` Database Operation

**Current Code (Lines 135-150):**
```typescript
const assignOrder = (memberName: string, pizzaType: string) => {
  // 🔧 TODO: assign order to slot in Supabase
  const newEntry: ScheduleEntry = {
    id: Date.now(),
    name: memberName,
    pizza: pizzaType,
    time: selectedSlot.time,
    day: selectedDay,
    slotId: selectedSlot.id,
  };
  setSchedule([...schedule, newEntry]);  // ← Only updates local state
};
```

**Needs:**
- **Option A:** Create a new order in `orders` table with:
  - `pickup_date` = selected night's date
  - `pickup_time` = time slot's time (formatted as HH:MM:SS)
  - `member_id` = lookup member by name
  - `pizza_id` = lookup pizza by name
  - `status` = 'pending'
- **Option B:** Update existing order's `pickup_date` and `pickup_time` to match time slot
- Update `time_slots.is_available = false` for the assigned slot
- Reload schedule data after assignment

### 4. Implement `removeFromSlot()` Database Operation

**Current Code (Lines 117-133):**
```typescript
const removeFromSlot = (slotId: string, day: string) => {
  Alert.alert(/* ... */, {
    onPress: () => {
      // 🔧 TODO: remove assignment from Supabase
      setSchedule(schedule.filter(/* ... */));  // ← Only updates local state
    },
  });
};
```

**Needs:**
- Find order matching the time slot (by `pickup_date` + `pickup_time`)
- Either:
  - **Option A:** Delete the order from `orders` table
  - **Option B:** Update order's `pickup_date`/`pickup_time` to NULL
  - **Option C:** Update order's `status` to 'cancelled'
- Update `time_slots.is_available = true` for the released slot
- Reload schedule data after removal

### 5. Update Assignment Modal

**Current Code (Lines 225-244):**
```typescript
<TouchableOpacity onPress={() => assignOrder('Kelli', 'Pepperoni')}>
  <Text>Kelli - Pepperoni</Text>
</TouchableOpacity>
// ... hardcoded buttons for Kelli, Nimix, Alex
```

**Needs:**
- Query `members` table to get list of all members
- Query `pizzas` table to get list of all pizzas
- Display dropdowns or searchable lists for:
  - Member selection
  - Pizza selection
- Or: Show list of pending orders that can be assigned to this slot

---

## 📚 AVAILABLE API FUNCTIONS

### From `lib/supabaseApi.ts`:

**Nights API:**
```typescript
nightsApi.getActive(): Promise<Night[]>
nightsApi.getAll(): Promise<Night[]>
nightsApi.create(night: CreateNightInput): Promise<Night | null>
nightsApi.update(id: number, updates: Partial<Night>): Promise<Night | null>
```

**Schedule/Time Slots API:**
```typescript
scheduleApi.getByNight(nightId: number): Promise<TimeSlot[]>
scheduleApi.getAvailableByNight(nightId: number): Promise<TimeSlot[]>
scheduleApi.assignOrder(timeSlotId: number, orderId: number): Promise<boolean>
scheduleApi.releaseTimeSlot(timeSlotId: number): Promise<boolean>
```

**Note:** The `scheduleApi.assignOrder()` function expects `time_slot_id` in orders table, but current orders use `pickup_date`/`pickup_time`. This API may need modification or you may need to write custom queries.

### Direct Supabase Queries Needed:

Since orders don't use `time_slot_id`, you'll likely need custom queries:

```typescript
// Get orders for a specific night
const { data: orders } = await supabase
  .from('orders')
  .select(`
    *,
    members!inner(first_name, last_name),
    pizzas!inner(name)
  `)
  .eq('pickup_date', nightDate)
  .not('status', 'eq', 'cancelled');

// Match order to time slot by time
const orderTime = order.pickup_time; // "17:15:00"
const slotTime = timeSlot.starts_at;  // "2025-12-13T17:15:00Z"
// Extract time portion and compare
```

---

## 🎨 UI/UX CONSIDERATIONS

### Current UI is Complete:
- ✅ Day selector styling
- ✅ Time slot grid layout (2 columns, responsive)
- ✅ Assigned vs available visual states
- ✅ Assignment modal with overlay
- ✅ Loading states (though not fully utilized)

### Potential Enhancements:
- Add loading spinner while fetching data
- Add error message display if queries fail
- Add refresh button to reload schedule
- Improve assignment modal with member/pizza selection UI
- Add search/filter for orders in assignment modal

---

## 🔐 AUTHENTICATION & SECURITY

**Current State:**
- No admin authentication check in `loadScheduleData()`
- TODOs mention adding admin auth checks

**Needs:**
- Add `adminAuth.checkAdminAccess()` before loading data
- Use `lib/adminAuth.ts` similar to other admin pages
- Redirect to `/login` if not authenticated

**Example from other admin pages:**
```typescript
useEffect(() => {
  const checkAccess = async () => {
    const hasAccess = await checkAdminAccess();
    if (!hasAccess) return;
    loadScheduleData();
  };
  checkAccess();
}, []);
```

---

## 🧪 TESTING CHECKLIST

Once implemented, test:

1. **Data Loading:**
   - [ ] Loads active nights from database
   - [ ] Loads time slots for selected night
   - [ ] Loads orders matching night's date
   - [ ] Correctly matches orders to time slots by time

2. **Day Selection:**
   - [ ] Switching to Friday shows Friday night's data
   - [ ] Switching to Saturday shows Saturday night's data
   - [ ] Time slots update when day changes

3. **Assignment:**
   - [ ] Clicking empty slot opens assignment modal
   - [ ] Assigning order updates database
   - [ ] Assigned slot shows member name and pizza
   - [ ] Schedule refreshes after assignment

4. **Removal:**
   - [ ] Clicking assigned slot shows confirmation
   - [ ] Removing assignment updates database
   - [ ] Slot becomes available after removal
   - [ ] Schedule refreshes after removal

5. **Edge Cases:**
   - [ ] Handles nights with no orders
   - [ ] Handles nights with no time slots
   - [ ] Handles multiple orders at same time (if allowed)
   - [ ] Handles time format mismatches

---

## 📝 CODE STRUCTURE REFERENCE

### Current File: `app/admin/schedule.tsx`
- **Total Lines:** 423
- **Imports:** React Native components, Ionicons, types from `lib/supabaseTypes`
- **State Variables:**
  - `schedule: ScheduleEntry[]` - Current schedule data (mock)
  - `selectedDay: 'Friday' | 'Saturday'` - Currently selected day
  - `selectedSlot: TimeSlotWithOrder | null` - Slot selected for assignment
  - `isAssignModalVisible: boolean` - Modal visibility
  - `loading: boolean` - Loading state

### Type Definitions Needed:

**Current `ScheduleEntry` type (Lines 54-61):**
```typescript
type ScheduleEntry = {
  id: number;
  name: string;
  pizza: string;
  time: string;
  day: string;
  slotId: string;
};
```

**May need to extend to include:**
- `order_id: number` - For database operations
- `member_id: number` - For member lookup
- `pizza_id: number` - For pizza lookup
- `pickup_date: string` - For date matching
- `pickup_time: string` - For time matching

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Data Loading (Critical)
1. Replace `loadScheduleData()` with real Supabase queries
2. Load nights, time slots, and orders
3. Match orders to time slots
4. Update `getSlotAssignment()` to use real data

### Phase 2: Assignment (High Priority)
1. Update `assignOrder()` to write to database
2. Update assignment modal with real member/pizza lists
3. Reload schedule after assignment

### Phase 3: Removal (High Priority)
1. Update `removeFromSlot()` to delete/update order in database
2. Reload schedule after removal

### Phase 4: Polish (Nice to Have)
1. Add loading indicators
2. Add error handling UI
3. Add refresh button
4. Improve assignment modal UX

---

## 🔗 RELATED FILES

**Files to Reference:**
- `app/admin/menu.tsx` - Example of loading pizzas from database
- `app/admin/members.tsx` - Example of loading members from database
- `app/admin/kds.tsx` - Example of loading orders with JOINs
- `app/menu.tsx` - Example of matching orders to time slots by `pickup_date`/`pickup_time`
- `lib/supabaseApi.ts` - Available API functions
- `lib/supabaseTypes.ts` - TypeScript interfaces

**Key Patterns to Follow:**
- Use `supabase.from('table').select()` for queries
- Use JOINs with `!inner()` for related data
- Handle errors with try/catch and console.error
- Update local state after successful database operations
- Use `useFocusEffect` for refreshing on screen focus (if needed)

---

## ⚠️ IMPORTANT NOTES

1. **Orders don't use `time_slot_id`:** The current order system uses `pickup_date` and `pickup_time` directly. The Schedule page needs to match orders to time slots by comparing these fields, not by foreign key.

2. **Time Format Matching:** Be careful with time format conversion:
   - `time_slots.starts_at` = ISO timestamp: `"2025-12-13T17:15:00Z"`
   - `orders.pickup_time` = Time string: `"17:15:00"`
   - Extract time portion from ISO timestamp for comparison

3. **Night ID Type Mismatch:** 
   - `nights.id` = `number`
   - `time_slots.night_id` = `string` (uuid)
   - May need conversion or check actual database schema

4. **RLS Considerations:**
   - `orders` table has RLS **DISABLED** (for admin delete functionality)
   - `nights` and `time_slots` tables may have RLS enabled
   - Test queries and adjust RLS policies if needed

---

## ✅ COMPLETION CRITERIA

The Schedule page is **complete** when:

1. ✅ Loads real nights from `nights` table
2. ✅ Loads real time slots from `time_slots` table
3. ✅ Loads real orders from `orders` table
4. ✅ Matches orders to time slots correctly
5. ✅ Displays assigned orders with member name and pizza name
6. ✅ Assignment modal allows selecting real members and pizzas
7. ✅ Assigning order writes to database
8. ✅ Removing assignment updates/deletes order in database
9. ✅ Schedule refreshes after assignment/removal
10. ✅ Admin authentication check implemented

---

**End of Schedule Page Completion Guide**









