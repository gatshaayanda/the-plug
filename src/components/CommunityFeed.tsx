"use client";
import {useEffect,useRef,useState} from "react";
import {collection,onSnapshot,query,where} from "firebase/firestore";
import {db} from "@/lib/firebase/client";
import {trackPlugJourney} from "@/lib/firebase/journey-analytics";
type Activity={id:string;productLabel:string;createdAt:string;audience:"public"|"friends";status:string};
function dateLabel(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?"Recently":date.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
export default function CommunityFeed(){
 const[items,setItems]=useState<Activity[]>([]),[memberCount,setMemberCount]=useState<number|null>(null),[loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false);const feedRef=useRef<HTMLElement|null>(null);const trackedView=useRef(false);
 useEffect(()=>{const node=feedRef.current;if(!node||trackedView.current)return;if(typeof IntersectionObserver==="undefined"){trackedView.current=true;void trackPlugJourney("community_feed_opened",{source:"homepage"});return;}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)&&!trackedView.current){trackedView.current=true;void trackPlugJourney("community_feed_opened",{source:"homepage"});observer.disconnect();}},{threshold:0.25});observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{
  let settled=false;const timeout=window.setTimeout(()=>{if(!settled){setLoaded(true);setFailed(true);}},1500);
  const stopActivity=onSnapshot(query(collection(db,"communityActivity"),where("status","==","published"),where("audience","==","public")),snap=>{settled=true;window.clearTimeout(timeout);setItems(snap.docs.map(d=>({id:d.id,...d.data()} as Activity)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,8));setLoaded(true);setFailed(false)},()=>{settled=true;window.clearTimeout(timeout);setItems([]);setLoaded(true);setFailed(true)});
  const stopMembers=onSnapshot(query(collection(db,"memberSettings"),where("showInCircle","==",true)),snap=>setMemberCount(snap.size),()=>setMemberCount(null));
  return()=>{window.clearTimeout(timeout);stopActivity();stopMembers()};
 },[]);
 return <section ref={feedRef} className="plugCommunityFeed" id="community"><div className="plugContainer"><div className="plugCommunityHead"><div><span className="plugKicker">THE COMMUNITY EDIT</span><h2>Finds worth <em>sharing.</em></h2><p>Completed purchases shared by members who choose public visibility.</p></div>{memberCount!==null&&<div className="plugCircleCountPublic"><strong>{memberCount}</strong><span>opted-in Circle {memberCount===1?"member":"members"}</span></div>}</div>{!loaded?<p className="plugCommunityEmpty">Checking shared finds…</p>:items.length>0?<div className="plugCommunityRail">{items.map(item=><article key={item.id}><span>COMPLETED FIND · {dateLabel(item.createdAt)}</span><h3>{item.productLabel}</h3><p>Shared by a Plug member</p></article>)}</div>:<div className="plugCommunityEmpty">{failed?"Shared finds are taking a moment to load.":"When a member chooses to share a completed find and Frank publishes it, it will appear here."}</div>}</div></section>
}
