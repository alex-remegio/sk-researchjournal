export function IssueCover({
  src,
  title,
  className = "h-40 w-28 object-cover",
}: {
  src?: string | null;
  title: string;
  className?: string;
}) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`Cover of ${title}`} className={`rounded border border-ink-200 bg-ink-100 ${className}`} />
  );
}
