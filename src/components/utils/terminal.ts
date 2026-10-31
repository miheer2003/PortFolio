export const TERMINAL_EVENT = "terminal:open";
export const openTerminal = () => window.dispatchEvent(new Event(TERMINAL_EVENT));
