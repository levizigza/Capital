# Production ship checklist

Use after merging the island content full rewrite branch.

## Machine gates (automated)

```bash
npm run test -- --run \
  src/islands/islandContentDepth.test.ts \
  src/islands/islandPlaytestUnlock.test.ts \
  src/islands/story/capitalIconicGame.test.ts \
  src/islands/story/capitalPatternLibrary.test.ts \
  src/qa/contentValidation.test.ts \
  src/islands/progressOrganLocks.test.ts \
  src/islands/spineTakeFootprints.test.ts
```

- [ ] All suites green
- [ ] `PLAYTEST_UNLOCK_ALL_ISLANDS === false` in `src/islands/progressGates.ts`
- [ ] Every map island ≥ 8 minigames, ≥ 3 quests (Harbor hub exempt from quests)
- [ ] Locked scar/quest IDs unchanged (capitalIconicGame.test.ts)

## Human gate (pattern #94)

1. Fresh profile · Harbor → Cove → Paycheck → Credit cold path
2. Answer six questions in [`pattern-human-playtest.md`](./pattern-human-playtest.md)
3. Replace `HUMAN_PLAYTEST: PENDING` with `HUMAN_PLAYTEST: PASS` when a non-designer confirms

**Cannot ship iconic to players until #94 is filled by a real human.**

## Deploy

- [ ] Merge PR to `main`
- [ ] Verify GitHub Pages / live URL matches merged SHA
- [ ] One cold triangle on device (signature loop + one side shore digression)
