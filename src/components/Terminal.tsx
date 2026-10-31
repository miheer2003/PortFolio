import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { GithubData } from "../../api/github";
import { EMAIL, GH, LINKEDIN, PROJECTS, RESUME } from "../data/profile";
import { openCoffee } from "./utils/coffee";
import { getLenis, scrollToTarget } from "./utils/lenis";
import { TERMINAL_EVENT } from "./utils/terminal";
import "./styles/Terminal.css";

type Line = { id: number; cmd?: string; out?: ReactNode };

const SECTIONS = ["about", "work", "capabilities", "experience", "stack", "certifications", "contact"];

const SKILLS: [string, string][] = [
  ["ai", "MCP · LangGraph · LangChain · CrewAI · OpenAI · Claude · Gemini · Hugging Face · Ollama"],
  ["llm", "RAG · context engineering · embeddings & vector DBs · tool calling · agents · evals"],
  ["ml", "Python · PyTorch · FastAPI"],
  ["product", "Ruby on Rails · Java · Spring Boot · React · TypeScript"],
  ["ship", "PostgreSQL · AWS · Docker · Git · GitHub"],
];

const EXPERIENCE: [string, string, string][] = [
  ["now", "AI Engineer · Ruby on Rails", "Nutsovertech"],
  ["2025–26", "PG-DAC, Advanced Computing · AIR 23", "CDAC ACTS, Pune"],
  ["2025", "Software Development Intern", "Xpedio Live, Pune"],
  ["2022–25", "B.Tech, Computer Engineering", "MIT ADT University"],
];

const HELP: [string, string][] = [
  ["whoami", "who I am"],
  ["projects", "things I've built  (open <n> to view one)"],
  ["skills", "tools I use"],
  ["experience", "where I've worked and studied"],
  ["github", "live GitHub stats"],
  ["contact", "ways to reach me"],
  ["resume", "open my résumé"],
  ["coffee", "buy me a coffee ☕"],
  ["ls / cd <section>", "jump to a part of the page"],
  ["date", "time in Pune"],
  ["clear / exit", "clear screen / close"],
];

const COMMANDS = [
  ...HELP.flatMap(([c]) => c.split(" / ").map((x) => x.split(" ")[0])),
  "help",
  "open",
  "email",
  "echo",
  "sudo",
];

const distance = (a: string, b: string) => {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
};

const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
    {children}
  </a>
);

const Table = ({ rows }: { rows: [ReactNode, ReactNode][] }) => (
  <div className="term-table">
    {rows.map(([a, b], i) => (
      <div key={i}>
        <span className="term-key">{a}</span>
        <span>{b}</span>
      </div>
    ))}
  </div>
);

const puneTime = () =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

const BANNER = (
  <>
    <pre className="term-banner" aria-hidden="true">{`  __  __    _
 |  \\/  |  | |
 | \\  / |  | |
 | |\\/| |_ | |
 |_|  |_\\___/ .`}</pre>
    <p>
      Hi, I'm Miheer. Type <span className="term-cmd">help</span> to see what this terminal can do.
    </p>
  </>
);

