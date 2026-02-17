import { useParallax } from '../hooks/useParallax';
import styles from './Hero.module.css';

const Hero = () => {
    const heroRef = useParallax(0.3);

    const handleButtonHover = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        e.currentTarget.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
    };

    const handleButtonLeave = (e) => {
        e.currentTarget.style.transform = '';
    };

    return (
        <header id="home" className={styles.hero} ref={heroRef}>
            <div className={styles.heroContent}>
                <div className={styles.profileImageContainer}>
                    <img src={`${import.meta.env.BASE_URL}images/profile.jpg`} alt="Miheer Jangale" className={styles.profileImage} />
                </div>
                <h1 className={styles.heroTitle}>Student. Developer. Creator.</h1>
                <p className={styles.heroDescription}>
                    Building the future with Machine Learning and Cloud Computing.
                </p>
                <div className={styles.heroButtons}>
                    <a
                        href="#work"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onMouseMove={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        View Work
                    </a>
                    <a
                        href="https://drive.google.com/file/d/1J5onnTgzav7WMxzd1yk-_s03xkKcrxdL/view?usp=drive_link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onMouseMove={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        View Resume
                    </a>
                    <a
                        href="#contact"
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onMouseMove={handleButtonHover}
                        onMouseLeave={handleButtonLeave}
                    >
                        Contact Me <span className={styles.arrow}>→</span>
                    </a>
                </div>
            </div>
        </header>
    );
};

export default Hero;
