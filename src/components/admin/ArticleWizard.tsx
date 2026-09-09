"use client";

import { useEffect, useMemo, useState } from "react";
import { ArticleView } from "@/components/article/ArticleView";
import { PublicationPipeline } from "@/components/admin/PublicationPipeline";
import { api } from "@/lib/client/api";
import { isValidDoi, isValidOrcid } from "@/lib/identifiers";
import {
  formatArticleStatus,
  isReadyToPublish,
  isReadyToSchedule,
  pipelineStage,
} from "@/lib/lifecycle/article";
import type { ScholarArticle } from "@/lib/scholar";

type AuthorLink = {
  authorId: string;
  name: string;
  corresponding: boolean;
  affiliationText: string;
  orcid: string;
};

type WizardProps = {
  article: Record<string, unknown> & {
    id: string;
    title: string;
    abstract: string;
    articleType: string;
    categoryId?: string | null;
    journalId: string;
    issueId?: string | null;
    firstPage?: string | null;
    lastPage?: string | null;
    publicationDate?: string | Date | null;
    doi?: string | null;
    edasPaperId?: string | null;
    status: string;
    authors: Array<{
      authorId: string;
      corresponding: boolean;
      affiliationText?: string | null;
      author: { firstName: string; lastName: string; affiliation: string; orcid?: string | null };
    }>;
    keywords: Array<{ keyword: string }>;
    references: Array<{ referenceText: string; doi?: string | null; url?: string | null }>;
    files?: Array<{ id: string; fileType: string; originalName: string }>;
    journal: Record<string, unknown>;
  };
  journals: Array<{ id: string; name: string; issnOnline?: string | null; issnPrint?: string | null }>;
  issues: Array<{
    id: string;
    journalId: string;
    volume: number;
    issueNumber: number;
    year: number;
    title: string;
  }>;
  categories: Array<{ id: string; journalId: string; name: string }>;
  authors: Array<{
    id: string;
    firstName: string;
    lastName: string;
    affiliation: string;
    orcid?: string | null;
  }>;
  blockers: string[];
  permissions: { canEdit: boolean; canApprove: boolean; canPublish: boolean; canSchedule: boolean };
};

type WizardArticle = WizardProps["article"];

const STEPS = [
  { title: "Article information", fields: ["Title", "Abstract", "Article type", "Category"] },
  {
    title: "Authors",
    fields: ["Author 1", "Author 2", "Author 3", "Corresponding author", "Affiliations", "ORCID"],
  },
  { title: "Publication", fields: ["Journal", "Volume", "Issue", "Pages", "Publication date"] },
  { title: "Identifiers", fields: ["DOI", "EDAS Paper ID", "ISSN"] },
  { title: "Files", fields: ["Final PDF", "Supplementary file", "Thumbnail"] },
  { title: "Keywords & references", fields: ["Keywords", "References"] },
  { title: "Preview", fields: ["Publish"] },
] as const;

function fileFor(article: WizardArticle, fileType: string) {
  return article.files?.find((file) => file.fileType === fileType);
}

