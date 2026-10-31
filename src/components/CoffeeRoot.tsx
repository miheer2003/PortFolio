import { lazy, Suspense, useEffect, useState } from "react";
import { COFFEE_EVENT } from "./utils/coffee";

const CoffeeModal = lazy(() => import("./CoffeeModal"));

/** Loads the modal (and the QR library) only after the first click. */
const CoffeeRoot = () => {
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    if (requested) return;
    const on = () => setRequested(true);
    window.addEventListener(COFFEE_EVENT, on, { once: true });
    return () => window.removeEventListener(COFFEE_EVENT, on);
  }, [requested]);
  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <CoffeeModal initialOpen />
    </Suspense>
  );
};

export default CoffeeRoot;
