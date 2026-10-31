import CoffeeButton from "./CoffeeButton";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis, scrollToTarget } from "./utils/lenis";
import { openTerminal } from "./utils/terminal";
import "./styles/Navbar.css";

const LINKS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const RESUME =
  "https://drive.google.com/file/d/1qq9yPUU2tygYuroMppPYi_-x5V9dt0Oe/view?usp=sharing";

const Navbar = () => {
  const [active, setActive] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = ["about", "work", "capabilities", "experience", "stack", "certifications", "contact"];
    const triggers = ids.map((id) =>
      ScrollTrigger.create({
        trigger: `#${id}`,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => self.isActive && setActive(id),
        onLeaveBack: () => id === ids[0] && setActive(""),
      })
    );
    const top = ScrollTrigger.create({
      start: 40,
      end: "max",
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      top.kill();
    };
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToTarget(id === "top" ? 0 : `#${id}`);
  };

  return (
    <header className={`header ${scrolled ? "is-scrolled" : ""} ${open ? "is-open" : ""} ${active === "contact" && !open ? "is-dark" : ""}`}>
      <div className="header-bar">
        <a href="#top" className="nav-logo" onClick={(e) => go(e, "top")} aria-label="Miheer Jangale, back to top">
          <Logo />
        </a>

        <nav className="nav-pill" aria-label="Primary">
          {LINKS.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => go(e, id)}
              className={active === id ? "is-active" : ""}
              aria-current={active === id ? "true" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <button className="nav-term" onClick={openTerminal} aria-label="Open terminal" title="Terminal ( ` )">
            <span aria-hidden="true">
              {">"}
              <span className="caret">_</span>
            </span>
          </button>
          <CoffeeButton compact className="nav-coffee" />
          <a href={RESUME} target="_blank" rel="noopener noreferrer" className="btn nav-resume">
            Résumé
          </a>
          <button
            className="nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className="nav-menu" id="mobile-menu" aria-hidden={!open}>
        <nav>
          {LINKS.map(({ id, label }, i) => (
            <a key={id} href={`#${id}`} onClick={(e) => go(e, id)} tabIndex={open ? 0 : -1}>
              <span className="mono">0{i + 1}</span>
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-menu-foot mono">
          <a href="mailto:miheerjangale7@gmail.com" tabIndex={open ? 0 : -1}>
            miheerjangale7@gmail.com
          </a>
          <a href={RESUME} target="_blank" rel="noopener noreferrer" tabIndex={open ? 0 : -1}>
            Résumé ↗
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
