"use client";
import {useEffect,useMemo,useState} from "react";
import {signOut} from "firebase/auth";
import {auth} from "@/lib/firebase/client";

type Shift={startedAt:number;expiresAt:number;lastActivityAt:number;durationHours:number};
const KEY="theplug:owner-shift:v1";
const durations=[1,2,4,6,8,10,12,16,20,24];
const clock=(ms:number)=>{const seconds=Math.max(0,Math.floor(ms/1000));return [Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,"0")).join(":")};

export default function OwnerShift(){
 const[shift,setShift]=useState<Shift|null>(null),[now,setNow]=useState(Date.now()),[duration,setDuration]=useState(12),[ending,setEnding]=useState(false),[expanded,setExpanded]=useState(false);
 useEffect(()=>{
  let saved:Shift|null=null;try{const raw=localStorage.getItem(KEY);if(raw)saved=JSON.parse(raw) as Shift}catch{}
  const time=Date.now();
  const valid=saved&&Number.isFinite(saved.startedAt)&&saved.expiresAt>time&&time-saved.lastActivityAt<30*60*1000?saved:{startedAt:time,expiresAt:time+12*60*60*1000,lastActivityAt:time,durationHours:12};
  setShift(valid);setDuration(valid.durationHours);localStorage.setItem(KEY,JSON.stringify(valid));
  const activity=()=>{const stamp=Date.now();setShift(current=>{if(!current||stamp-current.lastActivityAt<15000)return current;const next={...current,lastActivityAt:stamp};localStorage.setItem(KEY,JSON.stringify(next));return next})};
  const events=["pointerdown","keydown","touchstart","scroll","wheel"];events.forEach(name=>window.addEventListener(name,activity,{passive:true}));
  const timer=window.setInterval(()=>{const stamp=Date.now();setNow(stamp);const current=(()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null") as Shift|null}catch{return null}})();if(current&&(stamp>=current.expiresAt||stamp-current.lastActivityAt>=30*60*1000)){localStorage.removeItem(KEY);setShift(null);void signOut(auth)}},1000);
  const close=()=>localStorage.removeItem(KEY);window.addEventListener("pagehide",close);
  return()=>{events.forEach(name=>window.removeEventListener(name,activity));window.clearInterval(timer);window.removeEventListener("pagehide",close)};
 },[]);
 async function endShift(){setEnding(true);localStorage.removeItem(KEY);setShift(null);await signOut(auth).catch(()=>{});setEnding(false)}
 function updateDuration(hours:number){setDuration(hours);if(!shift)return;const next={...shift,durationHours:hours,expiresAt:shift.startedAt+hours*3600000};setShift(next);localStorage.setItem(KEY,JSON.stringify(next))}
 const elapsed=useMemo(()=>shift?clock(now-shift.startedAt):"00:00:00",[now,shift]);
 if(!shift)return null;
 return <section className="plugOwnerShift">
  <button type="button" className="plugOwnerShiftSummary" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}><span className="plugShiftClock" aria-hidden="true">◷</span><span className="plugShiftTitle"><small>OWNER SHIFT</small><strong>Shift active</strong></span><span className="plugShiftLive"><i/>ACTIVE</span><span className="plugShiftManage">{expanded?"Close":"Manage shift"}⌄</span></button>
  {expanded&&<div className="plugOwnerShiftBody"><div className="plugOwnerShiftMetrics"><article><small>Time on shift</small><strong>{elapsed}</strong><span>Started {new Date(shift.startedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span></article><article><small>Session expires in</small><strong>{clock(shift.expiresAt-now)}</strong><span>Automatic expiry</span></article></div><div className="plugOwnerShiftControls"><label>Maximum session (applies to this shift)<select value={duration} onChange={event=>updateDuration(Number(event.target.value))}>{durations.map(hours=><option key={hours} value={hours}>{hours} hours</option>)}</select></label><button type="button" className="button buttonLight" onClick={()=>void endShift()} disabled={ending}>{ending?"Ending…":"End shift / Sign out"}</button></div><p>Shift ends when you leave the Briefcase, after 30 minutes without activity, at the selected maximum duration, or when you sign out.</p></div>}
 </section>;
}
