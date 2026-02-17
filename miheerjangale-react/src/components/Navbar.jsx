import { useState } from 'react';
import { useScrollEffect } from '../hooks/useScrollEffect';
import styles from './Navbar.module.css';

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isScrolled } = useScrollEffect();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleSmoothScroll = (e, targetId) => {
        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth',
            });
            closeMobileMenu();
        }
    };

    return (
        <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
            <div className={styles.navContainer}>
                <a href="#" className={styles.logo}>
                    Miheer Jangale
                </a>
                <ul className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
                    <li>
                        <a href="#about" onClick={(e) => handleSmoothScroll(e, '#about')}>
                            About
                        </a>
                    </li>
                    <li>
                        <a href="#experience" onClick={(e) => handleSmoothScroll(e, '#experience')}>
                            Experience
                        </a>
                    </li>
                    <li>
                        <a href="#work" onClick={(e) => handleSmoothScroll(e, '#work')}>
                            Work
                        </a>
                    </li>
                    <li>
                        <a href="#certifications" onClick={(e) => handleSmoothScroll(e, '#certifications')}>
                            Certifications
                        </a>
                    </li>
                    <li>
                        <a href="#contact" onClick={(e) => handleSmoothScroll(e, '#contact')}>
                            Contact
                        </a>
                    </li>
                    <li>
                        <a
                            href="https://drive.google.com/file/d/1J5onnTgzav7WMxzd1yk-_s03xkKcrxdL/view?usp=drive_link"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Resume
                        </a>
                    </li>
                </ul>
                <div className={styles.burger} onClick={toggleMobileMenu}>
                    ☰
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
