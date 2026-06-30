export function NewsTicker({ items }: { items: string[] }) {
  const text = items.join("  •  ");
  return (
    <div className="lq-news-ticker py-2 px-1">
      <span className="lq-news-ticker-inner text-xs font-mono text-amber-200">
        BREAKING: {text}
      </span>
    </div>
  );
}
