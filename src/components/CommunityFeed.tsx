"use client";
import {useEffect,useRef,useState} from "react";
import {collection,onSnapshot,query,where} from "firebase/firestore";
import {db,hasFirebaseWebConfig} from "@/lib/firebase/client";
import {trackPlugJourney} from "@/lib/firebase/journey-analytics";
import PlugLoadingState from "@/components/PlugLoadingState";
import {useStorefrontText} from "@/lib/storefront-translations";
type Activity={id:string;productLabel:string;createdAt:string;audience:"public"|"friends";status:string};
function dateLabel(value:string){const date=new Date(value);return Number.isNaN(date.getTime())?"Recently":date.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"})}
export default function CommunityFeed(){const{t}=useStorefrontText();
 const[items,setItems]=useState<Activity[]>([]),[memberCount,setMemberCount]=useState<number|null>(null),[loaded,setLoaded]=useState(false),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);const feedRef=useRef<HTMLElement|null>(null);const trackedView=useRef(false);
 useEffect(()=>{const node=feedRef.current;if(!node||trackedView.current)return;if(typeof IntersectionObserver==="undefined"){trackedView.current=true;void trackPlugJourney("community_feed_opened",{source:"homepage"});return;}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)&&!trackedView.current){trackedView.current=true;void trackPlugJourney("community_feed_opened",{source:"homepage"});observer.disconnect();}},{threshold:0.25});observer.observe(node);return()=>observer.disconnect()},[]);
 useEffect(()=>{
  if(!hasFirebaseWebConfig){setItems([]);setMemberCount(null);setLoaded(true);setFailed(true);return;}
  let settled=false;const timeout=window.setTimeout(()=>{if(!settled){setLoaded(true);setFailed(true);}},5000);
  const stopActivity=onSnapshot(query(collection(db,"communityActivity"),where("status","==","published"),where("audience","==","public")),snap=>{settled=true;window.clearTimeout(timeout);setItems(snap.docs.map(d=>({id:d.id,...d.data()} as Activity)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,8));setLoaded(true);setFailed(false)},error=>{settled=true;window.clearTimeout(timeout);console.error("[The Plug] community feed failed:",error.code,error.message);setItems([]);setLoaded(true);setFailed(true)});
  const stopMembers=onSnapshot(query(collection(db,"memberSettings"),where("showInCircle","==",true)),snap=>setMemberCount(snap.size),error=>{console.error("[The Plug] member count failed:",error.code,error.message);setMemberCount(null)});
  return()=>{window.clearTimeout(timeout);stopActivity();stopMembers()};
 },[attempt]);
 return <section ref={feedRef} className="plugCommunityFeed" id="community"><div className="plugContainer"><div className="plugCommunityHead"><div><span className="plugKicker">{t("communityKicker")}</span><h2>{t("communityTitle")} <em>{t("communitySuffix")}</em></h2><p>{t("communityIntro")}</p></div>{memberCount!==null&&<div className="plugCircleCountPublic"><strong>{memberCount}</strong><span>{memberCount===1?t("circleMember"):t("circleMembers")}</span></div>}</div>{!loaded?<PlugLoadingState message={t("checkingShared")} onRetry={()=>{setLoaded(false);setFailed(false);setAttempt(value=>value+1)}}/> :items.length>0?<div className="plugCommunityRail">{items.map(item=><article key={item.id}><span>{t("completedFind")} · {dateLabel(item.createdAt)}</span><h3>{item.productLabel}</h3><p>{t("publishedBy")}</p></article>)}</div>:<div className="plugCommunityEmpty">{failed?<><span>{t("sharedUnavailable")}</span><button type="button" className="plugFeedRetry" onClick={()=>{setLoaded(false);setFailed(false);setAttempt(value=>value+1)}}>{t("retry")} ↻</button></>:t("communityEmpty")}</div>}</div></section>
}
