"use client";
import Link from "next/link";
import {getIdToken,GoogleAuthProvider,browserLocalPersistence,linkWithPopup,onAuthStateChanged,setPersistence,signInWithCredential,signInWithPopup,signOut,type User} from "firebase/auth";
import {useEffect,useState} from "react";
import {auth,hasFirebaseWebConfig} from "@/lib/firebase/client";
import NotificationSettings from "@/components/NotificationSettings";
import CustomerConversations from "@/components/CustomerConversations";
import {getCustomerProfile,isAdminUser,saveCustomerProfile,type CustomerProfile} from "@/lib/firebase/data";
import {subscribeToCustomerPlugRequests,type PlugRequest} from "@/lib/firebase/plug-data";
import MemberCircle from "@/components/MemberCircle";
import MemberPrivacySettings from "@/components/MemberPrivacySettings";
import MemberActivityFeed from "@/components/MemberActivityFeed";
import RequestForm from "@/app/request/request-form";
import CustomerReceipts from "@/components/CustomerReceipts";
import CustomerRewards from "@/components/CustomerRewards";

function authMessage(error:unknown){
 const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:unknown}).code):"";
 if(code==="auth/popup-closed-by-user")return "Google sign-in was cancelled.";
 if(code==="auth/credential-already-in-use"||code==="auth/account-exists-with-different-credential")return "That Google account belongs to a separate The Plug account. The histories have not been merged, and your current session is unchanged. Keep this session open; The Plug cannot safely combine those histories automatically.";
 if(code==="auth/popup-blocked")return "Your browser blocked the Google sign-in window. Allow pop-ups for The Plug and try again.";
 if(code==="auth/unauthorized-domain")return "Google sign-in is not enabled for this website yet. Try again later; your current session has not been changed.";
 if(code==="auth/configuration-not-found"||code==="auth/operation-not-allowed")return "Google sign-in is not available yet. The Plug's sign-in setup is incomplete. Try again later.";
 if(code.startsWith("auth/")||code.startsWith("app/"))return "Google sign-in could not be completed because The Plug’s sign-in setup is not ready. Try again later; your current session has not been changed.";
 return "Google sign-in could not be completed. Please try again later. Your current session has not been changed.";
}
function requestKind(notes:string){return notes.match(/Request type:\s*([^\n]+)/i)?.[1]?.trim()||"Sourcing request"}
function storefrontReference(notes:string){return notes.match(/Storefront listed price when requested:\s*P([0-9,.]+)/i)?.[1]||""}
type SourcingSelectionItem={id:string;title:string;price?:number;type:"find"|"deal"};
const terminal=new Set(["Delivered","Collected","Cancelled"]);

