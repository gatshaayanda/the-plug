"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Send, Sparkles, X } from "lucide-react";
import {useStorefrontText} from "@/lib/storefront-translations";

type GuideMessage = { id: number; from: "guide" | "you"; text: string };
const actions = [
  { href: "#featured", label: "Browse finds" },
  { href: "#deals", label: "Live offers" },
  { href: "/request", label: "Request a product" },
  { href: "/account", label: "Open My Plug" },
];
function replyFor(message:string,t:(key:any)=>string){const v=message.toLowerCase();if(/request|source|buy|order|want|find me/.test(v))return t("guideRequest");if(/account|saved|history|message|reply|track|status/.test(v))return t("guideAccount");if(/offer|deal|discount|sale/.test(v))return t("guideOffers");if(/find|shoe|sneaker|nike|adidas|clothes|apparel/.test(v))return t("guideFinds");if(/install|app/.test(v))return t("guideInstall");return t("guideFallback");}
export default function PlugGuide() {\n  const{t}=useStorefrontText();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([]);\n  useEffect(()=>{setMessages(current=>current.length?current:[{id:1,from:"guide",text:t("guideWelcome")}]);},[t]);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); launcherRef.current?.focus(); return; }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]');
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus(); else launcherRef.current?.focus();
    };
  }, [open]);
  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;
    const now = Date.now();
    const visitorMessage: GuideMessage = { id: now, from: "you", text: value };
    const guideMessage: GuideMessage = { id: now + 1, from: "guide", text: replyFor(value,t) };
    setMessages(current => [...current, visitorMessage, guideMessage].slice(-8));
    setInput("");
  }
  return <div className="plugGuideRoot">
    {open && <button type="button" className="plugGuideBackdrop" aria-label="Close guide" onClick={() => setOpen(false)} />}
    {open && <section ref={panelRef} className="plugGuidePanel" role="dialog" aria-modal="true" aria-labelledby="plug-guide-title">
      <header className="plugGuideHead">
        <span className="plugGuideAvatar"><Sparkles size={18} aria-hidden="true" /></span>
        <div><small>THE PLUG · CUSTOMER GUIDE</small><h2 id="plug-guide-title">{t("needHand")}</h2><p>{t("guidePrompt")}</p></div>
        <button ref={closeRef} type="button" aria-label="Close guide" onClick={() => setOpen(false)}><X size={18} /></button>
      </header>
      <div className="plugGuideIntro"><strong>{t("guideIntro")}</strong><p>{t("guideExplanation")}</p></div>
      <nav className="plugGuideActions" aria-label="Guide shortcuts">
        {actionKeys.map(action => <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>{t(action.key)}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
      </nav>
      <div className="plugGuideThread" aria-live="polite" aria-relevant="additions text">
        {messages.slice(-5).map(message => <p key={message.id} className={"plugGuideMessage is-" + message.from}>{message.text}</p>)}
      </div>
      <form className="plugGuideComposer" onSubmit={send}>
        <input value={input} onChange={event => setInput(event.target.value)} aria-label="Ask The Plug guide" placeholder={t("guidePlaceholder")} maxLength={300} />
        <button type="submit" disabled={!input.trim()} aria-label="Send question"><Send size={17} /></button>
      </form>
      <p className="plugGuideFootnote">{t("guideFootnote")}</p>
    </section>}
    <button ref={launcherRef} type="button" className="plugGuideLauncher" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>
      {open ? <X size={19} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
      <span>{open ? "Close" : "Need a hand?"}</span>
    </button>
  </div>;
}
