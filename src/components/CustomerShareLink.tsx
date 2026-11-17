"use client";
import {useState} from "react";
import {Globe2,Languages,Share2,Check} from "lucide-react";
import {STOREFRONT_LANGUAGES} from "@/lib/storefront-translations";
import {STOREFRONT_MARKETS,getLanguage,getMarket,type PlugLanguage,type PlugMarket} from "@/lib/storefront-config";

export default function CustomerShareLink(){
 const[language,setLanguage]=useState<PlugLanguage>("en");
 const[marketCode,setMarketCode]=useState<PlugMarket>("BW");
 const[notice,setNotice]=useState("");
 const[shared,setShared]=useState(false);
 const market=getMarket(marketCode);
 const languageLabel=STOREFRONT_LANGUAGES.find(item=>item.code===language)?.nativeName??"English";
 async function share(){
  const url=new URL("/account",window.location.origin);
  url.searchParams.set("newRequest","1");
  url.searchParams.set("lang",language);
  url.searchParams.set("currency",market.currency);
  url.searchParams.set("market",market.code);
  const link=url.toString();
  try{
   if(navigator.share){await navigator.share({title:"The Plug · My Plug",text:"Open The Plug to send your sourcing request.",url:link});}
   else{await navigator.clipboard.writeText(link);}
   setShared(true);
   setNotice((navigator.share?"Customer link shared":"Customer link copied")+" · "+market.name+" · "+market.currency+" · "+languageLabel);
  }catch(error){
   if(error instanceof Error&&error.name==="AbortError")return;
   setNotice("Sharing is unavailable in this browser. Copy this link: "+link);
  }
 }
 return <section className="plugCustomerShare" aria-label="Share configured customer link">
  <header className="plugCustomerShareHeader">
   <div className="plugCustomerShareIcon"><Share2 size={18} aria-hidden="true"/></div>
   <div><span className="kicker">CUSTOMER INVITE</span><strong>Prepare a My Plug invite</strong><small>Set the customer’s language and market. Their matching currency is included automatically.</small></div>
  </header>
  <div className="plugCustomerShareControls">
   <label><span><Languages size={14} aria-hidden="true"/> Language</span><select value={language} onChange={event=>{setLanguage(getLanguage(event.target.value));setShared(false)}}>{STOREFRONT_LANGUAGES.map(item=><option key={item.code} value={item.code}>{item.nativeName}</option>)}</select></label>
   <label><span><Globe2 size={14} aria-hidden="true"/> Country / market</span><select value={marketCode} onChange={event=>{setMarketCode(getMarket(event.target.value).code);setShared(false)}}>{STOREFRONT_MARKETS.map(item=><option key={item.code} value={item.code}>{item.flag} {item.name} · {item.currency}</option>)}</select></label>
  </div>
  <div className="plugCustomerShareSummary"><span><small>INVITE SETTINGS</small><strong>{market.flag} {market.name}</strong></span><span><small>LANGUAGE</small><strong>{languageLabel}</strong></span><span><small>CURRENCY</small><strong>{market.currency} · {market.currencyLabel}</strong></span></div>
  <button type="button" className="button buttonPrimary plugCustomerShareButton" onClick={()=>void share()}>{shared?<Check size={17} aria-hidden="true"/>:<Share2 size={17} aria-hidden="true"/>}{shared?"Share again":"Share customer link"} <span aria-hidden="true">↗</span></button>
  {notice&&<p className="plugCustomerShareNotice" role="status">{notice}</p>}
 </section>;
}
