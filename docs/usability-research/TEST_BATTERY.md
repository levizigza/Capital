# Observational test battery

Each test: **RESEARCH QUESTION · TARGET USER · STARTING STATE · TASK · EXPECTED BEHAVIOR · SUCCESS · FAILURE · OBSERVABLE SIGNALS**.

Tasks are **goals**. Do not read Expected Behavior to participants.

**Primary device default:** desktop browser; note phone variants in session runbook.

Legend for target users: aligns with recruitment rounds (S1 parents, etc.). Child co-play = parent present.

---

## UT-01 — Orient after arrival

**RESEARCH QUESTION:** Can a new player find a meaningful next action in Harbor without instruction?

**TARGET USER:** S1 parent (solo first) or S1 parent+child; also any cold adult tester.

**STARTING STATE:** Brand-new profile. Facilitator may skip only if participant already finished Title→Cast→Ashore alone; otherwise start from Title. Stop when Harbor plaza is interactive (`meet_guide` / first Harbor land). Do **not** explain Piggy or Carpet.

**TASK:**  
“You’ve arrived somewhere new. Figure out what you’re supposed to do next here.”

**EXPECTED BEHAVIOR (do not read aloud):** Walk; notice Piggy / plaza; approach and Talk (E/Enter); avoid treating Settings/Family Room as the main quest.

**SUCCESS CONDITION:** Within **4 minutes**, participant initiates Talk with the guide character (Piggy) **or** clearly states a correct next goal (“talk to someone” / “find how to leave”) and then executes it.

**FAILURE CONDITION:** ≥4 minutes with no Talk and no carpet board; **or** abandons; **or** only opens Settings/Family Room/utility stalls and treats that as “done.”

**OBSERVABLE SIGNALS:** Hesitation at empty plaza; hunting for HUD buttons; trying to click skybox; asking “is it broken?”; discovering near+E without help; delight at character.

---

## UT-02 — Leave Harbor for a first adventure

**RESEARCH QUESTION:** Can the player discover how to travel to the first island adventure?

**TARGET USER:** Same as UT-01 (after Piggy talk **or** if they already talked during UT-01).

**STARTING STATE:** Harbor after first Piggy Talk completed (`to_dock` / carpet available). If UT-01 failed Talk, either stop session path or reset to post-Talk save **without teaching** — prefer natural continuation.

**TASK:**  
“You want to go on your first money adventure away from this harbor. Show me how you’d get there.”

**EXPECTED BEHAVIOR:** Find Money Carpet / dock, board, ride to Coincraft Cove (or open travel and choose Cove).

**SUCCESS CONDITION:** Arrives on Cove shore (or equivalent first main island) within **5 minutes** of task start, without facilitator navigation hints.

**FAILURE CONDITION:** Cannot leave Harbor in 5 minutes; boards wrong flow repeatedly; opens Outfitter/Capsule as substitute “adventure” and stops.

**OBSERVABLE SIGNALS:** Carpet misread as decoration; map anxiety; Esc traps; phone Walk-pad struggle; uninstructed carpet discovery; time to board.

---

## UT-03 — Make a money choice that matters

**RESEARCH QUESTION:** Can the player complete an irreversible money choice and notice it is consequential?

**TARGET USER:** S1 (parent or parent+child co-play). Child may drive input with parent think-aloud.

**STARTING STATE:** On Coincraft Cove shore, chapter playable (fresh Cove). Do not mention Keeper Kira, Jar, or Treat.

**TASK:**  
“Somewhere on this shore, you’ll need to make a money choice you can’t undo. Find that moment and make the choice you think is right — then tell me what you think will happen because of it.”

**EXPECTED BEHAVIOR:** Explore shore / structure / NPCs; enter Talk that presents irreversible Take (jar vs treat); choose; dismiss; experience Take hush / cinema.

**SUCCESS CONDITION:** Completes irreversible Take **and** verbalizes a consequence prediction (even if wrong) **before or during** hush; cinema/hush begins or completes without facilitator intervention.

**FAILURE CONDITION:** Never finds the Take Talk in **10 minutes**; completes unrelated minigames only and declares done; refuses to choose when presented; soft-locks.

**OBSERVABLE SIGNALS:** Misreading structure toys as the “real” choice; skipping Talk; not noticing irreversibility language; delight/anxiety at choice; cause-effect guess quality.

---

## UT-04 — Return when the world goes quiet

**RESEARCH QUESTION:** After Take hush, can the player understand they should return to Harbor and do so?

**TARGET USER:** Continues from UT-03 success (or seeded post-Take hush on Cove with `chapterQuietPending`).

**STARTING STATE:** Cove post-Take with soft HUD / “Carpet home” cue present (whatever the build shows). Facilitator stays silent about Carpet.

**TASK:**  
“Things feel different now. Get back to the place you started from today.”

**EXPECTED BEHAVIOR:** Use carpet/travel home to Harbor.

**SUCCESS CONDITION:** Harbor plaza loads within **3 minutes**.

