"use client";
import {useEffect,useState} from "react";
import {Globe2,Languages} from "lucide-react";
import {DEFAULT_LANGUAGE,DEFAULT_MARKET,getLanguage,getMarket,STOREFRONT_MARKETS,type PlugLanguage,type PlugMarket} from "@/lib/storefront-config";
import {STOREFRONT_LANGUAGES,useStorefrontText} from "@/lib/storefront-translations";
export type {PlugLanguage,PlugMarket} from "@/lib/storefront-config";
type Preferences={market:PlugMarket;language:PlugLanguage};
const KEY="theplug:storefront-preferences:v1",EVENT="theplug:storefront-preferences-changed";
const DEFAULT={market:DEFAULT_MARKET,language:DEFAULT_LANGUAGE} as Preferences;
function read():Preferences{try{const v=JSON.parse(localStorage.getItem(KEY)||"null") as {market?:string;language?:string}|null;return v?{market:getMarket(v.market).code,language:getLanguage(v.language)}:DEFAULT;}catch{return DEFAULT;}}
export default function StorefrontPreferencesBar(){const[value,setValue]=useState<Preferences>(DEFAULT);const{t}=useStorefrontText();useEffect(()=>setValue(read()),[]);function update(patch:Partial<Preferences>){const next={...value,...patch};setValue(next);try{localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new CustomEvent(EVENT,{detail:next}));}catch{/* optional preference */}}const market=getMarket(value.market);return <div className="plugPreferenceBar" aria-label="Store preferences"><label className="plugPreferenceControl"><Globe2 size={14} aria-hidden="true"/><span>{t("market")}</span><select aria-label="Sourcing market" value={value.market} onChange={e=>update({market:getMarket(e.target.value).code})}>{STOREFRONT_MARKETS.map(m=><option key={m.code} value={m.code}>{m.flag} {m.name} · {m.currency}</option>)}</select><b>{market.flag} {market.currency}</b></label><label className="plugPreferenceControl"><Languages size={14} aria-hidden="true"/><span>{t("language")}</span><select aria-label="Display language" value={value.language} onChange={e=>update({language:getLanguage(e.target.value)})}>{STOREFRONT_LANGUAGES.map(l=><option key={l.code} value={l.code}>{l.nativeName}</option>)}</select></label><small>{t("priceNote")}</small></div>}
