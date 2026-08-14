/**
 * Lead discovery — qualified prospects only.
 * Never invents emails. Never auto-contacts.
 */

export type IcpSegment = "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8";

export type BuyerRole = "buyer" | "influencer" | "user_only" | "not_buyer_strategic";

export interface LeadScores {
  painEvidence: number; // /25
  icpFit: number; // /20
  timing: number; // /15
  abilityToPay: number; // /20
  reachability: number; // /10
  strategicValue: number; // /10
}

export interface QualifiedLead {
  id: string;
  name: string;
  who: string;
  problemSignal: string;
  icpSegments: IcpSegment[];
  buyerRole: BuyerRole;
  timingSignal: string;
  /** Published access only — never guessed personal inboxes */
  access: string;
  sourceUrls: string[];
  scores: LeadScores;
  totalScore: number;
  whyQualified: string;
  autoContact: false;
}

export const QUALIFIED_FLOOR = 60;

export function totalScore(s: LeadScores): number {
  return (
    s.painEvidence +
    s.icpFit +
    s.timing +
    s.abilityToPay +
    s.reachability +
    s.strategicValue
  );
}

export function assertScoreBounds(s: LeadScores): void {
  const caps: [keyof LeadScores, number][] = [
    ["painEvidence", 25],
    ["icpFit", 20],
    ["timing", 15],
    ["abilityToPay", 20],
    ["reachability", 10],
    ["strategicValue", 10],
  ];
  for (const [k, max] of caps) {
    const v = s[k];
    if (v < 0 || v > max) throw new Error(`${k} out of range 0–${max}: ${v}`);
  }
}