export function ArticleWizard({
  article: initial,
  journals,
  issues,
  categories,
  authors,
  blockers: initialBlockers,
  permissions,
}: WizardProps) {
  const [step, setStep] = useState(0);
  const [article, setArticle] = useState(initial);
  const [blockers, setBlockers] = useState(initialBlockers);
  const [status, setStatus] = useState("Saved");
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(initial.title);
  const [abstract, setAbstract] = useState(initial.abstract);
  const [articleType, setArticleType] = useState(initial.articleType);
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [journalId, setJournalId] = useState(initial.journalId);
  const [issueId, setIssueId] = useState(initial.issueId ?? "");
  const [firstPage, setFirstPage] = useState(initial.firstPage ?? "");
  const [lastPage, setLastPage] = useState(initial.lastPage ?? "");
  const [publicationDate, setPublicationDate] = useState(
    initial.publicationDate ? String(initial.publicationDate).slice(0, 10) : "",
  );
  const [doi, setDoi] = useState(initial.doi ?? "");
  const [edasPaperId, setEdasPaperId] = useState(initial.edasPaperId ?? "");
  const [edasStatus, setEdasStatus] = useState<string | null>(null);
  const [authorLinks, setAuthorLinks] = useState<AuthorLink[]>(
    initial.authors.map((link) => ({
      authorId: link.authorId,
      name: `${link.author.firstName} ${link.author.lastName}`,
      corresponding: link.corresponding,
      affiliationText: link.affiliationText ?? link.author.affiliation,
      orcid: link.author.orcid ?? "",
    })),
  );
  const [keywords, setKeywords] = useState(initial.keywords.map((item) => item.keyword).join(", "));
  const [references, setReferences] = useState(
    initial.references
      .map((item) => `${item.referenceText}${item.doi ? ` | ${item.doi}` : ""}${item.url ? ` | ${item.url}` : ""}`)
      .join("\n"),
  );
  const [newAuthor, setNewAuthor] = useState({
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    country: "",
    orcid: "",
  });
  const initialIssue = issues.find((issue) => issue.id === initial.issueId);
  const [volume, setVolume] = useState<string>(initialIssue ? String(initialIssue.volume) : "");

  const filteredIssues = useMemo(
    () => issues.filter((issue) => issue.journalId === journalId),
    [issues, journalId],
  );
  const volumes = useMemo(
    () => [...new Set(filteredIssues.map((issue) => issue.volume))].sort((a, b) => b - a),
    [filteredIssues],
  );
  const issuesForVolume = useMemo(
    () => filteredIssues.filter((issue) => !volume || String(issue.volume) === volume),
    [filteredIssues, volume],
  );
  const filteredCategories = useMemo(
    () => categories.filter((category) => category.journalId === journalId),
    [categories, journalId],
  );
  const journal = journals.find((item) => item.id === journalId);
  const selectedIssue = filteredIssues.find((issue) => issue.id === issueId);
  const authorSlots = Math.max(3, authorLinks.length);
  const stage = pipelineStage(article.status);
  const canScheduleNow =
    permissions.canSchedule && isReadyToSchedule(article.status) && Boolean(issueId && publicationDate);
  const canPublishNow =
    permissions.canPublish && isReadyToPublish(article.status) && blockers.length === 0;

  const stepComplete = [
    Boolean(title.trim() && abstract.trim() && articleType && categoryId),
    authorLinks.length >= 1 && authorLinks.filter((link) => link.corresponding).length === 1,
    Boolean(journalId && issueId && firstPage && lastPage && publicationDate),
    Boolean(doi && isValidDoi(doi)),
    Boolean(fileFor(article, "FINAL_PDF")),
    keywords.split(",").some((item) => item.trim()),
    blockers.length === 0,
  ];

  async function refresh() {
    const result = await api<{ article: WizardArticle; blockers: string[] }>(`/api/articles/${article.id}`);
    setArticle(result.article);
    setBlockers(result.blockers);
    return result;
  }

  async function saveInformation() {
    const result = await api<{ article: WizardArticle; blockers: string[] }>(`/api/articles/${article.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, abstract, articleType, categoryId: categoryId || null }),
    });
    setArticle(result.article);
    setBlockers(result.blockers);
  }

  async function savePublication() {
    const result = await api<{ article: WizardArticle; blockers: string[] }>(`/api/articles/${article.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        step: "publication",
        journalId,
        issueId: issueId || null,
        firstPage: firstPage || null,
        lastPage: lastPage || null,
        publicationDate: publicationDate || null,
      }),
    });
    setArticle(result.article);
    setBlockers(result.blockers);
  }

  async function saveIdentifiers() {
    if (doi && !isValidDoi(doi)) throw new Error("Invalid DOI");
    const result = await api<{ article: WizardArticle; blockers: string[] }>(`/api/articles/${article.id}`, {
      method: "PATCH",
      body: JSON.stringify({ step: "identifiers", doi: doi || null, edasPaperId: edasPaperId || null }),
    });
    setArticle(result.article);
    setBlockers(result.blockers);
  }

  async function saveAuthors() {
    await api(`/api/articles/${article.id}/authors`, {
      method: "PUT",
      body: JSON.stringify({
        authors: authorLinks.map((link, index) => ({
          authorId: link.authorId,
          authorOrder: index + 1,
          corresponding: link.corresponding,
          affiliationText: link.affiliationText,
        })),
      }),
    });
    await refresh();
  }

  async function saveKeywords() {
    await api(`/api/articles/${article.id}/keywords`, {
      method: "PUT",
      body: JSON.stringify({
        keywords: keywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    });
    const refs = references
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [referenceText, doiValue, url] = line.split("|").map((part) => part.trim());
        return { referenceText, doi: doiValue || null, url: url || null };
      });
    await api(`/api/articles/${article.id}/references`, {
      method: "PUT",
      body: JSON.stringify({ references: refs }),
    });
    await refresh();
  }

  async function persist(current = step) {
    if (!permissions.canEdit) return;
    setError(null);
    setStatus("Saving…");
    try {
      await fetch("/api/auth/csrf");
      if (current === 0) await saveInformation();
      if (current === 1) await saveAuthors();
      if (current === 2) await savePublication();
      if (current === 3) await saveIdentifiers();
      if (current === 5) await saveKeywords();
      setStatus("Saved");
    } catch (err) {
      setStatus("Save failed");
      setError(err instanceof Error ? err.message : "Save failed");
      throw err;
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void persist().catch(() => undefined);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title,
    abstract,
    articleType,
    categoryId,
    journalId,
    issueId,
    firstPage,
    lastPage,
    publicationDate,
    doi,
    edasPaperId,
    authorLinks,
    keywords,
    references,
    step,
  ]);

  async function upload(fileType: "FINAL_PDF" | "SUPPLEMENTARY" | "THUMBNAIL", file: File) {
    await fetch("/api/auth/csrf");
    const form = new FormData();
    form.append("file", file);
    form.append("fileType", fileType);
    const csrf = document.cookie.split("; ").find((row) => row.startsWith("journal_csrf="))?.split("=")[1];
    const response = await fetch(`/api/articles/${article.id}/files`, {
      method: "POST",
      headers: csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {},
      body: form,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Upload failed");
    await refresh();
  }

  async function changeStatus(statusValue: string) {
    setError(null);
    try {
      await persist();
      await fetch("/api/auth/csrf");
      if (statusValue === "SUBMITTED") {
        const result = await api<{ article: WizardArticle }>(`/api/articles/${article.id}/review/screen`, {
          method: "POST",
          body: JSON.stringify({ action: "SUBMIT" }),
        });
        setArticle(result.article);
        return;
      }
      const result = await api<{ article: WizardArticle }>(`/api/articles/${article.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: statusValue }),
      });
      setArticle(result.article);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status change failed");
    }
  }

  async function goNext() {
    try {
      await persist(step);
      if (step < STEPS.length - 1) setStep(step + 1);
    } catch {
      /* persist already set error */
    }
  }

  const inputClass = "mt-1 w-full rounded border border-ink-300 px-3 py-2";

  function addExistingAuthor(authorId: string) {
    const selected = authors.find((item) => item.id === authorId);
    if (!selected) return;
    setAuthorLinks((current) => {
      if (current.some((link) => link.authorId === selected.id)) return current;
      return [
        ...current,
        {
          authorId: selected.id,
          name: `${selected.firstName} ${selected.lastName}`,
          corresponding: current.length === 0,
          affiliationText: selected.affiliation,
          orcid: selected.orcid ?? "",
        },
      ];
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-crimson-700">Publishing pipeline</p>
          <h1 className="mt-1 font-serif text-3xl">Article wizard</h1>
          <p className="text-sm text-ink-600">
            {formatArticleStatus(article.status)} · {status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {permissions.canEdit ? (
            <button className="rounded border px-3 py-1" type="button" onClick={() => void persist().catch(() => undefined)}>
              Save draft
            </button>
          ) : null}
          {permissions.canEdit && article.status === "DRAFT" ? (
            <button className="rounded border px-3 py-1" type="button" onClick={() => changeStatus("SUBMITTED")}>
              Submit for screening
            </button>
          ) : null}
          {article.status !== "PUBLISHED" && article.status !== "ARCHIVED" ? (
            <a className="rounded border px-3 py-1" href={`/admin/review/${article.id}`}>
              Peer review
            </a>
          ) : null}
          {canScheduleNow ? (
            <button className="rounded border px-3 py-1" type="button" onClick={() => changeStatus("SCHEDULED")}>
              Schedule
            </button>
          ) : null}
          {permissions.canPublish && article.status === "PUBLISHED" ? (
            <button
              className="rounded border px-3 py-1"
              type="button"
              onClick={() => changeStatus(issueId && publicationDate ? "SCHEDULED" : "READY_FOR_PUBLICATION")}
            >
              Unpublish
            </button>
          ) : null}
          {permissions.canApprove ? (
            <button className="rounded border px-3 py-1" type="button" onClick={() => changeStatus("ARCHIVED")}>
              Archive
            </button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-3 text-sm text-crimson-700">{error}</p> : null}
      {stage === "REJECTED" ? (
        <p className="mt-3 text-sm text-crimson-700">This article was rejected and is outside the publication pipeline.</p>
      ) : null}
      <PublicationPipeline status={article.status} />

      <ol className="mt-6 grid gap-2 md:grid-cols-4 xl:grid-cols-8" aria-label="Publishing steps">
        {STEPS.map((item, index) => (
          <li key={item.title}>
            <button
              className={`h-full w-full rounded border px-3 py-2 text-left ${
                index === step ? "border-ink-950 bg-ink-950 text-white" : "bg-white"
              }`}
              type="button"
              onClick={() => setStep(index)}
            >
              <span className="block text-[11px] uppercase tracking-wide opacity-70">Step {index + 1}</span>
              <span className="mt-1 block text-sm font-medium">{item.title}</span>
              <span className={`mt-1 block text-xs ${index === step ? "text-ink-200" : "text-ink-500"}`}>
                {stepComplete[index] ? "Complete" : item.fields.join(" · ")}
              </span>
            </button>
          </li>
        ))}
        <li>
          <div
            className={`h-full rounded border px-3 py-2 ${
              article.status === "PUBLISHED" ? "border-crimson-700 bg-crimson-700 text-white" : "bg-ink-100"
            }`}
          >
            <span className="block text-[11px] uppercase tracking-wide opacity-70">Final</span>
            <span className="mt-1 block text-sm font-medium">Publish</span>
            <span className="mt-1 block text-xs opacity-80">
              {article.status === "PUBLISHED" ? "Live" : canPublishNow ? "Ready" : "After preview"}
            </span>
          </div>
        </li>
      </ol>

      <div className="mt-6 rounded border border-ink-200 bg-white p-5">
        <h2 className="font-serif text-2xl">
          Step {step + 1}. {STEPS[step].title}
        </h2>
        <p className="mt-1 text-sm text-ink-600">{STEPS[step].fields.join(" · ")}</p>

        {step === 0 ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              Title
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block">
              Abstract
              <textarea className={inputClass} rows={8} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
            </label>
            <label className="block">
              Article type
              <select className={inputClass} value={articleType} onChange={(e) => setArticleType(e.target.value)}>
                {["RESEARCH", "REVIEW", "SHORT_COMMUNICATION", "EDITORIAL", "CASE_STUDY", "TECHNICAL_NOTE"].map(
                  (type) => (
                    <option key={type}>{type}</option>
                  ),
                )}
              </select>
            </label>
            <label className="block">
              Category
              <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {filteredCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <div className="grid gap-3">
              {Array.from({ length: authorSlots }, (_, index) => {
                const link = authorLinks[index];
                return (
                  <section key={link?.authorId ?? `empty-${index}`} className="rounded border p-4">
                    <h3 className="font-medium">Author {index + 1}</h3>
                    {link ? (
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <p className="md:col-span-2">{link.name}</p>
                        <label>
                          Affiliations
                          <input
                            className={inputClass}
                            value={link.affiliationText}
                            onChange={(event) =>
                              setAuthorLinks((current) =>
                                current.map((item, itemIndex) =>
                                  itemIndex === index ? { ...item, affiliationText: event.target.value } : item,
                                ),
                              )
                            }
                          />
                        </label>
                        <label>
                          ORCID
                          <input className={inputClass} readOnly value={link.orcid || "Not provided"} />
                        </label>
                        <label className="flex items-center gap-2 text-sm md:col-span-2">
                          <input
                            type="radio"
                            name="corresponding-author"
                            checked={link.corresponding}
                            onChange={() =>
                              setAuthorLinks((current) =>
                                current.map((item, itemIndex) => ({
                                  ...item,
                                  corresponding: itemIndex === index,
                                })),
                              )
                            }
                          />
                          Corresponding author
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="rounded border px-3 py-1 text-sm"
                            onClick={() =>
                              setAuthorLinks((current) => {
                                if (index === 0) return current;
                                const copy = [...current];
                                [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
                                return copy;
                              })
                            }
                          >
                            Move up
                          </button>
                          <button
                            type="button"
                            className="rounded border px-3 py-1 text-sm"
                            onClick={() => setAuthorLinks((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-ink-500">Not added yet. Use the catalog or create form below.</p>
                    )}
                  </section>
                );
              })}
            </div>
            <label className="block">
              Add existing author
              <select
                className={inputClass}
                defaultValue=""
                onChange={(event) => {
                  addExistingAuthor(event.target.value);
                  event.target.value = "";
                }}
              >
                <option value="">Select author</option>
                {authors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.lastName}, {item.firstName}
                    {item.orcid ? ` · ${item.orcid}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="grid gap-2 md:grid-cols-2">
              <legend className="text-sm font-medium">Create author</legend>
              <input
                className={inputClass}
                placeholder="First name"
                value={newAuthor.firstName}
                onChange={(e) => setNewAuthor({ ...newAuthor, firstName: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Last name"
                value={newAuthor.lastName}
                onChange={(e) => setNewAuthor({ ...newAuthor, lastName: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Email"
                value={newAuthor.email}
                onChange={(e) => setNewAuthor({ ...newAuthor, email: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Affiliation"
                value={newAuthor.affiliation}
                onChange={(e) => setNewAuthor({ ...newAuthor, affiliation: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Country"
                value={newAuthor.country}
                onChange={(e) => setNewAuthor({ ...newAuthor, country: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="ORCID"
                value={newAuthor.orcid}
                onChange={(e) => setNewAuthor({ ...newAuthor, orcid: e.target.value })}
              />
              <button
                className="rounded bg-ink-950 px-3 py-2 text-white"
                type="button"
                onClick={async () => {
                  if (newAuthor.orcid && !isValidOrcid(newAuthor.orcid)) {
                    setError("Invalid ORCID");
                    return;
                  }
                  await fetch("/api/auth/csrf");
                  const created = await api<{
                    author: { id: string; firstName: string; lastName: string; affiliation: string; orcid?: string | null };
                  }>("/api/authors", {
                    method: "POST",
                    body: JSON.stringify(newAuthor),
                  });
                  setAuthorLinks((current) => [
                    ...current,
                    {
                      authorId: created.author.id,
                      name: `${created.author.firstName} ${created.author.lastName}`,
                      corresponding: current.length === 0,
                      affiliationText: created.author.affiliation,
                      orcid: created.author.orcid ?? newAuthor.orcid,
                    },
                  ]);
                  setNewAuthor({ firstName: "", lastName: "", email: "", affiliation: "", country: "", orcid: "" });
                }}
              >
                Add new author
              </button>
            </fieldset>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              Journal
              <select
                className={inputClass}
                value={journalId}
                onChange={(e) => {
                  setJournalId(e.target.value);
                  setIssueId("");
                  setVolume("");
                }}
              >
                {journals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Volume
              <select
                className={inputClass}
                value={volume}
                onChange={(e) => {
                  setVolume(e.target.value);
                  setIssueId("");
                }}
              >
                <option value="">Select volume</option>
                {volumes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Issue
              <select className={inputClass} value={issueId} onChange={(e) => setIssueId(e.target.value)}>
                <option value="">Select issue</option>
                {issuesForVolume.map((issue) => (
                  <option key={issue.id} value={issue.id}>
                    No. {issue.issueNumber} ({issue.year}) — {issue.title}
                  </option>
                ))}
              </select>
            </label>
            <p className="self-end text-sm text-ink-600">
              {selectedIssue
                ? `Vol. ${selectedIssue.volume}, Issue ${selectedIssue.issueNumber} (${selectedIssue.year})`
                : "Choose a volume and issue"}
            </p>
            <label>
              Pages
              <span className="mt-1 flex gap-2">
                <input className={inputClass} value={firstPage} onChange={(e) => setFirstPage(e.target.value)} placeholder="First" />
                <input className={inputClass} value={lastPage} onChange={(e) => setLastPage(e.target.value)} placeholder="Last" />
              </span>
            </label>
            <label>
              Publication date
              <input className={inputClass} type="date" value={publicationDate} onChange={(e) => setPublicationDate(e.target.value)} />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              DOI
              <input className={inputClass} value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.xxxx/xxxxx" required />
            </label>
            <p className="text-sm text-ink-600">Required for publication. Registered with Crossref when the article is published.</p>
            <label className="block">
              EDAS Paper ID
              <input className={inputClass} value={edasPaperId} onChange={(e) => setEdasPaperId(e.target.value)} />
            </label>
            <p className="text-sm text-ink-600">
              EDAS records submission, review, and decision for this paper ID. PostgreSQL keeps the journal metadata;
              file storage keeps PDFs and images.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="rounded border px-3 py-2 text-sm"
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    const result = await api<{ paper: { paperId: string; status?: string; stage?: string } | null }>(
                      `/api/edas/papers?paperId=${encodeURIComponent(edasPaperId)}`,
                    );
                    setEdasStatus(
                      result.paper
                        ? `${result.paper.paperId} · ${result.paper.stage ?? "lookup"} · ${result.paper.status ?? "unknown"}`
                        : "No EDAS record found",
                    );
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "EDAS lookup failed");
                  }
                }}
              >
                Look up in EDAS
              </button>
              {edasStatus ? <span className="text-sm text-ink-700">{edasStatus}</span> : null}
            </div>
            <label className="block">
              ISSN (print)
              <input className={inputClass} readOnly value={journal?.issnPrint || "Not set on journal"} />
            </label>
            <label className="block">
              ISSN (online)
              <input className={inputClass} readOnly value={journal?.issnOnline || "Not set on journal"} />
            </label>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-6 space-y-4">
            {(
              [
                ["FINAL_PDF", "Final PDF", "application/pdf"],
                ["SUPPLEMENTARY", "Supplementary file", undefined],
                ["THUMBNAIL", "Thumbnail", "image/png,image/jpeg,image/webp"],
              ] as const
            ).map(([fileType, label, accept]) => (
              <label key={fileType} className="block">
                {label}
                <input
                  className={inputClass}
                  type="file"
                  accept={accept}
                  onChange={(e) => e.target.files?.[0] && upload(fileType, e.target.files[0]).catch((err) => setError(err.message))}
                />
                <span className="mt-1 block text-sm text-ink-600">
                  {fileFor(article, fileType)?.originalName ?? "No file uploaded"}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              Keywords
              <textarea
                className={inputClass}
                rows={3}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Comma-separated keywords"
              />
            </label>
            <label className="block">
              References
              <textarea
                className={inputClass}
                rows={10}
                value={references}
                onChange={(e) => setReferences(e.target.value)}
                placeholder="One per line: text | DOI | URL"
              />
            </label>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="mt-6">
            {blockers.length ? (
              <div className="mb-6 rounded border border-crimson-200 bg-crimson-50 p-4 text-sm text-crimson-700">
                <p className="font-medium">Publication checks</p>
                <ul className="mt-2 list-disc pl-5">
                  {blockers.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mb-6 text-sm text-ink-600">This article meets the publication requirements.</p>
            )}
            {!canPublishNow && article.status !== "PUBLISHED" ? (
              <p className="mb-6 text-sm text-ink-600">
                {isReadyToSchedule(article.status)
                  ? "Schedule the article on an issue, then publish."
                  : "Publish is available after EDAS acceptance, complete metadata, PDF, and DOI."}
              </p>
            ) : null}
            <div className="rounded border bg-paper p-6">
              <ArticleView article={article as unknown as ScholarArticle} preview />
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <button
            className="rounded border px-4 py-2 disabled:opacity-40"
            type="button"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Back
          </button>
          <div className="flex flex-wrap gap-2">
            {step < STEPS.length - 1 ? (
              <button className="rounded bg-ink-950 px-4 py-2 text-white" type="button" onClick={() => void goNext()}>
                Next
              </button>
            ) : canPublishNow ? (
              <button
                className="rounded bg-crimson-700 px-4 py-2 text-white"
                type="button"
                onClick={() => changeStatus("PUBLISHED")}
              >
                Publish
              </button>
            ) : canScheduleNow ? (
              <button className="rounded bg-ink-950 px-4 py-2 text-white" type="button" onClick={() => changeStatus("SCHEDULED")}>
                Schedule
              </button>
            ) : article.status === "PUBLISHED" ? (
              <p className="self-center text-sm text-ink-600">This article is published.</p>
            ) : (
              <button className="rounded bg-ink-950 px-4 py-2 text-white" type="button" onClick={() => void persist().catch(() => undefined)}>
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
