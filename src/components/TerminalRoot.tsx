import { lazy, Suspense, useEffect, useState } from "react";
import { openTerminal, TERMINAL_EVENT } from "./utils/terminal";

const Terminal = lazy(() => import("./Terminal"));

const typing = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/** Loads the terminal only when first opened; ` or ~ opens it from anywhere. */
const TerminalRoot = () => {
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "`" || e.key === "~") && !e.metaKey && !e.ctrlKey && !e.altKey && !typing(e.target)) {
        e.preventDefault();
        openTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (requested) return;
    const on = () => setRequested(true);
    window.addEventListener(TERMINAL_EVENT, on, { once: true });
    return () => window.removeEventListener(TERMINAL_EVENT, on);
  }, [requested]);

  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <Terminal />
    </Suspense>
  );
};

export default TerminalRoot;
