import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

export const runtime="nodejs";
export const dynamic="force-dynamic";
type Range=7|30;
type Row={label:string;visitors:number;pageviews:number};
type Result={connection:"connected"|"not_connected"|"unavailable"|"credentials"|"rate_limited";message?:string;range:Range;since:string;until:string;totals?:{visitors:number;pageviews:number};daily?:Array<{date:string;visitors:number;pageviews:number}>;routes?:Row[];referrers?:Row[];devices?:Row[];partial:boolean};
const cache=new Map<string,{expiresAt:number;value:Result}>();
const CACHE_TTL_MS=10*60*1000;

function firebaseAdminApp(){
 const existing=getApps()[0];
 if(existing)return existing;
 const raw=process.env.FIREBASE_ADMIN_KEY;
 if(!raw)throw new Error("Owner authentication is not configured.");
 const account=JSON.parse(raw) as Record<string,unknown>;
 return initializeApp({credential:cert(account as Parameters<typeof cert>[0])});
}
function number(value:unknown){return typeof value==="number"&&Number.isFinite(value)?value:0}
function safeMessage(status:number){
 if(status===401||status===403)return "Vercel Analytics credentials need attention (API token or project access).";
 if(status===429)return "Vercel Analytics rate limited the report. Try again shortly.";
 return "Vercel Analytics is temporarily unavailable.";
}
function irrelevant(path:string){
 return path==="/admin"||path.startsWith("/admin/")||path==="/api"||path.startsWith("/api/")||path.startsWith("/_next/")||path.startsWith("/_vercel/")||path==="/favicon.ico"||path==="/robots.txt"||path==="/manifest.webmanifest"||/\.(?:js|css|map|png|jpe?g|gif|svg|webp|ico|woff2?|ttf)$/i.test(path);
}
function breakdown(value:unknown,dimension:"requestPath"|"referrerHostname"|"deviceType",limit=10):Row[]{
 const data=value&&typeof value==="object"&&Array.isArray((value as {data?:unknown}).data)?(value as {data:unknown[]}).data:[];
 return data.flatMap(raw=>{
  if(!raw||typeof raw!=="object")return[];
  const row=raw as Record<string,unknown>;const label=typeof row[dimension]==="string"?String(row[dimension]).trim():"";
  if(!label||(dimension==="requestPath"&&irrelevant(label)))return[];
  return[{label,visitors:number(row.visitors),pageviews:number(row.pageviews)}];
 }).sort((a,b)=>b.pageviews-a.pageviews||b.visitors-a.visitors).slice(0,limit);
}
async function queryTraffic(range:Range,refresh:boolean):Promise<Result>{
 const projectId=process.env.VERCEL_PROJECT_ID?.trim();
 const teamId=(process.env.VERCEL_TEAM_ID||process.env.VERCEL_ORG_ID||"").trim();
 const token=(process.env.VERCEL_API_TOKEN||process.env.VERCEL_TOKEN||"").trim();
 const now=new Date();const until=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()));
 const since=new Date(until.getTime()-(range-1)*86400000);
 const base={range,since:since.toISOString().slice(0,10),until:until.toISOString().slice(0,10)};
 if(!token)return{...base,connection:"not_connected",message:"Automatic Vercel Analytics collection is installed. Add VERCEL_API_TOKEN with access to The Plug's Web Analytics to show this owner-side report.",partial:false};
 if(!projectId)return{...base,connection:"not_connected",message:"Automatic Vercel Analytics collection is installed. Set VERCEL_PROJECT_ID to the actual The Plug Vercel project ID to retrieve owner-side traffic data.",partial:false};
 const key=range+":"+projectId+":"+teamId;
 if(!refresh){const cached=cache.get(key);if(cached&&cached.expiresAt>Date.now())return cached.value}
 const endpoint="https://api.vercel.com/v1/query/web-analytics/visits";
 const request=async(kind:"count"|"aggregate",by?:string,limit?:number)=>{
  const params=new URLSearchParams({projectId,since:base.since,until:base.until});
  if(teamId)params.set("teamId",teamId);
  if(by)params.set("by",by);
  if(limit)params.set("limit",String(limit));
  const response=await fetch(endpoint+"/"+kind+"?"+params.toString(),{headers:{Authorization:"Bearer "+token,Accept:"application/json"},cache:"no-store"});
  if(!response.ok)throw Object.assign(new Error(safeMessage(response.status)),{status:response.status});
  return response.json() as Promise<unknown>;
 };
 const results=await Promise.allSettled([request("count"),request("aggregate","day",range),request("aggregate","requestPath",25),request("aggregate","referrerHostname",15),request("aggregate","deviceType",10)]);
 const rejected=results.filter((item):item is PromiseRejectedResult=>item.status==="rejected");
 if(rejected.length===results.length){
  const statuses=rejected.map(item=>Number((item.reason as {status?:number})?.status||500));
  const status=statuses.includes(401)?401:statuses.includes(403)?403:statuses.includes(429)?429:500;
  return{...base,connection:status===401||status===403?"credentials":status===429?"rate_limited":"unavailable",message:safeMessage(status),partial:false};
 }
 const value=(index:number)=>results[index].status==="fulfilled"?(results[index] as PromiseFulfilledResult<unknown>).value:undefined;
 const count=value(0) as {data?:{visitors?:number;pageviews?:number}}|undefined;
 const dailyData=value(1) as {data?:unknown[]}|undefined;
 const daily=(dailyData?.data??[]).flatMap(raw=>{
  if(!raw||typeof raw!=="object")return[];
  const row=raw as Record<string,unknown>;const timestamp=typeof row.timestamp==="string"?row.timestamp:"";
  return timestamp?[{date:timestamp.slice(0,10),visitors:number(row.visitors),pageviews:number(row.pageviews)}]:[];
 });
 const result:Result={...base,connection:"connected",totals:{visitors:number(count?.data?.visitors),pageviews:number(count?.data?.pageviews)},daily,routes:breakdown(value(2),"requestPath"),referrers:breakdown(value(3),"referrerHostname"),devices:breakdown(value(4),"deviceType"),partial:rejected.length>0,...(rejected.length?{message:"Some traffic breakdowns are temporarily unavailable."}:{})};
 cache.set(key,{expiresAt:Date.now()+CACHE_TTL_MS,value:result});
 return result;
}
export async function GET(request:Request){
 try{
  const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
  if(!match)return NextResponse.json({error:"Authentication required."},{status:401});
  const app=firebaseAdminApp();const decoded=await getAuth(app).verifyIdToken(match[1]);
  const admin=await getFirestore(app).collection("admins").doc(decoded.uid).get();
  if(!admin.exists||!["owner","staff"].includes(String(admin.data()?.role??"").toLowerCase()))return NextResponse.json({error:"Owner workspace access required."},{status:403});
  const params=new URL(request.url).searchParams;
  const range:Range=params.get("days")==="30"?30:7;
  const traffic=await queryTraffic(range,params.get("refresh")==="1");
  return NextResponse.json({traffic},{headers:{"Cache-Control":"private, no-store","X-Robots-Tag":"noindex, nofollow"}});
 }catch(error){
  console.error("Infrastructure analytics request failed:",error instanceof Error?error.message:"unknown error");
  return NextResponse.json({error:"Infrastructure analytics are temporarily unavailable."},{status:500});
 }
}
