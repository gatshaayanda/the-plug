"use client";

import Link from "next/link";

const WHATSAPP = "https://wa.me/26776411150";
const WHATSAPP_CATALOG = "https://wa.me/c/26776411150";
const INSTAGRAM = "https://www.instagram.com/the.plugworldwidebw/";

function openInstallPrompt() {
  window.dispatchEvent(new Event("theplug-open-install"));
}

export default function Home() {
  return (
    <main className="plugSite plugFocusedHome">
      <div className="plugNotice"><div className="plugContainer"><span>🇧🇼 Botswana</span><strong>If we can source it, you can get it.</strong><a href={WHATSAPP}>WhatsApp +267 76 411 150</a></div></div>
      <header className="plugNav"><div className="plugContainer plugNavInner">
        <Link href="/" className="plugBrand"><span className="plugMark">P</span><span><strong>THE PLUG</strong><small>Sneakers · Apparel · Sourcing</small></span></Link>
        <div className="plugActions"><Link href="/account" className="plugButton plugButtonGhost">My requests</Link><button type="button" onClick={openInstallPrompt} className="plugButton plugButtonGhost">Install app</button></div>
      </div></header>

      <section className="plugFocusedStage">
        <div className="plugContainer">
          <div className="plugFocusedHeading"><span className="plugKicker">SNEAKERS · APPAREL · BOTSWANA</span><h1>What’s the <em>next find?</em></h1></div>
          <div className="plugFocusedGrid">
            <section className="plugFeaturedStage" aria-label="Featured finds">
              <div className="plugFeaturedTop"><span>FRANK’S PICKS</span><span className="plugLiveDot">FEATURED FINDS</span></div>
              <div className="plugFeaturedEmpty">
                <div className="plugFeaturedMark">P</div>
                <span className="plugKicker">THE PLUG · BOTSWANA</span>
                <h2>Featured finds<br/><em>coming soon.</em></h2>
                <p>Check back for Frank’s latest picks.</p>
              </div>
              <div className="plugFeaturedBottom"><span>New finds appear here.</span><span>01 / 01</span></div>
            </section>
            <Link href="/request" className="plugSourcingCard">
              <span className="plugKicker">CAN’T FIND IT?</span>
              <span className="plugSourcingIcon">↗</span>
              <span className="plugSourcingTitle">Ask Frank<br/><em>to source it.</em></span>
              <span className="plugSourcingDescription">Send a link, photo or screenshot. Tell us the size, colour or details.</span>
              <span className="plugSourcingAction">Make a sourcing request <b>→</b></span>
            </Link>
          </div>
          <div className="plugFocusedFootnote"><span>Find something you like. Ask for what you can’t find.</span><Link href="/account">Your requests & messages →</Link></div>
        </div>
      </section>

      <footer className="plugFooter plugFocusedFooter"><div className="plugContainer">
        <strong>THE PLUG</strong><span>Sneakers · Apparel · Sourcing in Botswana</span>
        <Link href="/account">My requests</Link>
        <a href={WHATSAPP_CATALOG} target="_blank" rel="noreferrer">WhatsApp catalogue ↗</a>
        <a href={INSTAGRAM} target="_blank" rel="noreferrer">Instagram ↗</a>
        <button type="button" onClick={openInstallPrompt}>Install The Plug ↑</button>
        <Link href="/admin">Admin</Link>
      </div></footer>
    </main>
  );
}
