# FinanceQuest Pro - Quick Reference Guide

## 🎮 How It Works

```
User Opens App
    ↓
GitHub Authentication
    ↓
Consent Dialog (PIPEDA)
    ↓
VARK Assessment (Learning Style)
    ↓
Mode Selection
    ├─→ Creative Mode (Finance Garden) ─→ Play Games ─→ Garden Grows
    └─→ Structured Mode (Analytics) ─→ Play Games ─→ View Stats
```

## 🌳 Creative Mode Flow

```
Finance Garden View
    ├─ Overview Tab - Interactive garden with clickable plants
    ├─ Progression Tab - Tier advancement and quest tracking
    ├─ Mini-Games Tab - Quick 2-5 minute games
    ├─ Adventures Tab - Longer 7-10 minute experiences
    ├─ Challenges Tab - Daily and weekly goals
    └─ Progress Tab - Stats, recent activity, achievements
```

## 📊 Structured Mode Flow

```
Analytics Dashboard
    ├─ Dashboard Tab - 4 KPI cards + category progress + pie chart
    ├─ Banking Tab - Transaction simulator and settings
    ├─ Progression Tab - Same tier system as Creative
    ├─ Games Tab - Sortable game library with stats
    ├─ Statistics Tab - Line charts + bar charts
    └─ Leaderboard Tab - Top 10 high scores
```

## 🎯 Game Flow

```
Select Game
    ↓
Game Loads (with tier-appropriate difficulty)
    ↓
Play & Learn Financial Concepts
    ↓
Complete Game
    ↓
Earn XP + Coins + Line XP
    ↓
Update Progress
    ↓
Check Challenges (if applicable)
    ↓
Return to Hub
```

## 🏆 Progression System

```
8 Tiers (Survive → Sanctify)
    ↓
Each Tier Has 3-5 Quests
    ↓
Each Quest Requires:
    ├─ Financial KPI (measurable action)
    └─ Soft Skill KPI (human development)
    ↓
Completing Quests Earns:
    ├─ Finance-XP (levels you up)
    └─ Line-XP (allocate to skill lines)
    ↓
Allocate Line-XP to 4 Dimensions:
    ├─ Cognition (analytical thinking)
    ├─ Values (priorities & trade-offs)
    ├─ Morals (ethical decisions)
    └─ Faith (long-term vision)
```

## 💾 Data Flow

```
User Actions
    ↓
React State Updates
    ↓
Spark KV (primary storage)
    ↓
Auto-save to localStorage (every 30s)
    ↓
Optional: Export to JSON
```

## 🔐 Security Flow

```
GitHub OAuth
    ↓
Session Created (30 min or 30 days)
    ↓
Activity Tracked
    ↓
5-min Warning Before Timeout
    ↓
Auto-logout or Extend Session
```

## 🎨 Component Hierarchy

```
App.tsx
├─ SessionGuard
│  ├─ ConsentDialog (first time)
│  ├─ VARKAssessment (first time)
│  ├─ ModeSelection (if no mode chosen)
│  ├─ CreativeModeHub
│  │  ├─ FinanceGarden
│  │  ├─ TierProgressionView
│  │  ├─ Game Components
│  │  └─ Settings Dialog
│  └─ StructuredModeHub
│     ├─ Dashboard Tabs
│     ├─ TierProgressionView
│     ├─ ProfessionalGameHub
│     └─ Settings Dialog
└─ SecureFooter
```

## 📦 Key Files

### Core App
- `App.tsx` - Main application, routing, state management
- `main.tsx` - Entry point (DO NOT EDIT)
- `index.html` - HTML shell with Google Fonts

### Mode Hubs
- `CreativeModeHub.tsx` - Finance Garden mode
- `StructuredModeHub.tsx` - Analytics Dashboard mode
- `ModeSelection.tsx` - Initial mode picker

### Games
- `ProfessionalGameHub.tsx` - Game launcher
- `games/CoinCatcherGame.tsx` - Savings game
- `games/BudgetBalancerGame.tsx` - Budget game
- `games/InvestmentClimberGame.tsx` - Investing game
- `games/CreditDefenderGame.tsx` - Credit game
- `games/BusinessBuilderGame.tsx` - Business game
- `games/LemonadeBossGame.tsx` - Profit game
- `PixelBudgetRunner.tsx` - Runner game
- `CreditCardMemory.tsx` - Memory game
- `CompoundGrowth.tsx` - Growth visualizer

### Features
- `TierProgressionView.tsx` - Quest & tier system
- `FinanceGarden.tsx` - Visual garden
- `FinanceLauncher.tsx` - Banking integration
- `VARKAssessment.tsx` - Learning style quiz
- `ConsentDialog.tsx` - Privacy consent
- `SessionGuard.tsx` - Auth wrapper
- `GameErrorBoundary.tsx` - Error handling
- `DataPersistenceControls.tsx` - Save/load

### Hooks
- `use-auth.ts` - Authentication & sessions
- `use-accessibility.ts` - A11y settings
- `use-data-persistence.ts` - Save/load system
- `use-banking.ts` - Transaction simulator
- `use-encrypted-kv.ts` - Encryption for sensitive data

