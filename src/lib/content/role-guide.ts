/** SKRJET Role-Based Guide for Journal Management System — Proposed v1.0 (2026) */

export const ROLE_GUIDE_META = {
  title: "Role-Based Guide for Journal Management System",
  version: "Proposed Version 1.0 | 2026",
  reviewModel: "Double-blind peer review",
  frequency: "Biannual: June and December",
  institution: "Sultan Kudarat State University",
  pdfHref: "/docs/SKRJET_Role-Based_Guide.pdf",
};

export const ROLE_OVERVIEW = [
  {
    role: "Author",
    function: "Submit and revise manuscripts",
    permissions:
      "Create submission, upload files, enter metadata, respond to decisions, track status",
  },
  {
    role: "Reviewer",
    function: "Provide independent scholarly evaluation",
    permissions:
      "Accept/decline invitation, view anonymized manuscript, complete review, submit recommendation",
  },
  {
    role: "Section Editor",
    function: "Manage manuscripts in assigned subject area",
    permissions: "Screen, invite reviewers, monitor reviews, recommend decisions",
  },
  {
    role: "Managing Editor",
    function: "Coordinate editorial operations",
    permissions:
      "Check completeness, manage files/metadata, communicate, monitor workflow, coordinate production",
  },
  {
    role: "Editor-in-Chief",
    function: "Exercise final editorial authority",
    permissions:
      "Assign editors, approve decisions, resolve conflicts, approve publication",
  },
  {
    role: "System Administrator",
    function: "Maintain technical system",
    permissions: "Manage accounts, configuration, backups, and technical support",
  },
] as const;

export const EDITORIAL_WORKFLOW_STEPS = [
  "Author creates account and starts submission.",
  "Author selects article type, enters metadata, accepts declarations, and uploads required files.",
  "Managing Editor conducts technical completeness check.",
  "Editor-in-Chief or Managing Editor assigns Section Editor.",
  "Section Editor conducts scope and preliminary scholarly screening.",
  "Section Editor invites qualified reviewers.",
  "Reviewers accept or decline invitations.",
  "Reviewers submit reports and recommendations.",
  "Section Editor evaluates reports and recommends a decision.",
  "Editor-in-Chief confirms or changes the decision.",
  "Author receives decision letter.",
  "Author submits revision and response to reviewers when required.",
  "Accepted manuscripts proceed to copyediting, layout, proofreading, and publication.",
  "Editor-in-Chief approves the final article or issue.",
] as const;

export const WORKFLOW_PIPELINE =
  "Submission → Technical Check → Editorial Screening → Reviewer Assignment → Peer Review → Editorial Decision → Revision, if required → Acceptance → Production → Publication";

export const FOUR_FILE_PACKAGE = [
  {
    file: "File 1 — Cover Letter",
    content:
      "Originality statement, contribution, ethics, funding, conflicts, and confirmation that all authors approved.",
    visibility: "Editorial team only",
    required: true,
  },
  {
    file: "File 2 — Title Page",
    content:
      "Full title, author names, affiliations, ORCID iDs, corresponding-author details, funding, conflicts, ethics, and identifying information.",
    visibility: "Editorial team only",
    required: true,
  },
  {
    file: "File 3 — Anonymous Manuscript",
    content:
      "Main manuscript without author names, affiliations, acknowledgments, identifying institutional references, or revealing metadata.",
    visibility: "Reviewers and editorial team",
    required: true,
  },
  {
    file: "File 4 — Supplementary Materials",
    content:
      "Datasets, instruments, appendices, additional tables/figures, protocols, code, or supporting files.",
    visibility: "Authorized users according to file type",
    required: false,
  },
] as const;

export const FILE_NAMING = [
  "Surname_CoverLetter.docx",
  "Surname_TitlePage.docx",
  "Anonymous_Manuscript.docx",
  "Surname_Supplementary_01.pdf",
  "Surname_Supplementary_02.xlsx",
] as const;

export const AUTHOR_DECLARATIONS = [
  "Manuscript is original.",
  "Not simultaneously submitted elsewhere.",
  "All authors approved the final version and author order.",
  "Ethical requirements were observed.",
  "Sources are properly cited.",
  "Funding and conflicts are disclosed.",
  "AI use is disclosed where applicable.",
  "Copyright and licensing terms are accepted.",
] as const;

export const AUTHOR_CHECKLIST = [
  "Cover Letter uploaded",
  "Title Page uploaded",
  "Anonymous Manuscript uploaded",
  "Supplementary Materials uploaded, if applicable",
  "Metadata complete",
  "All authors entered in correct order",
  "Corresponding author identified",
  "Ethics, funding, conflict, AI, and data statements completed as applicable",
  "Declarations accepted",
  "Manuscript anonymized",
  "Files readable and correctly named",
] as const;