export default function AccountPage(){
 const[user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<CustomerProfile|null>(null),[requests,setRequests]=useState<PlugRequest[]>([]),[busy,setBusy]=useState(false),[authReady,setAuthReady]=useState(false),[message,setMessage]=useState(""),[submittedRequestId,setSubmittedRequestId]=useState(""),[requestsReady,setRequestsReady]=useState(false),[requestIntent,setRequestIntent]=useState(false),[basketReady,setBasketReady]=useState(false),[basketCount,setBasketCount]=useState(0),[basketItems,setBasketItems]=useState<SourcingSelectionItem[]>([]),[selectionReview,setSelectionReview]=useState(false),[hasDirectProduct,setHasDirectProduct]=useState(false);


 useEffect(()=>{const refresh=()=>{try{const list=JSON.parse(localStorage.getItem("theplug:sourcing-selection:v1")||"[]") as SourcingSelectionItem[];const valid=Array.isArray(list)?list.filter(item=>item&&typeof item.id==="string"&&typeof item.title==="string"):[];setBasketItems(valid);setBasketCount(valid.length)}catch{setBasketItems([]);setBasketCount(0)}setBasketReady(true)};refresh();window.addEventListener("theplug:sourcing-selection-changed",refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener("theplug:sourcing-selection-changed",refresh);window.removeEventListener("storage",refresh)}},[]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);if(params.has("submitted")){setMessage("Your request is saved. Frank will review it and confirm availability, final price and timing. Nothing is ordered or charged yet.");setSubmittedRequestId(params.get("submitted")||"")}setHasDirectProduct(params.has("product"));setSelectionReview(params.has("review"));setRequestIntent(params.has("product")||params.has("newRequest"))},[]);
 useEffect(()=>{
  let stopRequests=()=>{};
  let stopAuth=()=>{};
  let disposed=false;
  const start=async()=>{
   if(hasFirebaseWebConfig){
    try{await setPersistence(auth,browserLocalPersistence)}catch{if(!disposed)setMessage("This browser could not confirm saved sign-in. Keep this browser session available while using The Plug.")}
   }
   if(disposed)return;
   stopAuth=onAuthStateChanged(auth,async next=>{
    stopRequests();stopRequests=()=>{};
    if(next&&await isAdminUser(next.uid)){
     await signOut(auth);
     if(disposed)return;
     setUser(null);setProfile(null);setRequests([]);setAuthReady(true);return;
    }
    if(disposed)return;
    setUser(next);
    if(next){
     setRequestsReady(false);
     const saved=await getCustomerProfile(next.uid).catch(()=>null);
     if(disposed)return;
     setProfile(saved??{uid:next.uid,name:next.displayName??"",email:next.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
     stopRequests=subscribeToCustomerPlugRequests(next.uid,nextRequests=>{setRequests(nextRequests);setRequestsReady(true)},error=>{setRequestsReady(true);setMessage(error.message)});
    }else{setProfile(null);setRequests([]);setRequestsReady(true)}
    setAuthReady(true);
   });
  };
  void start();
  return()=>{disposed=true;stopRequests();stopAuth()};
 },[]);

 async function google(){
  if(!authReady||busy)return;
  if(!hasFirebaseWebConfig){setMessage("Google sign-in is not available yet because The Plug's member sign-in setup is incomplete. Try again later; your current session has not been changed.");return;}
  setBusy(true);setMessage("");
  try{
   const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});
   let recoveredExistingAccount=false;
   if(user?.isAnonymous){
    try{
     const linked=await linkWithPopup(user,provider);
     const saved=await getCustomerProfile(linked.user.uid);
     if(saved)setProfile(saved);
    }catch(error){
     const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:unknown}).code):"";
     if(code!=="auth/credential-already-in-use"&&code!=="auth/account-exists-with-different-credential")throw error;
     // The Google identity already has its own UID. Sign into that existing account
     // instead of trapping the customer in an anonymous-session linking error.
     // Do not claim or attempt to merge the separate histories.
     const credential=GoogleAuthProvider.credentialFromError(error as import("firebase/app").FirebaseError);
     if(!credential)throw error;
     const result=await signInWithCredential(auth,credential);
     const now=new Date().toISOString();
     const saved=await getCustomerProfile(result.user.uid);
     if(saved)setProfile(saved);
     else{
      const nextProfile={uid:result.user.uid,name:result.user.displayName??"",email:result.user.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:now,updatedAt:now};
      await saveCustomerProfile(nextProfile);setProfile(nextProfile);
     }
     recoveredExistingAccount=true;
    }
   }
   else if(!user){const result=await signInWithPopup(auth,provider);const now=new Date().toISOString();const saved=await getCustomerProfile(result.user.uid);if(saved)setProfile(saved);else{const nextProfile={uid:result.user.uid,name:result.user.displayName??"",email:result.user.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:now,updatedAt:now};await saveCustomerProfile(nextProfile);setProfile(nextProfile)}}
   setMessage(recoveredExistingAccount?"You’re signed in to your existing The Plug Google account. The separate guest-session history has not been merged.":"Your The Plug account is connected.");
   const destination=new URLSearchParams(window.location.search).get("next");
   if(destination&&destination.startsWith("/")&&!destination.startsWith("//"))window.location.assign(destination);
  }catch(error){setMessage(authMessage(error))}finally{setBusy(false)}
 }

 async function approveQuote(request:PlugRequest){
  if(!user||busy)return;
  setBusy(true);setMessage("");
  try{
   const idToken=await getIdToken(user);
   const response=await fetch("/api/sourcing-request/approve-quote",{method:"POST",headers:{Authorization:"Bearer "+idToken,"Content-Type":"application/json"},body:JSON.stringify({requestId:request.id})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"We could not record your approval. Please try again.");
   setMessage(result.alreadyApproved?"You already approved this exact quote.":"Quote approval saved. Frank can now confirm the deposit and sourcing steps.");
  }catch(error){setMessage(error instanceof Error?error.message:"We could not record your approval. Please try again.");}
  finally{setBusy(false);}
 }

 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!user||!profile)return;setBusy(true);setMessage("");
  const form=new FormData(event.currentTarget);
  const next={...profile,name:String(form.get("name")??"").trim(),email:String(form.get("email")??"").trim(),phone:String(form.get("phone")??"").trim(),preferredDeliveryLocation:String(form.get("preferredDeliveryLocation")??"").trim(),notes:String(form.get("notes")??"").trim(),updatedAt:new Date().toISOString()};
  try{await saveCustomerProfile(next);setProfile(next);setMessage("Your The Plug details are saved.")}catch{setMessage("We could not save your details. Nothing was changed; please try again.")}finally{setBusy(false)}
 }

 return <main className="orderPage"><div className="orderWrap">
  <div className="orderHeader plugCareHeader"><Link href="/" className="logo"><span className="logoMark">P</span><span>THE PLUG<small>YOUR CUSTOMER CARE SPACE</small></span></Link><nav aria-label="My Plug navigation" className="accountTopNav"><Link href="/?select=1#featured" className="button buttonLight">Store</Link><a href="#requests" className="button buttonLight">My requests</a><a href="#messages" className="button buttonLight">Messages</a><a href="#receipts" className="button buttonLight">Receipts</a><a href="#rewards" className="button buttonLight">Rewards</a><a href="#profile" className="button buttonLight">My details</a></nav></div>
  <section className="orderCard accountHome" style={{maxWidth:920,margin:"0 auto"}}>
   <div className="accountHero"><div><span className="kicker">MY PLUG · CUSTOMER CARE</span><h1>Your Plug.</h1><p>Your finds, sourcing requests and conversations with Frank — together in one place.</p><Link href="/?select=1#featured" className="accountHeroNewRequest">＋ Build a sourcing list</Link></div>{user&&profile&&<span className="accountStatus">{user.isAnonymous?"Guest session":"Google connected"}</span>}</div>{requestIntent&&<section className="accountRequestStage"><div className="accountRequestStageHead"><span className="kicker">{selectionReview?"REVIEW YOUR SOURCING LIST":"BUILD YOUR SOURCING LIST"}</span><Link href="/?select=1#featured" className="textLink">Browse the store ↗</Link></div>{selectionReview&&basketItems.length>0?<div className="plugSelectionReview"><div className="plugSelectionReviewHeading"><strong>{basketItems.length} {basketItems.length===1?"find":"finds"} selected</strong><span>Choose what Frank should source. These are reference prices, not a payment or confirmed quote.</span></div><div className="plugSelectionReviewItems">{basketItems.map(item=><article key={item.id}><div><strong>{item.title}</strong><small>{item.type==="deal"?"Live offer":"Featured find"}</small></div><b>{typeof item.price==="number"?"P"+item.price.toLocaleString("en-BW",{maximumFractionDigits:2}):"Price to confirm"}</b></article>)}</div><div className="plugSelectionReviewTotal"><span>Storefront reference total</span><strong>P{basketItems.reduce((sum,item)=>sum+(typeof item.price==="number"?item.price:0),0).toLocaleString("en-BW",{minimumFractionDigits:2,maximumFractionDigits:2})}</strong></div><div className="plugSelectionReviewActions"><Link href="/?select=1#featured" className="button buttonLight">Add more finds</Link><button type="button" className="button buttonPrimary" onClick={()=>{const product=basketItems.map(item=>item.title).join(" + ");const total=basketItems.reduce((sum,item)=>sum+(typeof item.price==="number"?item.price:0),0);window.location.assign("/account?newRequest=1&fromSelection=1&product="+encodeURIComponent(product)+"&price="+encodeURIComponent(String(total))+"&itemType=find")}}>Continue to request details →</button></div></div>:basketReady&&basketCount===0&&!hasDirectProduct?<div className="plugAccountBuilderEmpty"><strong>Start with the finds you want.</strong><p>Browse Featured Finds and Live Offers. Tick the products you want Frank to review, then bring them back here together.</p><Link href="/?select=1#featured" className="button buttonPrimary">Choose products from the store →</Link></div>:<RequestForm embedded/>}</section>}




   {user&&profile&&<>
    {requests.length===0?(requestIntent?null:submittedRequestId?<article id="requests" className="feedEmpty"><strong>{requestsReady?"Your saved request hasn’t appeared yet.":"Opening your saved request…"}</strong><p>{requestsReady?"Your submission was confirmed, but My Plug has not received the matching private record yet. Keep this browser session open and refresh in a moment.":"Loading the request you just sent to Frank."}</p></article>:<article id="requests" className="feedEmpty"><strong>Nothing here yet.</strong><p>Found something? Send it to Frank and your request will show up here.</p><Link className="button buttonPrimary" href="/?select=1#featured">Browse finds to request →</Link></article>):<section id="requests" className="accountSection accountRequestsSection"><div className="panelHeading accountRequestsHeading"><div><span className="kicker">REQUESTS · {requests.length}</span><h2>Your sourcing requests.</h2></div>{!requestIntent&&<Link className="button buttonPrimary" href="/?select=1#featured">New request +</Link>}</div><div className="feedList">{[...requests].sort((a,b)=>Number(b.id===submittedRequestId)-Number(a.id===submittedRequestId)).map(request=>{const justSubmitted=request.id===submittedRequestId;const complete=terminal.has(request.status);const quote=request.quotedPrice!==undefined?" · Quote P"+request.quotedPrice.toFixed(2):"";return <article className={"feedItem"+(justSubmitted?" feedItemJustSubmitted":"")} key={request.id}><div className="feedMarker">{complete?"✓":"•"}</div><div className="feedBody">{justSubmitted&&<span className="requestSavedMarker">JUST SUBMITTED · SAVED</span>}<div className="feedTop"><strong>{request.status}</strong><small>{new Date(request.updatedAt).toLocaleString()}</small></div><span className="accountRequestType">{requestKind(request.notes||"")}</span><p className="accountRequestProduct">{request.product}{request.size?" · "+request.size:""}{request.colour?" · "+request.colour:""}{quote}</p>{storefrontReference(request.notes||"")&&<div className="accountRequestReference"><span>STOREFRONT LISTED PRICE</span><strong>P{storefrontReference(request.notes||"")}</strong><small>Reference only · not paid · Frank confirms availability and final price</small></div>}<div className="feedActions"><span>{request.depositPaid!==undefined&&request.depositRequired!==undefined?"Deposit P"+request.depositPaid.toFixed(2)+" / P"+request.depositRequired.toFixed(2):"No deposit recorded yet"}</span><Link className="button buttonLight" href={"/requests/"+request.id}>Track request</Link></div>{request.quotedPrice!==undefined&&["Quote Ready","Awaiting Deposit"].includes(request.status)&&request.customerApprovedPrice!==request.quotedPrice&&<div className="feedActions"><p className="orderTruth">Review the confirmed quote of P{request.quotedPrice.toFixed(2)}. Nothing is charged by approving it.</p><button className="button buttonPrimary" type="button" disabled={busy} onClick={()=>void approveQuote(request)}>{busy?"Saving approval…":"Approve this quote"}</button></div>}{request.customerApprovedAt&&request.customerApprovedPrice!==undefined&&request.customerApprovedPrice===request.quotedPrice&&<p className="orderTruth">You approved this quote on {new Date(request.customerApprovedAt).toLocaleString()}.</p>}</div></article>})}</div></section>}
   </>}


   {user&&<div id="messages" className="accountCareMessages"><CustomerConversations/></div>}
   {user&&profile&&<CustomerReceipts requests={requests}/>}
   {user&&<CustomerRewards uid={user.uid} completedPurchases={requests.filter(request=>["Delivered","Collected"].includes(request.status)&&request.quotedPrice!==undefined&&(request.depositPaid??0)+0.009>=request.quotedPrice).length}/> }
   {user&&<details className="memberSetup accountSetupDisclosure" ><summary className="accountSetupSummary"><span className="kicker">OPTIONAL SETUP</span><strong>Account, updates & your circle</strong><small>Connect Google, choose useful notifications and manage what you share.</small><b aria-hidden="true">＋</b></summary><div className="accountSetupBody"><div className="memberSetupHeading"><span className="kicker">MAKE IT YOURS</span><h2 id="member-setup-title">{user.isAnonymous?"Keep your Plug history. Make it yours.":"Your Plug, your way."}</h2><p>{user.isAnonymous?"One quick account connection helps keep this request and future conversations together when you change devices. You can set the rest up whenever you like.":"A few optional choices make The Plug more useful: relevant updates, a feed that fits you and friends you choose to connect with."}</p></div><div className="memberSetupGrid">{user.isAnonymous?<><a href="#notifications" className="memberSetupCard memberSetupCardPrimary"><span>01 · START HERE</span><strong>Choose useful updates <b aria-hidden="true">↗</b></strong><small>Set up supported request and reply notifications on this device now. No Google connection needed to start.</small></a><a href="#connect" className="memberSetupCard"><span>02 · KEEP YOUR HISTORY</span><strong>Connect Google <b aria-hidden="true">↗</b></strong><small>Optional for now; recommended before changing devices so you can keep access to requests and private conversations.</small></a><div className="memberSetupCard memberSetupCardLater"><span>03 · YOUR CIRCLE</span><strong>Connect with friends</strong><small>Once your account is connected, invite friends and share only what you choose.</small></div><div className="memberSetupCard memberSetupCardLater"><span>04 · YOUR CHOICES</span><strong>Set interests & privacy</strong><small>After connecting your account, choose interests and what connected friends can see.</small></div></>:<><div className="memberSetupCard memberSetupCardComplete"><span>01 · ACCOUNT</span><strong>Account connected <b aria-hidden="true">✓</b></strong><small>Your request history and private conversations are linked to this Google account.</small></div><a href="#notifications" className="memberSetupCard"><span>02 · STAY IN THE LOOP</span><strong>Choose your alerts <b aria-hidden="true">↗</b></strong><small>Enable this device for supported request and reply updates when you want them.</small></a><a href="#friends" className="memberSetupCard"><span>03 · YOUR CIRCLE</span><strong>Invite a friend <b aria-hidden="true">↗</b></strong><small>Connect with people you trust, then share only the finds and interests you choose.</small></a><a href="#privacy" className="memberSetupCard"><span>04 · YOUR CHOICES</span><strong>Choose interests & privacy <b aria-hidden="true">↗</b></strong><small>Pick new drops, seasonal buys and loyalty updates; decide what connected friends can see.</small></a></>}</div><p className="memberSetupFootnote">Your sourcing requests, WhatsApp number, private messages and payment details are not shared with friends. Promotions and loyalty notices are sent only when relevant offers and supported update events exist.</p>{user&&profile&&<section className="accountSection accountSetupNotifications" id="notifications"><div className="panelHeading"><div><span className="kicker">PREFERENCES</span><h2>Notifications.</h2></div></div><NotificationSettings/></section>}{user&&!user.isAnonymous&&profile&&<><MemberPrivacySettings user={user} displayName={profile.name||user.displayName||"A Plug member"}/><MemberCircle user={user} displayName={profile.name||user.displayName||"A Plug member"}/></>}</div></details>}
   {(!user||user.isAnonymous)&&!requestIntent&&<section id="connect" className="accountConnect accountConnectPrimary"><div><strong>{user?.isAnonymous?"Keep your history and set up your circle.":"Already have a Plug account?"}</strong><p>{user?.isAnonymous?"When you return on this browser, The Plug will reopen this session and its saved requests. Connect Google only if you want to access the same history on other devices.":"Continue with Google to reopen an existing account and its saved history. New to The Plug? Start a request first; your private session is created only when you submit."}</p>{!hasFirebaseWebConfig&&<p className="notice" role="status">The Plug cannot connect or save requests in this deployment yet. Try again later; nothing has been sent.</p>}</div><div className="actions"><button className="googleSignInButton" type="button" onClick={()=>void google()} disabled={busy||!authReady||!hasFirebaseWebConfig}><span>{!authReady?"Restoring your session…":busy?"Connecting…":user?.isAnonymous?"Connect Google":"Continue with Google"}</span></button>{!user&&<Link className="button buttonLight" href="/?select=1#featured">Browse finds</Link>}</div></section>}


   {message&&<p className="notice" role="status">{message}</p>}

   {user&&!user.isAnonymous&&profile&&<><MemberActivityFeed user={user}/>
      <div className="accountBottomActions"><button className="button buttonLight" type="button" onClick={()=>void signOut(auth)}>Sign out</button><span className="orderTruth">Your account keeps your member activity together.</span></div></>}
   {user&&profile&&<details id="profile" className="accountDetails"><summary><span><strong>Your details</strong><small>Name, WhatsApp, delivery preference and notes</small></span><b>Edit</b></summary><form className="adminForm" onSubmit={save}><label>Name<input name="name" defaultValue={profile.name} required/></label><label>Email<input name="email" type="email" defaultValue={profile.email} readOnly={Boolean(user.email)} required={!user.isAnonymous}/>{user.isAnonymous&&<span>Optional until you connect Google.</span>}</label><label>WhatsApp / phone<input name="phone" type="tel" defaultValue={profile.phone} required/></label><label>Preferred delivery location <span>(optional)</span><input name="preferredDeliveryLocation" defaultValue={profile.preferredDeliveryLocation}/></label><label>Notes <span>(optional)</span><textarea name="notes" defaultValue={profile.notes}/></label><button className="button buttonPrimary" type="submit" disabled={busy}>{busy?"Saving…":"Save my details"}</button></form></details>}
   {user&&!user.isAnonymous&&<details id="external-links" className="accountDetails"><summary><span><strong>External links</strong><small>For when you actually need them</small></span><b>Open</b></summary><div className="adminForm"><p className="orderTruth">Your requests, conversations and The Plug activity come first. Open these only when you want to leave The Plug.</p><p><a href="https://wa.me/c/26776411150" target="_blank" rel="noreferrer">WhatsApp catalogue ↗</a></p><p><a href="https://www.instagram.com/the.plugworldwidebw/" target="_blank" rel="noreferrer">Instagram ↗</a></p></div></details>}
   <p className="accountFooterNote orderTruth">{user?.isAnonymous?"This browser remembers your guest session. Connect Google before using another device to access the same requests and private conversations there.":"Frank confirms the price and timing before you pay."}</p>
  </section>
 </div></main>;
}
