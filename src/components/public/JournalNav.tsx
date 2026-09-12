import Link from "next/link";

export function JournalNav({ slug, name }: { slug: string; name: string }) {
  const links = [
    ["Home", `/journals/${slug}`],
    ["About", `/journals/${slug}/about`],
    ["Current issue", `/journals/${slug}/current`],
    ["Archive", `/journals/${slug}/archive`],
    ["Editorial board", `/journals/${slug}/board`],
    ["For authors", `/journals/${slug}/for-authors`],
    ["For reviewers", `/journals/${slug}/for-reviewers`],
    ["Editorial workflow", `/journals/${slug}/editorial-workflow`],
    ["Peer review", `/journals/${slug}/peer-review`],
    ["Announcements", `/journals/${slug}/announcements`],
  ];
  return (
    <nav aria-label={`${name} sections`} className="mb-8 flex flex-wrap gap-3 text-sm text-ink-700">
      {links.map(([label, href]) => (
        <Link key={href} className="underline-offset-4 hover:underline" href={href}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