/** Seed qualified leads (orgs / public roles). Personal emails never invented. */
export const QUALIFIED_LEADS: QualifiedLead[] = [
  {
    id: "L03",
    name: "Great Homeschool Conventions",
    who: "Regional US homeschool conventions and curriculum exhibit halls",
    problemSignal: "Parents attend to shop life-skills/financial literacy teaching resources",
    icpSegments: ["S2"],
    buyerRole: "buyer",
    timingSignal: "Annual regional convention + exhibitor cycles",
    access: "Published org email info@greathomeschoolconventions.com; exhibitor phone on site",
    sourceUrls: [
      "https://greathomeschoolconventions.com/about",
      "https://greathomeschoolconventions.com/exhibitors/rules-and-regulations",
    ],
    scores: {
      painEvidence: 22,
      icpFit: 19,
      timing: 14,
      abilityToPay: 16,
      reachability: 9,
      strategicValue: 8,
    },
    totalScore: 88,
    whyQualified: "Highest S2 density with purchase behavior; public org contact",
    autoContact: false,
  },
  {
    id: "L04",
    name: "Royal Credit Union School $ense",
    who: "CU operating ~30 student-run school credit union sites",
    problemSignal: "Hands-on youth money program at elementary–HS scale",
    icpSegments: ["S3", "S1"],
    buyerRole: "buyer",
    timingSignal: "2024–25 School $ense year publicly kicked off",
    access: "Official rcu.org contact/about channels only",
    sourceUrls: [
      "https://www.rcu.org/about-royal/news-events/news-stories/school-sense-kicks-off-2024-2025",
    ],
    scores: {
      painEvidence: 21,
      icpFit: 15,
      timing: 14,
      abilityToPay: 17,
      reachability: 7,
      strategicValue: 7,
    },
    totalScore: 81,
    whyQualified: "Program budget owner with clear youth-ed problem",
    autoContact: false,
  },
  {
    id: "L05",
    name: "Suncoast Credit Union student-run branches",
    who: "Large FL CU expanding elementary student-run branches",
    problemSignal: "Elementary savings literacy buildout in underbanked communities",
    icpSegments: ["S3", "S1"],
    buyerRole: "buyer",
    timingSignal: "24th branch opening PR Sept 2024",
    access: "suncoast.com Contact Us / press channels",
    sourceUrls: [
      "https://www.suncoast.com/Why-Suncoast/About-Us/Publications/Press-Releases/2024/24th-Student-Run-Branch",
    ],
    scores: {
      painEvidence: 20,
      icpFit: 15,
      timing: 14,
      abilityToPay: 17,
      reachability: 7,
      strategicValue: 7,
    },
    totalScore: 80,
    whyQualified: "Active expansion + public superintendent urgency quotes",
    autoContact: false,
  },
  {
    id: "L16",
    name: "MI CU × library Smart Money Kids Read (pattern)",
    who: "Credit union + public library family money literacy programs",
    problemSignal: "Co-run family story/games for early financial literacy",
    icpSegments: ["S1", "S3"],
    buyerRole: "buyer",
    timingSignal: "April Financial Literacy Month recurring",
    access: "Library public contact + CU public contact pages",
    sourceUrls: [
      "https://royaloak.librarycalendar.com/event/smart-money-michigan-kids-read-family-241",
    ],
    scores: {
      painEvidence: 20,
      icpFit: 18,
      timing: 13,
      abilityToPay: 15,
      reachability: 7,
      strategicValue: 6,
    },
    totalScore: 79,
    whyQualified: "Concrete S1 co-play venue with institutional buyer",
    autoContact: false,
  },
  {
    id: "L06",
    name: "A+ Federal Credit Union Youth programs",
    who: "CU Youth Month and kid/teen financial capability resources",
    problemSignal: "Helps parents have money conversations with kids",
    icpSegments: ["S1", "S3"],
    buyerRole: "buyer",
    timingSignal: "April Youth Month / Financial Literacy Month",
    access: "aplusfcu.org public contact + youth program pages",
    sourceUrls: ["https://aplusfcu.org/about-us/youth-programs/youth-month"],
    scores: {
      painEvidence: 19,
      icpFit: 16,
      timing: 13,
      abilityToPay: 16,
      reachability: 7,
      strategicValue: 6,
    },
    totalScore: 77,
    whyQualified: "Parent-facing youth ed with CU budget",
    autoContact: false,
  },
  {
    id: "L01",
    name: "Jump$tart Coalition (national)",
    who: "National financial literacy coalition + state affiliates",
    problemSignal: "Youth financial education mission; parent Check Your School campaign",
    icpSegments: ["S4", "S1", "S3"],
    buyerRole: "influencer",
    timingSignal: "Educator conference + April campaigns",
    access: "Published info@jumpstart.org; (202) 846-6780",
    sourceUrls: [
      "https://www.jumpstart.org/",
      "https://www.jumpstart.org/about/staff/",
    ],
    scores: {
      painEvidence: 20,
      icpFit: 14,
      timing: 12,
      abilityToPay: 10,
      reachability: 10,
      strategicValue: 10,
    },
    totalScore: 76,
    whyQualified: "Legitimate national hub with published contact",
    autoContact: false,
  },
  {
    id: "L21",
    name: "Check Your School parent advocates",
    who: "Parents advocating for school financial education via Jump$tart campaign",
    problemSignal: "Self-selected concern that schools under-teach money",
    icpSegments: ["S1"],
    buyerRole: "buyer",
    timingSignal: "Ongoing campaign",
    access: "Public campaign site only — no scraping parent identities",
    sourceUrls: ["https://www.jumpstart.org/about/"],
    scores: {
      painEvidence: 22,
      icpFit: 19,
      timing: 11,
      abilityToPay: 14,
      reachability: 4,
      strategicValue: 5,
    },
    totalScore: 75,
    whyQualified: "High pain/ICP; ethical recruit via partnership or public call only",
    autoContact: false,
  },
  {
    id: "L07",
    name: "Boys & Girls Clubs — Money Matters",
    who: "National youth org financial literacy program for teens",
    problemSignal: "Long-running Money Matters sessions + digital practice tools",
    icpSegments: ["S3"],
    buyerRole: "buyer",
    timingSignal: "Ongoing MyFuture activities",
    access: "Find a Club locator → local Club public phone/web",
    sourceUrls: ["https://www.bgca.org/programs/education/money-matters/"],
    scores: {
      painEvidence: 20,
      icpFit: 14,
      timing: 11,
      abilityToPay: 14,
      reachability: 6,
      strategicValue: 8,
    },
    totalScore: 73,
    whyQualified: "S3 program owners; contact local Clubs only",
    autoContact: false,
  },
  {
    id: "L08",
    name: "Junior Achievement local offices",
    who: "JA Finance Park / financial literacy pathway providers",
    problemSignal: "Simulations exist because abstract money teaching underperforms",
    icpSegments: ["S3", "S4"],
    buyerRole: "buyer",
    timingSignal: "School-year program delivery",
    access: "JA near you public locator → local office contacts",
    sourceUrls: ["https://jausa.ja.org/programs/ja-finance-park-entry-level"],
    scores: {
      painEvidence: 19,
      icpFit: 13,
      timing: 12,
      abilityToPay: 15,
      reachability: 6,
      strategicValue: 8,
    },
    totalScore: 73,
    whyQualified: "Local JA offices control program partnerships",
    autoContact: false,
  },
  {
    id: "L17",
    name: "Maine Credit Union League Financial Fitness Fairs",
    who: "League interactive student financial fitness fairs",
    problemSignal: "Immersive budget simulations for school-age students",
    icpSegments: ["S3", "S4"],
    buyerRole: "buyer",
    timingSignal: "School outreach + April campaigns",
    access: "League official public contact channels",
    sourceUrls: [
      "https://www.americascreditunions.org/blogs/americas-credit-unions/making-financial-education-accessible-and-engaging-one-student-time",
    ],
    scores: {
      painEvidence: 19,
      icpFit: 14,
      timing: 12,
      abilityToPay: 15,
      reachability: 6,
      strategicValue: 7,
    },
    totalScore: 73,
    whyQualified: "Engagement-seeking youth ed with institutional budget",
    autoContact: false,
  },
  {
    id: "L09",
    name: "America’s Credit Unions youth education push",
    who: "Trade association amplifying CU youth financial education",
    problemSignal: "Promotes interactive fairs and Youth Month kits for engagement",
    icpSegments: ["S3"],
    buyerRole: "influencer",
    timingSignal: "April Youth Month",
    access: "Association public site contact channels",
    sourceUrls: [
      "https://www.americascreditunions.org/blogs/americas-credit-unions/making-financial-education-accessible-and-engaging-one-student-time",
    ],
    scores: {
      painEvidence: 18,
      icpFit: 13,
      timing: 13,
      abilityToPay: 12,
      reachability: 7,
      strategicValue: 9,
    },
    totalScore: 72,
    whyQualified: "Multiplier to CU education buyers",
    autoContact: false,
  },
  {
    id: "L10",
    name: "HSLDA",
    who: "Large homeschool advocacy membership organization",
    problemSignal: "Members continually select curricula including life skills",
    icpSegments: ["S2"],
    buyerRole: "influencer",
    timingSignal: "Evergreen member education",
    access: "hslda.org public contact/membership paths — no member scraping",
    sourceUrls: ["https://hslda.org/"],
    scores: {
      painEvidence: 17,
      icpFit: 18,
      timing: 10,
      abilityToPay: 11,
      reachability: 6,
      strategicValue: 9,
    },
    totalScore: 71,
    whyQualified: "S2 reach without private data access",
    autoContact: false,
  },
  {
    id: "L02",
    name: "Next Gen Personal Finance (NGPF)",
    who: "Nonprofit free PF curriculum and teacher PD",
    problemSignal: "Teacher/district implementation friction for engaging PF",
    icpSegments: ["S4"],
    buyerRole: "influencer",
    timingSignal: "State mandate adoption wave",
    access: "Published info@ngpf.org",
    sourceUrls: [
      "https://www.ngpf.org/",
      "https://www.ngpf.org/blog/teacher-tips/the-right-inbox-for-every-ngpf-question/",
    ],
    scores: {
      painEvidence: 18,
      icpFit: 12,
      timing: 13,
      abilityToPay: 8,
      reachability: 10,
      strategicValue: 9,
    },
    totalScore: 70,
    whyQualified: "Door to S4 teachers; not a seat buyer itself",
    autoContact: false,
  },
  {
    id: "L12",
    name: "Library Money Smart Week programmers",
    who: "Public librarians running family money literacy events",
    problemSignal: "Kids money storytimes and crafts for family learning",
    icpSegments: ["S1"],
    buyerRole: "buyer",
    timingSignal: "Money Smart Week / April",
    access: "Each library’s published children’s/program contact",
    sourceUrls: [
      "https://programminglibrarian.org/articles/programs-help-your-patrons-get-money-smart",
    ],
    scores: {
      painEvidence: 17,
      icpFit: 17,
      timing: 12,
      abilityToPay: 11,
      reachability: 7,
      strategicValue: 6,
    },
    totalScore: 70,
    whyQualified: "S1 co-play venues with public staff contacts",
    autoContact: false,
  },
  {
    id: "L19",
    name: "School PTA/PTO (geo-specific template)",
    who: "Parent-teacher organizations funding enrichment",
    problemSignal: "Parents fund gaps when school money ed feels thin",
    icpSegments: ["S1"],
    buyerRole: "buyer",
    timingSignal: "Back-to-school / spring program budgets",
    access: "Only PTA emails published on school websites",
    sourceUrls: [],
    scores: {
      painEvidence: 17,
      icpFit: 18,
      timing: 11,
      abilityToPay: 15,
      reachability: 5,
      strategicValue: 4,
    },
    totalScore: 70,
    whyQualified: "Household+PTA buyers once geography chosen",
    autoContact: false,
  },
  {
    id: "L11",
    name: "NFEC homeschool personal finance curriculum",
    who: "Curriculum provider targeting homeschool PF",
    problemSignal: "Markets to parents who cannot find usable PF home content",
    icpSegments: ["S2"],
    buyerRole: "influencer",
    timingSignal: "Ongoing curriculum offers",
    access: "Public contact on financialeducatorscouncil.org",
    sourceUrls: [
      "https://www.financialeducatorscouncil.org/personal-finance-homeschool-curriculum/",
    ],
    scores: {
      painEvidence: 18,
      icpFit: 17,
      timing: 10,
      abilityToPay: 12,
      reachability: 7,
      strategicValue: 5,
    },
    totalScore: 69,
    whyQualified: "S2 problem signal; discovery not customer-poaching",
    autoContact: false,
  },
  {
    id: "L18",
    name: "Urban library children’s services (geo picklist)",
    who: "Children’s services managers at large library systems",
    problemSignal: "Family learning programs; occasional money literacy",
    icpSegments: ["S1"],
    buyerRole: "buyer",
    timingSignal: "School-year programming calendars",
    access: "Copy contacts only from each library’s official site",
    sourceUrls: [],
    scores: {
      painEvidence: 16,
      icpFit: 17,
      timing: 10,
      abilityToPay: 10,
      reachability: 8,
      strategicValue: 5,
    },
    totalScore: 66,
    whyQualified: "Interview recruitment + modest program budgets",
    autoContact: false,
  },
  {
    id: "L20",
    name: "Cooperative Extension / 4-H money educators",
    who: "State/county Extension educators teaching youth money skills",
    problemSignal: "Practical life-skills mandate including money",
    icpSegments: ["S3", "S1"],
    buyerRole: "buyer",
    timingSignal: "County program calendars",
    access: "State Extension public staff directories",
    sourceUrls: [],
    scores: {
      painEvidence: 17,
      icpFit: 14,
      timing: 10,
      abilityToPay: 13,
      reachability: 7,
      strategicValue: 5,
    },
    totalScore: 66,
    whyQualified: "Grant-funded facilitators with public emails",
    autoContact: false,
  },
  {
    id: "L15",
    name: "Council for Economic Education",
    who: "National K–12 economics/personal finance education nonprofit",
    problemSignal: "Teacher PD implies classroom readiness and engagement gaps",
    icpSegments: ["S4"],
    buyerRole: "influencer",
    timingSignal: "School-year PD",
    access: "Public contact on councilforeconed.org",
    sourceUrls: [],
    scores: {
      painEvidence: 16,
      icpFit: 12,
      timing: 11,
      abilityToPay: 11,
      reachability: 7,
      strategicValue: 7,
    },
    totalScore: 64,
    whyQualified: "S4 influencer with legitimate partnership path",
    autoContact: false,
  },
  {
    id: "L13",
    name: "CFPB Money as You Grow (strategic signal)",
    who: "Federal parent money-conversation resources",
    problemSignal: "Public guides exist because household money talks are hard",
    icpSegments: ["S1"],
    buyerRole: "not_buyer_strategic",
    timingSignal: "Evergreen",
    access: "Public web resources only — no sales outreach",
    sourceUrls: [],
    scores: {
      painEvidence: 16,
      icpFit: 15,
      timing: 8,
      abilityToPay: 4,
      reachability: 10,
      strategicValue: 7,
    },
    totalScore: 60,
    whyQualified: "Problem-signal for interview design; not a commercial buyer",
    autoContact: false,
  },
];

export function assertLeadsValid(leads = QUALIFIED_LEADS): void {
  for (const lead of leads) {
    assertScoreBounds(lead.scores);
    if (totalScore(lead.scores) !== lead.totalScore) {
      throw new Error(`${lead.id}: totalScore mismatch`);
    }
    if (lead.totalScore < QUALIFIED_FLOOR) {
      throw new Error(`${lead.id}: below qualified floor`);
    }
    if (lead.autoContact !== false) {
      throw new Error(`${lead.id}: autoContact must be false`);
    }
    if (/[a-z0-9._%+-]+@gmail\.com/i.test(lead.access)) {
      throw new Error(`${lead.id}: looks like invented personal gmail`);
    }
  }
}

export function rankedLeads(leads = QUALIFIED_LEADS): QualifiedLead[] {
  return [...leads].sort((a, b) => b.totalScore - a.totalScore);
}

export function primaryIcpLeads(leads = QUALIFIED_LEADS): QualifiedLead[] {
  return rankedLeads(leads).filter((l) =>
    l.icpSegments.some((s) => s === "S1" || s === "S2"),
  );
}
