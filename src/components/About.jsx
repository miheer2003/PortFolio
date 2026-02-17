import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import styles from './About.module.css';

const About = () => {
    const [ref, isVisible] = useIntersectionObserver();

    return (
        <section id="about" className="section">
            <div className="container">
                <h2 className="section-title">About Me</h2>
                <div className={styles.bentoGrid}>
                    <div
                        ref={ref}
                        className={`${styles.bentoItem} ${styles.aboutCard} ${isVisible ? 'visible' : ''} fade-in`}
                    >
                        <div className={styles.bentoContent}>
                            <h3>Who I Am</h3>
                            <p>
                                Detail-oriented Full Stack Developer specializing in scalable Java backend systems and clean, modern frontends.
                                I leverage enterprise frameworks and industry best practices to build robust, maintainable applications that solve real-world problems.
                            </p>
                            <div className={styles.skillsGrid}>
                                <div className={styles.skillItem}>Java</div>
                                <div className={styles.skillItem}>Spring Boot</div>
                                <div className={styles.skillItem}>MySQL</div>
                                <div className={styles.skillItem}>DSA</div>
                                <div className={styles.skillItem}>Full Stack Development</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
