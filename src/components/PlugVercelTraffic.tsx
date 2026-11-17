"use client";

import {useCallback,useEffect,useState} from "react";
import {getIdToken} from "firebase/auth";
import {auth} from "@/lib/firebase/client";

type Range=7|30;
type Row={label:string;visitors:number;pageviews:number};
type Traffic={
 connection:"connected"|"not_connected"|"unavailable"|"credentials"|"rate_limited";
 message?:string;range:Range;since:string;until:string;
 totals?:{visitors:number;pageviews:number};
 daily?:Array<{date:string;visitors:number;pageviews:number}>;
 routes?:Row[];referrers?:Row[];devices?:Row[];partial:boolean;
};

function Breakdown({title,rows}:{title:string;rows?:Row[]}){
 const max=Math.max(1,...(rows??[]).map(row=>row.pageviews));
 return <div className="plugVercelBreakdown"><h4>{title}</h4>{rows?.length?rows.map(row=><div className="plugVercelBreakdownRow" key={row.label}><span>{row.label}<small>{row.visitors.toLocaleString()} visitors · {row.pageviews.toLocaleString()} views</small></span><i><b style={{width:`${Math.max(4,row.pageviews/max*100)}%`}}/></i></div>):<p>No breakdown data returned for this period.</p>}</div>;
}

export default function PlugVercelTraffic(){
 const[range,setRange]=useState<Range>(7);
 const[traffic,setTraffic]=useState<Traffic|null>(null);
 const[loading,setLoading]=useState(false);
 const[error,setError]=useState("");
 const load=useCallback(async(nextRange:Range,refresh=false)=>{
  setLoading(true);setError("");
  try{
   const user=auth.currentUser;
   if(!user)throw new Error("Your owner session is unavailable. Sign in again.");
   const token=await getIdToken(user);
   const response=await fetch(`/api/admin/infrastructure/analytics?days=${nextRange}${refresh?"&refresh=1":""}`,{headers:{Authorization:"Bearer "+token},cache:"no-store"});
   const payload=await response.json() as {traffic?:Traffic;error?:string};
   if(!response.ok)throw new Error(payload.error||"Vercel traffic could not be loaded.");
   if(!payload.traffic)throw new Error("Vercel returned no traffic report.");
   setTraffic(payload.traffic);
  }catch(cause){setError(cause instanceof Error?cause.message:"Vercel traffic is temporarily unavailable.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load(range)},[load,range]);
 const maxDaily=Math.max(1,...(traffic?.daily??[]).map(row=>row.pageviews));
 return <section className="plugVercelTraffic">
  <div className="plugVercelTrafficHead"><div><span className="kicker">VERCEL WEB ANALYTICS</span><h3>Actual site traffic</h3><p>Anonymous aggregated visits to The Plug, separate from customer identities and sourcing records.</p></div><button className="button buttonLight" type="button" disabled={loading} onClick={()=>void load(range,true)}>{loading?"Refreshing…":"↻ Refresh"}</button></div>
  <div className="plugVercelTrafficControls" role="group" aria-label="Traffic reporting period"><button type="button" className={range===7?"active":""} aria-pressed={range===7} onClick={()=>setRange(7)}>Last 7 days</button><button type="button" className={range===30?"active":""} aria-pressed={range===30} onClick={()=>setRange(30)}>Last 30 days</button></div>
  {loading&&!traffic?<p className="orderTruth">Loading Vercel traffic…</p>:null}
  {error?<p className="notice" role="status">{error}</p>:null}
  {traffic?.connection==="not_connected"?<div className="plugVercelState"><strong>Vercel reporting is not connected</strong><p>{traffic.message}</p></div>:null}
  {traffic&&["unavailable","credentials","rate_limited"].includes(traffic.connection)?<div className="plugVercelState"><strong>{traffic.message||"Traffic analytics temporarily unavailable."}</strong><p>Customer and sourcing records remain available independently.</p></div>:null}
  {traffic?.connection==="connected"?<>
   {traffic.partial?<p className="orderTruth" role="status">{traffic.message||"Some breakdowns are temporarily unavailable."}</p>:null}
   <div className="plugVercelMetrics"><article><span>Site visitors</span><strong>{traffic.totals?.visitors.toLocaleString()??"—"}</strong></article><article><span>Page views</span><strong>{traffic.totals?.pageviews.toLocaleString()??"—"}</strong></article></div>
   <div className="plugVercelTrend"><h4>Daily visitors / page views</h4>{traffic.daily?.length?traffic.daily.map(row=><div className="plugVercelDay" key={row.date}><span>{new Date(row.date+"T00:00:00Z").toLocaleDateString("en-GB",{day:"numeric",month:"short",timeZone:"UTC"})}</span><i><b style={{height:`${Math.max(4,row.pageviews/maxDaily*100)}%`}}/></i><strong>{row.visitors} / {row.pageviews}</strong></div>):<p>No daily trend returned for this period.</p>}</div>
   <div className="plugVercelBreakdowns"><Breakdown title="Top routes" rows={traffic.routes}/><Breakdown title="Top referrers" rows={traffic.referrers}/><Breakdown title="Devices" rows={traffic.devices}/></div>
   <p className="orderTruth">Traffic totals come directly from Vercel Web Analytics. Admin, API, framework assets and static files are excluded from the route breakdown.</p>
  </>:null}
 </section>;
}
