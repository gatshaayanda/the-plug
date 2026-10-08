import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="orderPage">
      <div className="orderWrap">
        <div className="orderHeader">
          <Link href="/" className="logo"><span className="logoMark">B</span><span>The Plug</span></Link>
        </div>
        <section className="orderCard confirm">
          <div className="confirmIcon">📶</div>
          <span className="kicker">Offline mode</span>
          <h1>The Plug is still here.</h1>
          <p>The The Plug app shell and previously loaded public pages can remain available on this device while your connection is away.</p>
          <p>Firestore can keep an eligible request write locally and synchronize it later, but the Frank has not received an offline request until Firebase confirms synchronization.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/order">Open request</Link>
            <Link className="button buttonLight" href="/">Open The Plug</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
