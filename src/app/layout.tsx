import type {Metadata,Viewport} from "next";
import {headers} from "next/headers";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css"; import "./pwa.css";
const siteUrl=process.env.NEXT_PUBLIC_BASE_URL||"https://the-plug.vercel.app";
const EMBEDDED_BROWSER_PATTERN=/WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i;
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"The Plug | Sneakers & Apparel",template:"%s | The Plug"},description:"The Plug — sneaker and apparel sourcing in Botswana. If we can source it, you can get it.",applicationName:"The Plug",keywords:["The Plug","sneakers","apparel","Botswana","sourcing"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"The Plug",title:"The Plug | Sneakers & Apparel",description:"If we can source it, you can get it."},twitter:{card:"summary",title:"The Plug | Sneakers & Apparel",description:"If we can source it, you can get it."},icons:{icon:"/plug-icon.svg",apple:"/plug-icon.svg"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"The Plug",statusBarStyle:"default"}};
export const viewport:Viewport={themeColor:"#0866FF",colorScheme:"light"};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const requestHeaders=await headers();
 const userAgent=requestHeaders.get("user-agent")||"";
 const requestedWith=requestHeaders.get("x-requested-with")||"";
 const referrer=requestHeaders.get("referer")||"";
 const embedded=EMBEDDED_BROWSER_PATTERN.test(userAgent)
   || (/Android/i.test(userAgent)&&/\bwv\b/i.test(userAgent))
   || /^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i.test(requestedWith)
   || /(^|\.)((l|www)\.)?(whatsapp|instagram|facebook|tiktok|line)\.com\//i.test(referrer);
 const android=/Android/i.test(userAgent);
 return <html lang="en"><body style={embedded?{overflow:"hidden"}:undefined}><PwaRegister initialEmbedded={embedded} initialAndroid={android}/>{children}<Analytics/><SpeedInsights/></body></html>
}
