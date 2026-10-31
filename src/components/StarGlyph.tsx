import "./styles/StarGlyph.css";

/** The site's glossy four-point star and its tilted ring. `id` keeps gradient ids unique per copy. */
const StarGlyph = ({ id, ring = true }: { id: string; ring?: boolean }) => (
  <>
    {ring && (
      <svg className="sg-ring" viewBox="0 0 100 100" aria-hidden="true">
        <ellipse cx="50" cy="50" rx="47" ry="17" />
      </svg>
    )}
    <svg className="sg-body" viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-fill`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.3" stopColor="#ecd2b2" />
          <stop offset="0.7" stopColor="#a47864" />
          <stop offset="1" stopColor="#5c1726" />
        </radialGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff8e7" />
          <stop offset="1" stopColor="#5c1726" />
        </linearGradient>
      </defs>
      <path
        d="M50 2 C54 34 66 46 98 50 C66 54 54 66 50 98 C46 66 34 54 2 50 C34 46 46 34 50 2Z"
        fill={`url(#${id}-fill)`}
        stroke={`url(#${id}-edge)`}
        strokeWidth="1.2"
      />
      <path d="M50 12 C52 34 58 42 70 46 C58 44 52 38 50 12Z" fill="#fff" opacity="0.7" />
    </svg>
  </>
);

export default StarGlyph;
