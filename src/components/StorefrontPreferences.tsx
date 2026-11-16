"use client";
import { useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  DEFAULT_MARKET,
  getLanguage,
  getMarket,
  STOREFRONT_LANGUAGES,
  STOREFRONT_MARKETS,
  type PlugLanguage,
  type PlugMarket,
} from "@/lib/storefront-config";

export type { PlugLanguage, PlugMarket } from "@/lib/storefront-config";
export type StorefrontPreferences = { market: PlugMarket; language: PlugLanguage };
export const PREFERENCES_KEY = "theplug:storefront-preferences:v1";
export const PREFERENCES_EVENT = "theplug:storefront-preferences-changed";
export const DEFAULT_PREFERENCES: StorefrontPreferences = { market: DEFAULT_MARKET, language: DEFAULT_LANGUAGE };

export function readStorefrontPreferences(): StorefrontPreferences {
  try {
    const value = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || "null") as
      | { market?: string; language?: string; currency?: string }
      | null;
    if (!value) return DEFAULT_PREFERENCES;
    // Older versions stored a separately selectable currency. Market is now authoritative.
    return { market: getMarket(value.market).code, language: getLanguage(value.language) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveStorefrontPreferences(value: StorefrontPreferences) {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: value }));
  } catch {
    // Preferences are optional; defaults remain usable.
  }
}

export default function StorefrontPreferencesBar() {
  const [value, setValue] = useState<StorefrontPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    setValue(readStorefrontPreferences());
  }, []);

  function update(patch: Partial<StorefrontPreferences>) {
    const next = { ...value, ...patch };
    setValue(next);
    saveStorefrontPreferences(next);
  }

  return (
    <div className="plugPreferenceBar" aria-label="Store preferences">
      <label>
        <span>YOUR REGION</span>
        <select
          aria-label="Sourcing region"
          value={value.market}
          onChange={(event) => update({ market: getMarket(event.target.value).code })}
        >
          {STOREFRONT_MARKETS.map((market) => (
            <option key={market.code} value={market.code}>
              {market.flag} {market.name} · {market.currency}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>LANGUAGE</span>
        <select
          aria-label="Display language"
          value={value.language}
          disabled={STOREFRONT_LANGUAGES.length < 2}
          onChange={(event) => update({ language: getLanguage(event.target.value) })}
        >
          {STOREFRONT_LANGUAGES.map((language) => (
            <option key={language.code} value={language.code}>{language.nativeName}</option>
          ))}
        </select>
      </label>
      <small>
        Prices display in the selected region&apos;s currency · Estimates only · Frank confirms sourcing and delivery for each request.
      </small>
    </div>
  );
}
