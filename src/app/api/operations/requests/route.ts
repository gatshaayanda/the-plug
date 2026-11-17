import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

export const runtime="nodejs";

function adminApp(){
 const existing=getApps()[0];
 if(existing)return existing;
 const raw=process.env.FIREBASE_ADMIN_KEY;
 if(!raw)throw new Error("Operations request sync is not configured.");
 let serviceAccount:Record<string,unknown>;
 try{serviceAccount=JSON.parse(raw) as Record<string,unknown>}
 catch{throw new Error("Operations request sync credentials are invalid.")}
 return initializeApp({credential:cert(serviceAccount as Parameters<typeof cert>[0])});
}

export async function GET(request:Request){
 try{
  const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
  if(!match)return NextResponse.json({error:"Your Operations session has expired. Sign in again."},{status:401});
  const app=adminApp();
  const decoded=await getAuth(app).verifyIdToken(match[1]);
  const db=getFirestore(app);
  const admin=await db.collection("admins").doc(decoded.uid).get();
  const role=String(admin.data()?.role||"").toLowerCase();
  if(!admin.exists||!["owner","staff"].includes(role))return NextResponse.json({error:"Only authorized Operations staff can view sourcing requests."},{status:403});
  const snapshot=await db.collection("sourcingRequests").get();
  const requests=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>String(b.updatedAt||b.createdAt||"").localeCompare(String(a.updatedAt||a.createdAt||"")));
  return NextResponse.json({requests,checkedAt:new Date().toISOString(),count:requests.length},{headers:{"Cache-Control":"no-store, max-age=0"}});
 }catch(error){
  console.error("[The Plug] Operations request sync failed:",error);
  return NextResponse.json({error:"The sourcing records could not be refreshed. Check the Operations Firebase connection."},{status:500});
 }
}
