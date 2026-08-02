import { useEffect, useState, type ReactElement, type ReactNode } from "react";

import { castSheetPngUrl, hasSheetArtId, SERIES_SHEET_SPECS } from "./seriesLeadArt";

type Props = {
  id: string;
  className?: string;
  /** Prefer square crop for circular avatars */
  size?: number;
  title?: string;
};

const OUT = "#1c1917";

function Frame({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 96 120"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sheetSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a5f" />
          <stop offset="55%" stopColor="#0f766e" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>
        <radialGradient id="sheetGlow" cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="96" height="120" rx="14" fill="url(#sheetSky)" />
      <ellipse cx="48" cy="42" rx="40" ry="36" fill="url(#sheetGlow)" />
      {children}
    </svg>
  );
}

function CoinHead({
  cx = 48,
  cy = 38,
  r = 22,
  coin,
  eye,
  glyph,
  mustache,
  lashes,
  lipstick,
  squareHole,
}: {
  cx?: number;
  cy?: number;
  r?: number;
  coin: string;
  eye: string;
  glyph?: string;
  mustache?: boolean;
  lashes?: boolean;
  lipstick?: boolean;
  squareHole?: boolean;
}) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={r} ry={r} fill={coin} stroke={OUT} strokeWidth={2.2} />
      <ellipse cx={cx} cy={cy} rx={r - 4} ry={r - 4} fill="none" stroke="#d97706" strokeWidth={1.4} />
      {squareHole ? (
        <rect x={cx - 4} y={cy - 14} width={8} height={8} rx={1} fill={OUT} />
      ) : null}
      {glyph ? (
        <text
          x={cx}
          y={cy - (squareHole ? 2 : 6)}
          textAnchor="middle"
          fontSize={squareHole ? 8 : 11}
          fontWeight={800}
          fill="#14532d"
          fontFamily="ui-rounded, system-ui, sans-serif"
        >
          {glyph}
        </text>
      ) : null}
      <ellipse cx={cx - 7} cy={cy + 2} rx={4.2} ry={5} fill="#fffbeb" />
      <ellipse cx={cx + 7} cy={cy + 2} rx={4.2} ry={5} fill="#fffbeb" />
      <circle cx={cx - 7} cy={cy + 2.5} r={2.2} fill={eye} />
      <circle cx={cx + 7} cy={cy + 2.5} r={2.2} fill={eye} />
      {lashes ? (
        <>
          <path d={`M${cx - 11} ${cy - 2} L${cx - 3} ${cy - 3}`} stroke={OUT} strokeWidth={1.4} />
          <path d={`M${cx + 3} ${cy - 3} L${cx + 11} ${cy - 2}`} stroke={OUT} strokeWidth={1.4} />
        </>
      ) : null}
      {mustache ? (
        <>
          <path
            d={`M${cx - 10} ${cy + 10} Q ${cx - 4} ${cy + 14} ${cx} ${cy + 10}`}
            fill="none"
            stroke={OUT}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
          <path
            d={`M${cx + 10} ${cy + 10} Q ${cx + 4} ${cy + 14} ${cx} ${cy + 10}`}
            fill="none"
            stroke={OUT}
            strokeWidth={2.2}
            strokeLinecap="round"
          />
        </>
      ) : null}
      {lipstick ? (
        <path
          d={`M${cx - 5} ${cy + 12} Q ${cx} ${cy + 16} ${cx + 5} ${cy + 12}`}
          fill="#9f1239"
          stroke={OUT}
          strokeWidth={0.6}
        />
      ) : (
        <path
          d={`M${cx - 4} ${cy + 13} Q ${cx} ${cy + 15} ${cx + 4} ${cy + 13}`}
          fill="none"
          stroke={OUT}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

function BodyCoat({
  coat,
  accent,
  y = 62,
  w = 34,
  h = 36,
  cut = "coat",
}: {
  coat: string;
  accent: string;
  y?: number;
  w?: number;
  h?: number;
  cut?: "coat" | "cape" | "vest" | "kaftan" | "crop";
}) {
  const x = 48 - w / 2;
  if (cut === "cape") {
    return (
      <g>
        <path
          d={`M${x - 6} ${y} Q 48 ${y - 4} ${x + w + 6} ${y} L${x + w + 10} ${y + h + 6} Q 48 ${y + h - 4} ${x - 10} ${y + h + 6} Z`}
          fill={coat}
          stroke={OUT}
          strokeWidth={2}
        />
        <path
          d={`M${x + w - 2} ${y + 4} L${x + w + 6} ${y + h} L${x + w - 8} ${y + h - 2} Z`}
          fill={accent}
          opacity={0.85}
        />
      </g>
    );
  }
  if (cut === "vest" || cut === "crop") {
    const hh = cut === "crop" ? h * 0.72 : h;
    return (
      <g>
        <rect x={x} y={y} width={w} height={hh} rx={8} fill={coat} stroke={OUT} strokeWidth={2} />
        <rect x={48 - 2} y={y + 4} width={4} height={hh * 0.55} rx={1} fill={accent} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={48} cy={y + 10 + i * 8} r={2.2} fill={accent} stroke={OUT} strokeWidth={0.6} />
        ))}
      </g>
    );
  }
  if (cut === "kaftan") {
    return (
      <g>
        <path
          d={`M${x} ${y} L${x + w} ${y} L${x + w + 6} ${y + h} L${x - 6} ${y + h} Z`}
          fill={coat}
          stroke={OUT}
          strokeWidth={2}
        />
        <path d={`M48 ${y} L48 ${y + h}`} stroke={accent} strokeWidth={2} />
        <rect x={x + 4} y={y + 8} width={w - 8} height={4} fill={accent} opacity={0.7} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={7} fill={coat} stroke={OUT} strokeWidth={2} />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h * 0.42} rx={4} fill={accent} opacity={0.9} />
    </g>
  );
}

