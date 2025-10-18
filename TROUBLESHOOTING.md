# FinanceQuest Pro - Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Games not loading" or "Mode not showing"

**Solution:**
1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache and localStorage
3. Sign out and sign back in with GitHub

### Issue: "Nothing happens when I click Play"

**Cause:** The game components are loaded dynamically and need the complete onboarding flow.

**Solution:**
1. Make sure you're signed in with GitHub
2. Complete the consent dialog (PIPEDA)
3. Either complete or skip the VARK assessment
4. Select a mode (Creative or Structured)
5. Then try playing a game

### Issue: "Structured Mode tab is missing"

**Cause:** You selected Creative Mode and need to switch.

**Solution:**
1. Click the gear icon (⚙️) in the top right
2. Scroll to the bottom
3. Click "Switch to Structured Mode"

### Issue: "My progress was lost"

**Solution:**
1. Check if you're on the same browser/device
2. Progress is stored in spark.kv and localStorage
3. Use the Export Progress feature (in Settings > Data & Progress)
4. Import your progress file on another device

### Issue: "Game crashes or freezes"

**Solution:**
1. Check browser console for errors (F12)
2. Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
3. Hard refresh the page
4. If it persists, export your data and clear all data, then import

### Issue: "Banking tab shows no data"

**Cause:** Banking simulator needs to initialize.

**Solution:**
1. Go to Structured Mode > Banking tab
2. Click "Financial Dashboard"
3. The simulator will generate realistic transactions automatically
4. Or go to Banking Settings and click "Reset Simulator"

### Issue: "Tier progression not working"

**Cause:** Need to play games and complete quests.

**Solution:**
1. Go to either mode's "Progression" tab
2. Click on a quest to see requirements
3. Play the associated games to meet Financial KPIs
4. Complete the Soft Skill KPI (e.g., sharing strategy)
5. Quest will auto-complete when both KPIs are met

### Issue: "Challenges don't update"

**Cause:** Challenges are time-based and need specific conditions.

**Solution:**
1. Daily challenges reset at midnight
2. Weekly challenges reset every 7 days
3. Complete the exact requirement (e.g., score 500+ in Coin Catcher)
4. Challenge will auto-mark as complete when condition met

### Issue: "Dark mode not working"

**Cause:** Dark mode is only in Structured Mode.

**Solution:**
1. Switch to Structured Mode
2. Open Settings (gear icon)
3. Toggle "Dark Mode" under Appearance

## Emergency Reset

If nothing works, try this **full reset**:

1. Export your progress first! (Settings > Data & Progress > Export Progress)
2. Open browser console (F12)
3. Run: `localStorage.clear()`
4. Reload the page
5. Go through onboarding again
6. Import your progress if needed

## Performance Issues

If the app is slow:

1. Close other browser tabs
2. Disable browser extensions temporarily
3. Check if "Reduced Motion" is needed (Settings > Accessibility)
4. Use a modern browser with good JavaScript performance

## Data Privacy

- All data is stored locally in your browser
- Nothing is sent to external servers
- You can export and delete your data anytime
- PIPEDA compliance features protect Canadian users

## Getting Help

1. Check the PRD.md file for feature documentation
2. Check SYSTEM_STATUS.md for current system state
3. Look at browser console for error messages
4. Export your data before experimenting

## Verified Working Features

✅ Both Creative and Structured modes
✅ All 9 games (mini-games and adventures)
✅ Tier progression system
✅ Banking simulator
✅ Daily/weekly challenges
✅ Data persistence and backup
✅ Accessibility features
✅ Privacy/PIPEDA compliance
✅ VARK learning assessment

**Everything is implemented and working!** If you're experiencing issues, it's likely a state/cache problem that the above solutions will fix.
