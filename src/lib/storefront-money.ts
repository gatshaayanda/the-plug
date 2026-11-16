"use client";
import {useEffect,useState} from "react";
import {DEFAULT_PREFERENCES,PREFERENCES_EVENT,readStorefrontPreferences,type StorefrontPreferences} from "@/components/StorefrontPreferences";
type RateResponse={result?:string;base_code?:string;time_last_update_utc?:string;rates?:Record<string,number>};
type CachedRates={savedAt:number;updatedAt:string;rates:Record<string,number>};
const CACHE_KEY="theplug:fx-bwp-v1";
const PROVIDER_URL="https://open.er-api.com/v6/latest/BWP";
const SUPPORTED=["BWP","ZAR","NAD","GBP","USD","CAD","EUR"] as const;
function readCache():CachedRates|null{try{const value=JSON.parse(localStorage.getItem(CACHE_KEY)||"null") as CachedRates|null;if(!value||!value.rates||typeof value.savedAt!=="number"||typeof value.updatedAt!=="string")return null;return value;}catch{return null;}}
let sharedRateRequest:Promise<CachedRates|null>|null=null;
function loadRates():Promise<CachedRates|null>{
 if(!sharedRateRequest)sharedRateRequest=fetch(PROVIDER_URL,{cache:"no-store"}).then(response=>{if(!response.ok)throw new Error("Rate service unavailable");return response.json() as Promise<RateResponse>;}).then(data=>{
  if(data.result!=="success"||data.base_code!=="BWP"||!data.rates)throw new Error("BWP rates unavailable");
  const selected:Record<string,number>={BWP:1};for(const code of SUPPORTED){const rate=data.rates[code];if(typeof rate==="number"&&Number.isFinite(rate)&&rate>0)selected[code]=rate;}
  const next={savedAt:Date.now(),updatedAt:data.time_last_update_utc||new Date().toISOString(),rates:selected};
  try{localStorage.setItem(CACHE_KEY,JSON.stringify(next));}catch{/* Conversion remains available for this session. */}
  return next;
 }).catch(()=>null);
 return sharedRateRequest;
}
function format(amount:number,currency:string){return new Intl.NumberFormat(undefined,{style:"currency",currency,maximumFractionDigits:2}).format(amount);}
export function usePlugDisplayPrice(amount:number){
 const [prefs,setPrefs]=useState<StorefrontPreferences>(DEFAULT_PREFERENCES);
 const [rates,setRates]=useState<CachedRates|null>(null);
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const apply=()=>setPrefs(readStorefrontPreferences());
  apply();window.addEventListener(PREFERENCES_EVENT,apply);
  const cached=readCache();if(cached)setRates(cached);
  const fresh=cached&&Date.now()-cached.savedAt<20*60*60*1000;
  if(!fresh&&navigator.onLine){
   let active=true;
   void loadRates().then(next=>{if(!active)return;if(next){setRates(next);setFailed(false);}else setFailed(true);});
   return()=>{active=false;window.removeEventListener(PREFERENCES_EVENT,apply);};
  }
  return()=>window.removeEventListener(PREFERENCES_EVENT,apply);
 },[]);
 const currency=prefs.currency;
 if(currency==="BWP")return {text:format(amount,"BWP"),currency,estimate:undefined,rateDate:undefined,sourceText:"Original BWP price"};
 const rate=rates?.rates[currency];
 if(typeof rate==="number")return {text:format(amount*rate,currency),currency,estimate:format(amount,"BWP"),rateDate:rates?.updatedAt,sourceText:"Indicative estimate · Rates by ExchangeRate-API"};
 return {text:format(amount,"BWP"),currency:"BWP",estimate:undefined,rateDate:undefined,sourceText:failed?"Currency estimate unavailable · showing original BWP price":"Checking reference rate · showing original BWP price"};
}
