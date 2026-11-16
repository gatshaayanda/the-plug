import {redirect} from "next/navigation";
export const metadata={title:"My Plug · Request a product",description:"Continue your sourcing request in your private The Plug account."};
export default async function RequestPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const values=await searchParams;const params=new URLSearchParams();for(const [key,value] of Object.entries(values)){if(typeof value==="string")params.set(key,value)}if(!params.has("product")&&!params.has("newRequest"))params.set("newRequest","1");redirect("/account?"+params.toString())}
