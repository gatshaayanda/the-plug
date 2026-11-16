"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageCircle, Send, Sparkles, X } from "lucide-react";

type GuideMessage = { id: number; from: "guide" | "you"; text: string };
const welcome = "Hi. I can help you find your way around The Plug. Browse Frank’s published finds, start a sourcing request, or open My Plug. I’m a guided helper, not live support.";
const actions = [
  { href: "#featured", label: "Browse finds" },
  { href: "#deals", label: "Live offers" },
  { href: "/request", label: "Request a product" },
  { href: "/account", label: "Open My Plug" },
];
function replyFor(message: string) {
  const value = message.toLowerCase();
  if (/request|source|buy|order|want|find me/.test(value)) return "To ask Frank to source something, open Request a product. You can describe the item, add a link or image, and send the request without installing the app first.";
  if (/account|saved|history|message|reply|track|status/.test(value)) return "My Plug keeps your saved finds, sourcing requests and private updates together. Open My Plug to continue.";
  if (/offer|deal|discount|sale/.test(value)) return "Live offers appear only when Frank has published and activated them. Open Live offers to see what is currently listed.";
  if (/find|shoe|sneaker|nike|adidas|clothes|apparel/.test(value)) return "Browse Frank’s published finds. Open an item to see its details, then ask Frank about sourcing it. Availability and the final price are confirmed for each request.";
  if (/install|app/.test(value)) return "Installation is optional. Use the small Install The Plug control when you’re ready; you can keep browsing and requesting without installing.";
  return "I can point you to the real actions in The Plug: browse finds, view live offers, request a product, or open My Plug. I won’t guess at stock, delivery or a quote.";
}
export default function PlugGuide() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<GuideMessage[]>([{ id: 1, from: "guide", text: welcome }]);
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
    const guideMessage: GuideMessage = { id: now + 1, from: "guide", text: replyFor(value) };
    setMessages(current => [...current, visitorMessage, guideMessage].slice(-8));
    setInput("");
  }
  return <div className="plugGuideRoot">
    {open && <button type="button" className="plugGuideBackdrop" aria-label="Close guide" onClick={() => setOpen(false)} />}
    {open && <section ref={panelRef} className="plugGuidePanel" role="dialog" aria-modal="true" aria-labelledby="plug-guide-title">
      <header className="plugGuideHead">
        <span className="plugGuideAvatar"><Sparkles size={18} aria-hidden="true" /></span>
        <div><small>THE PLUG · CUSTOMER GUIDE</small><h2 id="plug-guide-title">Need a hand?</h2><p>Choose a next step or ask a quick question</p></div>
        <button ref={closeRef} type="button" aria-label="Close guide" onClick={() => setOpen(false)}><X size={18} /></button>
      </header>
      <div className="plugGuideIntro"><strong>What would you like to do?</strong><p>Keep browsing freely. This guide only points to existing pages and actions.</p></div>
      <nav className="plugGuideActions" aria-label="Guide shortcuts">
        {actions.map(action => <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>{action.label}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
      </nav>
      <div className="plugGuideThread" aria-live="polite" aria-relevant="additions text">
        {messages.slice(-5).map(message => <p key={message.id} className={"plugGuideMessage is-" + message.from}>{message.text}</p>)}
      </div>
      <form className="plugGuideComposer" onSubmit={send}>
        <input value={input} onChange={event => setInput(event.target.value)} aria-label="Ask The Plug guide" placeholder="Ask about finds or requests…" maxLength={300} />
        <button type="submit" disabled={!input.trim()} aria-label="Send question"><Send size={17} /></button>
      </form>
      <p className="plugGuideFootnote">Guided answers · Not live support · No message is sent to Frank</p>
    </section>}
    <button ref={launcherRef} type="button" className="plugGuideLauncher" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>
      {open ? <X size={19} aria-hidden="true" /> : <MessageCircle size={19} aria-hidden="true" />}
      <span>{open ? "Close" : "Need a hand?"}</span>
    </button>
  </div>;
}
