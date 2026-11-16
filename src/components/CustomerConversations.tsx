"use client";
import {useEffect,useState} from "react";
import {auth} from "@/lib/firebase/client";
import {subscribeToCustomerConversations,type Conversation} from "@/lib/firebase/data";
import ConversationPanel from "@/components/ConversationPanel";

const REQUESTS=[
 ["Question","Ask The Plug anything about the service"],
 ["Product sourcing","Ask what is available or request something"],
 ["Order / quote","Ask about availability or make a booking request"],
 ["Bulk / group sourcing","Discuss multiple pairs/items or a larger request"],
 ["Advance sourcing","Discuss a future sneaker or apparel request"],
 ["Quote / payment","Ask about a quote, deposit, payment or receipt"],
 ["Delivery / collection","Ask about fulfilment or collection"],
 ["Something else","Tell The Plug what you need in your own words"]
];

export default function CustomerConversations(){
 const[user,setUser]=useState(auth.currentUser),[conversations,setConversations]=useState<Conversation[]>([]),[selected,setSelected]=useState<string>(),[selectedTitle,setSelectedTitle]=useState<string>(),[notice,setNotice]=useState("");
 useEffect(()=>auth.onAuthStateChanged(next=>setUser(next)),[]);
 useEffect(()=>{if(!user){setConversations([]);setNotice("");return}return subscribeToCustomerConversations(user.uid,setConversations,error=>{const code=(error as {code?:unknown}).code;setNotice(code==="permission-denied"?"Customer messages are temporarily unavailable. Your The Plug account and orders are still safe.":"We could not load your The Plug messages right now.")})},[user]);
 function start(title:string){if(!user)return;setNotice("");setSelected(undefined);setSelectedTitle(title);}
 if(!user)return null;
 if(selected||selectedTitle)return <ConversationPanel conversationId={selected} conversationTitle={selectedTitle} onBack={()=>{setSelected(undefined);setSelectedTitle(undefined)}}/>;
 return <section className="conversationHub" id="conversation-hub">
  <div className="panelHeading"><div><span className="kicker">YOUR PRIVATE INBOX</span><h2>Messages with Frank.</h2><p className="orderTruth">Your sourcing conversations stay together here. Open a request to discuss that item, or start a separate message for anything else.</p></div><span className="conversationPrivate">{conversations.filter(x=>x.unreadForCustomer).length?conversations.filter(x=>x.unreadForCustomer).length+" new":"Private"}</span></div>
  <div className="conversationList">{conversations.map(item=><button className="conversationRow" key={item.id} onClick={()=>setSelected(item.id)}><span className="conversationDot" data-unread={item.unreadForCustomer?"true":"false"}/><span><strong>{item.title}</strong><small>{item.title.startsWith("Sourcing:")?"Request details saved · Open to review or reply.":item.lastMessagePreview||"No messages yet."}</small></span><time>{new Date(item.updatedAt).toLocaleDateString()}</time></button>)}{!conversations.length&&<div className="conversationEmpty"><strong>No conversations yet.</strong><p>Start a private conversation with Frank. Your replies and supporting files will stay in My Plug.</p></div>}</div>
  <details className="conversationStart"><summary><span><strong>Message Frank about something else</strong><small>For a question that is not already attached to one of your sourcing requests.</small></span><b aria-hidden="true">＋</b></summary><div className="requestChoices">{REQUESTS.map(([title,copy])=><button key={title} className="requestChoice" onClick={()=>start(title)}><strong>{title}</strong><span>{copy}</span><b aria-hidden="true">→</b></button>)}</div></details>
  {notice&&<p className="notice" role="status">{notice}</p>}
 </section>
}