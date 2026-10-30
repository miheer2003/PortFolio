import { lazy, Suspense, useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./App.css";
import { LoadingProvider } from "./context/LoadingProvider";
import { prefersReducedMotion, setLenis } from "./components/utils/lenis";

const MainContainer = lazy(() => import("./components/MainContainer"));

gsap.registerPlugin(ScrollTrigger);

const App = () => {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      lerp: prefersReducedMotion() ? 1 : 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    lenis.stop(); // started by initialFX once the loader exits
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LoadingProvider>
      <Suspense>
        <MainContainer />
      </Suspense>
    </LoadingProvider>
  );
};

export default App;