**FAILURE CONDITION:** Stuck on Cove ≥3 minutes; restarts chapter trying to “undo”; closes tab.

**OBSERVABLE SIGNALS:** Whether they read hush copy; carpet as only salient CTA; panic; discovery without reading.

---

## UT-05 — Understand that Harbor “felt” the choice

**RESEARCH QUESTION:** Does the player connect their Cove choice to Harbor’s reaction (scar / Plinth spectacle)?

**TARGET USER:** Continues from UT-04.

**STARTING STATE:** Harbor quiet homecoming / scar spectacle sequence available or running.

**TASK:**  
“Something happened here because of what you did earlier. Show me how you can tell — and what you think this place is trying to show you.”

**EXPECTED BEHAVIOR:** Attend to Plinth spectacle / captions; look at Memory Plinth; optionally Talk Piggy homecoming after.

**SUCCESS CONDITION:** Participant points to Plinth/scar/spectacle (or equivalent Harbor reaction) **and** links it in words to their earlier choice (cause → effect), within **4 minutes** of Harbor return (including during auto-cinema).

**FAILURE CONDITION:** Treats cinema as unskippable noise with no meaning; never looks at Plinth; attributes change to random bug; cannot name any link to Cove choice.

**OBSERVABLE SIGNALS:** Lean-in during spectacle; “Harbor felt that” comprehension; skipping share early; questions “did I break something?”; delight.

---

## UT-06 — Leave with a shareable artifact

**RESEARCH QUESTION:** Can the player obtain the share PNG (or download) without being told the control path?

**TARGET USER:** Continues when HarborFelt share UI is available post-spectacle.

**STARTING STATE:** Share preview / HarborFelt share overlay reachable (natural or still open).

**TASK:**  
“You want to show a friend or family member what just happened — using something from the game, not a phone photo of the whole screen. Show me how you’d do that.”

**EXPECTED BEHAVIOR:** Use Share / download on the share card.

**SUCCESS CONDITION:** Triggers share **or** download of the Harbor-felt card within **2 minutes** of task start (OS share sheet cancel still counts if intent clear).

**FAILURE CONDITION:** Only screenshots manually; cannot find share; dismisses overlay permanently without sharing and cannot reopen within 2 minutes.

**OBSERVABLE SIGNALS:** Mis-tap Leave; expectation of Instagram-native flow; delight at card; abandon.

---

## UT-07 — Know what opened next

**RESEARCH QUESTION:** After homecoming, can the player identify the newly available next adventure?

**TARGET USER:** Post Piggy homecoming Talk (or after spectacle if homecoming already named Paycheck).

**STARTING STATE:** Harbor post-homecoming; Paycheck unlocked per design.

**TASK:**  
“If you came back tomorrow, where would you go next to keep learning about money? Show me how you’d get there — you don’t have to finish that place.”

**EXPECTED BEHAVIOR:** Open carpet/map and indicate Paycheck Peninsula (or clearly named next painting).

**SUCCESS CONDITION:** Correctly identifies next main destination **and** opens travel far enough to select/highlight it within **3 minutes**.

**FAILURE CONDITION:** Only returns to Cove; cannot find map; names a utility stall as “next learning.”

**OBSERVABLE SIGNALS:** Memory of Piggy line; map literacy; hesitation among era shores.

---

## UT-08 — Enter a Money Structure and leave intact

**RESEARCH QUESTION:** Can players enter a Money Structure, do one meaningful poke/interact, and return to the walkable world without feeling “stuck in a menu”?

**TARGET USER:** S1 or any cold player; may run on Harbor Ledger Bank **or** Cove Coin Jar **before** Take if time — prefer Harbor Ledger Bank on a quiet plaza to isolate structure UX.

**STARTING STATE:** Harbor plaza with Ledger Bank available (not during `meet_guide` lock if E conflict — use post-Talk save). Or Cove pre-Take at Coin Jar.

**TASK:**  
“There’s a landmark here that’s about money in a bigger way than a normal stall. Get inside it, try one thing, then get back out to walking around outside.”

**EXPECTED BEHAVIOR:** Enter structure (vault door / coin slot motif), poke a part/toy, exit to plaza/shore.

**SUCCESS CONDITION:** Enter + ≥1 intentional interaction + exit to walkable exterior within **5 minutes**, without full app remount confusion.

**FAILURE CONDITION:** Cannot enter; enters but cannot exit (≥2 min); thinks crash occurred; never interacts inside.

**OBSERVABLE SIGNALS:** Silhouette readability without HUD; exit hunt; delight at toys; misread as settings.

---

## UT-09 — Cause and effect retell (no UI chasing)

**RESEARCH QUESTION:** After the signature loop, can the participant retell choice → Harbor consequence without prompting through menus?

**TARGET USER:** Anyone who completed UT-03–05 (or full cold path).

**STARTING STATE:** Harbor after spectacle; Plinth may be visited. Facilitator hides own notes of their actual choice.

**TASK:**  
“Pretend I wasn’t watching. Tell me the story of what you chose and what changed because of it. You can use the game to help you remember, but you don’t have to.”

