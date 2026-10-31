/**
 * Illustrated covers for projects that have no screenshots.
 * Pure SVG in the site palette; small CSS animations run only while the
 * cover is visible as the hover preview or on hover (see Work.css).
 */

const C = {
  latte: "#fff8e7",
  cream: "#e9d8bf",
  elev: "#f1e1c7",
  mocha: "#a47864",
  espresso: "#2a1a15",
  wine: "#5c1726",
};

type ArtProps = { id: string };

const Frame = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <svg className="art" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
    {children}
  </svg>
);

const Grid = ({ id, color, opacity = 0.08 }: { id: string; color: string; opacity?: number }) => (
  <>
    <defs>
      <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0V20" fill="none" stroke={color} strokeOpacity={opacity} />
      </pattern>
    </defs>
    <rect width="400" height="300" fill={`url(#${id}-grid)`} />
  </>
);

/* 01 PromptFlow: a prompt turns into Shortcut action blocks */
const PromptFlowArt = ({ id }: ArtProps) => (
  <Frame label="Prompt turning into Apple Shortcut blocks">
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.espresso} />
        <stop offset="1" stopColor={C.wine} />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill={`url(#${id}-bg)`} />
    <Grid id={id} color={C.latte} />
    {/* prompt bubble */}
    <g>
      <rect x="24" y="96" width="170" height="70" rx="18" fill={C.latte} />
      <path d="M48 166l-6 16 22-16z" fill={C.latte} />
      <text x="46" y="124" className="art-mono" fill={C.mocha} fontSize="9">PROMPT</text>
      <text x="46" y="146" fill={C.espresso} fontSize="14" fontWeight="500">Dim lights at 10 pm</text>
    </g>
    {/* sparkle */}
    <path className="art-spin" d="M214 131l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill={C.cream} />
    {/* blocks */}
    {[
      { y: 62, t: "When it's 10:00 PM", c: C.cream },
      { y: 112, t: "Set brightness 30%", c: C.mocha },
      { y: 162, t: "Turn on Focus", c: C.cream },
      { y: 212, t: "Play Lo-fi playlist", c: C.mocha },
    ].map((b, i) => (
      <g className="art-rise" style={{ animationDelay: `${i * 0.12}s` }} key={b.y}>
        <rect x="238" y={b.y} width="136" height="38" rx="10" fill={b.c} />
        <rect x="248" y={b.y + 11} width="16" height="16" rx="5" fill={C.espresso} fillOpacity="0.85" />
        <text x="272" y={b.y + 23.5} fill={C.espresso} fontSize="11" fontWeight="500">{b.t}</text>
      </g>
    ))}
    <path d="M374 100v12M374 150v12M374 200v12" stroke={C.cream} strokeOpacity="0.5" />
    <text x="28" y="270" className="art-mono" fill={C.cream} fillOpacity="0.7" fontSize="9">GEMINI · STRUCTURED OUTPUT → .SHORTCUT</text>
  </Frame>
);

/* 02 Job-hunt agent: funnel 2000 → 40 → 5 */
const JobHuntArt = ({ id }: ArtProps) => (
  <Frame label="Job funnel from 2000 postings to 5 in the inbox">
    <rect width="400" height="300" fill={C.elev} />
    <Grid id={id} color={C.espresso} opacity={0.06} />
    {[
      { y: 58, w: 330, n: "2000", t: "postings fetched", c: C.cream },
      { y: 128, w: 220, n: "40", t: "pass filters", c: C.mocha },
      { y: 198, w: 110, n: "5", t: "in your inbox", c: C.wine },
    ].map((r, i) => (
      <g key={r.n} className="art-grow" style={{ animationDelay: `${i * 0.15}s` }}>
        <rect x={(400 - r.w) / 2} y={r.y} width={r.w} height="52" rx="14" fill={r.c} />
        <text
          x={(400 - r.w) / 2 + 18}
          y={r.y + 35}
          fill={i === 2 ? C.latte : C.espresso}
          fontSize="26"
          fontWeight="500"
          letterSpacing="-1"
        >
          {r.n}
        </text>
        {i < 2 && (
          <text x={(400 + r.w) / 2 - 18} y={r.y + 31} textAnchor="end" className="art-mono" fill={C.espresso} fontSize="9">
            {r.t.toUpperCase()}
          </text>
        )}
      </g>
    ))}
    {/* envelope next to the last bar */}
    <g transform="translate(266 206)">
      <rect width="46" height="34" rx="6" fill={C.latte} stroke={C.espresso} strokeOpacity="0.2" />
      <path d="M4 6l19 14 19-14" fill="none" stroke={C.wine} strokeWidth="2" strokeLinecap="round" />
      <circle className="art-pulse" cx="44" cy="2" r="6" fill={C.wine} />
    </g>
    <text x="24" y="282" className="art-mono" fill={C.espresso} fillOpacity="0.55" fontSize="9">FETCH → FILTER → LLM SCORE → DRAFT</text>
  </Frame>
);

