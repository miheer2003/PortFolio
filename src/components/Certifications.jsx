import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import styles from './Certifications.module.css';

const Certifications = () => {
    const [ref, isVisible] = useIntersectionObserver();

    const certifications = [
        {
            url: 'https://www.credly.com/badges/24697ebb-af02-441b-a866-88e50380c385/linked_in_profile',
            icon: '☁️',
            title: 'AWS Cloud Foundations',
            provider: 'Amazon Web Services',
        },
        {
            url: 'https://www.credly.com/badges/4956f14e-8d7d-4ac7-b8c5-b962591e573b/linked_in?t=swihpo',
            icon: '⚙️',
            title: 'AWS DevOps Associate',
            provider: 'Amazon Web Services',
        },
        {
            url: 'https://www.udemy.com/certificate/UC-78d9ef21-728f-4d0f-84b6-03173ad04d83/',
            icon: '🤖',
            title: 'ML with Python',
            provider: 'Udemy',
        },
        {
            url: 'https://infyspringboard.onwingspan.com/web/en/app/toc/lex_auth_01275806667282022456_shared/overview',
            icon: '🗄️',
            title: 'Database Management',
            provider: 'Infosys',
        },
        {
            url: 'https://infyspringboard.onwingspan.com/web/en/app/toc/lex_18109698366332810000_shared/overview',
            icon: '⚡',
            title: 'Advanced JavaScript',
            provider: 'Infosys',
        },
        {
            url: 'https://www.udemy.com/certificate/UC-78d9ef21-728f-4d0f-84b6-03173ad04d83/',
            icon: '🌐',
            title: 'Web Dev Bootcamp',
            provider: 'Udemy',
        },
    ];

    return (
        <section id="certifications" className="section">
            <div className="container">
                <h2 className="section-title">Certifications</h2>
                <div className={styles.bentoGrid}>
                    <div
                        ref={ref}
                        className={`${styles.bentoItem} ${styles.certificationsCard} ${isVisible ? 'visible' : ''} fade-in`}
                    >
                        <div className={styles.bentoContent}>
                            <h3>Professional Certifications</h3>
                            <div className={styles.certGrid}>
                                {certifications.map((cert, index) => (
                                    <a
                                        key={index}
                                        href={cert.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.certItem}
                                    >
                                        <div className={styles.certIcon}>{cert.icon}</div>
                                        <h4>{cert.title}</h4>
                                        <p>{cert.provider}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Certifications;
