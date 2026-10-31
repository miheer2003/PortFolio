import "./styles/Coffee.css";
import { openCoffee } from "./utils/coffee";

/** Cup with rising steam. The cup shakes every few seconds, and continuously on hover. */
export const CoffeeCup = ({ className = "" }: { className?: string }) => (
  <svg className={`cup ${className}`} viewBox="0 0 32 32" aria-hidden="true">
    <g className="cup-steam">
      <path d="M11 9c-1.6-1.6 1.6-3.2 0-4.8" />
      <path d="M15.5 9c-1.6-1.6 1.6-3.2 0-4.8" />
      <path d="M20 9c-1.6-1.6 1.6-3.2 0-4.8" />
    </g>
    <g className="cup-body">
      <path className="cup-fill" d="M6.5 12h18v6.5a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7V12Z" />
      <path className="cup-coffee" d="M7.6 13.4h15.8" />
      <path className="cup-handle" d="M24.5 14h1.6a3 3 0 0 1 0 6h-2" />
      <path className="cup-saucer" d="M4 28h23" />
    </g>
  </svg>
);

const CoffeeButton = ({ compact = false, className = "" }: { compact?: boolean; className?: string }) => (
  <button
    type="button"
    className={`btn coffee-btn ${compact ? "is-compact" : ""} ${className}`}
    onClick={openCoffee}
    aria-haspopup="dialog"
    aria-label="Buy me a coffee"
  >
    <CoffeeCup />
    {!compact && <span>Buy me a coffee</span>}
  </button>
);

export default CoffeeButton;
