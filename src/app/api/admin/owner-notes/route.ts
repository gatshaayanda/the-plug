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
 if(!raw)throw new Error("Private owner storage is not configured.");
 const account=JSON.parse(raw) as Record<string,unknown>;
 return initializeApp({credential:cert(account as Parameters<typeof cert>[0])});
}

async function ownerUid(request:Request){
 const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
 if(!match)return null;
 const app=firebaseAdminApp();
 const decoded=await getAuth(app).verifyIdToken(match[1]);
 const admin=await getFirestore(app).collection("admins").doc(decoded.uid).get();
 if(!admin.exists||!["owner","Owner"].includes(String(admin.data()?.role??"")))return null;
 return decoded.uid;
}

export async function GET(request:Request){
 try{
  const uid=await ownerUid(request);
  if(!uid)return NextResponse.json({error:"Private owner access required."},{status:403});
  const snapshot=await getFirestore(firebaseAdminApp()).collection("ownerWorkspace").doc(uid).get();
  return NextResponse.json({notes:typeof snapshot.data()?.notes==="string"?snapshot.data()!.notes:"",updatedAt:snapshot.data()?.updatedAt??null},{headers:{"Cache-Control":"private, no-store"}});
 }catch(error){
  console.error("Private owner notes read failed:",error instanceof Error?error.message:"unknown error");
  return NextResponse.json({error:"Private owner notes could not be loaded."},{status:500});
 }
}

export async function PUT(request:Request){
 try{
  const uid=await ownerUid(request);
  if(!uid)return NextResponse.json({error:"Private owner access required."},{status:403});
  const body=await request.json().catch(()=>null) as {notes?:unknown}|null;
  if(typeof body?.notes!=="string"||body.notes.length>12000)return NextResponse.json({error:"Notes must be text under 12,000 characters."},{status:400});
  const updatedAt=new Date().toISOString();
  await getFirestore(firebaseAdminApp()).collection("ownerWorkspace").doc(uid).set({notes:body.notes,updatedAt},{merge:true});
  return NextResponse.json({ok:true,updatedAt},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("Private owner notes write failed:",error instanceof Error?error.message:"unknown error");
  return NextResponse.json({error:"Private owner notes could not be saved."},{status:500});
 }
}
