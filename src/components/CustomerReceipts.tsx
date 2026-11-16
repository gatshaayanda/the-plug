"use client";
import type {PlugRequest,PlugPaymentRecord} from "@/lib/firebase/plug-data";
function money(n:number){return "P"+n.toFixed(2)}
function storefrontPrice(notes:string){const match=notes.match(/Storefront listed price when requested:\\s*P([0-9,.]+)/i);return match?Number(match[1].replace(/,/g,"")):undefined}
function selectedItems(notes:string){const match=notes.match(/Selected storefront items:\\s*([\\s\\S]*?)(?=\\n(?:Request type:|Storefront listed price|Product \/ social link:|Budget guide:|Shopping for:|When needed:|Additional details:)|$)/i);return match?.[1]?.split("\\n").map(line=>line.trim()).filter(Boolean)??[]}
function printRecord(){window.print()}
type ReceiptRow={key:string;request:PlugRequest;payment:PlugPaymentRecord;legacy:boolean};
export default function CustomerReceipts({requests}:{requests:PlugRequest[]}){
 const paymentRows:ReceiptRow[]=requests.flatMap(request=>{
  if(request.paymentRecords?.length)return request.paymentRecords.map((payment,index)=>({key:payment.id||request.id+"-"+index,request,payment,legacy:false}));
  if(typeof request.depositPaid==="number"&&request.depositPaid>0)return [{key:request.id+"-legacy",request,payment:{id:"LEGACY",amount:request.depositPaid,method:request.depositMethod??"Other",reference:request.depositReference,recordedAt:request.depositRecordedAt??""},legacy:true}];
  return [];
 }).sort((a,b)=>b.payment.recordedAt.localeCompare(a.payment.recordedAt));
 const sortedRequests=[...requests].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
 return <section id="receipts" className="accountSection plugReceipts" aria-labelledby="plug-receipts-title">
  <div className="panelHeading"><div><span className="kicker">LIVE REQUEST RECORDS & PAYMENT RECEIPTS</span><h2 id="plug-receipts-title">Your records.</h2><p>Each sourcing request has a live, printable record that updates as Frank reviews and progresses it. Payment acknowledgements appear separately and only after a payment is recorded.</p></div></div>
  {sortedRequests.length===0?<div className="feedEmpty"><strong>No sourcing records yet.</strong><p>Once you submit a request, its live record will appear here at every stage.</p></div>:<div className="plugLiveRecordList">{sortedRequests.map(request=>{
   const reference=storefrontPrice(request.notes||"");
   const items=selectedItems(request.notes||"");
   const paid=request.depositPaid??request.paymentRecords?.reduce((sum,p)=>sum+p.amount,0)??0;
   const remaining=request.quotedPrice===undefined?undefined:Math.max(0,request.quotedPrice-paid);
   return <article className="plugLiveRecord" key={request.id}>
    <div className="plugLiveRecordTop"><div><span className="kicker">THE PLUG · SOURCING RECORD</span><strong>{request.product}</strong><small>Record {request.id.slice(0,10).toUpperCase()} · Updated {new Date(request.updatedAt).toLocaleString()}</small></div><span className="plugLiveRecordStatus">{request.status}</span></div>
    <div className="plugLiveRecordPaper">
     <header><span className="plugRecordBrand">P</span><div><strong>THE PLUG</strong><small>SNEAKERS · APPAREL · SOURCING</small></div><span className="plugRecordDocType">LIVE SOURCING RECORD</span></header>
     <div className="plugRecordIdentity"><div><small>REQUEST REFERENCE</small><strong>{request.id.slice(0,10).toUpperCase()}</strong></div><div><small>CREATED</small><strong>{new Date(request.createdAt).toLocaleDateString()}</strong></div><div><small>CURRENT STAGE</small><strong>{request.status}</strong></div></div>
     <dl><div><dt>Customer</dt><dd>{request.customerName||"The Plug customer"}</dd></div><div><dt>Product / request</dt><dd>{request.product}</dd></div>{request.size&&<div><dt>Size</dt><dd>{request.size}</dd></div>}{request.colour&&<div><dt>Colour / version</dt><dd>{request.colour}</dd></div>}{request.deliveryMethod&&<div><dt>Fulfilment</dt><dd>{request.deliveryMethod==="delivery"?"Delivery":"Collection"}{request.deliveryEstimate?" · "+request.deliveryEstimate:""}</dd></div>}</dl>
     {items.length>0&&<div className="plugRecordItems"><strong>Selected storefront finds</strong>{items.map((item,index)=><span key={index}>{item}</span>)}</div>}
     <div className="plugRecordFinancials">
      {reference!==undefined&&<div><span>Storefront reference amount</span><strong>{money(reference)}</strong><small>Reference only · not paid · not a confirmed quote</small></div>}
      <div><span>Confirmed quote</span><strong>{request.quotedPrice===undefined?"Pending Frank’s confirmation":money(request.quotedPrice)}</strong><small>{request.quotedPrice===undefined?"No confirmed selling price has been issued.":"Quote recorded by The Plug"}</small></div>
      <div><span>Payments recorded</span><strong>{money(paid)}</strong><small>{paid>0?"Staff-recorded payments only":"No payment recorded"}</small></div>
      {remaining!==undefined&&<div><span>Remaining against quote</span><strong>{money(remaining)}</strong><small>Calculated from recorded payments</small></div>}
     </div>
     {request.adminNote&&<div className="plugRecordNote"><strong>Update from Frank</strong><p>{request.adminNote}</p></div>}
     <footer>This is a live sourcing and account record, not a tax invoice, proof of payment, order confirmation or guarantee of stock. A storefront reference amount is never treated as money received. Only the confirmed quote and separately recorded payments represent agreed pricing and funds received.</footer>
    </div>
    <div className="plugLiveRecordActions"><span>Live record · changes with request status</span><button type="button" className="button buttonLight" onClick={printRecord}>Print / save PDF</button></div>
   </article>
  })}</div>}
  <div className="plugPaymentRecordsHeading"><span className="kicker">PAYMENTS ACTUALLY RECORDED</span><h3>Payment acknowledgements.</h3><p>These are separate from live sourcing records. Acknowledgements are issued only for amounts Frank has recorded as received.</p></div>
  {paymentRows.length===0?<div className="feedEmpty"><strong>No payments recorded yet.</strong><p>Storefront prices, estimates and pending quotes are not receipts. When Frank records a payment, its acknowledgement will appear here.</p></div>:<div className="plugReceiptList">{paymentRows.map(({key,request,payment,legacy})=><details className="plugReceipt" key={key}><summary><span><strong>{request.product}</strong><small>{payment.recordedAt?"Payment recorded "+new Date(payment.recordedAt).toLocaleDateString():"Older payment · date not captured"} · {payment.method}</small></span><b>{money(payment.amount)}</b></summary><div className="plugReceiptPaper"><header><span>THE PLUG</span><strong>PAYMENT ACKNOWLEDGEMENT</strong><small>Record · {request.id.slice(0,8).toUpperCase()} · {legacy?"LEGACY":payment.id}</small></header><dl><div><dt>Customer</dt><dd>{request.customerName}</dd></div><div><dt>Item</dt><dd>{request.product}</dd></div><div><dt>Request reference</dt><dd>{request.id.slice(0,10).toUpperCase()}</dd></div><div><dt>Recorded on</dt><dd>{payment.recordedAt?new Date(payment.recordedAt).toLocaleString():"Date not captured on this older record"}</dd></div><div><dt>Payment method</dt><dd>{payment.method}</dd></div><div><dt>Payment reference</dt><dd>{payment.reference||"Not supplied"}</dd></div></dl><div className="plugReceiptAmount"><span>Amount recorded received</span><strong>{money(payment.amount)}</strong></div><p>Confirmed quote: {request.quotedPrice!==undefined?money(request.quotedPrice):"Not set"} · Total recorded: {money(request.depositPaid??payment.amount)} · Remaining balance: {request.quotedPrice!==undefined?money(Math.max(0,request.quotedPrice-(request.depositPaid??payment.amount))):"Not calculated"}</p><footer>This is a payment acknowledgement based on a record entered by The Plug. It is not a tax invoice, payment processor confirmation or independent verification of funds.</footer><button type="button" className="button buttonPrimary" onClick={printRecord}>Print / save PDF</button></div></details>)}</div>}
 </section>
}
