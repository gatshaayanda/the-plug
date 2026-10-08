"use client";
import {useEffect,useState} from "react";
import {auth} from "@/lib/firebase/client";
import {subscribeToCustomerConversations,type Conversation} from "@/lib/firebase/data";
import ConversationPanel from "@/components/ConversationPanel";

const REQUESTS=[
 ["Question","Ask The Plug anything about the service"],
 ["Product sourcing","Ask what is available or request something"],
 ["Order / quote","Ask about availability or make a booking request"],
 ["Bulk / group order","Plan food for a group, meeting or event"],
 ["Advance sourcing","Discuss a future meal or special request"],
 ["Payment / receipt","Ask about payment, receipts or an order charge"],
 ["Deposit / payment","Ask about The Plug's food subscription"],
 ["Something else","Tell The Plug what you need in your own words"]
];

export default function CustomerConversations(){
 const[user,setUser]=useState(auth.currentUser),[conversations,setConversations]=useState<Conversation[]>([]),[selected,setSelected]=useState<string>(),[selectedTitle,setSelectedTitle]=useState<string>(),[notice,setNotice]=useState("");
 useEffect(()=>auth.onAuthStateChanged(next=>setUser(next)),[]);
 useEffect(()=>{if(!user){setConversations([]);setNotice("");return}return subscribeToCustomerConversations(user.uid,setConversations,error=>{const code=(error as {code?:unknown}).code;setNotice(code==="permission-denied"?"Customer messages are temporarily unavailable. Your The Plug account and orders are still safe.":"We could not load your The Plug messages right now.")})},[user]);
 function start(title:string){if(!user)return;setNotice("");setSelected(undefined);setSelectedTitle(title);}
 if(!user)return null;
 if(selected||selectedTitle)return <ConversationPanel conversationId={selected} conversationTitle={selectedTitle} onBack={()=>{setSelected(undefined);setSelectedTitle(undefined)}}/>;
 return <section className="conversationHub">
  <div className="panelHeading"><div><span className="kicker">Talk to The Plug</span><h2>Need something?</h2><p className="orderTruth">Ask, request, reserve, discuss payment or subscription details, or send supporting images and PDFs. A The Plug team member can reply here.</p></div><span className="conversationPrivate">{conversations.filter(x=>x.unreadForCustomer).length?conversations.filter(x=>x.unreadForCustomer).length+" new":"Private"}</span></div>
  <div className="requestChoices">{REQUESTS.map(([title,copy])=><button key={title} className="requestChoice" onClick={()=>start(title)}><strong>{title}</strong><span>{copy}</span><b>→</b></button>)}</div>
  <div className="conversationList">{conversations.map(item=><button className="conversationRow" key={item.id} onClick={()=>setSelected(item.id)}><span className="conversationDot" data-unread={item.unreadForCustomer?"true":"false"}/><span><strong>{item.title}</strong><small>{item.lastMessagePreview||"No messages yet."}</small></span><time>{new Date(item.updatedAt).toLocaleDateString()}</time></button>)}{!conversations.length&&<div className="conversationEmpty"><strong>Your The Plug conversations will appear here.</strong><p>Use a request above, then explain what you need. Add a food photo, screenshot, receipt or PDF when it helps us understand the request.</p></div>}</div>
  {notice&&<p className="notice" role="status">{notice}</p>}
 </section>
}