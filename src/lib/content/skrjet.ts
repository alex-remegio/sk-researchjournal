/** Official SKRJET journal copy from the founding document. */

export const SKRJET_ABOUT_INTRO = `The Sultan Kudarat Research Journal of Education and Technology (SKRJET) is the official bi-annual, peer-reviewed academic publication of Sultan Kudarat State University (SKSU). It serves as a platform for disseminating high-quality scholarly work across diverse disciplines in education, science, and technology.

SKRJET is committed to advancing research and innovation that address the dynamic challenges in education, social development, and technological progress. The journal adheres to a double-blind peer review process, ensuring that all manuscripts meet the highest standards of academic integrity, methodological rigor, and scholarly contribution.`;

export const SKRJET_AIMS = [
  "Encouraging interdisciplinary collaboration and knowledge sharing;",
  "Publishing innovative, evidence-based research that contributes to education and technology development;",
  "Providing a venue for both theoretical and applied studies that inform policy, practice, and pedagogy; and",
  "Showcasing the research capabilities of local, national, and international scholars.",
];

export const SKRJET_SCOPE = [
  {
    title: "Education and Pedagogy",
    body: "Curriculum innovation, assessment, teacher education, and learning outcomes.",
  },
  {
    title: "Science and Mathematics Education",
    body: "Inquiry-based learning, laboratory instruction, computational methods, and STEM integration.",
  },
  {
    title: "Filipino and Social Studies",
    body: "Language and literature studies, cultural education, Philippine history, and sociocultural development.",
  },
  {
    title: "Management and Entrepreneurship Education",
    body: "Educational leadership, governance, strategic management, and institutional innovation.",
  },
  {
    title: "Livelihood and Technology Education",
    body: "Technical-vocational pedagogy, sustainable livelihood development, and industrial technology innovations.",
  },
  {
    title: "Information and Communication Technology",
    body: "ICT in education, digital transformation, artificial intelligence in learning, and data-driven education.",
  },
];

export const SKRJET_ARTICLE_TYPES = [
  "Research Articles: Original, data-driven studies with clear methodology and findings.",
  "Review Articles: Analytical and integrative reviews of existing literature and research trends.",
  "Policy Briefs",
];

export const SKRJET_PEER_REVIEW =
  "All submitted manuscripts undergo an initial editorial screening followed by a double-blind peer review by at least two independent experts in the relevant field. Reviewers evaluate manuscripts based on originality, methodological rigor, significance, and clarity. Decisions may include acceptance, minor or major revisions, or rejection. SKRJET upholds ethical standards following the COPE (Committee on Publication Ethics) guidelines and requires all authors to declare potential conflicts of interest.";

export const SKRJET_FREQUENCY =
  "SKRJET is published bi-annually (June and December). Submission and publication are free of charge, and all articles are open access to ensure broad dissemination of research outputs.";

export const SKRJET_INDEPENDENCE =
  "The editorial board upholds academic freedom, equity, and diversity in the review and publication process. Manuscripts are evaluated solely on scholarly merit without regard to authors’ institutional affiliation, nationality, or background.";

export const SKRJET_SPONSOR =
  "The Sultan Kudarat Research Journal of Education and Technology (SKRJET) is published by the Sultan Kudarat State University, with support from the Office of the Vice President for Research, Extension, and Innovation.";

export const SKRJET_DESCRIPTION_HTML = `<p>${SKRJET_ABOUT_INTRO.split("\n\n").join("</p><p>")}</p>`;

export type FoundingBoardMember = {
  name: string;
  title: string;
  affiliation: string;
  email?: string;
  sortOrder: number;
  biography?: string;
};

export const SKRJET_FOUNDING_BOARD: FoundingBoardMember[] = [
  {
    name: "Mildred F. Accad, PhD",
    title: "Editor-in-Chief",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 1,
  },
  {
    name: "Cyril John A. Domingo, PhD",
    title: "Managing Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 2,
  },
  {
    name: "Section Editor — Education",
    title: "Section Editor (Education)",
    affiliation: "To be appointed",
    sortOrder: 3,
  },
  {
    name: "Section Editor — Technology",
    title: "Section Editor (Technology)",
    affiliation: "To be appointed",
    sortOrder: 4,
  },
  {
    name: "Charissa De Vera, PhD",
    title: "Reviewer — TLE",
    affiliation: "Pangasinan State University",
    email: "charissadevera@psu.edu.ph",
    sortOrder: 5,
  },
  {
    name: "Aldrin Bonto, PhD",
    title: "Reviewer — Science Education",
    affiliation: "De La Salle University",
    email: "aldrin.bonto@dlsu.edu.ph",
    sortOrder: 6,
  },
  {
    name: "Technical and layout editing",
    title: "Editorial Support Staff",
    affiliation: "Metadata, DOI, and web publication management",
    sortOrder: 7,
    biography: "Role: Technical and layout editing, metadata, DOI, and web publication management.",
  },
  {
    name: "Copy editing and proofreading",
    title: "Editorial Support Staff",
    affiliation: "Reference management",
    sortOrder: 8,
    biography: "Role: Copy editing, proofreading, and reference management.",
  },
  {
    name: "Atty. Cyrus E. Torreña, MNSA, DPA",
    title: "Advisory Board — University President",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 9,
  },
  {
    name: "Alex Remegio, PhD",
    title: "Super Admin",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 10,
  },
];
