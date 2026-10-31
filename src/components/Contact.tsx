import { useState } from "react";
import { MdArrowOutward, MdArrowUpward } from "react-icons/md";
import "./styles/Contact.css";
import CoffeeButton from "./CoffeeButton";
import { useLocalTime } from "./Landing";
import { scrollToTarget } from "./utils/lenis";
import { StarDock } from "./ScrollStar";

const EMAIL = "miheerjangale7@gmail.com";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/miheer2003" },
  { label: "LinkedIn", href: "https://linkedin.com/in/miheer-jangale" },
  {
    label: "Résumé",
    href: "https://drive.google.com/file/d/1qq9yPUU2tygYuroMppPYi_-x5V9dt0Oe/view?usp=sharing",
  },
];

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const time = useLocalTime();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <section className="section contact" id="contact">
      <div className="contact-glow" aria-hidden="true" />
      <div className="wrap">
        <div className="sec-head">
          <span className="mono sec-index">(07)</span>
          <span className="mono">Contact</span>
          <span className="sec-line" aria-hidden="true" />
        </div>

        <p className="mono contact-kicker" data-reveal="fade">
          <span className="live-dot" /> Open to collaborations &amp; interesting problems
        </p>
        <h2 className="contact-title" data-reveal="lines">
          Let's build <StarDock before="something" /> <span className="serif accent-text">intelligent.</span>
        </h2>

        <div className="contact-actions" data-reveal="fade">
          <a href={`mailto:${EMAIL}`} className="contact-email">
            <span>{EMAIL}</span>
            <MdArrowOutward />
          </a>
          <button className="btn" onClick={copy} aria-live="polite">
            {copied ? "Copied ✓" : "Copy email"}
          </button>
          <CoffeeButton />
        </div>

        <div className="contact-grid">
          <div>
            <span className="mono">Phone</span>
            <a href="tel:+918177870012" className="link-line">
              +91 81778 70012
            </a>
          </div>
          <div>
            <span className="mono">Elsewhere</span>
            <ul>
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="link-line">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="mono">Local time</span>
            <span>{time} IST · Pune</span>
          </div>
        </div>

        <footer className="footer">
          <span className="mono">© {new Date().getFullYear()} Miheer Jangale</span>
          <span className="mono">Designed &amp; built by me</span>
          <button className="mono footer-top" onClick={() => scrollToTarget(0)}>
            Back to top <MdArrowUpward />
          </button>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
