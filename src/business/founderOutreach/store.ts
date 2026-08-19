/**
 * Founder-led outreach drafts — never auto-send.
 */

export type ComplianceFlag =
  | "CASL_REVIEW_REQUIRED"
  | "CASL_LIKELY_N/A"
  | "CASL_CONSENT_ON_FILE";

export type DraftStatus = "UNSENT" | "APPROVED_UNSENT" | "SENT_BY_FOUNDER" | "REJECTED";

export interface OutreachDraft {
  id: string;
  prospect: string;
  leadId: string;
  reasonForOutreach: string;
  subject: string;
  messageBody: string;
  cta: string;
  complianceFlag: ComplianceFlag;
  recommendedFollowUpDate: string;
  status: DraftStatus;
  autoSend: false;
}

export const FORBIDDEN_PHRASES: RegExp[] = [
  /revolutionary solution/i,
  /game-changing ai/i,
  /unlock your potential/i,
  /disrupt the industry/i,
  /synergy/i,
];

export const OUTREACH_DRAFTS: OutreachDraft[] = [
  {
    id: "O01",
    prospect: "Great Homeschool Conventions (info@greathomeschoolconventions.com)",
    leadId: "L03",
    reasonForOutreach:
      "Top S2 channel; curriculum-shopping parents; money/literacy workshops already on agenda",
    subject: "Question about life-skills / money workshops at GHC",
    messageBody:
      "Hi GHC team — I’m building Capital, a browser adventure game that teaches money choices through play (save vs spend, paycheck decisions)—aimed at families and homeschoolers, not a banking app.\n\nI saw you host large curriculum halls and parenting/education workshops, including money/financial-literacy-adjacent sessions for parents. I’m not asking to blast attendees.\n\nWould you be open to a short conversation about whether a research pass or future exhibitor fit makes sense—or who on your side vets life-skills tools? Happy to share a 5-minute cold play link first.\n\nThanks for the work you do for homeschool families,",
    cta: "15–20 min call or pointer to the right contact; optional play link",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-08-28",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O02",
    prospect: "Royal Credit Union School $ense (published rcu.org contact only)",
    leadId: "L04",
    reasonForOutreach:
      "30 student-run school sites; hands-on deposits; may need engagement beside teller practice",
    subject: "School $ense + a playable money-choice prototype (research ask)",
    messageBody:
      "Hello — I read your School $ense update on the 2024–25 year (30 student-run locations, student tellers handling real deposits). That hands-on model is exactly the kind of learning I’m trying to respect.\n\nI’m the founder of Capital, a short adventure game where kids face a money choice they can’t undo, then see the “home” world react—not a debit product and not a worksheet pack.\n\nI’m looking for a few youth-education partners willing to do a conversation or supervised playtest, not a sales pitch. If School $ense staff have 20 minutes, I’d love to learn what still feels hard after the teller experience—and whether a game layer is even useful.",
    cta: "Intro to School $ense education lead or candid not-a-fit",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-02",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O03",
    prospect: "Suncoast Credit Union (published Contact Us)",
    leadId: "L05",
    reasonForOutreach: "Expanding elementary student-run branches; early money-skills urgency in PR",
    subject: "Elementary student-run branches — research conversation?",
    messageBody:
      "Hi — Your September 2024 note on the student-run branch at Sallie Jones Elementary (and the pace of new branches) stood out. You’re clearly investing in kids practicing money in the real world.\n\nI build Capital, a narrative money game for families/kids that focuses on one memorable choice (and what changes afterward). I’m exploring whether that kind of practice helps before or beside account-based programs—not replacing them.\n\nWould someone on the youth/financial-education side be open to a 20-minute call or a small playtest with staff first? I’ll keep it concrete and won’t spam members.",
    cta: "20-min call with youth-ed / community team",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-02",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O04",
    prospect: "A+ Federal Credit Union Youth Programs",
    leadId: "L06",
    reasonForOutreach: "Youth Month + parent money-conversation resources align with S1 co-play",
    subject: "Youth Month resources — quick research ask",
    messageBody:
      "Hello — I spent time on your Youth Month / raising money-smart kids pages. You’re already helping parents start money conversations, which is rarer than tip lists.\n\nI’m building Capital, a playable adventure where a child’s money choice has a visible consequence—meant for family co-play, not another lecture PDF.\n\nI’m not pitching a member blast. I’m asking whether your youth-education team would talk for 15 minutes about what parents still struggle with after the videos/tips—and whether you’d ever trial a game in a Youth Month context.",
    cta: "Intro to youth-ed owner",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-03",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O05",
    prospect: "Jump$tart Coalition (info@jumpstart.org)",
    leadId: "L01",
    reasonForOutreach: "National youth fin-lit coalition; parent/school engagement; evaluation learning",
    subject: "Research intro — adventure game for money choices (not a partner pitch deck)",
    messageBody:
      "Hi Jump$tart team — I’m building Capital, a browser adventure that tries to make one money decision feel memorable for kids/families (save/spend and related choices).\n\nI’m writing because of your focus on youth financial capability and parent/school engagement (including Check Your School). I don’t assume Capital belongs in the Clearinghouse yet.\n\nCould I book a short conversation to learn how you evaluate new learning tools, and whether a teacher or parent playtest introduction would ever be appropriate? Happy to send a silent play link in advance.",
    cta: "20-min learning call / redirect",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-08-29",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O06",
    prospect: "Next Gen Personal Finance (info@ngpf.org)",
    leadId: "L02",
    reasonForOutreach: "Teacher engagement gaps beside free curriculum; complementary research ask",
    subject: "Complement to free PF curriculum? Research conversation",
    messageBody:
      "Hi NGPF — Teachers trust your free curriculum and PD; I’m not trying to sell you a paid replacement.\n\nCapital is a short adventure game about money choices (family/early teen tone). I’m trying to understand whether game-based practice helps with engagement gaps that worksheets don’t fix—and where it would just get in the way.\n\nWould someone on partnerships or teacher engagement take a 15-minute call, or tell me honestly if this isn’t useful to NGPF’s model? I can share a play link; no demo theater required.",
    cta: "15-min call or candid not-a-fit",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-08-29",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O07",
    prospect: "Local Boys & Girls Club program director (fill from locator)",
    leadId: "L07",
    reasonForOutreach: "Money Matters shows Clubs use sessions + games; local Club can observe youth play",
    subject: "Money Matters adjacent — small playtest ask",
    messageBody:
      "Hi — I saw Clubs run Money Matters with sessions and digital practice. I’m building Capital, a story-driven money game (choices with consequences), and I’m looking for one Club willing to watch 2–3 youth try a short session while staff observe.\n\nThis is a usability/research ask, not a sponsorship pitch. I’ll bring a simple observation sheet and won’t collect unnecessary personal data.\n\nOpen to a 15-minute call to see if timing even makes sense?",
    cta: "Call + optional playtest",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-05",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O08",
    prospect: "Local Junior Achievement office",
    leadId: "L08",
    reasonForOutreach: "Finance Park proves practice > abstraction; same problem space",
    subject: "After Finance Park — research on playable money choices",
    messageBody:
      "Hello — JA’s Finance Park model (practice budgets in a simulated world) is one of the clearest proofs that kids need to do money decisions, not only hear them.\n\nI make Capital, a smaller-scope adventure game focused on a few irreversible choices and what “home” feels like afterward. I’m researching whether that helps in out-of-school or classroom-adjacent settings.\n\nWould your program team spare 20 minutes to tell me what students still miss after JA programs—and whether a tiny playtest is worth anyone’s time?",
    cta: "20-min program conversation",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-05",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O09",
    prospect: "Library children’s / programming librarian (geo-specific)",
    leadId: "L12",
    reasonForOutreach: "High-trust S1 family programs; research recruit share",
    subject: "Family money literacy — research evening?",
    messageBody:
      "Hi — I’m building Capital, a browser adventure that helps kids practice money choices in a story world. I’m looking for a few caregivers for a paid research session (interview ± short play), and wondered if you’d be willing to share a flyer or newsletter blurb—no sales pressure on patrons.\n\nI can send screener text and privacy notes. Totally fine if the answer is no.",
    cta: "Share research invite once or decline",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-04",
    status: "UNSENT",
    autoSend: false,
  },
  {
    id: "O10",
    prospect: "MI CU × library Smart Money Kids Read partners",
    leadId: "L16",
    reasonForOutreach: "Documented family money literacy partnership; exact co-play venue",
    subject: "Smart Money Kids Read — follow-on research idea",
    messageBody:
      "Hello — I saw the Smart Money Michigan Kids Read family program (stories/games with credit union partnership). That’s closely aligned with what I’m studying: caregivers and kids learning money together without it feeling like homework.\n\nCapital is a short adventure game built around a memorable money choice. I’m seeking a small research cohort of families—not a product launch at your event.\n\nWould you have 15 minutes to advise whether a future program night or newsletter mention for research recruits could work?",
    cta: "Advice call / research recruit share",
    complianceFlag: "CASL_REVIEW_REQUIRED",
    recommendedFollowUpDate: "2026-09-04",
    status: "UNSENT",
    autoSend: false,
  },
];

export function assertNoForbiddenPhrases(drafts = OUTREACH_DRAFTS): void {
  for (const d of drafts) {
    const text = `${d.subject}\n${d.messageBody}`;
    for (const re of FORBIDDEN_PHRASES) {
      if (re.test(text)) {
        throw new Error(`${d.id} contains forbidden phrase /${re.source}/`);
      }
    }
  }
}

export function assertNeverAutoSend(drafts = OUTREACH_DRAFTS): void {
  for (const d of drafts) {
    if (d.autoSend !== false) throw new Error(`${d.id} autoSend must be false`);
    if (d.status === "SENT_BY_FOUNDER") {
      throw new Error(`${d.id}: agent must not mark SENT without founder log`);
    }
  }
}

export function unsentDrafts(drafts = OUTREACH_DRAFTS): OutreachDraft[] {
  return drafts.filter((d) => d.status === "UNSENT" || d.status === "APPROVED_UNSENT");
}

export function markFounderApproved(
  id: string,
  drafts: OutreachDraft[] = OUTREACH_DRAFTS,
): OutreachDraft {
  const d = drafts.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown draft ${id}`);
  d.status = "APPROVED_UNSENT";
  return d;
}
