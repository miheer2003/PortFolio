import { useEffect, useRef } from 'react';

export const useParallax = (speed = 0.3) => {
    const elementRef = useRef(null);

    useEffect(() => {
        let ticking = false;
        let lastScrollY = 0;

        const updateParallax = () => {
            if (elementRef.current) {
                const translateY = lastScrollY * speed;
                elementRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
                elementRef.current.style.willChange = 'transform';
            }
            ticking = false;
        };

        const handleScroll = () => {
            lastScrollY = window.pageYOffset;
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return elementRef;
};
