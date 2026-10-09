import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="orderPage">
      <div className="orderWrap">
        <div className="orderHeader">
          <Link href="/" className="logo"><span className="logoMark">P</span><span>The Plug</span></Link>
        </div>
        <section className="orderCard confirm">
          <div className="confirmIcon">📶</div>
          <span className="kicker">Offline mode</span>
          <h1>The Plug is still here.</h1>
          <p>The The Plug app shell and previously loaded public pages can remain available on this device while your connection is away.</p>
          <p>A request can only be treated as received after The Plug confirms it was saved. If you are offline, reconnect before submitting or contact Frank on WhatsApp.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/request">Open request</Link>
            <Link className="button buttonLight" href="/">Open The Plug</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
