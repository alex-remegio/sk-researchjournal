/** Safe for client and server — no secrets. */
export const BRAND_NAME =
  "Sultan Kudarat Journal of Education, Agriculture, and Technology (SKJEAT)";
export const BRAND_SHORT = "SKJEAT";
export const BRAND_FULL =
  "Sultan Kudarat Journal of Education, Agriculture, and Technology";
export const BRAND_PUBLISHER = "Sultan Kudarat State University";
export const BRAND_TAGLINE =
  "Peer-reviewed research in education, agriculture, and technology.";
export const BRAND_MOBILE_TAGLINE = "Education • Agriculture • Technology";
export const BRAND_LOGO = "/brand/skjeat-logo.png";
export const BRAND_HERO = "/brand/skrjet-hero.jpg";

export const BRAND_CONTACT = {
  address: "EJC Montilla, Tacurong City, 9800, Philippines",
  phone: "(064) 200 7336",
  email: "info@sksu.edu.ph",
  website: "https://sksu.edu.ph",
  websiteLabel: "sksu.edu.ph",
};

export const BRAND_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/journals/skrjet/about" },
  { label: "Current Issue", href: "/journals/skrjet/current" },
  { label: "Archives", href: "/journals/skrjet/archive" },
  { label: "Board", href: "/journals/skrjet/board" },
  { label: "Submissions", href: "/journals/skrjet/for-authors" },
  { label: "Guidelines", href: "/journals/skrjet/editorial-workflow" },
  { label: "Contact", href: "/#contact" },
  { label: "Login", href: "/login" },
] as const;
