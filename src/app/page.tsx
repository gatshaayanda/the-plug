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
        <nav className="plugLinks"><a href="#member-value">Membership</a><a href="#how">How it works</a><a href="#catalogue">Catalogue</a></nav>
        <div className="plugActions"><Link href="/account" className="plugButton plugButtonPrimary">Join with Google →</Link><button type="button" onClick={openInstallPrompt} className="plugButton plugButtonGhost">Install app</button></div>
      </div></header>

      <section className="plugHero plugInstallHero"><div className="plugContainer plugHeroGrid">
        <div className="plugInstallHeroCopy">
          <span className="plugKicker">YOUR CUSTOMER SPACE · BOTSWANA</span>
          <h1>Find what you want.<br/><em>Keep it moving.</em></h1>
          <p>The Plug helps you and Frank keep the important parts of sourcing together: your requests, the details you shared, private conversations and order progress.</p>
          <div className="plugHeroActions"><Link href="/account" className="plugButton plugButtonPrimary plugInstallHeroButton">Join The Plug with Google <span aria-hidden="true">→</span></Link><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer" className="plugButton plugButtonDark">Browse catalogue ↗</a></div>
          <p className="plugInstallNote"><span aria-hidden="true">✓</span> Your requests in one place · <span aria-hidden="true">✓</span> Private conversations · <span aria-hidden="true">✓</span> Clear order follow-up</p>
          <a className="plugInstallTextLink" href="#how">See how membership works ↓</a>
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
        <div className="plugSectionHead"><div><span className="plugKicker">More than a catalogue link</span><h2>A better way to follow through.</h2><p>WhatsApp is still where Frank’s live catalogue and direct contact live. The Plug adds a member account around your own sourcing journey.</p></div></div>
        <div className="plugInstallBenefitGrid">
          <article><span className="plugBenefitNumber">01</span><div className="plugBenefitIcon">↗</div><h3>Tell Frank what you want</h3><p>Share a product name, link or screenshot with your size, colour and notes in one request.</p></article>
          <article><span className="plugBenefitNumber">02</span><div className="plugBenefitIcon">✉</div><h3>Keep your follow-up together</h3><p>Return to your account for request history, recorded status and private conversations.</p></article>
          <article><span className="plugBenefitNumber">03</span><div className="plugBenefitIcon">✦</div><h3>Stay in the loop</h3><p>Member updates and any offers will be shown when Frank actually publishes them. No made-up discounts or promises.</p></article>
        </div>
      </div></section>

      <section id="how" className="plugSection plugHow plugInstallHow"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">Your first visit</span><h2>Join. Share. Follow through.</h2><p>Start with your member account. Set up alerts if you want them, then use The Plug when you need Frank to source something.</p></div><Link href="/account" className="plugButton plugButtonPrimary">Join with Google →</Link></div>
        <div className="plugSteps">
          <article><b>01</b><h3>Join with Google</h3><p>Your account keeps private requests and conversations connected to you.</p></article>
          <article><b>02</b><h3>Check your details</h3><p>Add the right WhatsApp number and delivery preference so Frank can follow up.</p></article>
          <article><b>03</b><h3>Send what you want</h3><p>Share a product, size, colour and screenshot if helpful. You can also browse the WhatsApp catalogue.</p></article>
          <article><b>04</b><h3>Confirm before paying</h3><p>Frank confirms the current quote and expected timing. A request is not a stock confirmation or an order payment.</p></article>
        </div>
      </div></section>

      <section id="catalogue" className="plugSection plugCatalogueSection"><div className="plugContainer plugCatalogueGrid">
        <div><span className="plugKicker">The catalogue stays simple</span><h2>Products on WhatsApp.<br/><em>Your journey in The Plug.</em></h2><p>Frank keeps his existing WhatsApp catalogue as the source of truth. You do not need to maintain another list or assume that a pictured item is in stock.</p><a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer" className="plugButton plugButtonDark">Browse WhatsApp catalogue ↗</a></div>
        <div className="plugCatalogueCard"><span className="plugCatalogueBadge">LIVE BUSINESS CATALOGUE</span><div className="plugCatalogueMark">P</div><strong>Found something?</strong><p>Share the product link or screenshot with Frank. Current price, size and sourcing availability are confirmed directly.</p><a href={WHATSAPP} target="_blank" rel="noreferrer">WhatsApp Frank · +267 76 411 150 →</a></div>
      </div></section>

      <section id="contact" className="plugContact"><div className="plugContainer plugContactGrid"><div><span className="plugKicker">Need a hand?</span><h2>Start with what you want.</h2><p>Join The Plug to keep your request and follow-up together, or contact Frank directly if you need help.</p></div><div className="plugContactCard"><strong>+267 76 411 150</strong><span>Call or WhatsApp Frank</span><div><Link href="/request" className="plugButton plugButtonPrimary">Start a sourcing request</Link><a className="plugButton plugButtonDark" href={WHATSAPP}>WhatsApp Frank</a></div></div></div></section>
      <footer className="plugFooter"><div className="plugContainer"><strong>THE PLUG</strong><span>Sneakers · Apparel · Sourcing in Botswana</span><button type="button" onClick={openInstallPrompt}>Install app ↑</button><Link href="/account">Member account</Link><Link href="/admin">Admin</Link></div></footer>
    </main>
  );
}
