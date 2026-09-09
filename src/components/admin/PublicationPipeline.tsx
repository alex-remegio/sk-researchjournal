import {
  formatArticleStatus,
  pipelineStage,
  PUBLICATION_PIPELINE,
} from "@/lib/lifecycle/article";

export function PublicationPipeline({ status }: { status?: string }) {
  const current = status ? pipelineStage(status) : null;
  return (
    <ol className="mt-6 grid gap-2 sm:grid-cols-3 xl:grid-cols-6" aria-label="Publication lifecycle">
      {PUBLICATION_PIPELINE.map((stage, index) => {
        const currentIndex =
          current && (PUBLICATION_PIPELINE as readonly string[]).includes(current)
            ? PUBLICATION_PIPELINE.indexOf(current as (typeof PUBLICATION_PIPELINE)[number])
            : -1;
        const active = current === stage;
        const reached = currentIndex >= 0 && index <= currentIndex;
        return (
          <li
            key={stage}
            className={`rounded border px-3 py-2 ${
              active ? "border-ink-950 bg-ink-950 text-white" : reached || !status ? "bg-white" : "bg-ink-100 text-ink-500"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-wide opacity-70">{index === 0 ? "Start" : "Then"}</span>
            <span className="mt-1 block text-sm font-medium">{formatArticleStatus(stage)}</span>
          </li>
        );
      })}
    </ol>
  );
}
