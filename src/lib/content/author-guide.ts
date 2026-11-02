/** SKJEAT Guide for Authors, Version 1.0 (2026). */

export const AUTHOR_GUIDE_META = {
  title: "Guide for Authors",
  version: "Version 1.0 | 2026",
  abbreviation: "SKJEAT",
  journal: "Sultan Kudarat Journal of Education, Agriculture, and Technology",
  pdfHref: "/docs/SKJEAT_Guide_for_Authors_Version_1.0.pdf",
  titlePageHref: "/docs/SKJEAT_File_2_Title_Page_Template.docx",
  manuscriptHref: "/docs/SKJEAT_File_3_Anonymous_Manuscript_Template.docx",
};

export const AUTHOR_GUIDE_FACTS = [
  { label: "Publisher", value: "Sultan Kudarat State University" },
  { label: "Frequency", value: "Biannual — June and December" },
  { label: "Model", value: "Open access, peer reviewed, double-blind" },
  { label: "Fees", value: "No submission or publication fee" },
  { label: "References", value: "APA 7th edition" },
  { label: "Abstract", value: "Up to 250 words for research articles" },
  { label: "Keywords", value: "3–5 specific terms" },
] as const;

export const AUTHOR_FILE_PACKAGE = [
  {
    file: "File 1 — Cover Letter",
    required: true,
    visibility: "Editorial team only",
    content:
      "Manuscript title, article type, originality and exclusivity statement, research problem, contribution, relevance to SKJEAT, ethics, conflicts, funding, confirmation that all authors approved, and the corresponding author’s contact details.",
  },
  {
    file: "File 2 — Title Page",
    required: true,
    visibility: "Editorial team only",
    href: AUTHOR_GUIDE_META.titlePageHref,
    download: "SKJEAT_File_2_Title_Page_Template.docx",
    content:
      "Article type, full title, author names, affiliations, ORCID iDs, corresponding author, email, keywords, funding, conflict of interest, ethics, data availability, and AI-use disclosure. Submit this file separately from the anonymous manuscript.",
  },
  {
    file: "File 3 — Anonymous Manuscript",
    required: true,
    visibility: "Reviewers and editorial team",
    href: AUTHOR_GUIDE_META.manuscriptHref,
    download: "SKJEAT_File_3_Anonymous_Manuscript_Template.docx",
    content:
      "The main manuscript with author names, affiliations, identifying acknowledgments, and self-identifying statements removed. Check document properties so author metadata is not stored in the file.",
  },
  {
    file: "File 4 — Supplementary Materials",
    required: false,
    visibility: "Authorized users according to file type",
    content:
      "Additional tables or figures, instruments, datasets, code, protocols, appendices, or technical documentation, only when they support the manuscript.",
  },
] as const;

export const AUTHOR_ARTICLE_TYPES = [
  {
    type: "Research Articles",
    detail:
      "Original empirical, theoretical, experimental, qualitative, quantitative, mixed-methods, developmental, or design-based research.",
  },
  {
    type: "Review Articles",
    detail:
      "A critical synthesis that states its scope and search strategy, identifies gaps, and gives implications for future research.",
  },
  {
    type: "Policy Briefs",
    detail: "Evidence translated for decision-makers. Recommended length: 3,000–5,000 words.",
  },
] as const;

export const AUTHOR_PREPARATION = [
  "Write in clear scholarly English unless the Editorial Board authorizes another language.",
  "Use a concise, informative title. Avoid phrases such as “A Study of” or “An Investigation of.”",
  "Research-article abstracts should be no more than 250 words and should cover context, objective, methods, results, and implications. Do not cite sources in the abstract.",
  "Provide 3–5 keywords.",
  "Use APA 7th edition for in-text citations and the reference list. Include a DOI as a URL when one exists.",
  "Place editable tables and publication-quality figures in the manuscript, numbered and cited in the text.",
  "Disclose funding, conflicts of interest, ethics approval, data availability, and generative-AI use where they apply.",
  "The manuscript must be original, not previously published in substantial part, and not under consideration elsewhere.",
] as const;

export const AUTHOR_DECISIONS = [
  { decision: "Accept", detail: "No substantive revision, or only minor production corrections." },
  { decision: "Minor revision", detail: "Limited changes. Recommended deadline: 14 days." },
  { decision: "Major revision", detail: "Substantial changes. The revision may be reviewed again. Recommended deadline: 30 days." },
  { decision: "Reject and resubmit", detail: "Extensive changes would be required before a new submission could be considered." },
  { decision: "Reject", detail: "The manuscript is not suitable for SKJEAT." },
] as const;

export const AUTHOR_GUIDE_CHECKLIST = [
  "The manuscript is within SKJEAT’s scope and the article type matches its structure.",
  "The work is original, unpublished, and not under consideration elsewhere.",
  "All authors meet authorship criteria, approved the manuscript, and agreed the author order.",
  "The corresponding author is identified.",
  "Ethics approval, informed consent, and participant confidentiality are addressed where required.",
  "Abstract, keywords, methods, results, discussion, and conclusion meet the guide.",
  "Every citation appears in the reference list, and every reference is cited.",
  "Funding, conflicts, ethics, AI use, and data availability are disclosed as applicable.",
  "The anonymous manuscript contains no author names or identifying statements.",
  "Cover letter, title page, and supplementary files (if any) are prepared as separate files.",
] as const;

export const AUTHOR_GUIDE_CONTACTS = [
  {
    role: "Editor-in-Chief",
    name: "Cyril John A. Domingo, PhD",
    email: "editorinchief-skrjet@sksu.edu.ph",
  },
  {
    role: "Managing Editor",
    name: "Amira Mae Castromayor-Gumanoy, PhD",
    email: "managingeditor-skrjet@sksu.edu.ph",
  },
] as const;
