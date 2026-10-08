import type {Metadata,Viewport} from "next";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import "./globals.css"; import "./pwa.css";
const siteUrl=process.env.NEXT_PUBLIC_BASE_URL||"https://the-plug.vercel.app";
export const metadata:Metadata={metadataBase:new URL(siteUrl),title:{default:"The Plug | Sneakers & Apparel",template:"%s | The Plug"},description:"The Plug — sneaker and apparel sourcing in Botswana. If we can source it, you can get it.",applicationName:"The Plug",keywords:["The Plug","sneakers","apparel","Botswana","sourcing"],alternates:{canonical:"/"},openGraph:{type:"website",url:siteUrl,siteName:"The Plug",title:"The Plug | Sneakers & Apparel",description:"If we can source it, you can get it."},twitter:{card:"summary",title:"The Plug | Sneakers & Apparel",description:"If we can source it, you can get it."},icons:{icon:"/icon.svg",apple:"/icon.svg"},manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"The Plug",statusBarStyle:"default"}};
export const viewport:Viewport={themeColor:"#0866FF",colorScheme:"light"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><PwaRegister/>{children}<Analytics/><SpeedInsights/></body></html>}