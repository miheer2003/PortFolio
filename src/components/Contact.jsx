import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import styles from './Contact.module.css';

const Contact = () => {
    const [ref, isVisible] = useIntersectionObserver();

    return (
        <section id="contact" className={`section ${styles.contactSection}`}>
            <div ref={ref} className={`container ${isVisible ? 'visible' : ''} fade-in`}>
                <h2 className={styles.contactTitle}>Let's Connect.</h2>
                <p className={styles.heroDescription}>Open for collaborations and new opportunities.</p>
                <div className={styles.contactLinks}>
                    <a href="mailto:miheerjangale7@gmail.com" className={styles.contactItem}>
                        <span className={styles.icon}>✉️</span>
                        miheerjangale7@gmail.com
                    </a>
                    <a href="tel:+918177870012" className={styles.contactItem}>
                        <span className={styles.icon}>📱</span>
                        +91-8177870012
                    </a>
                    <a
                        href="https://www.linkedin.com/in/miheer-jangale/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.contactItem}
                    >
                        <span className={styles.icon}>💼</span>
                        LinkedIn
                    </a>
                </div>
            </div>
        </section>
    );
};

export default Contact;
