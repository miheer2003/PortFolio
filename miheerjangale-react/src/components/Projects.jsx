import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import styles from './Projects.module.css';

const Projects = () => {
    const [ref1, isVisible1] = useIntersectionObserver();
    const [ref2, isVisible2] = useIntersectionObserver();

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
        e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
    };

    return (
        <section id="work" className="section">
            <div className="container">
                <h2 className="section-title">Projects</h2>
                <div className={styles.bentoGrid}>
                    <div
                        ref={ref1}
                        className={`${styles.bentoItem} ${styles.projectCard} ${isVisible1 ? 'visible' : ''} fade-in`}
                        onMouseMove={handleMouseMove}
                    >
                        <div className={styles.bentoContent}>
                            <h3>OptiRoute – Route Optimization System</h3>
                            <p>
                                Built a system to find shortest travel routes, reducing travel time by 25%.
                                Added route input and visualization features. Useful for logistics and delivery services.
                            </p>
                            <a
                                href="https://github.com/Miheer2003/OptiRoute"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.bentoLink}
                            >
                                View Project →
                            </a>
                        </div>
                        <img src={`${import.meta.env.BASE_URL}images/Picture1.jpg`} alt="OptiRoute Project" className={styles.bentoImage} />
                    </div>

                    <div
                        ref={ref2}
                        className={`${styles.bentoItem} ${styles.projectCard} ${isVisible2 ? 'visible' : ''} fade-in`}
                        onMouseMove={handleMouseMove}
                    >
                        <div className={styles.bentoContent}>
                            <h3>Sign Language Recognition</h3>
                            <p>
                                Developed an app to convert sign language to text and speech.
                                Trained model on 500+ gesture samples using ML and image processing.
                            </p>
                            <a
                                href="https://github.com/Miheer2003/Sign-Language-Recognition"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.bentoLink}
                            >
                                View Project →
                            </a>
                        </div>
                        <img src={`${import.meta.env.BASE_URL}images/Sign.jpeg`} alt="Sign Language Project" className={styles.bentoImage} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