### Data
- `tiers.ts` - 8-tier progression data
- `vark-questions.ts` - Learning style questions
- `gameData.ts` - Game metadata

### Styles
- `index.css` - Main theme CSS
- `main.css` - Structural CSS (DO NOT EDIT)

## 🎯 Common Tasks

### Add a New Game
1. Create component in `game/components/games/`
2. Add to game list in `CreativeModeHub.tsx` or `StructuredModeHub.tsx`
3. Include in `ProfessionalGameHub.tsx` if professional game
4. Ensure onComplete callback is wired
5. Test tier adaptation

### Modify Theme Colors
1. Edit `:root` variables in `index.css`
2. Use `oklch` color format
3. Maintain WCAG AA contrast ratios
4. Test in both modes

### Add New Tier
1. Edit `TIER_DATA` in `data/tiers.ts`
2. Add tier ID (9, 10, etc.)
3. Define quests with dual KPIs
4. Set line XP rewards
5. Test progression flow

### Add Accessibility Feature
1. Add setting to `use-accessibility.ts`
2. Update UI in settings dialogs
3. Apply CSS classes based on setting
4. Test with actual assistive tech

## 🐛 Debugging Tips

### "Game won't launch"
- Check browser console for errors
- Verify game import path
- Ensure GameErrorBoundary is wrapping
- Check userTier prop is valid

### "Progress not saving"
- Verify localStorage is enabled
- Check browser console for KV errors
- Look for quota exceeded errors
- Try manual save button

### "Mode switch broken"
- Check currentMode state in App.tsx
- Verify handleModeSwitch callback
- Ensure userProfile.preferredMode updates
- Look for routing logic errors

### "Charts not rendering"
- Verify Recharts data format
- Check for empty data arrays
- Ensure ResponsiveContainer has height
- Look for missing XAxis/YAxis

## 📚 Learning Resources

### For Users
- Play games to learn financial concepts
- Complete challenges for bonus rewards
- View analytics to track progress
- Export data to review offline

### For Developers
- See `FIXES_APPLIED.md` for technical details
- See `FINAL_VERIFICATION.md` for testing guide
- Check `PRD.md` for original requirements
- Review component files for inline documentation

## 🎓 Financial Concepts Covered

1. **Budgeting**
   - 50/30/20 rule
   - Zero-based budgeting
   - Expense categorization
   - Budget balancing

2. **Saving**
   - Emergency funds
   - Goal setting
   - Impulse control
   - Savings rate

3. **Investing**
   - Portfolio diversification
   - Asset allocation
   - Compound interest
   - Risk vs. return
   - Market timing

4. **Credit**
   - Credit scores
   - Credit cards
   - Payment history
   - Utilization rate
   - Account mix

5. **Business**
   - Profit margins
   - Unit economics
   - Pricing strategy
   - Operating costs
   - Break-even analysis

6. **Banking**
   - Transaction tracking
   - Account types
   - Income vs. expenses
   - Cash flow management

## 🎮 Game Mechanics

### Mini-Games (2-5 min)
- Coin Catcher - Reflex-based saving
- Budget Balancer - Drag-and-drop categorization
- Pixel Runner - Side-scrolling budgeting
- Lemonade Boss - Business simulation
- Credit Memory - Memory matching
- Compound Growth - Interactive visualization

### Adventure Games (5-10 min)
- Investment Tower - 10-round portfolio building
- Credit Defender - Tower defense credit game
- Business Builder - Multi-factor business sim

## 🏅 Gamification Elements

- **XP & Levels** - Finance-XP for general progression
- **Coins** - Virtual currency for achievements
- **Tiers** - 8-tier advancement system
- **Quests** - Dual KPI requirements
- **Line XP** - Allocatable skill points
- **Challenges** - Daily and weekly goals
- **Streaks** - Consecutive day tracking
- **Achievements** - Milestone badges
- **Leaderboard** - High score tracking
- **Garden Growth** - Visual progress (Creative)
- **Analytics** - Data-driven feedback (Structured)

## 🎨 Design Principles

### Creative Mode
- Whimsical, organic aesthetics
- Nature metaphors (plants = games)
- Warm, encouraging colors
- Smooth, fluid animations
- Visual rewards

### Structured Mode
- Professional, clean interface
- Data-focused presentation
- Cool, analytical colors
- Precise, purposeful animations
- Numerical rewards

## 🔄 Update Frequency

- Auto-save: Every 30 seconds
- Challenges: Reset daily (00:00) / weekly (7 days)
- Banking transactions: Generated daily
- Session timeout: Check every minute
- Progress bars: Real-time updates

## ✅ Quality Checklist

Before considering work complete:
- [ ] All games launch without errors
- [ ] Both modes fully functional
- [ ] Data persistence working
- [ ] Mode switching seamless
- [ ] Accessibility features active
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Responsive on all screen sizes
- [ ] Smooth animations (60fps)
- [ ] Error boundaries catch crashes

---

**Quick Start**: Select a mode → Play a game → Watch your progress grow!

**Pro Tip**: Creative Mode for visual learners, Structured Mode for analytical minds. Both teach the same concepts, just different presentations!
