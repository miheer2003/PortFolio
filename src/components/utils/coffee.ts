export const COFFEE_EVENT = "coffee:open";
export const openCoffee = () => window.dispatchEvent(new Event(COFFEE_EVENT));
