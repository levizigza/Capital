# FinanceQuest Pro - Navigation Flow Documentation

## Overview
This document describes the complete navigation flow through FinanceQuest Pro and how page transitions work.

## Key Navigation Principles
1. **State-Based Navigation**: The app uses React state to switch between views (no URL routing)
2. **Conditional Rendering**: Components conditionally render different views based on state
3. **Proper Back Navigation**: All game pages have "Return to Hub" or "Exit" buttons
4. **Progress Preservation**: User progress is maintained when switching between modes

## Navigation Hierarchy

```
App.tsx (Root)
├── Mode Selection (when currentMode is null)
│   ├── Creative Mode Button → Sets currentMode = 'creative'
│   └── Structured Mode Button → Sets currentMode = 'structured'
│
├── Creative Mode Hub (when currentMode === 'creative')
│   ├── Tabs Navigation:
│   │   ├── Overview (Garden View)
│   │   ├── Progression (Tier System)
│   │   ├── Mini-Games (Quick Games List)
│   │   ├── Adventures (Main Games List)
│   │   ├── Challenges (Daily/Weekly)
│   │   └── Progress (Statistics)
│   │
│   ├── Game Selection → Sets selectedGame state
│   └── Individual Game (when selectedGame !== null)
│       └── Exit Button → Sets selectedGame = null (returns to hub)
│
└── Structured Mode Hub (when currentMode === 'structured')
    ├── Tabs Navigation:
    │   ├── Dashboard (KPI Overview)
    │   ├── Banking (Simulator)
    │   ├── Progression (Tier System)
    │   ├── Games (Games List)
    │   ├── Statistics (Charts)
    │   └── Leaderboard
    │
    ├── Game Selection → Sets isPlaying = true
    └── Professional Game Hub (when isPlaying === true)
        ├── Game Selection Menu
        ├── Individual Game → Renders specific game component
        └── Back/Exit Button → Sets isPlaying = false (returns to dashboard)
```

## Detailed Navigation Paths

### 1. From App Load to Playing a Game (Creative Mode)

```
1. User loads app
2. App.tsx checks authentication
3. If authenticated, checks currentMode
4. If currentMode is null → Shows ModeSelection
5. User clicks "Creative Mode"
   → onSelectMode('creative') called
   → currentMode state set to 'creative'
   → App.tsx renders CreativeModeHub
6. CreativeModeHub renders with tabs
7. User clicks on a game in Mini-Games or Adventures tab
   → handleGameStart(gameId) called
   → selectedGame state set to gameId
   → Component conditionally renders game
8. Game component renders with:
   → onComplete prop for finishing game
   → onExit prop for returning to hub
9. User clicks Exit or completes game
   → handleGameExit() or handleGameComplete() called
   → selectedGame state set to null
   → Returns to CreativeModeHub
```

### 2. From App Load to Playing a Game (Structured Mode)

```
1. User loads app
2. App.tsx checks authentication
3. If authenticated, checks currentMode
4. If currentMode is null → Shows ModeSelection
5. User clicks "Structured Mode"
   → onSelectMode('structured') called
   → currentMode state set to 'structured'
   → App.tsx renders StructuredModeHub
6. StructuredModeHub renders with tabs
7. User navigates to "Games" tab
8. User clicks "Start Game" on any game card
   → setIsPlaying(true) called
   → Component conditionally renders ProfessionalGameHub
9. ProfessionalGameHub shows game selection menu
10. User clicks "Start Game" on specific game
    → handleGameStart(gameId) in ProfessionalGameHub
    → selectedGame state (local to ProfessionalGameHub) set
    → Game component renders
11. User clicks Exit or completes game
    → Returns to ProfessionalGameHub game selection
12. User clicks "Back to Dashboard"
    → onExit() called
    → isPlaying set to false
    → Returns to StructuredModeHub
```

### 3. Switching Between Modes

```
1. User is in Creative Mode Hub
2. User opens Settings (gear icon)
3. User clicks "Switch to Structured Mode"
   → onModeSwitch() called in CreativeModeHub
   → Calls parent's handleModeSwitch() in App.tsx
   → currentMode state set to null
   → App.tsx renders ModeSelection
4. User can now select a mode again
   → This preserves all progress (stored in App.tsx state)
   → User profile, game scores, etc. all maintained
```

## State Management for Navigation

