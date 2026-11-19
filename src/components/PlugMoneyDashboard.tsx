"use client";

import {useEffect,useMemo,useState} from "react";
import {addDoc,collection,deleteDoc,doc,onSnapshot,orderBy,query,setDoc} from "firebase/firestore";
import {auth,db} from "@/lib/firebase/client";
import {uploadFiles} from "@/lib/uploadthing";
import type {PlugRequest} from "@/lib/firebase/plug-data";

type Expense={
 id:string;
 merchant:string;
 category:string;
 amount:number;
 currency:"BWP";
 date:string;
 note:string;
 createdAt:string;
 receipt?:{url:string;name:string;type:string;size:number}|null;
};
type JourneyEvent={event:string;createdAt:string};
type Props={
 journeyEvents:JourneyEvent[];
 requests:PlugRequest[];
 onOpenRequest:(request:PlugRequest)=>void;
 requestSyncStatus:"connecting"|"live"|"server"|"error";
 lastRequestSyncAt:string;
 onRefreshRequests:()=>void;
 refreshingRequests:boolean;
};
const terminal=new Set(["Delivered","Collected","Cancelled"]);
const money=(value:number)=>"P"+(Number.isFinite(value)?value:0).toLocaleString("en-BW",{minimumFractionDigits:2,maximumFractionDigits:2});
const validAmount=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>0?value:0;
function referenceValue(request:PlugRequest):number|null{
 const notes=request.notes||"";
 const basket=notes.split("Selected storefront items:\n")[1]?.split(/\n(?=[A-Z][^:\n]{0,90}:)/)[0]||"";
 const itemPrices=[...basket.matchAll(/—\s*P\s*([\d,]+(?:\.\d{1,2})?)/g)].map(match=>Number(match[1].replace(/,/g,""))).filter(value=>Number.isFinite(value)&&value>0);
 if(itemPrices.length)return itemPrices.reduce((sum,value)=>sum+value,0);
 const listed=notes.match(/Storefront listed price when requested:\s*P\s*([\d,]+(?:\.\d{1,2})?)/i);
 if(listed){const value=Number(listed[1].replace(/,/g,""));return Number.isFinite(value)&&value>0?value:null;}
 return null;
}
function paymentBreakdown(request:PlugRequest){
 const records=request.paymentRecords||[];
 if(records.length){
  const recorded=records.reduce((sum,item)=>{
   const amount=validAmount(item.amount);
   sum.total+=amount;
   if(item.part==="deposit")sum.deposit+=amount;
   else if(item.part==="balance")sum.balance+=amount;
   else sum.unclassified+=amount;
   return sum;
  },{total:0,deposit:0,balance:0,unclassified:0});
  return {
   total:validAmount(request.depositPaid)||recorded.total,
   deposit:request.depositReceived!==undefined?validAmount(request.depositReceived):recorded.deposit,
   balance:request.balanceReceived!==undefined?validAmount(request.balanceReceived):recorded.balance,
   unclassified:recorded.unclassified
  };
 }
 const legacy=validAmount(request.depositPaid);
 return {total:legacy,deposit:request.depositReceived!==undefined?validAmount(request.depositReceived):legacy,balance:validAmount(request.balanceReceived),unclassified:0};
}
function dateLabel(value:string){
 const date=new Date(value);
 return Number.isFinite(date.getTime())?date.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"Africa/Gaborone"}):"Date not recorded";
}
function todayKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Gaborone",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}

