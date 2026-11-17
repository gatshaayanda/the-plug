"use client";
import {useEffect,useState} from "react";
import {Globe2,Languages,Share2,Check,Eye,SlidersHorizontal} from "lucide-react";
import styles from "./CustomerShareLink.module.css";
import {STOREFRONT_LANGUAGES} from "@/lib/storefront-translations";
import {STOREFRONT_MARKETS,getLanguage,getMarket,type PlugLanguage,type PlugMarket} from "@/lib/storefront-config";
import {readStorefrontPreferences} from "@/components/StorefrontPreferences";

const previewCopy:Record<PlugLanguage,{account:string;action:string;market:string;currency:string}> = {
 en:{account:"Your Plug account",action:"Start a request",market:"Your market",currency:"Your currency"},
 tn:{account:"Akhaonto ya gago ya Plug",action:"Simolola kopo",market:"Mmaraka wa gago",currency:"Madi a gago"},
 af:{account:"Jou Plug-rekening",action:"Begin 'n versoek",market:"Jou mark",currency:"Jou geldeenheid"},
 fr:{account:"Votre compte Plug",action:"Commencer une demande",market:"Votre marché",currency:"Votre devise"},
};

export default function CustomerShareLink(){
 const[language,setLanguage]=useState<PlugLanguage>("en");
 const[marketCode,setMarketCode]=useState<PlugMarket>("BW");
 const[notice,setNotice]=useState("");
 const[shared,setShared]=useState(false);
 useEffect(()=>{const saved=readStorefrontPreferences();setLanguage(saved.language);setMarketCode(saved.market)},[]);
 const market=getMarket(marketCode);
 const languageLabel=STOREFRONT_LANGUAGES.find(item=>item.code===language)?.nativeName??"English";
 const preview=previewCopy[language]??previewCopy.en;
 async function share(){
  const url=new URL("/account",window.location.origin);
  url.searchParams.set("newRequest","1");
  url.searchParams.set("lang",language);
  url.searchParams.set("currency",market.currency);
  url.searchParams.set("market",market.code);
  const link=url.toString();
  const usedNativeShare=typeof navigator.share === "function";
  try{
   if(usedNativeShare){await navigator.share({title:"The Plug · My Plug",text:"Open The Plug to send your sourcing request.",url:link});}
   else{await navigator.clipboard.writeText(link);}
   setShared(true);
   setNotice((usedNativeShare?"Customer link shared":"Customer link copied")+" · "+market.name+" · "+market.currency+" · "+languageLabel);
  }catch(error){
   if(error instanceof Error&&error.name==="AbortError")return;
   setNotice("Sharing is unavailable in this browser. Copy this link: "+link);
  }
 }
 return <details className="plugCustomerShare">
  <summary className={styles.collapsedHeader}>
   <span className={styles.collapsedIcon}><Share2 size={17} aria-hidden="true"/></span>
   <span className={styles.collapsedCopy}><span className="kicker">CUSTOMER INVITE</span><strong>Prepare a My Plug invite</strong><small>Set the customer’s language and market, then share their link.</small></span>
   <span className={styles.collapsedAction}>Set up <span aria-hidden="true">⌄</span></span>
  </summary>
  <div className={styles.expandedContent}>
   <header className="plugCustomerShareHeader">
    <div className="plugCustomerShareIcon"><Share2 size={18} aria-hidden="true"/></div>
    <div><span className="kicker">CUSTOMER INVITE</span><strong>Prepare a My Plug invite</strong><small>Choose the customer’s language and market. Currency follows automatically.</small></div>
   </header>
   <div className={styles.setup}>
    <div className={styles.step}><span className={styles.stepIcon}><SlidersHorizontal size={15} aria-hidden="true"/></span><div><strong>1. Language &amp; market</strong><small>Choose the customer’s language and country. Currency follows the market.</small></div><span className={styles.editTag}>EDIT</span></div>
    <div className={styles.controls}>
     <label><span><Languages size={14} aria-hidden="true"/> Language</span><select value={language} onChange={event=>{setLanguage(getLanguage(event.target.value));setShared(false);setNotice("")}}>{STOREFRONT_LANGUAGES.map(item=><option key={item.code} value={item.code}>{item.nativeName}</option>)}</select></label>
     <label><span><Globe2 size={14} aria-hidden="true"/> Country / market</span><select value={marketCode} onChange={event=>{setMarketCode(getMarket(event.target.value).code);setShared(false);setNotice("")}}>{STOREFRONT_MARKETS.map(item=><option key={item.code} value={item.code}>{item.flag} {item.name} · {item.currency}</option>)}</select></label>
    </div>
   </div>
   <div className={styles.preview}>
    <div className={styles.step}><span className={styles.stepIcon+" "+styles.eye}><Eye size={15} aria-hidden="true"/></span><div><strong>2. Customer preview</strong><small>Preview only — not interactive.</small></div><span className={styles.previewTag}>PREVIEW</span></div>
    <div className={styles.previewCard}>
     <div className={styles.previewBrand}><span className={styles.previewMark}>P</span><span>THE PLUG <small>MY PLUG</small></span></div>
     <strong className={styles.previewTitle}>{preview.account}</strong>
     <p>{preview.action}</p>
     <div className="plugCustomerShareSummary">
      <span><small>{preview.market}</small><strong>{market.flag} {market.name}</strong></span>
      <span><small>LANGUAGE</small><strong>{languageLabel}</strong></span>
      <span><small>{preview.currency}</small><strong>{market.currency} · {market.currencyLabel}</strong></span>
     </div>
     <div className={styles.previewMockAction} aria-hidden="true">{preview.action}<span>↗</span></div>
    </div>
   </div>
   <div className={styles.shareStep}>
    <div className={styles.step}><span className={styles.stepIcon+" "+styles.shareIcon}><Share2 size={15} aria-hidden="true"/></span><div><strong>3. Share the invite</strong><small>Create the customer’s link and send it.</small></div></div>
    <button type="button" className="button buttonPrimary plugCustomerShareButton" onClick={()=>void share()}>{shared?<Check size={17} aria-hidden="true"/>:<Share2 size={17} aria-hidden="true"/>}{shared?"Share again":"Share customer invite"} <span aria-hidden="true">↗</span></button>
    {notice&&<p className="plugCustomerShareNotice" role="status">{notice}</p>}
   </div>
  </div>
 </details>;
}
