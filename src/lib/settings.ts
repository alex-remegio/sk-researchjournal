export const SETTING_KEYS = {
  SHOW_PUBLIC_METRICS: "SHOW_PUBLIC_METRICS",
  ALLOW_MULTIPLE_CORRESPONDING_AUTHORS: "ALLOW_MULTIPLE_CORRESPONDING_AUTHORS",
  MAX_PDF_SIZE_MB: "MAX_PDF_SIZE_MB",
  MAX_SUPPLEMENTARY_SIZE_MB: "MAX_SUPPLEMENTARY_SIZE_MB",
  MAX_THUMBNAIL_SIZE_MB: "MAX_THUMBNAIL_SIZE_MB",
  OPEN_ACCESS: "OPEN_ACCESS",
  LICENSE_NAME: "LICENSE_NAME",
  LICENSE_URL: "LICENSE_URL",
  REVIEW_MODE: "REVIEW_MODE",
} as const;

export type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  SHOW_PUBLIC_METRICS: "true",
  ALLOW_MULTIPLE_CORRESPONDING_AUTHORS: "false",
  MAX_PDF_SIZE_MB: "25",
  MAX_SUPPLEMENTARY_SIZE_MB: "50",
  MAX_THUMBNAIL_SIZE_MB: "5",
  OPEN_ACCESS: "true",
  LICENSE_NAME: "CC BY 4.0",
  LICENSE_URL: "https://creativecommons.org/licenses/by/4.0/",
  REVIEW_MODE: "SINGLE_BLIND",
};

export function parseBooleanSetting(value: string | undefined, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "yes";
}
