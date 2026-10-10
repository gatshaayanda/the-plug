"use client";
import Link from "next/link";
import {GoogleAuthProvider,browserLocalPersistence,linkWithPopup,onAuthStateChanged,setPersistence,signInAnonymously,signInWithPopup,signOut,type User} from "firebase/auth";
import {useEffect,useRef,useState} from "react";
import {auth,hasFirebaseWebConfig} from "@/lib/firebase/client";
import NotificationSettings from "@/components/NotificationSettings";
import CustomerConversations from "@/components/CustomerConversations";
import {getCustomerProfile,isAdminUser,saveCustomerProfile,type CustomerProfile} from "@/lib/firebase/data";
import {subscribeToCustomerPlugRequests,type PlugRequest} from "@/lib/firebase/plug-data";

function authMessage(error:unknown){
 const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:unknown}).code):"";
 if(code==="auth/popup-closed-by-user")return "Google sign-in was cancelled.";
 if(code==="auth/credential-already-in-use"||code==="auth/account-exists-with-different-credential")return "That Google account already has a separate The Plug account. Your current activity has not been moved. Keep using this session for now and contact Frank before switching accounts.";
 if(code==="auth/popup-blocked")return "Your browser blocked the Google sign-in window. Allow pop-ups for The Plug and try again.";
 if(code==="auth/unauthorized-domain")return "Google sign-in is not enabled for this website yet. Please contact Frank on WhatsApp while The Plug finishes setup.";
 if(code==="auth/configuration-not-found"||code==="auth/operation-not-allowed")return "Google sign-in is not available yet. The Plug's sign-in setup is incomplete; please contact Frank on WhatsApp for now.";
 if(code.startsWith("auth/")||code.startsWith("app/"))return "Google sign-in could not be completed because The Plug’s sign-in setup is not ready. Please contact Frank on WhatsApp for now.";
 return "Google sign-in could not be completed. Please try again later or contact Frank on WhatsApp.";
}
const terminal=new Set(["Delivered","Collected","Cancelled"]);