/* 03 AirLight: hand landmarks controlling a bulb */
const HAND: [number, number][] = [
  [120, 250],
  [95, 230], [78, 208], [66, 188], [58, 170],
  [105, 180], [100, 150], [97, 128], [95, 108],
  [122, 176], [122, 142], [122, 118], [122, 96],
  [138, 180], [142, 150], [144, 128], [146, 110],
  [152, 190], [162, 168], [168, 152], [173, 138],
];
const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [9, 10], [10, 11], [11, 12],
  [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
  [5, 9], [9, 13], [13, 17],
];
const AirLightArt = ({ id }: ArtProps) => (
  <Frame label="Hand tracking landmarks controlling a smart bulb">
    <defs>
      <radialGradient id={`${id}-glow`} cx="0.72" cy="0.36" r="0.5">
        <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.9" />
        <stop offset="0.35" stopColor={C.mocha} stopOpacity="0.35" />
        <stop offset="1" stopColor={C.espresso} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="400" height="300" fill={C.espresso} />
    <rect className="art-breathe" width="400" height="300" fill={`url(#${id}-glow)`} />
    {/* bulb */}
    <g transform="translate(288 108)">
      <circle r="30" fill="#ffe7bf" />
      <rect x="-12" y="28" width="24" height="16" rx="3" fill={C.cream} />
      <path d="M-10 33h20M-10 39h20" stroke={C.mocha} />
    </g>
    {/* targeting brackets */}
    <path d="M40 80v-14h14M200 80v-14h-14M40 268v14h14M200 268v14h-14" stroke={C.cream} strokeOpacity="0.6" fill="none" strokeWidth="1.5" />
    {BONES.map(([a, b]) => (
      <line key={`${a}-${b}`} x1={HAND[a][0]} y1={HAND[a][1]} x2={HAND[b][0]} y2={HAND[b][1]} stroke={C.cream} strokeOpacity="0.75" strokeWidth="1.6" />
    ))}
    {HAND.map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 4 : 3} fill={i % 4 === 0 ? "#ffd9a0" : C.latte} />
    ))}
    <text x="218" y="222" className="art-mono" fill={C.cream} fontSize="9">OPEN PALM → LIGHTS ON</text>
    <text x="218" y="238" className="art-mono" fill={C.cream} fillOpacity="0.6" fontSize="9">{"LATENCY < 400 MS · LOCAL"}</text>
  </Frame>
);

/* 04 UniYaar: campus map with a route */
const UniYaarArt = () => (
  <Frame label="Campus map with a walking route between pins">
    <rect width="400" height="300" fill={C.latte} />
    {/* blocks */}
    {[
      [20, 20, 110, 70], [150, 20, 90, 110], [260, 20, 120, 60],
      [20, 110, 110, 80], [260, 100, 120, 90], [20, 210, 160, 70], [200, 150, 40, 130], [260, 210, 120, 70],
    ].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx="10" fill={i % 3 === 0 ? C.elev : C.cream} />
    ))}
    {/* green */}
    <circle cx="75" cy="150" r="26" fill="#d9cfa8" />
    {/* route */}
    <path
      className="art-route"
      d="M70 60 C 140 60, 140 145, 200 145 S 250 240, 320 240"
      fill="none"
      stroke={C.wine}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="2 8"
    />
    {[
      [70, 60],
      [320, 240],
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <path d="M0 0c-10-12-14-18-14-24a14 14 0 0 1 28 0c0 6-4 12-14 24z" fill={i ? C.wine : C.espresso} transform="translate(0 -2)" />
        <circle cy="-26" r="5" fill={C.latte} />
      </g>
    ))}
    <g transform="translate(222 34)">
      <rect width="148" height="30" rx="15" fill={C.espresso} />
      <text x="16" y="19.5" className="art-mono" fill={C.latte} fontSize="9">LIBRARY → HOSTEL · 6 MIN</text>
    </g>
    <text x="24" y="292" className="art-mono" fill={C.espresso} fillOpacity="0.5" fontSize="9">UNIVERSITY → BUILDING → FLOOR → ROOM</text>
  </Frame>
);

