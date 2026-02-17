document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const burger = document.querySelector('.burger');
    const navLinks = document.querySelector('.nav-links');

    if (burger && navLinks) {
        burger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Smooth parallax effect using requestAnimationFrame (GPU accelerated)
    const hero = document.querySelector('header');
    if (hero) {
        let ticking = false;
        let lastScrollY = 0;

        const updateParallax = () => {
            const scrolled = lastScrollY;
            const parallaxSpeed = 0.3; // Reduced for smoother effect
            const translateY = scrolled * parallaxSpeed;

            // Use transform3d for GPU acceleration
            hero.style.transform = `translate3d(0, ${translateY}px, 0)`;
            hero.style.willChange = 'transform';

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            lastScrollY = window.pageYOffset;

            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    // Add hover effect to bento items with mouse tracking
    const bentoItems = document.querySelectorAll('.bento-item');
    bentoItems.forEach(item => {
        item.addEventListener('mouseenter', function () {
            this.style.zIndex = '10';
        });

        item.addEventListener('mouseleave', function () {
            this.style.zIndex = '1';
        });

        // Mouse tracking glow effect
        item.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            this.style.setProperty('--mouse-x', `${x}%`);
            this.style.setProperty('--mouse-y', `${y}%`);
        });
    });

    // Add magnetic effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
        });

        button.addEventListener('mouseleave', function () {
            this.style.transform = '';
        });
    });

    // Add stagger animation to fade-in elements
    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
    });

    // Smooth cursor trail effect (subtle)
    let cursorTrail = [];
    const maxTrailLength = 10;

    document.addEventListener('mousemove', (e) => {
        cursorTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
        if (cursorTrail.length > maxTrailLength) {
            cursorTrail.shift();
        }
    });
});
