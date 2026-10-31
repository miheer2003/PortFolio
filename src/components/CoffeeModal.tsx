import { useEffect, useMemo, useRef, useState } from "react";
import qrcode from "qrcode-generator";
import { MdClose, MdContentCopy, MdCheck } from "react-icons/md";
import { SiGooglepay, SiPaytm, SiPhonepe } from "react-icons/si";
import { CoffeeCup } from "./CoffeeButton";
import { COFFEE_EVENT } from "./utils/coffee";
import { getLenis } from "./utils/lenis";
import "./styles/Coffee.css";

const UPI_ID = "miheerjangale7@okaxis";
const PAYEE = "Miheer Jangale";
const NOTE = "Coffee for Miheer";
const AMOUNTS = [49, 99, 199];
const MAX = 10000;

// UPI apps expect a literal "@" in the VPA and %20 for spaces (not "+").
const enc = (v: string) => encodeURIComponent(v).replace(/%40/g, "@");
const upiQuery = (amount: number) =>
  `pa=${enc(UPI_ID)}&pn=${enc(PAYEE)}&am=${amount.toFixed(2)}&cu=INR&tn=${enc(NOTE)}`;

/** QR as a single SVG path, so it can take the site colours. */
const QR = ({ value }: { value: string }) => {
  const { d, n } = useMemo(() => {
    const qr = qrcode(0, "M");
    qr.addData(value);
    qr.make();
    const n = qr.getModuleCount();
    let d = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return { d, n };
  }, [value]);
  return (
    <svg className="coffee-qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label="UPI payment QR code" shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} rx="2" className="coffee-qr-bg" />
      <path d={d} className="coffee-qr-fg" />
    </svg>
  );
};

const CoffeeModal = ({ initialOpen = false }: { initialOpen?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(99);
  const [custom, setCustom] = useState("");
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const mobile = useMemo(() => window.matchMedia("(pointer: coarse)").matches, []);

  const customNum = Number(custom);
  const customValid = custom !== "" && Number.isFinite(customNum) && customNum >= 1 && customNum <= MAX;
  const value = custom !== "" ? (customValid ? Math.round(customNum * 100) / 100 : 0) : amount;
  const query = value ? upiQuery(value) : "";

  useEffect(() => {
    const onOpen = () => {
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
    };
    window.addEventListener(COFFEE_EVENT, onOpen);
    let raf = 0;
    if (initialOpen) raf = requestAnimationFrame(() => requestAnimationFrame(onOpen));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener(COFFEE_EVENT, onOpen);
    };
  }, [initialOpen]);

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      getLenis()?.start();
      lastFocus.current?.focus?.();
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked: the ID is visible to copy by hand */
    }
  };

  const apps = [
    { name: "Any UPI app", href: `upi://pay?${query}` },
    { name: "GPay", href: `tez://upi/pay?${query}`, Icon: SiGooglepay },
    { name: "PhonePe", href: `phonepe://pay?${query}`, Icon: SiPhonepe },
    { name: "Paytm", href: `paytmmp://pay?${query}`, Icon: SiPaytm },
  ];

  return (
    <div className={`coffee-overlay ${open ? "is-open" : ""}`} onClick={() => setOpen(false)} aria-hidden={!open}>
      <div
        className="coffee-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coffee-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="coffee-close" ref={closeRef} onClick={() => setOpen(false)} aria-label="Close" tabIndex={open ? 0 : -1}>
          <MdClose />
        </button>

        <div className="coffee-head">
          <span className="coffee-badge">
            <CoffeeCup className="is-big" />
          </span>
          <h2 id="coffee-title">
            Buy me a <span className="serif accent-text">coffee</span>
          </h2>
          <p>If something here helped or made you smile, a coffee keeps the next build going.</p>
        </div>

        <div className="coffee-amounts" role="radiogroup" aria-label="Amount">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              role="radio"
              aria-checked={custom === "" && amount === a}
              className={`coffee-chip ${custom === "" && amount === a ? "is-on" : ""}`}
              onClick={() => {
                setAmount(a);
                setCustom("");
              }}
              tabIndex={open ? 0 : -1}
            >
              ₹{a}
            </button>
          ))}
          <label className={`coffee-chip coffee-custom ${custom !== "" ? "is-on" : ""}`}>
            <span>₹</span>
            <input
              inputMode="numeric"
              placeholder="Other"
              value={custom}
              onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, "").slice(0, 7))}
              aria-label="Custom amount in rupees"
              tabIndex={open ? 0 : -1}
            />
          </label>
        </div>
        {custom !== "" && !customValid && <p className="coffee-error mono">Enter ₹1 – ₹{MAX.toLocaleString("en-IN")}</p>}

        {open && value > 0 && (
          <div className={`coffee-pay ${mobile ? "is-mobile" : ""}`}>
            {mobile ? (
              <div className="coffee-apps">
                {apps.map(({ name, href, Icon }) => (
                  <a key={name} href={href} className={`coffee-app ${Icon ? "" : "is-primary"}`}>
                    {Icon ? <Icon aria-hidden="true" /> : <CoffeeCup />}
                    <span>{Icon ? name : `Pay ₹${value} with UPI`}</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="coffee-scan">
                <QR value={`upi://pay?${query}`} />
                <p className="mono">
                  Scan with any UPI app
                  <br />
                  <strong>₹{value}</strong> · GPay, PhonePe, Paytm
                </p>
              </div>
            )}
          </div>
        )}

        <button className="coffee-upi mono" onClick={copy} tabIndex={open ? 0 : -1}>
          <span>{UPI_ID}</span>
          {copied ? <MdCheck /> : <MdContentCopy />}
          <span className="sr-only" aria-live="polite">
            {copied ? "UPI ID copied" : ""}
          </span>
        </button>
        <p className="coffee-foot mono">Goes straight to my bank · No fees · Thank you ♥</p>
      </div>
    </div>
  );
};

export default CoffeeModal;
