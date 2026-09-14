/** Safe for client and server — no secrets. */
export const BRAND_NAME =
  "Sultan Kudarat Research Journal of Education and Technology (SKRJET)";
export const BRAND_SHORT = "SKRJET";
export const BRAND_FULL =
  "Sultan Kudarat Research Journal of Education and Technology";
export const BRAND_PUBLISHER = "Sultan Kudarat State University";
export const BRAND_TAGLINE =
  "Advancing scholarly innovation through research, education, and technology.";
export const BRAND_MOBILE_TAGLINE = "Research • Education • Technology";
export const BRAND_LOGO = "/brand/skrjet-logo.png";
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
  { label: "Submissions", href: "/journals/skrjet/for-authors" },
  { label: "Contact", href: "/#contact" },
] as const;
