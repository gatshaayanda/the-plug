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
        <nav className="plugLinks"><a href="#featured">Featured finds</a><a href="#deals">Live deals</a><a href="#circle">Plug Circle</a></nav>
        <div className="plugActions"><Link href="/account" className="plugButton plugButtonPrimary">My Plug →</Link><button type="button" onClick={openInstallPrompt} className="plugButton plugButtonGhost">Install app</button></div>
      </div></header>

      <section className="plugHero plugInstallHero"><div className="plugContainer plugHeroGrid">
        <div className="plugInstallHeroCopy">
          <span className="plugKicker">SNEAKERS · APPAREL · BOTSWANA</span>
          <h1>Your next find.<br/><em>Starts here.</em></h1>
          <p>Explore Frank’s featured finds, real deals and Plug Circle updates. If what you want isn’t here, ask us to source it.</p>
          <div className="plugHeroActions"><a href="#featured" className="plugButton plugButtonPrimary plugInstallHeroButton">Explore featured finds <span aria-hidden="true">↓</span></a><Link href="/request" className="plugButton plugButtonDark">Find something unlisted ↗</Link></div>
          <p className="plugInstallNote">Featured finds · Live deals · Your requests</p>
        </div>
        <div className="plugInstallVisual" aria-label="The Plug storefront priorities">
          <div className="plugInstallGlow"/>
          <div className="plugPhone">
            <div className="plugPhoneStatus"><span>THE PLUG</span><span>●●● ▰</span></div>
            <div className="plugPhoneHeader"><span className="plugPhoneMark">P</span><span><b>WHAT’S NEW</b><small>FINDS · DEALS · CIRCLE</small></span><span className="plugPhoneDots">•••</span></div>
            <div className="plugPhoneTitle"><small>YOUR NEXT FIND</small><strong>Good finds.<br/><em>Good timing.</em></strong><span>See what Frank has published, then choose what’s next.</span></div>
            <div className="plugPhonePanel"><span className="plugPhoneIcon">✦</span><span><b>Featured finds</b><small>Frank’s latest picks.</small></span><span>›</span></div>
            <div className="plugPhonePanel"><span className="plugPhoneIcon plugPhoneIconRed">%</span><span><b>Live deals</b><small>Real offers, while active.</small></span><span>›</span></div>
            <div className="plugPhoneBottom"><span>⌂<small>Home</small></span><span>✦<small>Finds</small></span><span>◉<small>My Plug</small></span></div>
          </div>
          <div className="plugInstallFloat plugInstallFloatTop"><span>✦</span><div><b>THE PLUG</b><small>Your finds, together.</small></div></div>
          <div className="plugInstallFloat plugInstallFloatBottom"><span>↗</span><div><b>Looking for more?</b><small>Request something unlisted</small></div></div>
        </div>
      </div></section>

      <section id="featured" className="plugInstallBenefits"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">01 · FRANK’S PICKS</span><h2>Featured finds.</h2><p>The items Frank chooses to put in front of The Plug community.</p></div></div>
        <div className="plugInstallBenefitGrid">
          <article><span className="plugBenefitNumber">THE PLUG</span><div className="plugBenefitIcon">✦</div><h3>Frank’s featured finds will live here.</h3><p>When a find is published in The Plug, it belongs here first. No made-up products or stock claims.</p><Link href="/request" className="plugTextLink">Looking for something now? Ask Frank →</Link></article>
          <article><span className="plugBenefitNumber">YOUR NEXT FIND</span><div className="plugBenefitIcon">↗</div><h3>Got something specific in mind?</h3><p>Send a product link, social post, photo or screenshot and tell Frank what you want.</p><Link href="/request" className="plugTextLink">Request an unlisted item →</Link></article>
        </div>
      </div></section>

      <section id="deals" className="plugCatalogueSection"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">02 · LIVE OFFERS</span><h2>Deals worth catching.</h2><p>Only offers Frank has published and marked active belong here. No fake discounts or countdowns.</p></div></div>
        <div className="plugDealEmpty"><div className="plugCatalogueMark">%</div><div><strong>Live deals will appear here.</strong><p>Check back for published offers. If you’re after something specific, you don’t have to wait for a deal to ask Frank to source it.</p><Link href="/request" className="plugButton plugButtonPrimary">Find what you want →</Link></div></div>
      </div></section>

      <section id="circle" className="plugInstallBenefits"><div className="plugContainer">
        <div className="plugSectionHead"><div><span className="plugKicker">03 · YOUR PLUG CIRCLE</span><h2>More than a catalogue.</h2><p>Your Plug account keeps the relationship going after you find something you want.</p></div></div>
        <div className="plugInstallBenefitGrid">
          <article><span className="plugBenefitNumber">01</span><div className="plugBenefitIcon">▤</div><h3>Your requests, together.</h3><p>Return to your sourcing requests and follow their progress.</p></article>
          <article><span className="plugBenefitNumber">02</span><div className="plugBenefitIcon">✉</div><h3>Private follow-up.</h3><p>Keep conversations with Frank connected to your requests.</p></article>
          <article><span className="plugBenefitNumber">03</span><div className="plugBenefitIcon">✦</div><h3>Member value, when confirmed.</h3><p>Circle-only offers and rewards must be published and your eligibility confirmed. An account alone does not promise membership or discounts.</p></article>
        </div>
        <div className="plugHeroActions"><Link href="/account" className="plugButton plugButtonPrimary">Open my Plug account →</Link><Link href="/request" className="plugButton plugButtonGhost">Find something unlisted</Link></div>
      </div></section>

      <section className="plugCatalogueSection"><div className="plugContainer plugCatalogueGrid">
        <div><span className="plugKicker">04 · CAN’T SEE IT HERE?</span><h2>Find something<br/><em>that isn’t listed.</em></h2><p>Send a product link, Instagram post or reel, photo, screenshot or PDF. Add size, colour, budget and timing—and tell Frank if you’re shopping for yourself or someone else. He’ll check the route and confirm price and timing before you commit.</p><Link href="/request" className="plugButton plugButtonPrimary">Ask Frank to source it →</Link></div>
        <div className="plugCatalogueCard"><span className="plugCatalogueBadge">YOUR SOURCING JOURNEY</span><div className="plugCatalogueMark">P</div><strong>See it. Send it.</strong><p>Frank checks what’s possible, then confirms the price and next steps. A request is not a confirmed order.</p><Link href="/account" className="plugCatalogueFallback">Track my requests →</Link></div>
      </div></section>

      <section className="plugContact"><div className="plugContainer plugContactGrid"><div><span className="plugKicker">NEED A HAND?</span><h2>Talk to Frank.</h2><p>Questions about an item or a request? Frank is reachable directly.</p></div><div className="plugContactCard"><strong>+267 76 411 150</strong><span>Call or WhatsApp Frank</span><div><Link href="/request" className="plugButton plugButtonPrimary">Request a product</Link><a className="plugButton plugButtonDark" href={WHATSAPP}>WhatsApp Frank</a></div></div></div></section>

      <section className="plugExternalFallback"><div className="plugContainer"><span className="plugKicker">05 · MORE PLACES TO LOOK</span><h2>Nothing here for you yet?</h2><p>Browse Frank’s other discovery channels. If you find an item, bring its link or screenshot back to The Plug so your sourcing request stays here.</p><div className="plugHeroActions"><a className="plugButton plugButtonGhost" href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer">WhatsApp catalogue ↗</a><a className="plugButton plugButtonGhost" href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram · @the.plugworldwidebw ↗</a></div></div></section>

      <footer className="plugFooter"><div className="plugContainer"><strong>THE PLUG</strong><span>Sneakers · Apparel · Sourcing in Botswana</span><button type="button" onClick={openInstallPrompt}>Install The Plug ↑</button><Link href="/account">My Plug</Link><Link href="/admin">Admin</Link></div></footer>
    </main>
  );
}
