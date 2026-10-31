import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { StarDock } from "./ScrollStar";
import { getGithub } from "./utils/github";
import { prefersReducedMotion } from "./utils/lenis";
import "./styles/Numbers.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Stat = {
  value: number | null;
  pre?: string;
  suf?: string;
  label: string;
  live?: boolean;
};

const STRIP = [..."01234567890123456789"]; // two turns, so every digit spins at least once

/** One rolling number. Digits land right-to-left, like the loader's counter. */
const Odometer = ({ value, play }: { value: number | null; play: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const digits = value === null ? "000" : String(value);

  useEffect(() => {
    const strips = ref.current?.querySelectorAll<HTMLElement>(".odo-strip");
    if (!strips?.length) return;
    const reduce = prefersReducedMotion();
    strips.forEach((s, i) => {
      const d = Number(s.dataset.d);
      const target = value === null ? 0 : 10 + d; // second turn
      gsap.killTweensOf(s);
      if (!play || reduce) {
        gsap.set(s, {
          yPercent:
            reduce && value !== null ? -(target * 100) / STRIP.length : 0,
        });
        return;
      }
      gsap.fromTo(
        s,
        { yPercent: 0 },
        {
          yPercent: -(target * 100) / STRIP.length,
          duration: 1.5 + (strips.length - 1 - i) * 0.25,
          ease: "expo.out",
          delay: (strips.length - 1 - i) * 0.06,
        },
      );
    });
  }, [value, play]);

  return (
    <span className="odo" ref={ref} aria-hidden="true">
      {[...digits].map((d, i) => (
        <span className="odo-digit" key={`${digits.length}-${i}`}>
          <span className="odo-strip" data-d={d}>
            {STRIP.map((n, k) => (
              <span key={k}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
};

const Numbers = () => {
  const rootRef = useRef<HTMLElement>(null);
  const [contrib, setContrib] = useState<number | null>(null);
  const [plays, setPlays] = useState([0, 0, 0, 0]); // bump one to (re)roll it
  const [hot, setHot] = useState<number | null>(null);

  useEffect(() => {
    getGithub()
      .then((d) => setContrib(d.total))
      .catch(() => setContrib(-1));
  }, []);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: rootRef.current,
        start: "top 72%",
        once: true,
        onEnter: () => setPlays((p) => p.map((n) => n + 1)),
      });
      if (prefersReducedMotion()) return () => st.kill();

      // Each column's content rises at its own speed and settles in line.
      gsap.utils.toArray<HTMLElement>(".num-in").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 70 + i * 36 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top bottom",
              end: "top 30%",
              scrub: 0.6,
            },
          },
        );
      });
    },
    { scope: rootRef },
  );

  const stats: Stat[] = [
    { value: 23, pre: "AIR", label: "All India Rank, CDAC PG-DAC" },
    contrib === -1
      ? { value: 200, suf: "+", label: "GitHub contributions this year" }
      : { value: contrib, label: "GitHub contributions this year", live: true },
    { value: 10, suf: "+", label: "REST APIs designed at Xpedio Live" },
    { value: 35, suf: "%", label: "Faster data loads from tuned MySQL" },
  ];

  return (
    <section className="numbers" ref={rootRef} aria-label="By the numbers">
      <div className="wrap">
        <p className="mono numbers-kicker">
          What the pressure <StarDock /> turned into
        </p>

        <ul className="numbers-grid">
          {stats.map((s, i) => (
            <li
              key={s.label}
              className={`num ${hot !== null && hot !== i ? "is-dim" : ""}`}
              onPointerEnter={() => {
                setHot(i);
                setPlays((p) =>
                  p[i] ? p.map((n, k) => (k === i ? n + 1 : n)) : p,
                );
              }}
              onPointerLeave={() => setHot(null)}
            >
              <span className="num-in">
                <span
                  className="num-value"
                  aria-label={`${s.pre ?? ""} ${s.value ?? ""}${s.suf ?? ""}`.trim()}
                >
                  {s.pre && <span className="num-pre mono">{s.pre}</span>}
                  <Odometer value={s.value} play={plays[i]} />
                  {s.suf && <span className="num-suf serif">{s.suf}</span>}
                </span>
                <span className="num-label mono">
                  {s.live && <span className="live-dot" />}
                  {s.label}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Numbers;
