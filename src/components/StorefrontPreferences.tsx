"use client";
import {useEffect,useState} from "react";

export type PlugMarket="BW"|"ZA"|"NA"|"GB"|"US"|"CA";
export type PlugCurrency="BWP"|"ZAR"|"NAD"|"GBP"|"USD"|"CAD"|"EUR";
export type PlugLanguage="en";
export type StorefrontPreferences={market:PlugMarket;currency:PlugCurrency;language:PlugLanguage};
export const PREFERENCES_KEY="theplug:storefront-preferences:v1";
export const PREFERENCES_EVENT="theplug:storefront-preferences-changed";
export const DEFAULT_PREFERENCES:StorefrontPreferences={market:"BW",currency:"BWP",language:"en"};
export const MARKET_OPTIONS=[
 {code:"BW" as const,name:"Botswana",currency:"BWP" as const},
 {code:"ZA" as const,name:"South Africa",currency:"ZAR" as const},
 {code:"NA" as const,name:"Namibia",currency:"NAD" as const},
 {code:"GB" as const,name:"United Kingdom",currency:"GBP" as const},
 {code:"US" as const,name:"United States",currency:"USD" as const},
 {code:"CA" as const,name:"Canada",currency:"CAD" as const}
];
export const CURRENCY_OPTIONS:PlugCurrency[]=["BWP","ZAR","NAD","GBP","USD","CAD","EUR"];
export function readStorefrontPreferences():StorefrontPreferences{
 try{const value=JSON.parse(localStorage.getItem(PREFERENCES_KEY)||"null") as Partial<StorefrontPreferences>|null;
 if(!value)return DEFAULT_PREFERENCES;
 return {market:MARKET_OPTIONS.some(x=>x.code===value.market)?value.market as PlugMarket:"BW",currency:CURRENCY_OPTIONS.includes(value.currency as PlugCurrency)?value.currency as PlugCurrency:"BWP",language:"en"};
 }catch{return DEFAULT_PREFERENCES;}
}
export function saveStorefrontPreferences(value:StorefrontPreferences){
 try{localStorage.setItem(PREFERENCES_KEY,JSON.stringify(value));window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT,{detail:value}));}catch{/* Preferences are optional; defaults remain usable. */}
}
export default function StorefrontPreferences(){
 const [value,setValue]=useState<StorefrontPreferences>(DEFAULT_PREFERENCES);
 useEffect(()=>{setValue(readStorefrontPreferences());},[]);
 function update(patch:Partial<StorefrontPreferences>){const next={...value,...patch};setValue(next);saveStorefrontPreferences(next);}
 return <div className="plugPreferenceBar" aria-label="Store preferences">
  <label><span>REGION</span><select aria-label="Display region" value={value.market} onChange={e=>{const market=MARKET_OPTIONS.find(x=>x.code===e.target.value);if(market)update({market:market.code,currency:market.currency});}}>{MARKET_OPTIONS.map(x=><option key={x.code} value={x.code}>{x.name}</option>)}</select></label>
  <label><span>DISPLAY CURRENCY</span><select aria-label="Display currency" value={value.currency} onChange={e=>update({currency:e.target.value as PlugCurrency})}>{CURRENCY_OPTIONS.map(code=><option key={code} value={code}>{code}</option>)}</select></label>
  <label><span>LANGUAGE</span><select aria-label="Language" value={value.language} disabled><option value="en">English</option></select></label>
  <small>Display preferences only · Frank confirms sourcing and delivery for each request.</small>
 </div>;
}
