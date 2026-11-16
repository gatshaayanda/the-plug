"use client";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import StorefrontFeed from "@/components/StorefrontFeed";
import CommunityFeed from "@/components/CommunityFeed";
import StorefrontPreferences from "@/components/StorefrontPreferences";
import {useState} from "react";
import PlugGuide from "@/components/PlugGuide";
import {useStorefrontText} from "@/lib/storefront-translations";
export default function Home(){const [benefitsOpen,setBenefitsOpen]=useState(false);const{t}=useStorefrontText();return <main className="plugSite plugEditorialHome">
<div className="plugNotice"><div className="plugContainer"><strong>{t("tagline")}</strong><span>{t("rooted")} · {t("curated")}</span></div></div>
<StorefrontPreferences/>
<header className="plugNav plugEditorialNav"><div className="plugContainer plugNavInner"><Link href="/" className="plugBrand"><span className="plugMark">P</span><span><strong>THE PLUG</strong><small>{t("brandLine")}</small></span></Link><nav className="plugEditorialLinks" aria-label={t("mainNavigation")}><a href="#featured">{t("finds")}</a><a href="#deals">{t("offers")}</a><Link href="/saved">{t("saved")}</Link></nav><div className="plugActions"><Link href="/account" className="plugButton plugButtonGhost plugMyPlugLink">{t("myPlug")} ↗</Link></div></div></header>
<StorefrontFeed/><CommunityFeed/>
<section className="plugMemberLoop"><div className="plugContainer"><div className="plugMemberLoopHead"><div><span className="plugKicker">{t("yourSpace")}</span><h2>{t("keepFinds")} <em>{t("close")}</em></h2></div><button type="button" aria-expanded={benefitsOpen} aria-controls="plug-member-benefits" onClick={()=>setBenefitsOpen(open=>!open)} className="plugMemberLoopToggle">{benefitsOpen?t("hideBenefits"):t("showBenefits")} <span>{benefitsOpen?"−":"＋"}</span></button></div>{benefitsOpen&&<div id="plug-member-benefits" className="plugMemberPerks"><article><span>{t("history")}</span><h3>{t("requestsTogether")}</h3><p>{t("privateProgress")}</p></article><article><span>{t("timing")}</span><h3>{t("usefulUpdates")}</h3><p>{t("notifications")}</p></article><article><span>{t("realOffers")}</span><h3>{t("noMadeUp")}</h3><p>{t("realRewards")}</p></article><article><span>{t("access")}</span><h3>{t("takeHistory")}</h3><p>{t("googleAccess")}</p></article><div className="plugMemberPerksAction"><Link href="/account" className="plugCircleAction">{t("openMyPlug")} ↗</Link><small>{t("browsingOpen")}</small></div></div>}</div></section>
<footer className="plugFooter plugEditorialFooter"><div className="plugContainer"><strong>THE PLUG</strong><span>{t("brandLine")} · BOTSWANA</span><Link href="/account">{t("myPlug")}</Link><Link href="/saved">{t("saved")}</Link><Link href="/account?newRequest=1">{t("requestProduct")}</Link><Link href="/admin" className="plugBriefcaseLink" aria-label="Open the Briefcase" title="Briefcase"><Briefcase size={20} aria-hidden="true"/></Link></div></footer>
<PlugGuide/>
</main>}