### App.tsx State
- `currentMode`: 'creative' | 'structured' | null
- `userProfile`: Contains all user data
- `gameScores`: Array of all game completions
- Progress persisted via useKV hook

### CreativeModeHub State
- `selectedGame`: string | null (which game is currently playing)
- `gameStartTime`: number (for tracking time spent)
- `activeTab`: which tab is currently visible
- `showSettings`: boolean (settings dialog open/closed)

### StructuredModeHub State
- `isPlaying`: boolean (whether user is in game hub)
- `showSettings`: boolean (settings dialog open/closed)
- `darkMode`: boolean (theme toggle)
- Tab state managed by Tabs component

### ProfessionalGameHub State (Structured Mode)
- `selectedGame`: string | null (which game is currently playing)
- `gameStartTime`: number (for tracking time spent)

## Return to Hub Mechanisms

### Creative Mode
- **Game Exit Button**: Calls `onExit` prop → `handleGameExit()` → `setSelectedGame(null)`
- **Game Completion**: Calls `onComplete` prop → `handleGameComplete()` → `setSelectedGame(null)`
- **Result**: Returns to CreativeModeHub on the same tab

### Structured Mode
- **Game Exit Button**: Calls `onExit` prop → `handleGameExit()` in ProfessionalGameHub → `setSelectedGame(null)`
- **Game Completion**: Calls `onComplete` prop → returns to game selection in ProfessionalGameHub
- **Hub Exit Button**: "Back to Dashboard" → calls `onExit` from StructuredModeHub → `setIsPlaying(false)`
- **Result**: Returns to StructuredModeHub

## Browser Back Button Behavior

**Current Implementation**: 
- The app does NOT use browser routing (no react-router)
- Browser back button will navigate away from the entire app
- This is intentional for a single-page application

**To Support Browser Back Button**:
- Would require implementing react-router or similar
- Would need URL-based routing instead of state-based
- Would need history management
- Not currently implemented

## Progress Preservation

### During Navigation
- All user progress stored in App.tsx state via useKV
- Switching between modes does NOT lose progress
- Playing games updates shared state
- All state persisted to browser storage automatically

### Across Sessions
- useKV hook persists to browser storage
- Data survives page refreshes
- Auto-save every 30 seconds
- Manual export/import available

## Error Handling

### Game Errors
- Each game wrapped in `GameErrorBoundary`
- Errors caught and user returned to hub
- Error message displayed
- Progress not lost

### Navigation Errors
- If game component not found, returns to hub
- If state becomes inconsistent, fallbacks to safe defaults
- Console logging for debugging

## Testing Navigation

### Manual Test Checklist
1. ✅ Load app → See mode selection
2. ✅ Click Creative Mode → See Creative Hub
3. ✅ Click game → Game loads
4. ✅ Click Exit → Return to Creative Hub
5. ✅ Complete game → Return to Creative Hub with rewards
6. ✅ Switch to Structured Mode → Return to mode selection
7. ✅ Click Structured Mode → See Structured Hub
8. ✅ Navigate to Games tab → See game list
9. ✅ Click Start Game → See Professional Game Hub
10. ✅ Click game → Game loads
11. ✅ Click Exit → Return to game selection
12. ✅ Click Back to Dashboard → Return to Structured Hub
13. ✅ Refresh page → App restores state
14. ✅ Play game in each mode → Progress saved

## Common Issues and Solutions

### Issue: Game doesn't load when clicked
**Cause**: selectedGame state not being set properly
**Solution**: Check handleGameStart() is called with correct gameId

### Issue: Can't return to hub from game
**Cause**: onExit prop not passed to game component
**Solution**: Ensure all game components receive onExit prop

### Issue: Progress lost when switching modes
**Cause**: State not lifted to App.tsx
**Solution**: All progress should be in App.tsx userProfile state

### Issue: Browser back button leaves app
**Cause**: No URL routing implemented
**Solution**: This is expected behavior for current implementation

## Future Enhancements

1. **URL Routing**: Implement react-router for proper URL-based navigation
2. **Deep Linking**: Allow sharing links to specific games
3. **Browser History**: Support browser back/forward buttons
4. **Breadcrumbs**: Show navigation path
5. **Recent Pages**: Quick access to recently visited pages
6. **Keyboard Shortcuts**: Alt+H for hub, Esc for back, etc.
