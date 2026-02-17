import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import styles from './Experience.module.css';

const Experience = () => {
    const [ref, isVisible] = useIntersectionObserver();

    return (
        <section id="experience" className="section">
            <div className="container">
                <h2 className="section-title">Experience</h2>
                <div className={styles.experienceContainer}>
                    <div
                        ref={ref}
                        className={`${styles.experienceCard} ${isVisible ? 'visible' : ''} fade-in`}
                    >
                        <div className={styles.experienceHeader}>
                            <div>
                                <h3>Frontend Developer Intern</h3>
                                <h4 className={styles.company}>Xpedio Live</h4>
                            </div>
                            <span className={styles.year}>2025</span>
                        </div>
                        <ul className={styles.responsibilities}>
                            <li>Created UI screens for a web application using React</li>
                            <li>Made pages more responsive and user-friendly</li>
                            <li>Built reusable components for faster development</li>
                            <li>Worked with team members to complete tasks on time</li>
                            <li>Fixed UI bugs and improved performance</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Experience;
