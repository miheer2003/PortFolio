import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./styles/TimeWidgets.css";

const IST_OFFSET = 330; // minutes

/** Current time in IST as hours/minutes/seconds (fractional seconds for smooth hands). */
const istParts = () => {
  const now = Date.now();
  const ist = new Date(now + (IST_OFFSET + new Date().getTimezoneOffset()) * 60_000);
  return { h: ist.getHours(), m: ist.getMinutes(), s: ist.getSeconds() + (now % 1000) / 1000 };
};

const partOfDay = (h: number) =>
  h < 5 ? "Night" : h < 12 ? "Morning" : h < 17 ? "Afternoon" : h < 21 ? "Evening" : "Night";

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

const describeGap = () => {
  const visitor = -new Date().getTimezoneOffset();
  const diff = IST_OFFSET - visitor;
  if (diff === 0) return "Same time zone";
  const h = Math.floor(Math.abs(diff) / 60);
  const m = Math.abs(diff) % 60;
  const span = `${h}h${m ? ` ${m}m` : ""}`;
  return diff > 0 ? `Pune is ${span} ahead` : `Pune is ${span} behind`;
};

const visitorZone = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    return tz.split("/").pop()?.replace(/_/g, " ") || "Your time";
  } catch {
    return "Your time";
  }
};

const SAME_ZONE = -new Date().getTimezoneOffset() === IST_OFFSET;
const TODAY = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(new Date());

const TimeWidgets = () => {
  const hRef = useRef<SVGLineElement>(null);
  const mRef = useRef<SVGLineElement>(null);
  const sRef = useRef<SVGLineElement>(null);
  const istRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const youRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let lastSec = -1;
    const fmtYou = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });

    const tick = () => {
      const { h, m, s } = istParts();
      // hands (SVG rotate around the 20,20 centre)
      sRef.current?.setAttribute("transform", `rotate(${s * 6} 20 20)`);
      mRef.current?.setAttribute("transform", `rotate(${(m + s / 60) * 6} 20 20)`);
      hRef.current?.setAttribute("transform", `rotate(${((h % 12) + m / 60) * 30} 20 20)`);

      const sec = Math.floor(s);
      if (sec === lastSec) return;
      lastSec = sec;
      if (istRef.current) istRef.current.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
      if (dayRef.current) dayRef.current.textContent = partOfDay(h);
      if (youRef.current) youRef.current.textContent = fmtYou.format(new Date());
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <>
      <div className="tw tw-clock" data-hero-fade>
        <svg className="tw-dial" viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="19" className="tw-face" />
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={i}
              x1="20"
              y1="3.5"
              x2="20"
              y2={i % 3 === 0 ? 7 : 5.5}
              className="tw-tick"
              transform={`rotate(${i * 30} 20 20)`}
            />
          ))}
          <line ref={hRef} x1="20" y1="20" x2="20" y2="11.5" className="tw-hand tw-h" />
          <line ref={mRef} x1="20" y1="20" x2="20" y2="7" className="tw-hand tw-m" />
          <line ref={sRef} x1="20" y1="23" x2="20" y2="5" className="tw-hand tw-s" />
          <circle cx="20" cy="20" r="1.4" className="tw-pin" />
        </svg>
        <div className="tw-text">
          <span className="mono tw-label">
            Pune · <span ref={dayRef} />
          </span>
          <span className="tw-time" ref={istRef} />
        </div>
      </div>

      <div className="tw tw-you" data-hero-fade>
        <span className="tw-globe" aria-hidden="true">
          <span />
        </span>
        <div className="tw-text">
          {SAME_ZONE ? (
            <>
              <span className="mono tw-label">Today</span>
              <span className="tw-time">{TODAY}</span>
              <span className="mono tw-sub">Replies within a day</span>
            </>
          ) : (
            <>
              <span className="mono tw-label">{visitorZone()}</span>
              <span className="tw-time" ref={youRef} />
              <span className="mono tw-sub">{describeGap()}</span>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TimeWidgets;