**EXPECTED BEHAVIOR:** Accurate jar-vs-treat (or equivalent) retell + Harbor scar/Plinth/share memory; optional Plinth visit to support recall.

**SUCCESS CONDITION:** Retell includes (1) the choice fork they took and (2) at least one Harbor-side consequence (scar, Plinth, “felt that,” Piggy line, quiet plaza). Wrong brand names OK if causal link correct.

**FAILURE CONDITION:** Cannot recall choice; invents combat/win framing; says “nothing changed”; only recalls Ashore walk tutorial.

**OBSERVABLE SIGNALS:** Use of Plinth as memory aid; confidence; child vs parent story divergence in co-play.

---

## UT-10 — Day-2 scar echo (return visit)

**RESEARCH QUESTION:** On a later session, can the player notice the world still remembers the scar without being told to check a quest log?

**TARGET USER:** S1 returning parent; same profile as prior session.

**STARTING STATE:** Save with day-2 / scar_echo rumor ready (Soft Beat “Still here” path). Cold open to Harbor.

**TASK:**  
“You’re back after some time away. Has anything about your earlier money choice stuck around? Show me how you can tell.”

**EXPECTED BEHAVIOR:** Notice day-2 echo / Plinth / locals; Visit Plinth or acknowledge echo cinema.

**SUCCESS CONDITION:** Identifies a day-2 memory signal tied to prior choice within **4 minutes**.

**FAILURE CONDITION:** Treats Harbor as brand-new; never finds Plinth; ignores echo overlay as ad.

**OBSERVABLE SIGNALS:** Recognition delight; confusion with Daily Ritual; abandon.

---

## UT-11 — Co-play control negotiation (parent+child)

**RESEARCH QUESTION:** In parent+child play, who drives, and where does control handoff break task success?

**TARGET USER:** S1 pair (child 7–10 + parent).

**STARTING STATE:** Fresh or mid Cove; both seated; one keyboard/mouse or tablet.

**TASK:**  
“Together, get to a money choice that matters and finish it. Decide between yourselves who steers — I won’t assign roles.”

**EXPECTED BEHAVIOR:** Natural handoff; Talk+Take completed; parent resists spoiling path (facilitator still silent on how).

**SUCCESS CONDITION:** Take completed; both can state the choice afterward.

**FAILURE CONDITION:** Parent fully pilots while child disengages entire time; child rage-quits; pair cannot agree to proceed ≥8 minutes.

**OBSERVABLE SIGNALS:** Who reads text; who presses E; spoiler teaching by parent (note as contamination, not product fail unless UI forced it).

---

## UT-12 — Accessibility / comfort without a tour

**RESEARCH QUESTION:** Can a player who needs larger text or less motion find relief without being told “open Settings”?

**TARGET USER:** Adult who self-identifies as wanting bigger text or less movement (recruit note); or any S1 with OS reduced motion on.

**STARTING STATE:** Harbor free roam; motion-heavy sequence not required first.

**TASK:**  
“The motion or text isn’t comfortable for you. Make this easier to play using anything in the product — then return to walking around.”

**EXPECTED BEHAVIOR:** Find Settings; adjust text size and/or reduced motion / Game Feel; return.

**SUCCESS CONDITION:** Changes ≥1 relevant setting and returns to plaza within **3 minutes**.

**FAILURE CONDITION:** Cannot find Settings; changes unrelated options only; leaves session due to comfort.

**OBSERVABLE SIGNALS:** Settings as “gear” affordance; label literacy; delight at relief.

---

## UT-13 — Family Room local share (optional / later cohort)

**RESEARCH QUESTION:** Can two people on one device export/import or create a Family Room without believing it is online multiplayer?

**TARGET USER:** S1 with second device or same-device handoff.

**STARTING STATE:** Harbor; Family Room hotspot available.

**TASK:**  
“You want another person in your household to continue this adventure on their device later — without an account on a company server if you can help it. Show me what you’d try.”

**EXPECTED BEHAVIOR:** Open Family Room; create/export/import JSON flow as designed.

**SUCCESS CONDITION:** Completes export **or** correctly explains local-only limitation after exploring UI within **5 minutes**.

**FAILURE CONDITION:** Assumes cloud friends list; cannot find Family Room; corrupts save (critical if so).

**OBSERVABLE SIGNALS:** Mental model multiplayer vs local; hesitation; misinterpretation.

---

## Session bundles (recommended)

| Bundle | Tests | Length | Cohort |
|--------|-------|--------|--------|
| **Cold signature** | UT-01→07 + UT-09 | 45–60 min | A1 families |
| **Structure probe** | UT-08 (+ UT-01 if needed) | 20 min | A1 overflow / B1 |
| **Return memory** | UT-10 | 15 min | Same participants day-2 |
| **Co-play** | UT-11 (+ UT-03–05) | 45–60 min | A1 co-play slots |
| **A11y** | UT-12 | 10–15 min | Tagged recruits |
| **Family Room** | UT-13 | 15 min | Later unlock |

Do not run all 13 in one sitting.
