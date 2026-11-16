"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import Link from "next/link";
import {ArrowUpRight,MessageCircle,Send,Sparkles,X} from "lucide-react";
import {useStorefrontText,storefrontText,type StorefrontCopyKey} from "@/lib/storefront-translations";
type GuideMessage={id:number;from:"guide"|"you";text:string};
const actions=[{href:"#featured",key:"browseFinds"},{href:"#deals",key:"offers"},{href:"/request",key:"requestProduct"},{href:"/account",key:"myPlug"}] as const;
function replyFor(message:string,language:"en"|"tn"|"af"|"fr"){
 const v=message.toLowerCase();
 const key:StorefrontCopyKey=/request|source|buy|order|want|find me/.test(v)?"guideRequest":/account|saved|history|message|reply|track|status/.test(v)?"guideAccount":/offer|deal|discount|sale/.test(v)?"guideOffers":/find|shoe|sneaker|nike|adidas|clothes|apparel/.test(v)?"guideFinds":/install|app/.test(v)?"guideInstall":"guideFallback";
 return storefrontText(language,key);
}
export default function PlugGuide(){
 const{t,language}=useStorefrontText();
 const[open,setOpen]=useState(false),[input,setInput]=useState(""),[messages,setMessages]=useState<GuideMessage[]>([]);
 const launcherRef=useRef<HTMLButtonElement>(null),closeRef=useRef<HTMLButtonElement>(null),panelRef=useRef<HTMLElement>(null);
 useEffect(()=>{setMessages(current=>current.length?current:[{id:1,from:"guide",text:storefrontText(language,"guideWelcome")}]);},[language]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;
  closeRef.current?.focus();
  const onKeyDown=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){setOpen(false);launcherRef.current?.focus();return;}
   if(event.key!=="Tab")return;
   const focusable=panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]');
   if(!focusable?.length)return;
   const first=focusable[0],last=focusable[focusable.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  window.addEventListener("keydown",onKeyDown);
  return()=>{window.removeEventListener("keydown",onKeyDown);if(previous?.isConnected)previous.focus();else launcherRef.current?.focus();};
 },[open]);
 function send(event:FormEvent<HTMLFormElement>){
  event.preventDefault();const value=input.trim();if(!value)return;
  const now=Date.now();const visitor:GuideMessage={id:now,from:"you",text:value};
  const answer:GuideMessage={id:now+1,from:"guide",text:replyFor(value,language)};
  setMessages(current=>[...current,visitor,answer].slice(-8));setInput("");
 }
 return <div className="plugGuideRoot">
  {open&&<button type="button" className="plugGuideBackdrop" aria-label={t("closeGuide")} onClick={()=>setOpen(false)}/>}
  {open&&<section ref={panelRef} className="plugGuidePanel" role="dialog" aria-modal="true" aria-labelledby="plug-guide-title">
   <header className="plugGuideHead"><span className="plugGuideAvatar"><Sparkles size={18} aria-hidden="true"/></span><div><small>{t("guideKicker")}</small><h2 id="plug-guide-title">{t("needHand")}</h2><p>{t("guidePrompt")}</p></div><button ref={closeRef} type="button" aria-label="Close guide" onClick={()=>setOpen(false)}><X size={18}/></button></header>
   <div className="plugGuideIntro"><strong>{t("guideIntro")}</strong><p>{t("guideExplanation")}</p></div>
   <nav className="plugGuideActions" aria-label="Guide shortcuts">{actions.map(action=><Link key={action.href} href={action.href} onClick={()=>setOpen(false)}>{t(action.key)}<ArrowUpRight size={14} aria-hidden="true"/></Link>)}</nav>
   <div className="plugGuideThread" aria-live="polite" aria-relevant="additions text">{messages.slice(-5).map(message=><p key={message.id} className={"plugGuideMessage is-"+message.from}>{message.text}</p>)}</div>
   <form className="plugGuideComposer" onSubmit={send}><input value={input} onChange={event=>setInput(event.target.value)} aria-label={t("askGuide")} placeholder={t("guidePlaceholder")} maxLength={300}/><button type="submit" disabled={!input.trim()} aria-label={t("sendQuestion")}><Send size={17}/></button></form>
   <p className="plugGuideFootnote">{t("guideFootnote")}</p>
  </section>}
  <button ref={launcherRef} type="button" className="plugGuideLauncher" aria-expanded={open} aria-haspopup="dialog" onClick={()=>setOpen(value=>!value)}>{open?<X size={19} aria-hidden="true"/>:<MessageCircle size={19} aria-hidden="true"/>}<span>{open?t("close"):t("needHand")}</span></button>
 </div>;
}