export default function PlugMoneyDashboard({journeyEvents,requests,onOpenRequest,requestSyncStatus,lastRequestSyncAt,onRefreshRequests,refreshingRequests}:Props){
 const [expenses,setExpenses]=useState<Expense[]>([]);
 const [expensesLoading,setExpensesLoading]=useState(true);
 const [expenseNotice,setExpenseNotice]=useState("");
 const [merchant,setMerchant]=useState("");
 const [category,setCategory]=useState("Operating costs");
 const [amount,setAmount]=useState("");
 const [expenseDate,setExpenseDate]=useState(todayKey());
 const [expenseNote,setExpenseNote]=useState("");
 const [receiptFile,setReceiptFile]=useState<File|null>(null);
 const [savingExpense,setSavingExpense]=useState(false);
 const [deletingExpense,setDeletingExpense]=useState("");
 const [serviceFeeRate,setServiceFeeRate]=useState<number|null>(null);
 const [serviceFeeSaved,setServiceFeeSaved]=useState<{rate:number;nextRate?:number;activatedAt:string;nextDueAt:string}|null>(null);
 const [serviceFeeLoading,setServiceFeeLoading]=useState(true);
 const [serviceFeeSaving,setServiceFeeSaving]=useState(false);
 const [serviceFeeNotice,setServiceFeeNotice]=useState("");
 const [showStorefrontReferencePreview,setShowStorefrontReferencePreview]=useState(false);

 useEffect(()=>onSnapshot(doc(db,"businessSettings","adminHubParticipation"),snapshot=>{
  const value=snapshot.exists()?snapshot.data() as {rate?:number;nextRate?:number;activatedAt?:string;nextDueAt?:string}:null;
  if(value&&typeof value.rate==="number"&&typeof value.activatedAt==="string"&&typeof value.nextDueAt==="string"){setServiceFeeSaved({rate:value.rate,nextRate:value.nextRate,activatedAt:value.activatedAt,nextDueAt:value.nextDueAt});setServiceFeeRate(typeof value.nextRate==="number"?value.nextRate:value.rate)}
  setServiceFeeLoading(false);
 },()=>{setServiceFeeLoading(false);setServiceFeeNotice("Admin Hub service fee settings could not be loaded. Check Operations permissions.")}),[]);

 useEffect(()=>onSnapshot(query(collection(db,"businessExpenses"),orderBy("date","desc")),snapshot=>{
  setExpenses(snapshot.docs.map(item=>({id:item.id,...item.data()} as Expense)));
  setExpensesLoading(false);
  setExpenseNotice("");
 },()=>{
  setExpensesLoading(false);
  setExpenseNotice("Business expenses could not be loaded. Check that the latest Firestore rules are published and the Operations account is connected to the correct Firebase project.");
 }),[]);

 const summary=useMemo(()=>{
  const eligible=requests.filter(item=>item.status!=="Cancelled");
  const open=eligible.filter(item=>!terminal.has(item.status));
  const quoted=eligible.filter(item=>typeof item.quotedPrice==="number"&&Number.isFinite(item.quotedPrice));
  const approved=quoted.filter(item=>!!item.customerApprovedAt&&item.customerApprovedPrice===item.quotedPrice);
  const approvedActive=approved.filter(item=>!terminal.has(item.status));
  const fulfilled=eligible.filter(item=>["Delivered","Collected"].includes(item.status));
  const referenceTotal=eligible.reduce((sum,item)=>sum+(referenceValue(item)||0),0);
  const referenceCount=eligible.filter(item=>referenceValue(item)!==null).length;
  const payments=eligible.reduce((sum,item)=>{const part=paymentBreakdown(item);sum.total+=part.total;sum.deposit+=part.deposit;sum.balance+=part.balance;sum.unclassified+=part.unclassified;return sum;},{total:0,deposit:0,balance:0,unclassified:0});
  const approvedDepositDue=approvedActive.reduce((sum,item)=>sum+(validAmount(item.depositRequired)||Math.round(validAmount(item.quotedPrice)*0.5*100)/100),0);
  const quotedOpen=open.reduce((sum,item)=>sum+validAmount(item.quotedPrice),0);
  const approvedOpen=approvedActive.reduce((sum,item)=>sum+validAmount(item.quotedPrice),0);
  const fulfilledValue=fulfilled.reduce((sum,item)=>sum+validAmount(item.quotedPrice),0);
  const outstanding=quoted.reduce((sum,item)=>sum+Math.max(0,validAmount(item.quotedPrice)-paymentBreakdown(item).total),0);
  const completedUnpaid=fulfilled.reduce((sum,item)=>sum+Math.max(0,validAmount(item.quotedPrice)-paymentBreakdown(item).total),0);
  const awaitingQuote=open.filter(item=>typeof item.quotedPrice!=="number").length;
  const awaitingDeposit=approvedActive.filter(item=>paymentBreakdown(item).total+0.009<(validAmount(item.depositRequired)||validAmount(item.quotedPrice)*0.5)).length;
  const cutoff=Date.now()-30*24*60*60*1000;
  const recent=requests.filter(item=>{const stamp=Date.parse(item.createdAt||"");return Number.isFinite(stamp)&&stamp>=cutoff;});
  const demand=new Map<string,{count:number;value:number;priced:number}>();
  eligible.forEach(item=>{
   const entry=demand.get(item.product)||{count:0,value:0,priced:0};
   entry.count+=1;
   const reference=referenceValue(item);
   if(reference!==null){entry.value+=reference;entry.priced+=1;}
   demand.set(item.product,entry);
  });
  return {
   requestedReferenceValue:referenceTotal,referenceCount,unpricedRequests:eligible.length-referenceCount,
   quotedOpen,approvedOpen,fulfilledValue,payments,outstanding,completedUnpaid,
   approvedDepositDue,depositGap:Math.max(0,approvedDepositDue-payments.deposit),
   awaitingQuote,awaitingDeposit,fulfilled:fulfilled.length,
   newRequests:recent.filter(item=>item.status==="New Request").length,
   quotesPrepared:recent.filter(item=>typeof item.quotedPrice==="number").length,
   activeJobs:recent.filter(item=>["Deposit Received","Sourcing","In Transit","Ready"].includes(item.status)).length,
   completedRecent:recent.filter(item=>["Delivered","Collected"].includes(item.status)).length,
   cancelledRecent:recent.filter(item=>item.status==="Cancelled").length,
   demand:[...demand.entries()].map(([product,data])=>({product,...data})).sort((a,b)=>b.count-a.count).slice(0,6)
  };
 },[requests]);

 const expenseTotal=useMemo(()=>expenses.reduce((sum,item)=>sum+validAmount(item.amount),0),[expenses]);
 const serviceFeeSummary=useMemo(()=>{
  const now=Date.now(),cutoff=now-30*86400000,previous=cutoff-30*86400000;
  const rows=requests.filter(item=>item.status!=="Cancelled").flatMap(item=>{
   const payments=item.paymentRecords?.length?item.paymentRecords.map(payment=>({amount:validAmount(payment.amount),stamp:Date.parse(payment.recordedAt||"")})):(validAmount(item.depositPaid)>0?[{amount:validAmount(item.depositPaid),stamp:Date.parse(item.depositRecordedAt||"")}]:[]);
   return payments.filter(row=>Number.isFinite(row.stamp)).map(row=>({...row,request:item}));
  });
  const eligible=rows.filter(row=>row.stamp>=cutoff&&row.stamp<=now&&["Delivered","Collected"].includes(row.request.status));
  const prior=rows.filter(row=>row.stamp>=previous&&row.stamp<cutoff&&["Delivered","Collected"].includes(row.request.status));
  const eligibleRevenue=eligible.reduce((sum,row)=>sum+row.amount,0),previousRevenue=prior.reduce((sum,row)=>sum+row.amount,0);
  const activity=requests.filter(item=>{const stamp=Date.parse(item.createdAt||"");return Number.isFinite(stamp)&&stamp>=cutoff&&stamp<=now&&item.status!=="Cancelled"}).length;
  const events=journeyEvents.filter(item=>{const stamp=Date.parse(item.createdAt||"");return Number.isFinite(stamp)&&stamp>=cutoff&&stamp<=now});
  const demandViews=events.filter(item=>["storefront_find_opened","storefront_offer_opened"].includes(item.event)).length;
  const requestClicks=events.filter(item=>item.event==="product_request_clicked").length;
  const outstanding=requests.filter(item=>item.status!=="Cancelled"&&typeof item.quotedPrice==="number").reduce((sum,item)=>sum+Math.max(0,validAmount(item.quotedPrice)-paymentBreakdown(item).total),0);
  const paidTransactions=new Set(eligible.filter(row=>typeof row.request.quotedPrice==="number"&&paymentBreakdown(row.request).total+0.009>=row.request.quotedPrice).map(row=>row.request.id)).size;
  return {eligibleRevenue,previousRevenue,paidTransactions,activity,outstanding,demandViews,requestClicks,change:previousRevenue>0?(eligibleRevenue-previousRevenue)/previousRevenue*100:null};
 },[requests,journeyEvents]);
 const serviceFeeAmount=serviceFeeSummary.eligibleRevenue*(serviceFeeRate??0)/100;
 const previewBasis=showStorefrontReferencePreview?summary.requestedReferenceValue:serviceFeeSummary.eligibleRevenue;
 const previewFee=previewBasis*(serviceFeeRate??0)/100;
 const previewRemainder=Math.max(0,previewBasis-previewFee);
 const previewFeeShare=previewBasis>0?Math.min(100,previewFee/previewBasis*100):0;
 async function recordService feePayment(){
  if(!serviceFeeSaved||Date.now()<Date.parse(serviceFeeSaved.nextDueAt)){setServiceFeeNotice("The next 30-day service fee payment is not due yet.");return;}
  const period=serviceFeeSaved.nextDueAt.slice(0,10);
  const periodNote="Admin Hub service fee · "+serviceFeeSaved.rate+"% of completed paid recorded revenue · Period ending "+period;
  if(expenses.some(item=>item.category==="Admin Hub service fee"&&item.note.includes("Period ending "+period))){setServiceFeeNotice("This period already has an Admin Hub expense record.");return;}
  const amountDue=serviceFeeSummary.eligibleRevenue*serviceFeeSaved.rate/100;
  if(amountDue<=0){setServiceFeeNotice("No eligible completed paid revenue was recorded for this period. No service fee payment is due.");return;}
  const now=new Date().toISOString();
  try{await addDoc(collection(db,"businessExpenses"),{merchant:"Admin Hub",category:"Admin Hub service fee",amount:amountDue,currency:"BWP",date:todayKey(),note:periodNote,createdAt:now,updatedAt:now,createdBy:auth.currentUser?.uid||"",receipt:null});
   const nextDueAt=new Date(Date.parse(serviceFeeSaved.nextDueAt)+30*86400000).toISOString();
   const nextRate=serviceFeeSaved.nextRate??serviceFeeSaved.rate;
   await setDoc(doc(db,"businessSettings","adminHubParticipation"),{rate:nextRate,nextRate,lastPaidPeriod:period,nextDueAt,updatedAt:now},{merge:true});
   setServiceFeeSaved({...serviceFeeSaved,rate:nextRate,nextRate,nextDueAt});setServiceFeeRate(nextRate);setServiceFeeNotice("Payment recorded as an Admin Hub service fee expense. Add the source receipt to the expense record if available.");
  }catch{setServiceFeeNotice("The payment was not fully recorded. Check Firebase sync and verify the expense list before retrying.");}
 }
 async function saveService fee(){
  if(serviceFeeRate===null){setServiceFeeNotice("Choose a service rate between 10% and 20% first.");return;}
  const now=new Date(),activatedAt=serviceFeeSaved?.activatedAt||now.toISOString(),nextDueAt=serviceFeeSaved?.nextDueAt||new Date(now.getTime()+30*86400000).toISOString();
  setServiceFeeSaving(true);setServiceFeeNotice("");
  try{if(serviceFeeSaved){await setDoc(doc(db,"businessSettings","adminHubParticipation"),{nextRate:serviceFeeRate,updatedAt:now.toISOString()},{merge:true});setServiceFeeSaved({...serviceFeeSaved,nextRate:serviceFeeRate});}else{await setDoc(doc(db,"businessSettings","adminHubParticipation"),{rate:serviceFeeRate,nextRate:serviceFeeRate,activatedAt,nextDueAt,updatedAt:now.toISOString(),basis:"completed_paid_recorded_revenue"},{merge:true});setServiceFeeSaved({rate:serviceFeeRate,nextRate:serviceFeeRate,activatedAt,nextDueAt});}setServiceFeeNotice("Saved. Your rate is saved. It applies to the next 30-day period; the current period is unchanged.");}
  catch{setServiceFeeNotice("Settings were not saved. Check Operations permissions and try again.");}
  finally{setServiceFeeSaving(false);}
 }

 const recordedCashAfterExpenses=summary.payments.total-expenseTotal;
 const latestRequests=useMemo(()=>[...requests].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||"")).slice(0,20),[requests]);

 async function saveExpense(){
  const value=Number(amount);
  if(!merchant.trim()||!Number.isFinite(value)||value<=0||!expenseDate){setExpenseNotice("Enter a merchant, a valid amount and an expense date.");return;}
  setSavingExpense(true);setExpenseNotice("");
  try{
   let receipt:Expense["receipt"]=null;
   if(receiptFile){
    const uploadedFiles=await uploadFiles("fileUploader",{files:[receiptFile]});
    const uploaded=uploadedFiles[0] as (typeof uploadedFiles)[number]&{ufsUrl?:string;appUrl?:string};
    const url=uploaded?.url||uploaded?.ufsUrl||uploaded?.appUrl;
    if(!url)throw new Error("The receipt upload finished without a file link. The expense was not saved.");
    receipt={url,name:receiptFile.name,type:receiptFile.type,size:receiptFile.size};
   }
   const now=new Date().toISOString();
   await addDoc(collection(db,"businessExpenses"),{merchant:merchant.trim(),category,amount:value,currency:"BWP",date:expenseDate,note:expenseNote.trim(),createdAt:now,updatedAt:now,createdBy:auth.currentUser?.uid||"",receipt});
   setMerchant("");setAmount("");setExpenseNote("");setReceiptFile(null);setExpenseDate(todayKey());
   setExpenseNotice("Expense saved to the owner’s Firebase records.");
  }catch(error){setExpenseNotice(error instanceof Error?error.message:"The expense could not be saved. Check the connection and Firestore rules.");}
  finally{setSavingExpense(false);}
 }
 async function removeExpense(item:Expense){
  if(!window.confirm("Delete the expense record for "+item.merchant+" ("+money(item.amount)+")?"))return;
  setDeletingExpense(item.id);setExpenseNotice("");
  try{await deleteDoc(doc(db,"businessExpenses",item.id));setExpenseNotice("Expense record deleted.");}
  catch{setExpenseNotice("The expense could not be deleted. Check Operations permissions.");}
  finally{setDeletingExpense("");}
 }
 const syncText=requestSyncStatus==="live"?"LIVE FIREBASE":requestSyncStatus==="server"?"SERVER VERIFIED":requestSyncStatus==="error"?"SYNC ERROR":"CONNECTING";
 const syncClass=requestSyncStatus==="error"?"error":requestSyncStatus==="connecting"?"pending":"ready";

 return <div className="plugMoneyDashboard">
  <section className="journeyAnalytics">
   <div className="panelHeading plugMoneyHeading"><div><span className="kicker">MONEY · OWNER RECONCILIATION</span><h2>Money &amp; records</h2><p className="orderTruth">Demand, approved quotes, fulfilment, actual recorded payments and business expenses are shown separately. Storefront prices are references—not quotes or money received.</p></div><div className="plugMoneySync"><span className={"plugMoneySyncBadge "+syncClass}>{syncText}</span><button type="button" className="button buttonLight" onClick={onRefreshRequests} disabled={refreshingRequests}>{refreshingRequests?"Refreshing…":"Refresh requests ↻"}</button><small>{lastRequestSyncAt?"Last checked "+new Date(lastRequestSyncAt).toLocaleTimeString():"Waiting for first sync"}</small></div></div>
   <div className="plugFinanceSectionLabel"><span>BUSINESS PULSE · LAST 30 DAYS</span><small>Live request records</small></div>
   <div className="journeyAnalyticsGrid plugFinancePulse">
    <article><span>New requests</span><strong>{summary.newRequests}</strong></article>
    <article><span>Quotes prepared</span><strong>{summary.quotesPrepared}</strong></article>
    <article><span>Awaiting deposit</span><strong>{summary.awaitingDeposit}</strong></article>
    <article><span>Active sourcing jobs</span><strong>{summary.activeJobs}</strong></article>
    <article><span>Delivered / collected</span><strong>{summary.completedRecent}</strong></article>
    <article><span>Cancelled</span><strong>{summary.cancelledRecent}</strong></article>
   </div>
  </section>

  <section className="journeyAnalytics">
   <div className="panelHeading"><div><span className="kicker">CUSTOMER DEMAND · NON-CANCELLED</span><h2>What customers are asking for</h2></div></div>
   {summary.demand.length?<div className="journeyAnalyticsProducts">{summary.demand.map(item=><div key={item.product}><span><b>{item.product}</b><small className="plugActivityMeta">{item.count} request{item.count===1?"":"s"} · {item.priced} with reference pricing</small></span><b>{money(item.value)}</b></div>)}</div>:<p className="orderTruth">Customer demand will appear here after the first sourcing request is recorded.</p>}
  </section>

  <section className="journeyAnalytics">
   <div className="panelHeading"><div><span className="kicker">REQUEST LEDGER · LIVE RECORDS</span><h2>Recent requests, traceable</h2><p className="orderTruth">The latest 20 request records behind the totals. Select a record to open it in Customers &amp; Jobs.</p></div><strong>{requests.length} records</strong></div>
   {latestRequests.length?<div className="plugMoneyLedger">{latestRequests.map(item=>{const reference=referenceValue(item);const paid=paymentBreakdown(item).total;return <article key={item.id}><div className="plugMoneyLedgerMain"><span className="plugMoneyLedgerStatus">{item.status}</span><strong>{item.product}</strong><small>{item.customerName} · #{item.id.slice(0,8).toUpperCase()} · {dateLabel(item.createdAt)}</small></div><div className="plugMoneyLedgerNumbers"><span>Reference <b>{reference===null?"Not listed":money(reference)}</b></span><span>Quote <b>{typeof item.quotedPrice==="number"?money(item.quotedPrice):"Pending"}</b></span><span>Paid <b>{money(paid)}</b></span></div><button type="button" className="button buttonLight" onClick={()=>onOpenRequest(item)}>Open request ↗</button></article>})}</div>:<p className="orderTruth">No sourcing requests are visible yet. Refresh records or check the request service connection.</p>}
  </section>

  <section className="journeyAnalytics">
   <div className="panelHeading"><div><span className="kicker">BUSINESS EXPENSES</span><h2>Record what it costs to operate</h2><p className="orderTruth">Save operating expenses with the source receipt attached. These owner records sync through Firebase across signed-in Operations devices.</p></div></div>
   <div className="plugFinanceSectionLabel"><span>FINANCIAL RECONCILIATION · BWP</span><small>Requests → quotes → payments → costs</small></div>
   <div className="panelHeading"><div><span className="kicker">FINANCIAL RECONCILIATION · BWP</span><h2>From requests to collections</h2><p className="orderTruth">All-time totals from the recorded sourcing requests. Amounts are not treated as sales until quoted, approved or paid at the appropriate stage.</p></div></div>
   <div className="journeyAnalyticsGrid plugFinanceGrid">
    <article><span>Requested storefront reference value</span><strong>{money(summary.requestedReferenceValue)}</strong><small>{summary.referenceCount} priced requests · {summary.unpricedRequests} without a reference price</small></article>
    <article><span>Open quoted value</span><strong>{money(summary.quotedOpen)}</strong><small>Quotes on active, non-cancelled requests</small></article>
    <article><span>Customer-approved value</span><strong>{money(summary.approvedOpen)}</strong><small>Customer approved the current quote</small></article>
    <article><span>Delivered / collected value</span><strong>{money(summary.fulfilledValue)}</strong><small>Quoted value marked fulfilled</small></article>
    <article><span>Recorded payments</span><strong>{money(summary.payments.total)}</strong><small>Deposit {money(summary.payments.deposit)} · Balance {money(summary.payments.balance)}</small></article>
    <article><span>Outstanding quoted balance</span><strong>{money(summary.outstanding)}</strong><small>All non-cancelled quotes less recorded payments</small></article>
    <article><span>Completed · unpaid balance</span><strong>{money(summary.completedUnpaid)}</strong><small>Delivered / collected jobs not fully paid</small></article>
    <article><span>Expected deposits on approved quotes</span><strong>{money(summary.approvedDepositDue)}</strong><small>Uses the recorded deposit requirement or 50% of quote</small></article>
    <article><span>Deposit gap · classified deposits</span><strong>{money(summary.depositGap)}</strong><small>Legacy payments without a deposit/balance label are not assumed to be deposits</small></article>
    <article><span>Payments not yet classified</span><strong>{money(summary.payments.unclassified)}</strong><small>Older payment records without a deposit or balance label</small></article>
    <article><span>Requests awaiting a quote</span><strong>{summary.awaitingQuote}</strong><small>Open requests with no quote entered</small></article>
    <article><span>Approved requests awaiting deposit</span><strong>{summary.awaitingDeposit}</strong><small>Approved quotes below the required deposit</small></article>
   </div>
   <p className="plugFinanceFootnote">Recorded payments are owner-entered acknowledgements, not bank-feed verification. The deposit gap is a follow-up estimate. Storefront reference prices can change and are never treated as confirmed quotes.</p>
   <div className="plugParticipationPanel">
   <div className="panelHeading"><div><span className="kicker">ADMIN HUB · SOFTWARE SERVICE</span><h2>Admin Hub service fee</h2><p className="orderTruth">Your Plug workspace helps customers discover products, enquire and place orders. The service fee is agreed upfront and calculated against eligible completed, paid sales recorded in The Plug.</p></div></div>
   <div className="plugParticipationIntro">
    <strong>What Admin Hub has put in place</strong>
    <ul>
     <li><b>Your digital shop:</b> a public storefront where customers can discover products and send sourcing requests.</li>
     <li><b>Your customer workspace:</b> customer accounts, request history and a direct path to follow each order.</li>
     <li><b>Your owner workspace:</b> one place to manage requests, quotes, payments, expenses and business records.</li>
     <li><b>Your operating infrastructure:</b> production hosting through Vercel, connected Firebase records and cross-device data sync for signed-in Operations devices.</li>
     <li><b>Your business insights:</b> customer journey events record product views and request clicks; Vercel Web Analytics and Speed Insights collection are installed to support traffic and performance reporting. The owner-side provider report still needs its access configuration.</li>
     <li><b>Room to grow:</b> the app can support optional promotions, rewards and customer-engagement games when the owner chooses to use them.</li>
    </ul>
    <small>In simple terms: Admin Hub builds and provides the digital tools; the owner runs the business and records the real transactions.</small>
   </div>
   <div className="plugParticipationStats">
    <article><span>Eligible recorded payments · last 30 days</span><strong>{money(serviceFeeSummary.eligibleRevenue)}</strong><small>From completed requests only</small></article>
    <article><span>Completed, fully paid transactions</span><strong>{serviceFeeSummary.paidTransactions}</strong></article>
    <article><span>Customer requests received</span><strong>{serviceFeeSummary.activity}</strong></article>
    <article><span>Product views</span><strong>{serviceFeeSummary.demandViews}</strong></article>
    <article><span>Product request clicks</span><strong>{serviceFeeSummary.requestClicks}</strong></article>
    <article><span>Quoted customer balances still due</span><strong>{money(serviceFeeSummary.outstanding)}</strong></article>
   </div>
   <div className="plugParticipationRationale"><span>Revenue trend vs previous 30 days</span><strong>{serviceFeeSummary.change===null?"No previous-period baseline":(serviceFeeSummary.change>=0?"+":"")+serviceFeeSummary.change.toFixed(1)+"%"}</strong><small>Demand views and product clicks are supporting signals only; they do not count as revenue.</small></div>
   <div className="plugParticipationChoice">
    <div className="plugParticipationChoiceHead"><div><span>YOUR CHOICE · ADMIN HUB SERVICE FEE</span><strong>{serviceFeeRate===null?"Choose a rate":serviceFeeRate+"%"}</strong></div><p>Choose a service rate between 10% and 20%. Your saved rate applies prospectively from the next 30-day period.</p></div>
     <div className="plugFeePreviewToggle"><div><strong>Preview against storefront requests</strong><small>Use the requested storefront reference value as an illustration—not as a billable sales figure.</small></div><button type="button" role="switch" aria-checked={showStorefrontReferencePreview} className={"plugFeeSwitch"+(showStorefrontReferencePreview?" isOn":"")} onClick={()=>setShowStorefrontReferencePreview(value=>!value)}><span/>{showStorefrontReferencePreview?"On":"Off"}</button></div>
     <div className="plugFeeVisual" aria-live="polite"><div className="plugFeeVisualHead"><span>{showStorefrontReferencePreview?"REQUESTED STOREFRONT REFERENCE VALUE":"ELIGIBLE COMPLETED, PAID SALES · LAST 30 DAYS"}</span><strong>{money(previewBasis)}</strong></div><div className="plugFeeBar" role="img" aria-label={"Illustrative service fee "+money(previewFee)+" and amount before other operating costs "+money(previewRemainder)}><span className="plugFeeBarCharge" style={{width:previewFeeShare+"%"}}/><span className="plugFeeBarRemainder" style={{width:(100-previewFeeShare)+"%"}}/></div><div className="plugFeeVisualLegend"><span><i className="plugFeeDot charge"/>Admin Hub service fee <b>{serviceFeeRate===null?"Choose rate":money(previewFee)}</b></span><span><i className="plugFeeDot remainder"/>Remaining before other operating costs <b>{serviceFeeRate===null?"—":money(previewRemainder)}</b></span></div>{showStorefrontReferencePreview?<p className="plugFeePreviewNote">Illustrative only: {summary.referenceCount} priced requests · {summary.unpricedRequests} without a reference price. Requests are not confirmed quotes, completed sales or money received. This preview does not change the billing calculation.</p>:<p className="plugFeePreviewNote">This is the live calculation basis. Only eligible completed, paid recorded sales count; unpaid balances, open requests and storefront views are excluded.</p>}</div>
    <input aria-label="Admin Hub service fee percentage" type="range" min="10" max="20" step="1" value={serviceFeeRate??15} onChange={event=>setServiceFeeRate(Number(event.target.value))}/>
    <div className="plugParticipationScale"><span>10% · lower contribution</span><span>15% · middle</span><span>20% · higher contribution</span></div>
    <div className="plugParticipationEstimate"><div><span>{serviceFeeRate===null?"Choose a rate to see the estimate":"At "+serviceFeeRate+"% of eligible payments"}</span><strong>{serviceFeeRate===null?"—":money(serviceFeeAmount)}</strong><small>Illustration using the last 30 days of eligible recorded payments</small></div><div><span>Next review / due date</span><strong>{serviceFeeLoading?"Loading…":serviceFeeSaved?dateLabel(serviceFeeSaved.nextDueAt):"Set when activated"}</strong></div></div>
    <p className="plugParticipationPlain">In simple terms: account for the Admin Hub service fee first, then plan stock, delivery, marketing and other operating expenses. The fee is calculated before those costs are deducted.</p>
   </div>
   <p className="plugFinanceFootnote">The 30-day statement will show the eligible payments, chosen rate and amount due. Changes you make now apply to the next period, not the period already running. This is an agreed software service fee for Admin Hub&apos;s digital platform and services; it is not automatically collected.</p>
   {serviceFeeNotice&&<p className="plugExpenseNotice" role="status">{serviceFeeNotice}</p>}
   <div className="plugParticipationActions"><button type="button" className="button buttonPrimary plugExpenseSave" disabled={serviceFeeSaving||serviceFeeLoading||serviceFeeRate===null} onClick={()=>void saveService fee()}>{serviceFeeSaving?"Saving…":"Save service rate"}</button>{serviceFeeSaved&&Date.now()>=Date.parse(serviceFeeSaved.nextDueAt)&&<button type="button" className="button buttonLight plugExpenseSave" onClick={()=>void recordService feePayment()}>Record payment &amp; expense</button>}</div>

   </div>
   {expenseNotice&&<p className="plugExpenseNotice" role="status">{expenseNotice}</p>}
   <div className="plugExpenseForm">
    <label>Merchant / supplier<input value={merchant} onChange={event=>setMerchant(event.target.value)} placeholder="e.g. Courier, supplier or fuel"/></label>
    <label>Expense category<select value={category} onChange={event=>setCategory(event.target.value)}><option>Operating costs</option><option>Admin Hub service fee</option><option>Transport &amp; delivery</option><option>Supplier payments</option><option>Marketing</option><option>Software &amp; hosting</option><option>Packaging</option><option>Equipment</option><option>Other</option></select></label>
    <label>Amount (BWP)<input type="number" min="0.01" step="0.01" value={amount} onChange={event=>setAmount(event.target.value)} placeholder="0.00"/></label>
    <label>Date<input type="date" value={expenseDate} onChange={event=>setExpenseDate(event.target.value)}/></label>
    <label className="plugExpenseWide">Receipt image or PDF <input type="file" accept="image/*,application/pdf" onChange={event=>{const file=event.target.files?.[0]||null;if(file&&file.size>4*1024*1024){setExpenseNotice("Receipt files must be 4 MB or smaller.");setReceiptFile(null);event.target.value="";return;}setReceiptFile(file);setExpenseNotice("");}}/><small>{receiptFile?receiptFile.name:"Optional · UploadThing attachment · max 4 MB"}</small></label>
    <label className="plugExpenseWide">Note (optional)<textarea rows={2} value={expenseNote} onChange={event=>setExpenseNote(event.target.value)} placeholder="What was this expense for?"/></label>
   </div>
   <button type="button" className="button buttonPrimary plugExpenseSave" disabled={savingExpense} onClick={()=>void saveExpense()}>{savingExpense?"Saving expense…":"Save expense record"}</button>
   <div className="plugExpenseSummary"><div><span>Recorded expenses</span><strong>{money(expenseTotal)}</strong><small>{expenses.length} records · Firebase synced</small></div><div><span>Recorded payments less recorded expenses</span><strong>{money(recordedCashAfterExpenses)}</strong><small>Cash movement only · not profit or a tax calculation</small></div></div>
   <div className="plugExpenseList"><div className="plugExpenseListHead"><strong>Expense records</strong><button type="button" className="button buttonLight" onClick={()=>window.print()}>Print / save statement</button></div>
    {expensesLoading?<p className="orderTruth">Loading expense records…</p>:expenses.length?expenses.map(item=><article key={item.id}><div><strong>{item.merchant}</strong><small>{item.category} · {dateLabel(item.date)}{item.note?" · "+item.note:""}</small>{item.receipt&&<a href={item.receipt.url} target="_blank" rel="noreferrer">Open receipt ↗</a>}</div><strong>{money(item.amount)}</strong><button type="button" className="button buttonLight" disabled={deletingExpense===item.id} onClick={()=>void removeExpense(item)}>{deletingExpense===item.id?"Deleting…":"Delete"}</button></article>):<p className="orderTruth">No expenses recorded yet.</p>}
   </div>
   <p className="plugFinanceFootnote">This is an operational owner ledger, not a certified financial statement, tax invoice or bank reconciliation. Verify every payment and expense against its source record.</p>
  </section>
 </div>;
}
