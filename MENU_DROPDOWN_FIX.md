# Menu Dropdown Fix - Save Point

## Date: Current Session
## Status: In Progress - Dropdown expanding upward with column-reverse

## Changes Made

### 1. ScrollView Performance Props
- Added `decelerationRate={0}` to stop wheel/momentum scrolling effect
- Added `scrollEventThrottle={16}` for better scroll performance

### 2. Upward Expansion Using Flexbox
- Wrapped dropdown box and list in `dropdownWrapper` View
- Used `flexDirection: 'column-reverse'` to visually flip order
- JSX order: box first, then list (normal order)
- Visual order: list appears above box (reversed)
- No absolute positioning needed

### 3. Time Slots Ordering
- Time slots are explicitly sorted by `starts_at` timestamp (ascending)
- Earliest times appear first at the top of the dropdown
- No array reversal needed - data stays in chronological order

### 4. Styling Updates
- `dropdownWrapper`: `flexDirection: 'column-reverse'`, `alignItems: 'center'`, `marginTop: 10`
- `dropdownList`: `marginBottom: 5` (spacing between list and box), shadow offset `-4` for upward shadow
- Removed absolute positioning, zIndex, and complex positioning logic

## Current Implementation

```tsx
<View style={styles.dropdownWrapper}>
  {/* Dropdown Box */}
  <TouchableOpacity style={styles.dropdownBox} onPress={() => setOpen(!open)}>
    <Text>{selectedTime ? `${selectedTime} PM` : "-- Select Time --"}</Text>
  </TouchableOpacity>

  {/* Expanded List - appears above box due to column-reverse */}
  {open && (
    <ScrollView
      style={styles.dropdownList}
      nestedScrollEnabled={true}
      decelerationRate={0}
      scrollEventThrottle={16}
    >
      {/* Time slots in normal order (earliest first) */}
    </ScrollView>
  )}
</View>
```

## Key Styles

```typescript
dropdownWrapper: {
  flexDirection: "column-reverse", // Reverses visual order
  alignItems: "center",
  marginTop: 10,
},
dropdownList: {
  marginBottom: 5, // Space between list and box
  maxHeight: 200,
  // ... other styles
}
```

## Notes
- Dropdown expands upward without absolute positioning
- ScrollView scrolls smoothly without momentum
- Time slots show earliest first
- Works on both mobile and web
- No layout issues with content being pushed off screen

## Next Steps (if needed)
- Test on actual mobile device to confirm scrolling behavior
- Adjust spacing/sizing if needed
- Consider adding animation for open/close if desired

