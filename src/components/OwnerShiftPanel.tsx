"use client";
import {useEffect,useState} from "react";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase/client";

const KEY="theplug:owner-shift:v1";
const DURATION_KEY="theplug:owner-shift-duration:v1";
const IDLE_LIMIT=30*60*1000;
type Shift={startedAt:number;expiresAt:number;lastActivity:number};

function readShift():Shift|null{
 try{const raw=localStorage.getItem(KEY);if(!raw)return null;const value=JSON.parse(raw) as Shift;if(!Number.isFinite(value.startedAt)||!Number.isFinite(value.expiresAt)||!Number.isFinite(value.lastActivity))return null;return value}catch{return null}
}
function clock(ms:number){const seconds=Math.max(0,Math.floor(ms/1000));return [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(value=>String(value).padStart(2,"0")).join(":")}

export default function OwnerShiftPanel(){
 const[shift,setShift]=useState<Shift|null>(null),[now,setNow]=useState(Date.now()),[duration,setDuration]=useState(12),[expanded,setExpanded]=useState(false);
 useEffect(()=>{
  const savedDuration=Number(localStorage.getItem(DURATION_KEY));
  const hours=Number.isInteger(savedDuration)&&savedDuration>=1&&savedDuration<=24?savedDuration:12;
  setDuration(hours);
  const existing=readShift();
  const current=Date.now();
  const valid=existing&&current<existing.expiresAt&&current-existing.lastActivity<IDLE_LIMIT?existing:{startedAt:current,expiresAt:current+hours*3600000,lastActivity:current};
  setShift(valid);localStorage.setItem(KEY,JSON.stringify(valid));
  const activity=()=>setShift(previous=>{if(!previous)return previous;const next={...previous,lastActivity:Date.now()};localStorage.setItem(KEY,JSON.stringify(next));return next});
  const events=["pointerdown","keydown","touchstart","wheel"];
  events.forEach(name=>window.addEventListener(name,activity,{passive:true}));
  const timer=window.setInterval(()=>{const stamp=Date.now();setNow(stamp);const currentShift=readShift();if(currentShift&&(stamp>=currentShift.expiresAt||stamp-currentShift.lastActivity>=IDLE_LIMIT)){localStorage.removeItem(KEY);void signOut(auth);setShift(null)}},1000);
  const close=()=>{localStorage.removeItem(KEY)};
  window.addEventListener("pagehide",close);
  return()=>{events.forEach(name=>window.removeEventListener(name,activity));window.clearInterval(timer);window.removeEventListener("pagehide",close)};
 },[]);
 function changeDuration(hours:number){const safe=Math.max(1,Math.min(24,hours));setDuration(safe);localStorage.setItem(DURATION_KEY,String(safe));setShift(previous=>{if(!previous)return previous;const next={...previous,expiresAt:previous.startedAt+safe*3600000};localStorage.setItem(KEY,JSON.stringify(next));return next})}
 async function finish(){localStorage.removeItem(KEY);setShift(null);await signOut(auth)}
 const expired=Boolean(shift&&(now>=shift.expiresAt||now-shift.lastActivity>=IDLE_LIMIT));
 return <section className="plugOwnerShift" aria-label="Owner shift">
  <button type="button" className="plugOwnerShiftSummary" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>
   <span className="plugShiftClock" aria-hidden="true">◷</span><span className="plugShiftTitle"><small>OWNER SHIFT</small><strong>{expired||!shift?"Shift ended":"Shift active"}</strong></span><span className={"plugShiftLive"+(expired||!shift?" isEnded":"")}><i/>{expired||!shift?"ENDED":"ACTIVE"}</span><span className="plugShiftManage">{expanded?"Close":"Manage shift"}⌄</span>
  </button>
  {expanded&&<div className="plugOwnerShiftBody">
   <div className="plugOwnerShiftMetrics"><article><small>Time on shift</small><strong>{shift?clock(now-shift.startedAt):"00:00:00"}</strong><span>Started {shift?new Date(shift.startedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):"—"}</span></article><article><small>Session expires in</small><strong>{shift?clock(shift.expiresAt-now):"00:00:00"}</strong><span>Maximum duration</span></article></div>
   <div className="plugOwnerShiftControls"><label>Maximum session<select value={duration} onChange={event=>changeDuration(Number(event.target.value))}>{[1,2,4,6,8,10,12,16,20,24].map(hours=><option key={hours} value={hours}>{hours} hours</option>)}</select></label><button type="button" className="button buttonLight" onClick={()=>void finish()}>End shift / Sign out</button></div>
   <p>Shift ends when you leave the Briefcase, after 30 minutes without activity, at the selected maximum duration, or when you sign out.</p>
  </div>}
 </section>
}
