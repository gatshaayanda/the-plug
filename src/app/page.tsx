"use client";
import Link from "next/link";

const WHATSAPP_CATALOG = "https://wa.me/c/26776411150";
const WHATSAPP = "https://wa.me/26776411150";
const INSTAGRAM = "https://www.instagram.com/the.plugworldwidebw/";
function openInstallPrompt() { window.dispatchEvent(new Event("theplug-open-install")); }

export default function Home() {
  return (
    <main className="plugSite plugInstallLanding">
      <div className="plugNotice"><div className="plugContainer"><span>🇧🇼 Botswana</span><strong>If we can source it, you can get it.</strong><a href={WHATSAPP}>WhatsApp +267 76 411 150</a></div></div>
      <header className="plugNav"><div className="plugContainer plugNavInner">
        <Link href="/" className="plugBrand"><span className="plugMark">P</span><span><strong>THE PLUG</strong><small>Sneakers · Apparel · Sourcing</small></span></Link>
        <nav className="plugLinks"><a href="#catalogue">Find products</a><a href="#member-value">Your requests</a></nav>
        <div className="plugActions"><Link href="/request" className="plugButton plugButtonPrimary">Find something →</Link><button type="button" onClick={openInstallPrompt} className="plugButton plugButtonGhost">Install app</button></div>
      </div></header>

      <section className="plugHero plugInstallHero"><div className="plugContainer plugHeroGrid">
        <div className="plugInstallHeroCopy">
          <span className="plugKicker">SNEAKERS · APPAREL · BOTSWANA</span>
          <h1>What are you<br/><em>looking for?</em></h1>
          <p>Find it in Frank’s catalogues or ask him to source it. Your requests and follow-up stay here.</p>
          <div className="plugHeroActions"><Link href="/request" className="plugButton plugButtonPrimary plugInstallHeroButton">Ask Frank to find it <span aria-hidden="true">→</span></Link><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer" className="plugButton plugButtonDark">Browse WhatsApp ↗</a></div>
          <p className="plugInstallNote">Requests · Messages · Order progress</p>
        </div>
        <div className="plugInstallVisual" aria-label="Preview of The Plug member space"><div className="plugInstallGlow"/><div className="plugPhone">
          <div className="plugPhoneStatus"><span>THE PLUG</span><span>●●● ▰</span></div>
          <div className="plugPhoneHeader"><span className="plugPhoneMark">P</span><span><b>YOUR REQUESTS</b><small>SOURCING · CONVERSATIONS</small></span><span className="plugPhoneDots">•••</span></div>
          <div className="plugPhoneTitle"><small>YOUR NEXT FIND</small><strong>See it.<br/><em>Send it.</em></strong><span>Frank confirms the price and next steps.</span></div>
          <div className="plugPhonePanel"><span className="plugPhoneIcon">↗</span><span><b>Sourcing requests</b><small>Track each request.</small></span><span>›</span></div>
          <div className="plugPhonePanel"><span className="plugPhoneIcon plugPhoneIconRed">✉</span><span><b>Private conversations</b><small>Follow up with Frank.</small></span><span>›</span></div>
          <div className="plugPhoneBottom"><span>⌂<small>Home</small></span><span>▤<small>Requests</small></span><span>◉<small>Account</small></span></div>
        </div><div className="plugInstallFloat plugInstallFloatTop"><span>✦</span><div><b>THE PLUG</b><small>Your sourcing, together.</small></div></div><div className="plugInstallFloat plugInstallFloatBottom"><span>↗</span><div><b>Find it anywhere</b><small>WhatsApp · Instagram</small></div></div></div>
      </div></section>

      <section id="catalogue" className="plugSection plugCatalogueSection"><div className="plugContainer plugCatalogueGrid">
        <div><span className="plugKicker">Browse products</span><h2>See something you like?<br/><em>Send it to Frank.</em></h2><p>Browse the live catalogues. If you don’t see what you want, send a link, photo or screenshot and ask Frank to source it.</p><Link href="/request" className="plugButton plugButtonPrimary">Request a product →</Link></div>
        <div className="plugCatalogueCard"><span className="plugCatalogueBadge">FRANK’S CATALOGUES</span><div className="plugCatalogueMark">P</div><strong>Find your next pair.</strong><p>Browse products and posts, then share the item you want.</p><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer">WhatsApp catalogue ↗</a><a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram · @the.plugworldwidebw ↗</a></div>
      </div></section>

      <section id="member-value" className="plugInstallBenefits"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">Your requests</span><h2>Everything after “I want that.”</h2><p>Keep your requests, messages and order progress together.</p></div></div>
        <div className="plugInstallBenefitGrid">
          <article><span className="plugBenefitNumber">01</span><div className="plugBenefitIcon">↗</div><h3>Send what you want</h3><p>Share a product, size, colour or screenshot.</p></article>
          <article><span className="plugBenefitNumber">02</span><div className="plugBenefitIcon">✉</div><h3>Follow the request</h3><p>See updates and message Frank privately.</p></article>
          <article><span className="plugBenefitNumber">03</span><div className="plugBenefitIcon">✓</div><h3>Decide when you know</h3><p>Frank confirms price and timing before you commit.</p></article>
        </div>
        <div className="plugHeroActions"><Link href="/request" className="plugButton plugButtonPrimary">Find something →</Link><Link href="/account" className="plugButton plugButtonGhost">My requests</Link></div>
      </div></section>

      <section className="plugContact"><div className="plugContainer plugContactGrid"><div><span className="plugKicker">Need help?</span><h2>Talk to Frank.</h2><p>Ask about a product or a sourcing request.</p></div><div className="plugContactCard"><strong>+267 76 411 150</strong><span>Call or WhatsApp Frank</span><div><Link href="/request" className="plugButton plugButtonPrimary">Request a product</Link><a className="plugButton plugButtonDark" href={WHATSAPP}>WhatsApp Frank</a></div></div></div></section>
      <footer className="plugFooter"><div className="plugContainer"><strong>THE PLUG</strong><span>Sneakers · Apparel · Sourcing in Botswana</span><button type="button" onClick={openInstallPrompt}>Install The Plug ↑</button><Link href="/account">My requests</Link><Link href="/admin">Admin</Link></div></footer>
    </main>
  );
}
