"use client";
import Link from "next/link";

const WHATSAPP_CATALOG = "https://wa.me/c/26776411150";
const WHATSAPP = "https://wa.me/26776411150";

function openInstallPrompt() {
  window.dispatchEvent(new Event("theplug-open-install"));
}

export default function Home() {
  return (
    <main className="plugSite plugInstallLanding">
      <div className="plugNotice"><div className="plugContainer"><span>🇧🇼 Botswana</span><strong>If we can source it, you can get it.</strong><a href={WHATSAPP}>WhatsApp +267 76 411 150</a></div></div>
      <header className="plugNav"><div className="plugContainer plugNavInner">
        <Link href="/" className="plugBrand"><span className="plugMark">P</span><span><strong>THE PLUG</strong><small>Sneakers · Apparel · Sourcing</small></span></Link>
        <nav className="plugLinks"><a href="#member-value">Your space</a><a href="#catalogue">Catalogue</a></nav>
        <div className="plugActions"><Link href="/request" className="plugButton plugButtonPrimary">Start a request →</Link><button type="button" onClick={openInstallPrompt} className="plugButton plugButtonGhost">Install app</button></div>
      </div></header>

      <section className="plugHero plugInstallHero"><div className="plugContainer plugHeroGrid">
        <div className="plugInstallHeroCopy">
          <span className="plugKicker">SNEAKERS · APPAREL · BOTSWANA</span>
          <h1>Find what you want.<br/><em>We’ll help you get it.</em></h1>
          <p>Tell Frank what you’re looking for. Keep your request, messages and order progress together in The Plug.</p>
          <div className="plugHeroActions"><Link href="/request" className="plugButton plugButtonPrimary plugInstallHeroButton">Start a request <span aria-hidden="true">→</span></Link><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer" className="plugButton plugButtonDark">Browse catalogue ↗</a></div>
          <p className="plugInstallNote">Requests · Private messages · Order progress</p>
          <a className="plugInstallTextLink" href="#how">What happens next ↓</a>
        </div>
        <div className="plugInstallVisual" aria-label="Preview of The Plug member space"><div className="plugInstallGlow"/><div className="plugPhone">
          <div className="plugPhoneStatus"><span>THE PLUG</span><span>●●● ▰</span></div>
          <div className="plugPhoneHeader"><span className="plugPhoneMark">P</span><span><b>YOUR MEMBER SPACE</b><small>SOURCING · CONVERSATIONS</small></span><span className="plugPhoneDots">•••</span></div>
          <div className="plugPhoneTitle"><small>YOUR NEXT FIND</small><strong>See it.<br/><em>Send it.</em></strong><span>Frank confirms the quote and next steps with you.</span></div>
          <div className="plugPhonePanel"><span className="plugPhoneIcon">↗</span><span><b>Sourcing requests</b><small>Keep product details together.</small></span><span>›</span></div>
          <div className="plugPhonePanel"><span className="plugPhoneIcon plugPhoneIconRed">✉</span><span><b>Private conversations</b><small>Follow up with Frank.</small></span><span>›</span></div>
          <div className="plugPhoneBottom"><span>⌂<small>Home</small></span><span>▤<small>Requests</small></span><span>◉<small>Account</small></span></div>
        </div><div className="plugInstallFloat plugInstallFloatTop"><span>✦</span><div><b>THE PLUG</b><small>Your sourcing, together.</small></div></div><div className="plugInstallFloat plugInstallFloatBottom"><span>↗</span><div><b>Join once</b><small>Pick up where you left off.</small></div></div></div>
      </div></section>

      <section id="member-value" className="plugInstallBenefits"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">Your space</span><h2>Your request, without the back-and-forth.</h2><p>Send Frank what you want. Your request and follow-up stay in one place.</p></div></div>
        <div className="plugInstallBenefitGrid">
          <article><span className="plugBenefitNumber">01</span><div className="plugBenefitIcon">↗</div><h3>Ask Frank to find it</h3><p>Send a product link or screenshot with your size and colour.</p></article>
          <article><span className="plugBenefitNumber">02</span><div className="plugBenefitIcon">✉</div><h3>Keep up with your request</h3><p>See the latest status and message Frank privately.</p></article>
          <article><span className="plugBenefitNumber">03</span><div className="plugBenefitIcon">✓</div><h3>Know before you pay</h3><p>Frank confirms the price and expected timing before you decide.</p></article>
        </div>
      </div></section>

      <section id="how" className="plugSection plugHow plugInstallHow"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">After you send it</span><h2>Frank takes it from there.</h2><p>Here’s what happens after you ask for an item.</p></div><Link href="/request" className="plugButton plugButtonPrimary">Start a request →</Link></div>
        <div className="plugSteps">
          <article><b>01</b><h3>Frank checks</h3><p>He checks whether the item can be sourced.</p></article>
          <article><b>02</b><h3>You get the details</h3><p>Frank confirms the current price and expected timing.</p></article>
          <article><b>03</b><h3>You decide</h3><p>If you want to go ahead, the agreed 50% deposit is paid before sourcing starts.</p></article>
        </div>
      </div></section>

      <section id="catalogue" className="plugSection plugCatalogueSection"><div className="plugContainer plugCatalogueGrid">
        <div><span className="plugKicker">Browse the catalogue</span><h2>Find your next pair.<br/><em>Or tell Frank what’s missing.</em></h2><p>Browse Frank’s WhatsApp catalogue, then send a link or screenshot if you want something.</p><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer" className="plugButton plugButtonDark">Browse WhatsApp catalogue ↗</a></div>
        <div className="plugCatalogueCard"><span className="plugCatalogueBadge">WHATSAPP CATALOGUE</span><div className="plugCatalogueMark">P</div><strong>Found something?</strong><p>Send it to Frank. He’ll confirm the price, size and availability.</p><a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp Frank · +267 76 411 150 →</a></div>
      </div></section>

      <section id="contact" className="plugContact"><div className="plugContainer plugContactGrid"><div><span className="plugKicker">Need help?</span><h2>Talk to Frank.</h2><p>Questions? Message Frank directly.</p></div><div className="plugContactCard"><strong>+267 76 411 150</strong><span>Call or WhatsApp Frank</span><div><Link href="/request" className="plugButton plugButtonPrimary">Start a sourcing request</Link><a className="plugButton plugButtonDark" href={WHATSAPP}>WhatsApp Frank</a></div></div></div></section>
      <footer className="plugFooter"><div className="plugContainer"><strong>THE PLUG</strong><span>Sneakers · Apparel · Sourcing in Botswana</span><button type="button" onClick={openInstallPrompt}>Install The Plug ↑</button><Link href="/account">Member account</Link><Link href="/admin">Admin</Link></div></footer>
    </main>
  );
}