const Terminal = () => {
  const [open, setOpen] = useState(true);
  const [lines, setLines] = useState<Line[]>([{ id: 0, out: BANNER }]);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const hIndex = useRef(-1);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  const print = useCallback((cmd: string | undefined, out?: ReactNode) => {
    setLines((l) => [...l, { id: nextId.current++, cmd, out }]);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim();
      if (input) {
        history.current = [input, ...history.current.filter((h) => h !== input)].slice(0, 30);
      }
      hIndex.current = -1;
      const [cmd = "", ...args] = input.split(/\s+/);
      const arg = args.join(" ");
      const c = cmd.toLowerCase();

      const go = (target: string) => {
        close();
        setTimeout(() => scrollToTarget(target === "top" ? 0 : `#${target}`), 250);
      };

      switch (c) {
        case "":
          return print("");
        case "help":
          return print(input, <Table rows={HELP.map(([a, b]) => [a, b])} />);
        case "whoami":
          return print(
            input,
            <>
              <p>
                <strong>Miheer Jangale</strong>, AI Engineer at Nutsovertech, Pune.
              </p>
              <p className="term-dim">
                I build LLM-powered products and agentic workflows, and ship Ruby on Rails, Java and React apps
                end to end. PG-DAC from CDAC ACTS with All India Rank 23.
              </p>
            </>
          );
        case "projects":
          return print(
            input,
            <>
              <Table
                rows={PROJECTS.map((p, i) => [
                  `${String(i + 1).padStart(2, "0")}  ${p.title}`,
                  <span className="term-dim">{p.kind}</span>,
                ])}
              />
              <p className="term-dim">
                Try <span className="term-cmd">open 1</span> or <span className="term-cmd">open uniyaar</span>.
              </p>
            </>
          );
        case "open": {
          const n = Number(arg);
          const p =
            Number.isInteger(n) && n >= 1 && n <= PROJECTS.length
              ? PROJECTS[n - 1]
              : PROJECTS.find((x) => x.title.toLowerCase().replace(/\s+/g, "").startsWith(arg.toLowerCase().replace(/\s+/g, "")));
          if (!arg || !p) return print(input, <p className="term-err">open: pick 1–{PROJECTS.length} or a project name</p>);
          window.open(p.link, "_blank", "noopener");
          return print(input, <p>Opening {p.title} on GitHub ↗</p>);
        }
        case "skills":
          return print(input, <Table rows={SKILLS} />);
        case "experience":
          return print(
            input,
            <Table rows={EXPERIENCE.map(([when, role, org]) => [when, <>{role} <span className="term-dim">· {org}</span></>])} />
          );
        case "github": {
          const id = nextId.current;
          print(input, <p className="term-dim">Fetching github.com/miheer2003…</p>);
          fetch("/api/github")
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d: GithubData) => {
              const active = d.weeks.flat().filter((x) => x.c > 0).length;
              setLines((l) =>
                l.map((x) =>
                  x.id === id
                    ? {
                        ...x,
                        out: (
                          <>
                            <Table
                              rows={[
                                ["contributions", `${d.total} in the last year`],
                                ["active days", String(active)],
                                ["latest push", d.repos[0] ? d.repos[0].name : "—"],
                              ]}
                            />
                            <p>
                              <Link href={GH}>github.com/miheer2003 ↗</Link>
                            </p>
                          </>
                        ),
                      }
                    : x
                )
              );
            })
            .catch(() =>
              setLines((l) =>
                l.map((x) => (x.id === id ? { ...x, out: <p className="term-err">github: couldn't reach GitHub. <Link href={GH}>Open profile ↗</Link></p> } : x))
              )
            );
          return;
        }
        case "contact":
          return print(
            input,
            <Table
              rows={[
                ["email", <Link href={`mailto:${EMAIL}`}>{EMAIL}</Link>],
                ["linkedin", <Link href={LINKEDIN}>linkedin.com/in/miheer-jangale ↗</Link>],
                ["github", <Link href={GH}>github.com/miheer2003 ↗</Link>],
              ]}
            />
          );
        case "email":
          window.location.href = `mailto:${EMAIL}`;
          return print(input, <p>Opening your mail app…</p>);
        case "resume":
          window.open(RESUME, "_blank", "noopener");
          return print(input, <p>Opening résumé ↗</p>);
        case "coffee":
          print(input, <p>Brewing… ☕</p>);
          close();
          setTimeout(openCoffee, 250);
          return;
        case "ls":
          return print(input, <p className="term-ls">{SECTIONS.map((s) => <span key={s}>{s}/</span>)}</p>);
        case "cd": {
          const t = arg.replace(/\/$/, "").toLowerCase();
          if (t === "" || t === "~" || t === "..") {
            go("top");
            return print(input);
          }
          if (!SECTIONS.includes(t)) return print(input, <p className="term-err">cd: no such section: {arg}. Try ls.</p>);
          go(t);
          return print(input);
        }
        case "date":
          return print(input, <p>{puneTime()} IST · Pune</p>);
        case "echo":
          return print(input, <p>{arg}</p>);
        case "sudo":
          if (/^hire(-|\s)?miheer$/i.test(arg)) {
            window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent("Let's work together")}`;
            return print(input, <p>Permission granted. Opening an email to Miheer…</p>);
          }
          return print(input, <p className="term-err">Nice try. Only <span className="term-cmd">sudo hire-miheer</span> is allowed here.</p>);
        case "clear":
          setLines([]);
          return;
        case "exit":
          close();
          return print(input);
        default: {
          const near = [...new Set(COMMANDS)]
            .map((x) => [x, distance(c, x)] as const)
            .sort((a, b) => a[1] - b[1])
            .find(([, d]) => d <= 2)?.[0];
          return print(
            input,
            <p className="term-err">
              command not found: {cmd}
              {near ? (
                <>
                  . Did you mean <span className="term-cmd">{near}</span>?
                </>
              ) : (
                ". Type help."
              )}
            </p>
          );
        }
      }
    },
    [close, print]
  );

  // Reopen on later events; lock page scroll while open; restore focus on close.
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(TERMINAL_EVENT, on);
    return () => window.removeEventListener(TERMINAL_EVENT, on);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement | null;
      lenis?.stop();
      // On phones, wait for a tap so the keyboard doesn't cover the output.
      if (finePointer()) requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    lenis?.start();
    returnFocus.current?.focus?.({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const b = bodyRef.current;
    if (b) b.scrollTop = b.scrollHeight;
  }, [lines]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      hIndex.current = Math.max(-1, Math.min(h.length - 1, hIndex.current + (e.key === "ArrowUp" ? 1 : -1)));
      setValue(hIndex.current === -1 ? "" : h[hIndex.current]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const [c, ...rest] = value.split(" ");
      if (rest.length && c === "cd") {
        const m = SECTIONS.find((s) => s.startsWith(rest.join(" ")));
        if (m) setValue(`cd ${m}`);
      } else if (!rest.length && c) {
        const m = [...new Set(COMMANDS)].filter((x) => x.startsWith(c));
        if (m.length === 1) setValue(`${m[0]} `);
        else if (m.length > 1) print(value, <p className="term-ls">{m.map((x) => <span key={x}>{x}</span>)}</p>);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const chip = (c: string) => {
    run(c);
    if (finePointer()) inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={`term-root ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <div className="term-backdrop" onClick={close} />
      <div
        className="term"
        role="dialog"
        aria-modal="true"
        aria-label="Terminal"
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest("a,button") && !window.getSelection()?.toString()) {
            inputRef.current?.focus({ preventScroll: true });
          }
        }}
      >
        <div className="term-bar">
          <span className="term-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="term-title">miheer@portfolio — zsh</span>
          <button className="term-close" onClick={close} aria-label="Close terminal">
            esc
          </button>
        </div>

        <div className="term-body" ref={bodyRef} data-lenis-prevent>
          {lines.map((l) => (
            <div className="term-line" key={l.id}>
              {l.cmd !== undefined && (
                <p className="term-in">
                  <Prompt />
                  {l.cmd}
                </p>
              )}
              {l.out}
            </div>
          ))}
          <label className="term-in term-input">
            <Prompt />
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              enterKeyHint="go"
              aria-label="Terminal command"
              tabIndex={open ? 0 : -1}
            />
          </label>
        </div>

        <div className="term-chips">
          {["help", "whoami", "projects", "skills", "github", "contact"].map((c) => (
            <button key={c} onClick={() => chip(c)} tabIndex={open ? 0 : -1}>
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Prompt = () => (
  <span className="term-prompt" aria-hidden="true">
    <span className="term-user">miheer</span>
    <span className="term-at">@portfolio</span>
    <span className="term-path"> ~ </span>
    <span className="term-sign">❯</span>{" "}
  </span>
);

export default Terminal;