export default function AccountPage(){
 const[user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<CustomerProfile|null>(null),[requests,setRequests]=useState<PlugRequest[]>([]),[busy,setBusy]=useState(false),[authReady,setAuthReady]=useState(false),[message,setMessage]=useState("");
 const suppressAutoAnonymous=useRef(false);

 useEffect(()=>{
  let stopRequests=()=>{};
  void setPersistence(auth,browserLocalPersistence).catch(()=>{});
  const stopAuth=onAuthStateChanged(auth,async next=>{
   stopRequests();stopRequests=()=>{};
   if(!next&&hasFirebaseWebConfig&&!suppressAutoAnonymous.current){try{await signInAnonymously(auth);return}catch{setMessage("The Plug could not start a private session on this device. Please try again or contact Frank on WhatsApp.")}}
   if(next&&await isAdminUser(next.uid)){await signOut(auth);setUser(null);setProfile(null);setRequests([]);setAuthReady(true);return}
   setUser(next);
   if(next){
    const saved=await getCustomerProfile(next.uid).catch(()=>null);
    setProfile(saved??{uid:next.uid,name:next.displayName??"",email:next.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    stopRequests=subscribeToCustomerPlugRequests(next.uid,setRequests,error=>setMessage(error.message));
   }else{setProfile(null);setRequests([])}
   setAuthReady(true);
  });
  return()=>{stopRequests();stopAuth()};
 },[]);

 async function google(){
  if(!authReady||busy)return;
  if(!hasFirebaseWebConfig){setMessage("Google sign-in is not available yet because The Plug's member sign-in setup is incomplete. Please contact Frank on WhatsApp for now.");return;}
  setBusy(true);setMessage("");
  try{
   const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});
   if(user?.isAnonymous){const linked=await linkWithPopup(user,provider);const saved=await getCustomerProfile(linked.user.uid);if(saved)setProfile(saved)}
   else if(!user){const result=await signInWithPopup(auth,provider);const now=new Date().toISOString();const saved=await getCustomerProfile(result.user.uid);if(saved)setProfile(saved);else{const nextProfile={uid:result.user.uid,name:result.user.displayName??"",email:result.user.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:now,updatedAt:now};await saveCustomerProfile(nextProfile);setProfile(nextProfile)}}
   setMessage("Your The Plug account is connected.");
   const destination=new URLSearchParams(window.location.search).get("next");
   if(destination&&destination.startsWith("/")&&!destination.startsWith("//"))window.location.assign(destination);
  }catch(error){setMessage(authMessage(error))}finally{setBusy(false)}
 }

 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!user||!profile)return;setBusy(true);setMessage("");
  const form=new FormData(event.currentTarget);
  const next={...profile,name:String(form.get("name")??"").trim(),email:String(form.get("email")??"").trim(),phone:String(form.get("phone")??"").trim(),preferredDeliveryLocation:String(form.get("preferredDeliveryLocation")??"").trim(),notes:String(form.get("notes")??"").trim(),updatedAt:new Date().toISOString()};
  try{await saveCustomerProfile(next);setProfile(next);setMessage("Your The Plug details are saved.")}catch{setMessage("We could not save your details. The app is still being built; please try again later or use WhatsApp.")}finally{setBusy(false)}
 }

 return <main className="orderPage"><div className="orderWrap">
  <div className="orderHeader"><Link href="/" className="logo"><span className="logoMark">P</span><span>THE PLUG</span></Link><Link href="/request" className="button buttonPrimary">Request a product</Link></div>
  <section className="orderCard accountHome" style={{maxWidth:920,margin:"0 auto"}}>
   <div className="accountHero"><div><span className="kicker">MY THE PLUG</span><h1>Your requests.</h1><p>See your requests, messages and order progress here.</p></div></div>
   {((!user&&!hasFirebaseWebConfig)||(user?.isAnonymous&&requests.length>0))&&<section className="accountConnect accountConnectPrimary"><div><strong>{user?.isAnonymous?"Keep your history if you change phones.":"Your space is almost ready."}</strong><p>{user?.isAnonymous?"Connect Google to get back to your requests and messages on another device.":"Start a request or contact Frank to get going."}</p>{!hasFirebaseWebConfig&&<p className="notice" role="status">The Plug is not ready to save requests here yet. Please WhatsApp Frank for now.</p>}</div><button className="googleSignInButton" type="button" onClick={()=>void google()} disabled={busy||!authReady||!hasFirebaseWebConfig}><span>{!authReady?"Opening The Plug…":busy?"Connecting…":!hasFirebaseWebConfig?"Not available yet":user?.isAnonymous?"Connect Google":"Continue with Google"}</span></button></section>}
   {user&&profile&&<>
    {requests.length===0?<article className="feedEmpty"><strong>Nothing here yet.</strong><p>Found something? Send it to Frank and your request will show up here.</p><Link className="button buttonPrimary" href="/request">Start a request →</Link></article>:<section className="accountSection"><div className="panelHeading"><div><span className="kicker">Requests</span><h2>Your sourcing requests.</h2></div></div><div className="feedList">{requests.map(request=>{const complete=terminal.has(request.status);const quote=request.quotedPrice!==undefined?" · Quote P"+request.quotedPrice.toFixed(2):"";return <article className="feedItem" key={request.id}><div className="feedMarker">{complete?"✓":"•"}</div><div className="feedBody"><div className="feedTop"><strong>{request.status}</strong><small>{new Date(request.updatedAt).toLocaleString()}</small></div><p>{request.product}{request.size?" · "+request.size:""}{request.colour?" · "+request.colour:""}{quote}</p><div className="feedActions"><span>{request.depositPaid!==undefined&&request.depositRequired!==undefined?"Deposit P"+request.depositPaid.toFixed(2)+" / P"+request.depositRequired.toFixed(2):"No deposit recorded yet"}</span><Link className="button buttonLight" href={"/requests/"+request.id}>Track request</Link></div></div></article>})}</div></section>}
   </>}
   {user&&<CustomerConversations/>}
   {message&&<p className="notice" role="status">{message}</p>}
   {user&&profile&&<details id="profile" className="accountDetails"><summary><span><strong>Your details</strong><small>Name, WhatsApp, delivery preference and notes</small></span><b>Edit</b></summary><form className="adminForm" onSubmit={save}><label>Name<input name="name" defaultValue={profile.name} required/></label><label>Email<input name="email" type="email" defaultValue={profile.email} readOnly={Boolean(user.email)} required={!user.isAnonymous}/>{user.isAnonymous&&<span>Optional until you connect Google.</span>}</label><label>WhatsApp / phone<input name="phone" type="tel" defaultValue={profile.phone} required/></label><label>Preferred delivery location <span>(optional)</span><input name="preferredDeliveryLocation" defaultValue={profile.preferredDeliveryLocation}/></label><label>Notes <span>(optional)</span><textarea name="notes" defaultValue={profile.notes}/></label><button className="button buttonPrimary" type="submit" disabled={busy}>{busy?"Saving…":"Save my details"}</button></form></details>}
   {user&&!user.isAnonymous&&<><section className="accountSection" id="notifications"><div className="panelHeading"><div><span className="kicker">Preferences</span><h2>Notifications.</h2></div></div><NotificationSettings/></section><div className="accountBottomActions"><button className="button buttonLight" type="button" onClick={()=>{suppressAutoAnonymous.current=true;void signOut(auth)}}>Sign out</button><span className="orderTruth">Your account keeps your member activity together.</span></div></>}
   <p className="accountFooterNote orderTruth">{user?.isAnonymous?"Connect Google before changing devices if you want to keep access to your history.":"Frank confirms the price and timing before you pay."}</p>
  </section>
 </div></main>;
}
