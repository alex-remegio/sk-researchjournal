/** Official SKJEAT journal copy from the Guide for Authors, Version 1.0 (2026). */

export const SKRJET_ABOUT_INTRO = `The Sultan Kudarat Journal of Education, Agriculture, and Technology (SKJEAT) is the official biannual, peer-reviewed academic publication of Sultan Kudarat State University (SKSU).

The journal provides a scholarly platform for high-quality research in education, agriculture, food and agricultural systems, technology, and related interdisciplinary fields. SKJEAT seeks to promote research and innovation that address contemporary challenges in education, agricultural productivity and sustainability, food security, rural development, technological advancement, and inclusive sustainable development.

SKJEAT uses double-blind peer review. Manuscripts that pass initial editorial screening are evaluated by at least two independent experts for originality, methodological rigor, significance, clarity, and scholarly contribution. There is no submission or publication charge, and published articles are intended to be openly accessible.`;

export const SKRJET_AIMS = [
  "Encourage interdisciplinary collaboration and knowledge sharing.",
  "Publish innovative, evidence-based research contributing to education, agriculture, and technology development.",
  "Provide a venue for theoretical and applied research that informs policy, practice, and pedagogy.",
  "Showcase the research capabilities of local, national, and international scholars.",
];

export const SKRJET_SCOPE = [
  {
    title: "Education, learning, and pedagogy",
    body: "Curriculum, instruction, assessment, teacher education, inclusive education, and educational policy.",
  },
  {
    title: "Science, mathematics, and health sciences education",
    body: "Inquiry-based learning, STEM, health and nutrition education, and science communication.",
  },
  {
    title: "Language, culture, humanities, and social studies",
    body: "Language and literature, Philippine history, indigenous knowledge, and cultural heritage.",
  },
  {
    title: "Educational management, leadership, and entrepreneurship",
    body: "Governance, quality assurance, institutional innovation, and university–community partnerships.",
  },
  {
    title: "Livelihood, technical-vocational, and industrial technology education",
    body: "Skills development, employability, entrepreneurship, and technology and livelihood education.",
  },
  {
    title: "Information and communication technology and digital innovation",
    body: "Educational technology, artificial intelligence, learning analytics, and digital learning environments.",
  },
  {
    title: "Applied science, technology, and community innovation",
    body: "Applied research, climate resilience, renewable energy, and community-based innovation.",
  },
  {
    title: "Agriculture, food systems, and rural development",
    body: "Crop and animal science, fisheries, food technology, agricultural extension, and rural livelihoods.",
  },
  {
    title: "Interdisciplinary and transdisciplinary research",
    body: "Work that connects education, science, technology, culture, management, and community development.",
  },
];

export const SKRJET_ARTICLE_TYPES = [
  "Research Articles: original empirical, theoretical, qualitative, quantitative, mixed-methods, developmental, or design-based research.",
  "Review Articles: critical, analytical syntheses of existing scholarly literature.",
  "Policy Briefs: concise, actionable translations of research evidence, normally 3,000–5,000 words.",
];

export const SKRJET_PEER_REVIEW =
  "Submitted manuscripts undergo initial editorial screening, then double-blind peer review by at least two independent experts. Reviewers do not see author identities, and authors do not see reviewer identities. Decisions may be accept, minor revision, major revision, reject and resubmit, or reject. Authors must disclose conflicts of interest, funding, ethics approval where required, and the use of generative artificial intelligence.";

export const SKRJET_FREQUENCY =
  "SKJEAT is published twice a year, in June and December. There is no submission or publication fee, and articles are published open access.";

export const SKRJET_INDEPENDENCE =
  "Manuscripts are evaluated on scholarly merit rather than institutional affiliation, nationality, or background, consistent with the journal’s commitment to academic freedom, equity, and diversity.";

export const SKRJET_SPONSOR =
  "The Sultan Kudarat Journal of Education, Agriculture, and Technology (SKJEAT) is published by Sultan Kudarat State University, with institutional support from the Office of the Vice President for Research, Extension, and Innovation.";

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
    name: "Cyril John A. Domingo, PhD",
    title: "Editor-in-Chief",
    affiliation: "Sultan Kudarat State University",
    email: "editorinchief-skrjet@sksu.edu.ph",
    sortOrder: 1,
  },
  {
    name: "Amira Mae Castromayor-Gumanoy, PhD",
    title: "Managing Editor",
    affiliation: "Sultan Kudarat State University",
    email: "managingeditor-skrjet@sksu.edu.ph",
    sortOrder: 2,
  },
  {
    name: "Adrian V. Protacio, PhD",
    title: "Section Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 3,
  },
  {
    name: "Fahad Salendab, PhD",
    title: "Section Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 4,
  },
  {
    name: "Doreen B. Tampus, PhD",
    title: "Section Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 5,
  },
  {
    name: "Vincent Louie D. Cabelin, PhD",
    title: "Section Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 6,
  },
  {
    name: "Maricel L. Amit, PhD",
    title: "Section Editor",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 7,
  },
  {
    name: "Atty. Cyrus E. Torreña, MNSA, DPA",
    title: "Consultant — University President",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 8,
  },
  {
    name: "Mildred F. Accad, PhD",
    title: "Consultant — Vice President for Research, Extension, and Innovation",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 9,
  },
  {
    name: "Reynaldo H. Dalayap Jr., PhD",
    title: "Consultant — Vice President for Finance, Administration, and Resource Generation",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 10,
  },
  {
    name: "Allan A. Maglantay, PhD",
    title: "Consultant — Vice President for Academic Affairs",
    affiliation: "Sultan Kudarat State University",
    sortOrder: 11,
  },
];
