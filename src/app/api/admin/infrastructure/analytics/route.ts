import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

export const runtime="nodejs";
export const dynamic="force-dynamic";

function firebaseAdminApp(){
 const existing=getApps()[0];
 if(existing)return existing;
 const raw=process.env.FIREBASE_ADMIN_KEY;
 if(!raw)throw new Error("Owner authentication is not configured.");
 const account=JSON.parse(raw) as Record<string,unknown>;
 return initializeApp({credential:cert(account as Parameters<typeof cert>[0])});
}

export async function GET(request:Request){
 try{
  const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
  if(!match)return NextResponse.json({error:"Authentication required."},{status:401});
  const app=firebaseAdminApp();
  const decoded=await getAuth(app).verifyIdToken(match[1]);
  const admin=await getFirestore(app).collection("admins").doc(decoded.uid).get();
  if(!admin.exists||!["owner","staff"].includes(String(admin.data()?.role??"").toLowerCase())){
   return NextResponse.json({error:"Owner workspace access required."},{status:403});
  }

  const token=process.env.VERCEL_API_TOKEN||process.env.VERCEL_TOKEN;
  const projectId=process.env.VERCEL_PROJECT_ID;
  const teamId=process.env.VERCEL_TEAM_ID||process.env.VERCEL_ORG_ID;
  if(!token||!projectId){
   return NextResponse.json({error:"Vercel Analytics API credentials are not configured for this deployment."},{status:503});
  }

  const requestedDays=Number(new URL(request.url).searchParams.get("days")||30);
  const periodDays=[7,30,90].includes(requestedDays)?requestedDays:30;
  const now=new Date();
  const since=new Date(now.getTime()-periodDays*86400000);
  const url=new URL("https://api.vercel.com/v1/query/web-analytics/visits/count");
  url.searchParams.set("projectId",projectId);
  url.searchParams.set("since",since.toISOString());
  url.searchParams.set("until",now.toISOString());
  if(teamId)url.searchParams.set("teamId",teamId);

  const response=await fetch(url,{headers:{Authorization:"Bearer "+token,Accept:"application/json"},cache:"no-store"});
  const payload=await response.json().catch(()=>null) as {data?:{pageviews?:number;visitors?:number};error?:{message?:string};message?:string}|null;
  if(!response.ok){
   console.error("Vercel Web Analytics query failed:",response.status,payload?.error?.message||payload?.message||"API error");
   return NextResponse.json({error:"Vercel Web Analytics could not return traffic totals."},{status:502});
  }
  return NextResponse.json({
   pageviews:Number(payload?.data?.pageviews??0),
   visitors:Number(payload?.data?.visitors??0),
   periodDays,
   queriedAt:now.toISOString()
  },{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  console.error("Infrastructure analytics request failed:",error instanceof Error?error.message:"unknown error");
  return NextResponse.json({error:"Infrastructure analytics are temporarily unavailable."},{status:500});
 }
}
