import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="orderPage">
      <div className="orderWrap">
        <div className="orderHeader">
          <Link href="/" className="logo"><span className="logoMark">P</span><span>The Plug</span></Link>
        </div>
        <section className="orderCard confirm">
          <div className="confirmIcon" aria-hidden="true">📶</div>
          <span className="kicker">YOU’RE OFFLINE</span>
          <h1>The Plug is still here.</h1>
          <p>This screen needs a live connection. We keep private account pages and requests fresh rather than showing an old version that could mislead you.</p>
          <p>You can return to The Plug and browse screens already saved on this device. Live prices, availability, requests and messages will be ready when your connection returns.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/">Back to The Plug</Link>
          </div>
          <p className="orderTruth" role="note">Nothing is submitted or changed unless The Plug confirms it.</p>
        </section>
      </div>
    </main>
  );
}
