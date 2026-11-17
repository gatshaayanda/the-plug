"use client";
import {useState} from "react";

const languages=[{code:"en",label:"English"},{code:"tn",label:"Setswana"}];
const currencies=[{code:"BWP",label:"Botswana pula · P"},{code:"ZAR",label:"South African rand · R"},{code:"USD",label:"US dollar · $"},{code:"GBP",label:"British pound · £"},{code:"EUR",label:"Euro · €"}];

export default function CustomerShareLink(){
 const[language,setLanguage]=useState("en"),[currency,setCurrency]=useState("BWP"),[notice,setNotice]=useState("");
 async function share(){
  const url=new URL("/account",window.location.origin);url.searchParams.set("newRequest","1");url.searchParams.set("lang",language);url.searchParams.set("currency",currency);
  const link=url.toString();
  try{if(navigator.share){await navigator.share({title:"The Plug · My Plug",text:"Open The Plug to send your sourcing request.",url:link});setNotice("Customer link shared with "+languages.find(x=>x.code===language)?.label+" and "+currency+" preferences.");return;}await navigator.clipboard.writeText(link);setNotice("Customer link copied with "+languages.find(x=>x.code===language)?.label+" and "+currency+" preferences.");}
  catch(error){if(error instanceof Error&&error.name==="AbortError")return;setNotice("Sharing is unavailable here. Copy this link: "+link)}
 }
 return <section className="plugCustomerShare" aria-label="Share configured customer link"><div><span className="kicker">CUSTOMER INVITE</span><strong>Send a configured My Plug link</strong><small>Language and currency travel with the link so the customer opens the right request experience.</small></div><div className="plugCustomerShareControls"><label>Language<select value={language} onChange={event=>setLanguage(event.target.value)}>{languages.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}</select></label><label>Currency<select value={currency} onChange={event=>setCurrency(event.target.value)}>{currencies.map(item=><option key={item.code} value={item.code}>{item.label}</option>)}</select></label><button type="button" className="button buttonPrimary" onClick={()=>void share()}>Share customer link ↗</button></div>{notice&&<p className="orderTruth" role="status">{notice}</p>}</section>
}
