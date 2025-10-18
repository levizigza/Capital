# Navigation System Documentation

## Overview
The FinanceQuest Pro application uses a state-based navigation system with browser history API integration to provide a seamless user experience across mode selection, hub navigation, and game play.

## Navigation Flow

### 1. Mode Selection → Hub
- **Entry Point**: `ModeSelection` component
- **Action**: User clicks "Creative Mode" or "Structured Mode"
- **Handler**: `handleModeSelect(mode)` in `App.tsx`
- **Result**: 
  - Sets `currentMode` state to 'creative' or 'structured'
  - Pushes state to browser history
  - Saves preference to user profile via `useKV`
  - Renders appropriate hub component

### 2. Hub → Game
**Creative Mode:**
- **Entry Point**: Game cards in mini-games/adventures tabs, or garden plants
- **Action**: User clicks "Play Now" button or clicks a plant
- **Handler**: `handleGameStart(gameId)` in `CreativeModeHub.tsx`
- **Result**:
  - Sets `selectedGame` state to game ID
  - Records game start time
  - Pushes game state to browser history
  - Renders game component in full-screen overlay

**Structured Mode:**
- **Entry Point**: Game cards in "Games" tab
- **Action**: User clicks "Start Game" button
- **Handler**: `handleGameStart()` in `StructuredModeHub.tsx`
- **Result**:
  - Sets `isPlaying` state to true
  - Pushes playing state to browser history
  - Renders `ProfessionalGameHub` in full-screen overlay

### 3. Game → Hub (Return)
- **Action**: User clicks exit button in game header
- **Handler**: `onExit` prop passed to game component
- **Flow**: Game `onExit` → Hub `handleGameExit` → Updates state
- **Result**:
  - Clears selected game state
  - Navigates back in browser history (if applicable)
  - Returns to hub view

### 4. Game Completion → Hub
- **Action**: Game ends (time up, lives lost, or completion)
- **Handler**: `onComplete` prop passed to game component
- **Flow**: Game `onComplete` → Hub `handleGameComplete` → App `completeGame`
- **Result**:
  - Records game score to `gameScores` via `useKV`
  - Awards XP and coins to user profile
  - Checks and completes challenges
  - Shows toast notification
  - Clears game state and returns to hub

### 5. Mode Switching
- **Entry Point**: Settings dialog in hub
- **Action**: User clicks "Switch to [Other] Mode"
- **Handler**: `onModeSwitch` prop → `handleModeSwitch` in `App.tsx`
- **Result**:
  - Clears `currentMode` state
  - Pushes null mode state to browser history
  - Returns to mode selection screen
  - **Preserves all user progress** via `useKV` persistence

## Browser Back Button Support

### Implementation
The app uses the HTML5 History API (`window.history`) to track navigation state:

1. **State Structure**:
   ```typescript
   type NavigationState = {
     mode: 'creative' | 'structured' | null
     game?: string
     playing?: boolean
   }
   ```

2. **History Events**:
   - `popstate` event listener in each component
   - State synced with React state on back/forward navigation

3. **User Experience**:
   - Back button from game → Returns to hub
   - Back button from hub → Returns to mode selection
   - Back button from mode selection → Browser default behavior

## State Persistence

### What Persists (via useKV)
- User profile (level, XP, coins, achievements)
- Game scores history
- User preferences (mode, difficulty, settings)
- Challenge progress (daily/weekly)
- Tier progression data
- Dark mode setting (structured mode)

### What Doesn't Persist
- Current selected game (intentional)
- In-progress game state (restarts fresh)
- Temporary UI states (dialogs, tabs)

## Key Components

### App.tsx
- Top-level navigation coordinator
- Manages mode selection
- Handles browser history for modes
- Orchestrates user profile and game completion

### CreativeModeHub.tsx
- Manages game selection in creative mode
- Handles game lifecycle (start, complete, exit)
- Browser history for game navigation
- Challenge tracking and rewards

### StructuredModeHub.tsx
- Manages professional game hub
- Handles play state and game hub routing
- Browser history for playing state
- Analytics and statistics display

### Game Components
All game components accept standard props:
```typescript
interface GameProps {
  onComplete: (score: number, additionalData?: any) => void
  onExit: () => void
  userTier?: 'elementary' | 'middle' | 'adult'
}
```

## Testing the Navigation

### Manual Test Cases

1. **Mode Selection Test**:
   - Select Creative Mode → Verify hub loads
   - Press browser back → Verify returns to mode selection
   - Select Structured Mode → Verify dashboard loads
   - Press browser back → Verify returns to mode selection

2. **Game Navigation Test (Creative)**:
   - Click mini-game → Verify game loads
   - Click exit button → Verify returns to hub
   - Click mini-game again → Verify game restarts fresh
   - Press browser back during game → Verify returns to hub

3. **Game Navigation Test (Structured)**:
   - Click Start Game → Verify game hub loads
   - Click Back to Dashboard → Verify returns to structured hub
   - Press browser back → Verify same result

4. **Mode Switching Test**:
   - Complete a game in Creative Mode
   - Note XP and coins
   - Switch to Structured Mode via settings
   - Verify same XP and coins displayed
   - Check statistics → Verify game scores preserved
   - Switch back to Creative Mode
   - Verify garden reflects completed games

5. **Browser Navigation Test**:
   - Navigate: Mode Select → Creative → Game
   - Press back twice → Verify at mode selection
   - Press forward twice → Verify at game
   - Click exit → Verify back stack maintained correctly

## Troubleshooting

### Issue: Games not loading
- **Check**: Is `selectedGame` or `isPlaying` state being set correctly?
- **Check**: Is the game component imported and mapped correctly?
- **Fix**: Verify game ID matches between hub and game registry

### Issue: Back button not working
- **Check**: Is `popstate` event listener attached?
- **Check**: Is history state being pushed on navigation?
- **Fix**: Ensure `window.history.pushState` called on navigation

### Issue: Progress not saved
- **Check**: Is `useKV` being used for persistence?
- **Check**: Are `setUserProfile` and `setGameScores` being called?
- **Fix**: Verify hooks are at top level and not conditional

### Issue: Mode switch loses data
- **This should not happen**: All data is persisted via `useKV`
- **Check**: Verify `userProfile` and `gameScores` are using `useKV`
- **Fix**: Ensure state updates use functional form: `setState(prev => ...)`

## Best Practices

1. **Always use functional state updates** when depending on previous state:
   ```typescript
   // ✅ Correct
   setUserProfile(prev => ({ ...prev, xp: prev.xp + 50 }))
   
   // ❌ Wrong (stale closure)
   setUserProfile({ ...userProfile, xp: userProfile.xp + 50 })
   ```

2. **Always push history state** on navigation:
   ```typescript
   window.history.pushState({ mode, game: gameId }, '', window.location.href)
   ```

3. **Always provide onExit handler** to game components:
   ```typescript
   <GameComponent onExit={handleGameExit} onComplete={handleGameComplete} />
   ```

4. **Always persist critical data** using useKV:
   ```typescript
   const [data, setData] = useKV('key', defaultValue)
   ```