export const REVIEWER_ACCESS = [
  "Anonymous Manuscript",
  "Relevant supplementary materials",
  "Review guidelines",
  "Review form",
  "Recommendation options",
  "Confidential comments to editor",
  "Comments to author",
  "Annotated manuscript upload, if allowed",
  "Deadline and confirmation",
] as const;

export const REVIEWER_MUST_NOT_SEE = [
  "Author names",
  "Title Page",
  "Cover Letter",
  "Other reviewer identities",
  "Other reviewer reports",
  "Internal editorial notes",
  "Confidential decision discussions",
] as const;

export const REVIEW_CRITERIA = [
  { criterion: "Scope relevance", scale: "Yes / No / Partly" },
  { criterion: "Originality", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "Significance", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "Theory/conceptual grounding", scale: "Excellent / Good / Fair / Poor / N/A" },
  { criterion: "Methodological rigor", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "Ethics", scale: "Satisfactory / Needs clarification / Unsatisfactory / N/A" },
  { criterion: "Results", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "Discussion", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "References", scale: "Excellent / Good / Fair / Poor" },
  { criterion: "Presentation", scale: "Excellent / Good / Fair / Poor" },
  {
    criterion: "Overall recommendation",
    scale: "Accept / Minor Revision / Major Revision / Reject",
  },
] as const;

export const SECTION_EDITOR_DUTIES = [
  "Manage assigned manuscripts.",
  "Assess scope and preliminary quality.",
  "Select qualified reviewers.",
  "Monitor invitations and deadlines.",
  "Evaluate reports.",
  "Request additional review when needed.",
  "Recommend decisions.",
  "Maintain fairness, confidentiality, and integrity.",
] as const;

export const MANAGING_EDITOR_DUTIES = [
  "Manage submission intake and technical completeness.",
  "Maintain records and metadata.",
  "Coordinate communications.",
  "Assign manuscripts as directed.",
  "Check anonymization.",
  "Prepare decision letters.",
  "Coordinate revisions, copyediting, layout, proofreading, and publication.",
  "Maintain issue records.",
] as const;

export const EIC_DUTIES = [
  "Provide editorial leadership.",
  "Approve policies and workflows.",
  "Assign Section Editors.",
  "Ensure fairness and independence.",
  "Make or confirm final decisions.",
  "Resolve conflicts and appeals.",
  "Approve reviewers and editorial appointments.",
  "Approve accepted manuscripts and issues.",
  "Oversee corrections, retractions, and expressions of concern.",
] as const;

export const MANUSCRIPT_STATUSES = [
  ["Draft", "Author has started but not submitted"],
  ["Submitted", "Submission received"],
  ["Technical Check", "Completeness and format are checked"],
  ["Returned for Technical Correction", "Author must correct deficiencies"],
  ["Awaiting Section Editor", "Awaiting assignment"],
  ["Editorial Screening", "Scope and preliminary quality assessment"],
  ["Reviewer Invitation", "Reviewers are being invited"],
  ["Under Review", "Reviews are active"],
  ["Reviews Complete", "Required reports received"],
  ["Decision Pending", "Decision being prepared"],
  ["Revision Required", "Author must revise"],
  ["Revision Submitted", "Revision received"],
  ["Accepted", "Accepted by authorized editor"],
  ["Copyediting", "Language/style editing"],
  ["Layout and Typesetting", "Publication formatting"],
  ["Proofreading", "Proof is being checked"],
  ["Ready for Publication", "Final files approved"],
  ["Published", "Publicly available"],
  ["Rejected", "Will not proceed"],
  ["Withdrawn", "Withdrawn under policy"],
  ["Archived", "Record retained"],
] as const;

export const DOUBLE_BLIND_RULES = [
  "Reviewers never see author names or Title Page.",
  "Authors never see reviewer names unless open review is formally adopted.",
  "Internal notes are never visible to authors or reviewers.",
  "File metadata must be checked.",
  "Editors receive a visibility warning before releasing files.",
  "Visibility overrides require authorization and a recorded reason.",
] as const;

export const AUTHOR_FACING_INSTRUCTIONS = `To submit a manuscript, prepare the following files:
• File 1 — Cover Letter
• File 2 — Title Page
• File 3 — Anonymous Manuscript
• File 4 — Supplementary Materials, if applicable

The Cover Letter and Title Page contain identifying information and are accessible only to the editorial team. The Anonymous Manuscript must not contain author names, affiliations, acknowledgments, or other information that may reveal author identity. Supplementary Materials should be uploaded only when relevant or required.`;
