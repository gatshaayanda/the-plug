export type PlugMarket = "BW" | "ZA" | "NA" | "GB" | "US" | "CA";
export type PlugCurrency = "BWP" | "ZAR" | "NAD" | "GBP" | "USD" | "CAD";
export type PlugLanguage = "en" | "tn" | "af" | "fr";

export type StorefrontMarket = {
  code: PlugMarket;
  name: string;
  flag: string;
  currency: PlugCurrency;
  currencyLabel: string;
  languages: readonly PlugLanguage[];
};

export const STOREFRONT_MARKETS: readonly StorefrontMarket[] = [
  { code: "BW", name: "Botswana", flag: "🇧🇼", currency: "BWP", currencyLabel: "Pula", languages: ["en", "tn", "af", "fr"] },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", currencyLabel: "Rand", languages: ["en", "tn", "af", "fr"] },
  { code: "NA", name: "Namibia", flag: "🇳🇦", currency: "NAD", currencyLabel: "Namibian dollar", languages: ["en", "tn", "af", "fr"] },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", currencyLabel: "Pound sterling", languages: ["en", "tn", "af", "fr"] },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", currencyLabel: "US dollar", languages: ["en", "tn", "af", "fr"] },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", currencyLabel: "Canadian dollar", languages: ["en", "tn", "af", "fr"] },
] as const;

export const STOREFRONT_LANGUAGES: readonly { code: PlugLanguage; label: string; nativeName: string }[] = [
  { code: "en", label: "English", nativeName: "English" },
];

export const DEFAULT_MARKET: PlugMarket = "BW";
export const DEFAULT_LANGUAGE: PlugLanguage = "en";

export function getMarket(code: string | undefined): StorefrontMarket {
  return STOREFRONT_MARKETS.find((market) => market.code === code) ?? STOREFRONT_MARKETS[0];
}

export function getLanguage(code: string | undefined): PlugLanguage {
  return STOREFRONT_LANGUAGES.some((language) => language.code === code)
    ? (code as PlugLanguage)
    : DEFAULT_LANGUAGE;
}