function Legs() {
  return (
    <g>
      <rect x={38} y={96} width={7} height={14} rx={2} fill="#1e3a5f" stroke={OUT} strokeWidth={1.2} />
      <rect x={51} y={96} width={7} height={14} rx={2} fill="#1e3a5f" stroke={OUT} strokeWidth={1.2} />
      <rect x={36} y={108} width={11} height={5} rx={1.5} fill="#f4b942" stroke={OUT} strokeWidth={1} />
      <rect x={49} y={108} width={11} height={5} rx={1.5} fill="#f4b942" stroke={OUT} strokeWidth={1} />
    </g>
  );
}

function Staff({ x = 78, y = 48, tip = "$", tipColor = "#14532d" }: { x?: number; y?: number; tip?: string; tipColor?: string }) {
  return (
    <g>
      <rect x={x} y={y} width={3.5} height={52} rx={1.5} fill="#292524" stroke={OUT} strokeWidth={0.8} />
      <circle cx={x + 1.75} cy={y} r={7} fill="#f4b942" stroke={OUT} strokeWidth={1.2} />
      <text x={x + 1.75} y={y + 3.5} textAnchor="middle" fontSize={9} fontWeight={800} fill={tipColor}>
        {tip}
      </text>
    </g>
  );
}

function CashwellArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.cashwell!;
  return (
    <Frame className={className} title="Cashwell">
      {/* Tall top hat */}
      <rect x={34} y={2} width={28} height={18} rx={3} fill={s.coat} stroke={OUT} strokeWidth={1.8} />
      <rect x={28} y={18} width={40} height={5} rx={2} fill={OUT} />
      <rect x={36} y={14} width={24} height={3} fill={s.accent} />
      <circle cx={48} cy={10} r={4} fill={s.accent} stroke={OUT} strokeWidth={0.8} />
      <text x={48} y={12.5} textAnchor="middle" fontSize={6} fontWeight={800} fill={s.coat}>
        $
      </text>
      <CoinHead coin={s.coin} eye={s.eye} mustache glyph="$" />
      <BodyCoat coat={s.coat} accent={s.accent} cut="coat" />
      <Legs />
      <Staff tip="$" tipColor={s.coat} />
    </Frame>
  );
}

function CashmereArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.cashmere!;
  return (
    <Frame className={className} title="Cashmere Couture">
      {/* Blonde waves */}
      <ellipse cx={28} cy={40} rx={10} ry={16} fill="#f4b942" stroke={OUT} strokeWidth={1.2} />
      <ellipse cx={68} cy={40} rx={10} ry={16} fill="#f4b942" stroke={OUT} strokeWidth={1.2} />
      <ellipse cx={48} cy={22} rx={20} ry={10} fill="#fbbf24" stroke={OUT} strokeWidth={1.2} />
      {/* Cocktail hat */}
      <ellipse cx={58} cy={16} rx={12} ry={4} fill={OUT} />
      <circle cx={58} cy={12} r={4} fill={s.accent} stroke={OUT} strokeWidth={0.8} />
      <path d="M50 18 Q58 28 66 18" fill="none" stroke={OUT} strokeWidth={1.2} opacity={0.7} />
      <CoinHead coin={s.coin} eye={s.eye} lashes lipstick />
      {/* Pearls */}
      <circle cx={30} cy={48} r={2.5} fill="#fafaf9" stroke={OUT} strokeWidth={0.6} />
      <circle cx={66} cy={48} r={2.5} fill="#fafaf9" stroke={OUT} strokeWidth={0.6} />
      <BodyCoat coat={s.coat} accent={s.accent} cut="cape" />
      <Legs />
      <Staff tip="$" tipColor={OUT} />
    </Frame>
  );
}

function PedroArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.peso_pedro!;
  return (
    <Frame className={className} title="Peso Pedro">
      <ellipse cx={48} cy={18} rx={34} ry={7} fill={s.coat} stroke={OUT} strokeWidth={1.8} />
      <rect x={38} y={8} width={20} height={12} rx={4} fill={s.coat} stroke={OUT} strokeWidth={1.5} />
      <ellipse cx={48} cy={16} rx={18} ry={2.5} fill={s.accent} />
      <CoinHead coin={s.coin} eye={s.eye} mustache glyph="P" />
      <BodyCoat coat={s.coat} accent={s.accent} cut="coat" />
      <Legs />
      <Staff tip="P" tipColor={s.coat} />
    </Frame>
  );
}

function FernandaArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.fortuna_fernanda!;
  return (
    <Frame className={className} title="Fortuna Fernanda">
      <ellipse cx={28} cy={42} rx={11} ry={18} fill="#1c1917" stroke={OUT} strokeWidth={1.2} />
      <ellipse cx={68} cy={42} rx={11} ry={18} fill="#1c1917" stroke={OUT} strokeWidth={1.2} />
      {[40, 48, 56].map((x, i) => (
        <circle key={x} cx={x} cy={14 + (i % 2)} r={5} fill={i === 1 ? s.accent : "#b91c1c"} stroke={OUT} strokeWidth={1} />
      ))}
      <CoinHead coin={s.coin} eye={s.eye} lashes lipstick />
      <BodyCoat coat={s.coat} accent={s.accent} cut="cape" />
      {/* Bill fan */}
      <g transform="translate(18 70) rotate(-25)">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={i * 3} y={-i} width={10} height={16} rx={2} fill="#86efac" stroke={OUT} strokeWidth={0.7} />
        ))}
      </g>
      <Legs />
      <Staff tip="P" tipColor={s.coat} />
    </Frame>
  );
}

function BaoArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.billionaire_bao!;
  return (
    <Frame className={className} title="Billionaire Bao">
      <ellipse cx={48} cy={20} rx={18} ry={10} fill={OUT} />
      <ellipse cx={30} cy={36} rx={8} ry={12} fill={OUT} />
      <ellipse cx={66} cy={36} rx={8} ry={12} fill={OUT} />
      <CoinHead coin={s.coin} eye={s.eye} glyph="BB" />
      <BodyCoat coat={s.coat} accent={s.accent} cut="vest" />
      <Legs />
      {/* Lion cane tip */}
      <Staff tip="🦁" tipColor={s.coat} />
    </Frame>
  );
}

function JadeArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.jade_fortune!;
  return (
    <Frame className={className} title="Jade Fortune">
      <ellipse cx={48} cy={16} rx={14} ry={10} fill={OUT} />
      <line x1={34} y1={14} x2={42} y2={20} stroke={s.accent} strokeWidth={2} />
      <line x1={62} y1={14} x2={54} y2={20} stroke="#f4b942" strokeWidth={2} />
      <CoinHead coin={s.coin} eye={s.eye} lashes squareHole />
      <BodyCoat coat="#0a0a0a" accent={s.accent} cut="cape" />
      <Legs />
      <Staff tip="玉" tipColor={s.coat} />
    </Frame>
  );
}

function SultanArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.sultan_stacks!;
  return (
    <Frame className={className} title="Sultan Stacks">
      <ellipse cx={48} cy={16} rx={18} ry={14} fill={s.accent} stroke={OUT} strokeWidth={1.5} />
      <ellipse cx={48} cy={20} rx={14} ry={8} fill={s.coat} stroke={OUT} strokeWidth={1.2} />
      <path d="M48 4 Q52 0 56 6" fill="none" stroke="#fafaf9" strokeWidth={2} />
      <circle cx={48} cy={22} r={3} fill="#10b981" stroke={OUT} strokeWidth={0.8} />
      <CoinHead coin={s.coin} eye={s.eye} mustache glyph="$" />
      {/* Goatee */}
      <path d="M48 52 L45 58 L51 58 Z" fill={OUT} />
      <BodyCoat coat={s.coat} accent={s.accent} cut="kaftan" />
      <Legs />
      <Staff tip="$" tipColor={s.coat} />
    </Frame>
  );
}

function DahliaArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.dinar_dahlia!;
  return (
    <Frame className={className} title="Dinar Dahlia">
      <ellipse cx={30} cy={40} rx={10} ry={16} fill={OUT} />
      <ellipse cx={66} cy={40} rx={10} ry={16} fill={OUT} />
      <rect x={30} y={8} width={36} height={8} rx={2} fill="#f4b942" stroke={OUT} strokeWidth={1.2} />
      {[34, 42, 48, 54, 62].map((x) => (
        <polygon key={x} points={`${x},8 ${x + 3},2 ${x + 6},8`} fill="#f4b942" stroke={OUT} strokeWidth={0.6} />
      ))}
      <circle cx={48} cy={6} r={3} fill={s.accent} />
      <CoinHead coin={s.coin} eye={s.eye} lashes lipstick glyph="DD" />
      <BodyCoat coat={s.coat} accent={s.accent} cut="cape" />
      <Legs />
      <Staff tip="DD" tipColor={s.coat} />
    </Frame>
  );
}

function MansaArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.mansa_moneybaggs!;
  return (
    <Frame className={className} title="Mansa Moneybaggs">
      <ellipse cx={48} cy={14} rx={16} ry={12} fill={s.accent} stroke={OUT} strokeWidth={1.4} />
      <rect x={36} y={4} width={24} height={6} rx={1} fill="#f4b942" />
      {[38, 44, 48, 52, 58].map((x) => (
        <polygon key={x} points={`${x},4 ${x + 2},0 ${x + 4},4`} fill="#f4b942" />
      ))}
      <CoinHead coin={s.coin} eye={s.eye} glyph="M" />
      {/* Gold mask overlay */}
      <rect x={34} y={30} width={28} height={12} rx={3} fill="#f4b942" opacity={0.85} stroke={OUT} strokeWidth={1} />
      <ellipse cx={48} cy={56} rx={12} ry={10} fill={OUT} />
      <BodyCoat coat={s.coat} accent={s.accent} cut="kaftan" />
      {/* Moneybag */}
      <ellipse cx={22} cy={88} rx={10} ry={12} fill={OUT} stroke="#f4b942" strokeWidth={1.5} />
      <circle cx={18} cy={80} r={2} fill="#f4b942" />
      <circle cx={24} cy={78} r={2} fill="#f4b942" />
      <Legs />
      <Staff tip="☀" tipColor={s.coat} />
    </Frame>
  );
}

function KandakeArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.kandake_kash!;
  return (
    <Frame className={className} title="Kandake Kash">
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = 48 + Math.cos(a) * 14;
        const y = 14 + Math.sin(a) * 8;
        return (
          <g key={i}>
            <rect x={x - 3} y={y} width={6} height={14} rx={2} fill={OUT} />
            <circle cx={x} cy={y + 4} r={2} fill="#f4b942" />
            {i % 2 === 0 ? <circle cx={x} cy={y + 10} r={2} fill={s.accent} /> : null}
          </g>
        );
      })}
      <CoinHead coin={s.coin} eye={s.eye} lashes lipstick glyph="KK" />
      <BodyCoat coat={s.coat} accent="#1b4332" cut="cape" />
      <Legs />
      <Staff tip="$" tipColor={s.coat} />
    </Frame>
  );
}

function MoneybaggArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.moneybagg_bro!;
  return (
    <Frame className={className} title="Moneybagg Bro">
      <ellipse cx={48} cy={18} rx={20} ry={14} fill={OUT} />
      <path d="M40 28 L48 40 L56 28" fill={OUT} />
      <rect x={42} y={8} width={12} height={6} rx={1} fill="#f4b942" stroke={OUT} strokeWidth={0.8} />
      <text x={48} y={13} textAnchor="middle" fontSize={6} fontWeight={800} fill={s.coat}>
        $
      </text>
      <CoinHead coin={s.coin} eye={s.eye} glyph="MB" />
      {/* Wide grin */}
      <rect x={40} y={48} width={16} height={4} rx={1} fill={OUT} />
      <rect x={42} y={49} width={12} height={2} fill="#fffbeb" />
      <BodyCoat coat={s.coat} accent={s.accent} cut="vest" />
      {/* Chain */}
      <ellipse cx={48} cy={70} rx={14} ry={5} fill="none" stroke="#f4b942" strokeWidth={2} />
      <Legs />
      <Staff tip="$" tipColor={s.accent} />
    </Frame>
  );
}

function MulaArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.mula_mami!;
  return (
    <Frame className={className} title="Mula Mami">
      <ellipse cx={48} cy={12} rx={10} ry={8} fill={OUT} />
      <ellipse cx={48} cy={22} rx={20} ry={12} fill={OUT} />
      <text x={38} y={20} fontSize={7} fill="#fde68a" fontWeight={800}>
        $
      </text>
      <text x={56} y={20} fontSize={7} fill="#fde68a" fontWeight={800}>
        $
      </text>
      <CoinHead coin={s.coin} eye={s.eye} lashes lipstick glyph="MM" />
      {/* Hoops */}
      <circle cx={24} cy={42} r={7} fill="none" stroke="#f4b942" strokeWidth={2.2} />
      <circle cx={72} cy={42} r={7} fill="none" stroke="#f4b942" strokeWidth={2.2} />
      <BodyCoat coat={s.coat} accent={s.accent} cut="crop" />
      {/* Quilted bag */}
      <rect x={16} y={82} width={14} height={16} rx={3} fill={OUT} stroke="#f4b942" strokeWidth={1.4} />
      <text x={23} y={93} textAnchor="middle" fontSize={8} fill="#fde68a" fontWeight={800}>
        $
      </text>
      <Legs />
      {/* Cash fan left */}
      <g transform="translate(20 68) rotate(-20)">
        {[0, 1, 2].map((i) => (
          <rect key={i} x={i * 3} y={0} width={9} height={14} rx={1.5} fill="#86efac" stroke={OUT} strokeWidth={0.6} />
        ))}
      </g>
    </Frame>
  );
}

function DebtArt({ className }: { className?: string }) {
  const s = SERIES_SHEET_SPECS.debt_collector!;
  return (
    <Frame className={className} title="The Debt Collector">
      <polygon points="24,22 48,6 72,22" fill="#57534e" stroke={OUT} strokeWidth={1.6} />
      <rect x={28} y={22} width={40} height={10} fill="#78716c" stroke={OUT} strokeWidth={1.2} />
      <rect x={34} y={28} width={28} height={22} rx={2} fill={s.coin} stroke={OUT} strokeWidth={1.6} />
      <circle cx={42} cy={38} r={3} fill={s.eye} />
      <circle cx={54} cy={38} r={3} fill={s.eye} />
      <rect x={30} y={54} width={36} height={40} rx={3} fill={s.coat} stroke={OUT} strokeWidth={2} />
      <circle cx={48} cy={74} r={10} fill="#292524" stroke="#f4b942" strokeWidth={2} />
      <text x={48} y={78} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fde68a">
        $
      </text>
      <rect x={70} y={50} width={4} height={48} fill="#292524" />
      <rect x={14} y={70} width={12} height={16} fill="#fafaf9" stroke={OUT} strokeWidth={1} />
    </Frame>
  );
}

const ART: Record<string, (p: { className?: string }) => ReactElement> = {
  cashwell: CashwellArt,
  cashmere: CashmereArt,
  peso_pedro: PedroArt,
  fortuna_fernanda: FernandaArt,
  billionaire_bao: BaoArt,
  jade_fortune: JadeArt,
  sultan_stacks: SultanArt,
  dinar_dahlia: DahliaArt,
  mansa_moneybaggs: MansaArt,
  kandake_kash: KandakeArt,
  moneybagg_bro: MoneybaggArt,
  mula_mami: MulaArt,
  debt_collector: DebtArt,
};

/**
 * Series-lead sheet portrait.
 * Prefers dropped-in `public/cast/{id}.png` (exact uploaded art);
 * otherwise uses the illustrated SVG recreation of the sheet look.
 */
export function SeriesLeadPortrait({ id, className, size, title }: Props) {
  const [pngOk, setPngOk] = useState<boolean | null>(null);
  const Art = ART[id];
  const png = castSheetPngUrl(id);

  useEffect(() => {
    if (!hasSheetArtId(id)) {
      setPngOk(false);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setPngOk(true);
    };
    img.onerror = () => {
      if (!cancelled) setPngOk(false);
    };
    img.src = png;
    return () => {
      cancelled = true;
    };
  }, [id, png]);

  if (!Art && !hasSheetArtId(id)) return null;

  if (pngOk) {
    return (
      <img
        src={png}
        alt={title ?? id}
        className={className}
        width={size}
        height={size}
        style={{
          width: size ?? "100%",
          height: size ?? "100%",
          objectFit: "contain",
          display: "block",
        }}
        data-sheet-src="png"
      />
    );
  }

  if (!Art) return null;
  return <Art className={className} />;
}

export function seriesLeadPortraitSvgElement(id: string): string | null {
  // Used by 3D texture bake — return null; billboard uses component render path.
  return ART[id] ? id : null;
}
