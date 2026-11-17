"use client";
import {useState} from "react";

const languages=[{code:"en",label:"English"},{code:"tn",label:"Setswana"}];
const markets=[
 {code:"BW",label:"🇧🇼 Botswana",currency:"BWP",currencyLabel:"Botswana pula · P"},
 {code:"ZA",label:"🇿🇦 South Africa",currency:"ZAR",currencyLabel:"South African rand · R"},
 {code:"NA",label:"🇳🇦 Namibia",currency:"NAD",currencyLabel:"Namibian dollar · $"},
 {code:"GB",label:"🇬🇧 United Kingdom",currency:"GBP",currencyLabel:"British pound · £"},
 {code:"US",label:"🇺🇸 United States",currency:"USD",currencyLabel:"US dollar · $"},
 {code:"CA",label:"🇨🇦 Canada",currency:"CAD",currencyLabel:"Canadian dollar · $"},
];

export default function CustomerShareLink(){
 const[language,setLanguage]=useState("en"),[marketCode,setMarketCode]=useState("BW"),[notice,setNotice]=useState("");
 const market=markets.find(item=>item.code===marketCode)??markets[0];
 async function share(){
  const url=new URL("/account",window.location.origin);url.searchParams.set("newRequest","1");url.searchParams.set("lang",language);url.searchParams.set("currency",market.currency);url.searchParams.set("market",market.code);
  const link=url.toString();
  try{if(navigator.share){await navigator.share({title:"The Plug · My Plug",text:"Open The Plug to send your sourcing request.",url:link});setNotice("Customer link shared for "+market.label+" · "+market.currency+".");return;}await navigator.clipboard.writeText(link);setNotice("Customer link copied for "+market.label+" · "+market.currency+".");}
  catch(error){if(error instanceof Error&&error.name==="AbortError")return;setNotice("Sharing is unavailable here. Copy this link: "+link)}
 }
 return <section className="plugCustomerShare" aria-label="Share configured customer link"><div><span className="kicker">CUSTOMER INVITE</span><strong>Send a configured My Plug link</strong><small>Choose the customer’s country. The matching currency travels with the link so they open the right request experience.</small></div><div className="plugCustomerShareControls"><label>Language<select value={language} onChange={event=>setLanguage(event.target.value)}>{languages.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}</select></label><label>Country<select value={marketCode} onChange={event=>setMarketCode(event.target.value)}>{markets.map(item=><option key={item.code} value={item.code}>{item.label} · {item.currency}</option>)}</select></label><div className="plugCustomerCurrency" aria-live="polite"><small>Matching currency</small><strong>{market.currencyLabel}</strong></div><button type="button" className="button buttonPrimary" onClick={()=>void share()}>Share customer link ↗</button></div>{notice&&<p className="orderTruth" role="status">{notice}</p>}</section>
}
