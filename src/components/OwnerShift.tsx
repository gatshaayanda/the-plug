"use client";
import {useEffect,useMemo,useState} from "react";
import {doc,getDoc} from "firebase/firestore";
import {signOut} from "firebase/auth";
import {auth,db} from "@/lib/firebase/client";

type Shift={startedAt:number;expiresAt:number;lastActivityAt:number;durationHours:number};
const KEY="theplug:owner-shift:v1";
const durations=[1,2,4,6,8,10,12,16,20,24];
const clock=(ms:number)=>{const seconds=Math.max(0,Math.floor(ms/1000));return [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,"0")).join(":")};

export default function OwnerShift(){
 const[isOwner,setIsOwner]=useState(false),[shift,setShift]=useState<Shift|null>(null),[now,setNow]=useState(Date.now()),[duration,setDuration]=useState(12),[ending,setEnding]=useState(false);
 useEffect(()=>{let live=true;const user=auth.currentUser;if(!user)return()=>{live=false};void getDoc(doc(db,"admins",user.uid)).then(snapshot=>{if(!live||!snapshot.exists()||String(snapshot.data().role??"").toLowerCase()!=="owner")return;setIsOwner(true);let saved:Shift|null=null;try{const raw=localStorage.getItem(KEY);if(raw)saved=JSON.parse(raw) as Shift;}catch{}const time=Date.now();if(saved&&Number.isFinite(saved.startedAt)&&saved.expiresAt>time&&time-saved.lastActivityAt<30*60*1000){setShift(saved);setDuration(saved.durationHours);}else{const fresh={startedAt:time,expiresAt:time+12*60*60*1000,lastActivityAt:time,durationHours:12};setShift(fresh);localStorage.setItem(KEY,JSON.stringify(fresh));}}).catch(()=>{});return()=>{live=false}},[]);
 useEffect(()=>{if(!isOwner||!shift)return;const tick=()=>{const time=Date.now();setNow(time);if(time-shift.lastActivityAt>=30*60*1000||time>=shift.expiresAt){localStorage.removeItem(KEY);setShift(null);void signOut(auth);return;} };const id=window.setInterval(tick,1000);const activity=()=>{const time=Date.now();setShift(current=>{if(!current||time-current.lastActivityAt<15000)return current;const next={...current,lastActivityAt:time};localStorage.setItem(KEY,JSON.stringify(next));return next;});};const events=["pointerdown","keydown","touchstart","scroll"];events.forEach(name=>window.addEventListener(name,activity,{passive:true}));return()=>{window.clearInterval(id);events.forEach(name=>window.removeEventListener(name,activity));}},[isOwner,shift?.startedAt,shift?.expiresAt,shift?.lastActivityAt]);
 async function endShift(){setEnding(true);localStorage.removeItem(KEY);setShift(null);await signOut(auth).catch(()=>{});setEnding(false);}
 function updateDuration(hours:number){setDuration(hours);if(!shift)return;const next={...shift,durationHours:hours,expiresAt:shift.startedAt+hours*60*60*1000};setShift(next);localStorage.setItem(KEY,JSON.stringify(next));}
 const elapsed=useMemo(()=>shift?clock(now-shift.startedAt):"00:00:00",[now,shift]);
 if(!isOwner||!shift)return null;
 return <details className="plugOwnerShift" style={{margin:"0 0 18px",border:"1px solid var(--line,#d9dee8)",borderRadius:16,background:"var(--panel,#fff)",overflow:"hidden"}}>
  <summary style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",cursor:"pointer",listStyle:"none"}}>
   <span aria-hidden="true" style={{fontSize:24,lineHeight:1}}>◷</span><span style={{display:"grid",gap:3,flex:1}}><small style={{fontSize:10,fontWeight:800,letterSpacing:".12em"}}>OWNER SHIFT</small><strong>Shift active</strong></span>
   <span style={{fontSize:11,fontWeight:800,color:"#16866a",letterSpacing:".08em"}}>● ACTIVE</span><span style={{fontSize:12,fontWeight:700}}>Manage shift⌄</span>
  </summary>
  <div style={{padding:"0 16px 16px",borderTop:"1px solid var(--line,#d9dee8)"}}>
   <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:12,padding:"14px 0"}}>
    <div><small style={{display:"block",opacity:.7}}>Time on shift</small><strong style={{fontSize:20,fontVariantNumeric:"tabular-nums"}}>{elapsed}</strong><small style={{display:"block",opacity:.65}}>Started {new Date(shift.startedAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></div>
    <div><small style={{display:"block",opacity:.7}}>Session expires in</small><strong style={{fontSize:20,fontVariantNumeric:"tabular-nums"}}>{clock(shift.expiresAt-now)}</strong><small style={{display:"block",opacity:.65}}>Automatic expiry</small></div>
   </div>
   <div style={{display:"flex",alignItems:"end",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
    <label style={{display:"grid",gap:6,fontSize:12,fontWeight:650}}>Maximum session (applies to this shift)<select value={duration} onChange={e=>updateDuration(Number(e.target.value))} style={{minHeight:42,padding:"8px 12px",borderRadius:10,border:"1px solid var(--line,#d9dee8)",background:"var(--background,#fff)",color:"inherit"}}>{durations.map(hours=><option key={hours} value={hours}>{hours} hours</option>)}</select></label>
    <button type="button" className="button buttonLight" onClick={()=>void endShift()} disabled={ending}>{ending?"Ending…":"End shift / Sign out"}</button>
   </div>
   <p style={{fontSize:12,lineHeight:1.5,opacity:.72,margin:"12px 0 0"}}>Shift time runs while the owner Briefcase is open. It ends after 30 minutes without activity, at the maximum session duration, or when you sign out.</p>
  </div>
 </details>;
}
