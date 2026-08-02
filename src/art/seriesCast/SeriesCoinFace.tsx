import type { ReactElement, ReactNode } from "react";
import { SERIES_SHEET_SPECS } from "./seriesLeadArt";

const OUT = "#1c1917";

type FaceProps = { className?: string; title?: string };

function FaceFrame({
  children,
  className,
  title,
  rim,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  rim: string;
}) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="coinMetal" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="55%" stopColor={rim} />
          <stop offset="100%" stopColor="#92400e" />
        </radialGradient>
      </defs>
      <circle cx="48" cy="48" r="46" fill="url(#coinMetal)" stroke={OUT} strokeWidth="2.5" />
      <circle cx="48" cy="48" r="40" fill="none" stroke="#d97706" strokeWidth="1.6" opacity="0.85" />
      {children}
    </svg>
  );
}

function Eyes({
  cx = 48,
  cy = 52,
  eye,
  lashes,
}: {
  cx?: number;
  cy?: number;
  eye: string;
  lashes?: boolean;
}) {
  return (
    <g>
      <ellipse cx={cx - 9} cy={cy} rx={5.5} ry={6.5} fill="#fffbeb" stroke={OUT} strokeWidth="1" />
      <ellipse cx={cx + 9} cy={cy} rx={5.5} ry={6.5} fill="#fffbeb" stroke={OUT} strokeWidth="1" />
      <circle cx={cx - 9} cy={cy + 0.5} r={2.6} fill={eye} />
      <circle cx={cx + 9} cy={cy + 0.5} r={2.6} fill={eye} />
      {lashes ? (
        <>
          <path d={`M${cx - 14} ${cy - 6} L${cx - 4} ${cy - 7}`} stroke={OUT} strokeWidth="1.6" />
          <path d={`M${cx + 4} ${cy - 7} L${cx + 14} ${cy - 6}`} stroke={OUT} strokeWidth="1.6" />
        </>
      ) : null}
    </g>
  );
}

function Mouth({
  cx = 48,
  cy = 66,
  lipstick,
  grin,
}: {
  cx?: number;
  cy?: number;
  lipstick?: boolean;
  grin?: boolean;
}) {
  if (grin) {
    return (
      <g>
        <rect x={cx - 10} y={cy - 2} width={20} height={5} rx={1.5} fill={OUT} />
        <rect x={cx - 8} y={cy - 1} width={16} height={2.5} fill="#fffbeb" />
      </g>
    );
  }
  if (lipstick) {
    return (
      <path
        d={`M${cx - 7} ${cy} Q ${cx} ${cy + 6} ${cx + 7} ${cy}`}
        fill="#9f1239"
        stroke={OUT}
        strokeWidth="0.7"
      />
    );
  }
  return (
    <path
      d={`M${cx - 6} ${cy} Q ${cx} ${cy + 4} ${cx + 6} ${cy}`}
      fill="none"
      stroke={OUT}
      strokeWidth="2"
      strokeLinecap="round"
    />
  );
}

function Mustache({ cx = 48, cy = 62 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <path
        d={`M${cx - 12} ${cy} Q ${cx - 5} ${cy + 6} ${cx} ${cy}`}
        fill="none"
        stroke={OUT}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d={`M${cx + 12} ${cy} Q ${cx + 5} ${cy + 6} ${cx} ${cy}`}
        fill="none"
        stroke={OUT}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  );
}

function Glyph({
  text,
  y = 40,
  size = 14,
}: {
  text: string;
  y?: number;
  size?: number;
}) {
  return (
    <text
      x="48"
      y={y}
      textAnchor="middle"
      fontSize={size}
      fontWeight={800}
      fill="#14532d"
      fontFamily="ui-rounded, system-ui, sans-serif"
    >
      {text}
    </text>
  );
}

function CashwellFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.cashwell!;
  return (
    <FaceFrame className={className} title={title ?? "Cashwell"} rim={s.coin}>
      <rect x="32" y="4" width="32" height="20" rx="3" fill={s.coat} stroke={OUT} strokeWidth="1.8" />
      <rect x="26" y="22" width="44" height="6" rx="2" fill={OUT} />
      <rect x="34" y="16" width="28" height="3" fill={s.accent} />
      <circle cx="48" cy="12" r="5" fill={s.accent} stroke={OUT} strokeWidth="0.8" />
      <text x="48" y="15" textAnchor="middle" fontSize="7" fontWeight={800} fill={s.coat}>
        $
      </text>
      <Glyph text="$" y={38} size={12} />
      <Eyes eye={s.eye} />
      <Mustache />
      <Mouth />
    </FaceFrame>
  );
}

function CashmereFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.cashmere!;
  return (
    <FaceFrame className={className} title={title ?? "Cashmere Couture"} rim={s.coin}>
      <ellipse cx="26" cy="48" rx="12" ry="20" fill="#fbbf24" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="70" cy="48" rx="12" ry="20" fill="#fbbf24" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="48" cy="28" rx="22" ry="12" fill="#f4b942" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="62" cy="18" rx="14" ry="5" fill={OUT} />
      <circle cx="62" cy="12" r="5" fill={s.accent} stroke={OUT} strokeWidth="0.8" />
      <path d="M52 20 Q62 32 72 20" fill="none" stroke={OUT} strokeWidth="1.2" opacity="0.65" />
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
      <circle cx="28" cy="58" r="3" fill="#fafaf9" stroke={OUT} strokeWidth="0.6" />
      <circle cx="68" cy="58" r="3" fill="#fafaf9" stroke={OUT} strokeWidth="0.6" />
    </FaceFrame>
  );
}

function PedroFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.peso_pedro!;
  return (
    <FaceFrame className={className} title={title ?? "Peso Pedro"} rim={s.coin}>
      <ellipse cx="48" cy="18" rx="40" ry="9" fill={s.coat} stroke={OUT} strokeWidth="2" />
      <rect x="36" y="6" width="24" height="14" rx="4" fill={s.coat} stroke={OUT} strokeWidth="1.5" />
      <ellipse cx="48" cy="16" rx="20" ry="3" fill={s.accent} />
      <Glyph text="P" y={40} />
      <Eyes eye={s.eye} />
      <Mustache />
      <Mouth />
    </FaceFrame>
  );
}

function FernandaFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.fortuna_fernanda!;
  return (
    <FaceFrame className={className} title={title ?? "Fortuna Fernanda"} rim={s.coin}>
      <ellipse cx="26" cy="50" rx="13" ry="22" fill="#1c1917" stroke={OUT} strokeWidth="1.2" />
      <ellipse cx="70" cy="50" rx="13" ry="22" fill="#1c1917" stroke={OUT} strokeWidth="1.2" />
      {[38, 48, 58].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={14 + (i % 2)}
          r={6}
          fill={i === 1 ? s.accent : "#b91c1c"}
          stroke={OUT}
          strokeWidth="1"
        />
      ))}
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
    </FaceFrame>
  );
}

function BaoFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.billionaire_bao!;
  return (
    <FaceFrame className={className} title={title ?? "Billionaire Bao"} rim={s.coin}>
      <ellipse cx="48" cy="22" rx="22" ry="14" fill={OUT} />
      <ellipse cx="28" cy="42" rx="10" ry="14" fill={OUT} />
      <ellipse cx="68" cy="42" rx="10" ry="14" fill={OUT} />
      <Glyph text="BB" y={40} size={13} />
      <Eyes eye={s.eye} />
      <Mouth />
    </FaceFrame>
  );
}

function JadeFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.jade_fortune!;
  return (
    <FaceFrame className={className} title={title ?? "Jade Fortune"} rim={s.coin}>
      <ellipse cx="48" cy="18" rx="16" ry="12" fill={OUT} />
      <line x1="32" y1="16" x2="42" y2="24" stroke={s.accent} strokeWidth="2.4" />
      <line x1="64" y1="16" x2="54" y2="24" stroke="#f4b942" strokeWidth="2.4" />
      <rect x="42" y="30" width="12" height="12" rx="1.5" fill={OUT} />
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
      <text x="48" y="78" textAnchor="middle" fontSize="11" fontWeight={800} fill={s.accent}>
        玉
      </text>
    </FaceFrame>
  );
}

function SultanFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.sultan_stacks!;
  return (
    <FaceFrame className={className} title={title ?? "Sultan Stacks"} rim={s.coin}>
      <ellipse cx="48" cy="16" rx="22" ry="16" fill={s.accent} stroke={OUT} strokeWidth="1.6" />
      <ellipse cx="48" cy="22" rx="16" ry="10" fill={s.coat} stroke={OUT} strokeWidth="1.2" />
      <path d="M48 2 Q54 -2 58 8" fill="none" stroke="#fafaf9" strokeWidth="2.2" />
      <circle cx="48" cy="26" r="3.5" fill="#10b981" stroke={OUT} strokeWidth="0.8" />
      <Glyph text="$" y={42} size={12} />
      <Eyes eye={s.eye} />
      <Mustache cy={64} />
      <path d="M48 70 L44 78 L52 78 Z" fill={OUT} />
    </FaceFrame>
  );
}

function DahliaFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.dinar_dahlia!;
  return (
    <FaceFrame className={className} title={title ?? "Dinar Dahlia"} rim={s.coin}>
      <ellipse cx="28" cy="48" rx="12" ry="20" fill={OUT} />
      <ellipse cx="68" cy="48" rx="12" ry="20" fill={OUT} />
      <rect x="28" y="8" width="40" height="10" rx="2" fill="#f4b942" stroke={OUT} strokeWidth="1.2" />
      {[32, 40, 48, 56, 64].map((x) => (
        <polygon key={x} points={`${x},8 ${x + 3},2 ${x + 6},8`} fill="#f4b942" stroke={OUT} strokeWidth="0.5" />
      ))}
      <circle cx="48" cy="6" r="3.5" fill={s.accent} />
      <Glyph text="DD" y={40} size={12} />
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
    </FaceFrame>
  );
}

function MansaFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.mansa_moneybaggs!;
  return (
    <FaceFrame className={className} title={title ?? "Mansa Moneybaggs"} rim={s.coin}>
      <ellipse cx="48" cy="14" rx="18" ry="12" fill={s.accent} stroke={OUT} strokeWidth="1.4" />
      <rect x="34" y="4" width="28" height="7" rx="1" fill="#f4b942" />
      {[36, 42, 48, 54, 60].map((x) => (
        <polygon key={x} points={`${x},4 ${x + 2},0 ${x + 4},4`} fill="#f4b942" />
      ))}
      <rect x="30" y="34" width="36" height="14" rx="3" fill="#f4b942" opacity="0.9" stroke={OUT} strokeWidth="1" />
      <Glyph text="M" y={30} size={11} />
      <Eyes eye={s.eye} cy={56} />
      <ellipse cx="48" cy="74" rx="14" ry="10" fill={OUT} />
    </FaceFrame>
  );
}

function KandakeFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.kandake_kash!;
  return (
    <FaceFrame className={className} title={title ?? "Kandake Kash"} rim={s.coin}>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = 48 + Math.cos(a) * 16;
        const y = 18 + Math.sin(a) * 10;
        return (
          <g key={i}>
            <rect x={x - 3.5} y={y} width={7} height={16} rx={2} fill={OUT} />
            <circle cx={x} cy={y + 4} r={2.2} fill="#f4b942" />
            {i % 2 === 0 ? <circle cx={x} cy={y + 11} r={2.2} fill={s.accent} /> : null}
          </g>
        );
      })}
      <Glyph text="KK" y={42} size={12} />
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
    </FaceFrame>
  );
}

function MoneybaggFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.moneybagg_bro!;
  return (
    <FaceFrame className={className} title={title ?? "Moneybagg Bro"} rim={s.coin}>
      <ellipse cx="48" cy="20" rx="24" ry="16" fill={OUT} />
      <path d="M38 32 L48 46 L58 32" fill={OUT} />
      <rect x="40" y="8" width="16" height="8" rx="1" fill="#f4b942" stroke={OUT} strokeWidth="0.8" />
      <text x="48" y="14.5" textAnchor="middle" fontSize="7" fontWeight={800} fill={s.coat}>
        $
      </text>
      <Glyph text="MB" y={40} size={12} />
      <Eyes eye={s.eye} />
      <Mouth grin />
    </FaceFrame>
  );
}

function MulaFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.mula_mami!;
  return (
    <FaceFrame className={className} title={title ?? "Mula Mami"} rim={s.coin}>
      <ellipse cx="48" cy="14" rx="12" ry="10" fill={OUT} />
      <ellipse cx="48" cy="26" rx="24" ry="14" fill={OUT} />
      <text x="36" y="24" fontSize="9" fill="#fde68a" fontWeight={800}>
        $
      </text>
      <text x="56" y="24" fontSize="9" fill="#fde68a" fontWeight={800}>
        $
      </text>
      <circle cx="20" cy="50" r="9" fill="none" stroke="#f4b942" strokeWidth="2.6" />
      <circle cx="76" cy="50" r="9" fill="none" stroke="#f4b942" strokeWidth="2.6" />
      <Glyph text="MM" y={42} size={12} />
      <Eyes eye={s.eye} lashes />
      <Mouth lipstick />
    </FaceFrame>
  );
}

function DebtFace({ className, title }: FaceProps) {
  const s = SERIES_SHEET_SPECS.debt_collector!;
  return (
    <FaceFrame className={className} title={title ?? "The Debt Collector"} rim={s.coin}>
      <polygon points="22,28 48,8 74,28" fill="#57534e" stroke={OUT} strokeWidth="1.6" />
      <rect x="26" y="28" width="44" height="12" fill="#78716c" stroke={OUT} strokeWidth="1.2" />
      <rect x="32" y="40" width="32" height="28" rx="2" fill={s.coin} stroke={OUT} strokeWidth="1.6" />
      <circle cx="42" cy="52" r="3.5" fill={s.eye} />
      <circle cx="54" cy="52" r="3.5" fill={s.eye} />
      <circle cx="48" cy="78" r="10" fill="#292524" stroke="#f4b942" strokeWidth="2" />
      <text x="48" y="82" textAnchor="middle" fontSize="11" fontWeight={800} fill="#fde68a">
        $
      </text>
    </FaceFrame>
  );
}

const COIN_ART: Record<string, (p: FaceProps) => ReactElement> = {
  cashwell: CashwellFace,
  cashmere: CashmereFace,
  peso_pedro: PedroFace,
  fortuna_fernanda: FernandaFace,
  billionaire_bao: BaoFace,
  jade_fortune: JadeFace,
  sultan_stacks: SultanFace,
  dinar_dahlia: DahliaFace,
  mansa_moneybaggs: MansaFace,
  kandake_kash: KandakeFace,
  moneybagg_bro: MoneybaggFace,
  mula_mami: MulaFace,
  debt_collector: DebtFace,
};

/** Face-forward spinning-coin portrait — signature hat/hair readable at a glance. */
export function SeriesCoinFace({
  id,
  className,
  title,
}: {
  id: string;
  className?: string;
  title?: string;
}) {
  const Art = COIN_ART[id];
  if (!Art) return null;
  return <Art className={className} title={title} />;
}

export function hasSeriesCoinFace(id: string): boolean {
  return Boolean(COIN_ART[id]);
}