/* 05 AsyncBatchPipeline: DAG with a running node */
const NODES: { x: number; y: number; s: "done" | "run" | "wait" | "fail"; l: string }[] = [
  { x: 60, y: 150, s: "done", l: "fetch" },
  { x: 160, y: 80, s: "done", l: "parse" },
  { x: 160, y: 220, s: "run", l: "enrich" },
  { x: 260, y: 80, s: "run", l: "store" },
  { x: 260, y: 220, s: "wait", l: "notify" },
  { x: 345, y: 150, s: "wait", l: "report" },
];
const EDGES = [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5], [1, 4]];
const PipelineArt = ({ id }: ArtProps) => (
  <Frame label="Task dependency graph with running and queued tasks">
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.mocha} />
        <stop offset="1" stopColor="#8a5f4d" />
      </linearGradient>
    </defs>
    <rect width="400" height="300" fill={`url(#${id}-bg)`} />
    <Grid id={id} color={C.latte} opacity={0.1} />
    {EDGES.map(([a, b]) => {
      const p = NODES[a];
      const q = NODES[b];
      const mx = (p.x + q.x) / 2;
      return (
        <path
          key={`${a}-${b}`}
          className={NODES[b].s === "run" ? "art-flow" : ""}
          d={`M${p.x} ${p.y} C ${mx} ${p.y}, ${mx} ${q.y}, ${q.x} ${q.y}`}
          fill="none"
          stroke={C.latte}
          strokeOpacity={NODES[b].s === "wait" ? 0.35 : 0.85}
          strokeWidth="2"
          strokeDasharray={NODES[b].s === "run" ? "6 6" : undefined}
        />
      );
    })}
    {NODES.map((n) => (
      <g key={n.l} transform={`translate(${n.x} ${n.y})`}>
        {n.s === "run" && <circle className="art-pulse" r="22" fill={C.latte} fillOpacity="0.25" />}
        <circle r="16" fill={n.s === "done" ? C.latte : n.s === "run" ? C.cream : C.mocha} stroke={C.latte} strokeWidth="2" />
        {n.s === "done" && <path d="M-6 0l4 4 8-8" stroke={C.wine} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        {n.s === "run" && <circle r="4" fill={C.wine} />}
        <text y="34" textAnchor="middle" className="art-mono" fill={C.latte} fontSize="9">{n.l.toUpperCase()}</text>
      </g>
    ))}
    <text x="24" y="282" className="art-mono" fill={C.latte} fillOpacity="0.75" fontSize="9">MAX CONCURRENCY 2 · RETRY W/ BACKOFF · ABORT</text>
  </Frame>
);

/* 06 Task Manager: kanban + API line */
const TaskArt = ({ id }: ArtProps) => (
  <Frame label="Kanban board with an API response">
    <rect width="400" height="300" fill={C.cream} />
    <Grid id={id} color={C.espresso} opacity={0.05} />
    {["TODO", "IN PROGRESS", "DONE"].map((h, ci) => (
      <g key={h} transform={`translate(${22 + ci * 124} 28)`}>
        <rect width="110" height="196" rx="14" fill={C.latte} fillOpacity="0.7" />
        <text x="12" y="22" className="art-mono" fill={C.espresso} fillOpacity="0.6" fontSize="8.5">{h}</text>
        {Array.from({ length: 3 - (ci === 2 ? 1 : 0) }, (_, i) => (
          <g key={i} transform={`translate(10 ${36 + i * 50})`}>
            <rect width="90" height="40" rx="8" fill={ci === 1 && i === 0 ? C.wine : C.elev} />
            <rect x="10" y="11" width={50 + ((i * 17 + ci * 11) % 28)} height="5" rx="2.5" fill={ci === 1 && i === 0 ? C.latte : C.mocha} fillOpacity="0.8" />
            <rect x="10" y="23" width="30" height="5" rx="2.5" fill={ci === 1 && i === 0 ? C.cream : C.mocha} fillOpacity="0.45" />
          </g>
        ))}
      </g>
    ))}
    <g transform="translate(22 238)">
      <rect width="356" height="40" rx="10" fill={C.espresso} />
      <text x="16" y="25" className="art-mono" fill={C.cream} fontSize="10">
        PATCH /api/tasks/42 <tspan fill="#b7d38a">200 OK</tspan>
        <tspan fill={C.cream} fillOpacity="0.6"> · 36 tests passing</tspan>
      </text>
      <rect className="art-caret" x="300" y="14" width="7" height="13" fill={C.cream} />
    </g>
  </Frame>
);

export type ArtKey = "promptflow" | "jobhunt" | "airlight" | "uniyaar" | "pipeline" | "tasks";

const ART: Record<ArtKey, (p: ArtProps) => JSX.Element> = {
  promptflow: PromptFlowArt,
  jobhunt: JobHuntArt,
  airlight: AirLightArt,
  uniyaar: UniYaarArt,
  pipeline: PipelineArt,
  tasks: TaskArt,
};

const ProjectArt = ({ art, id }: { art: ArtKey; id: string }) => {
  const Art = ART[art];
  return <Art id={id} />;
};

export default ProjectArt;
