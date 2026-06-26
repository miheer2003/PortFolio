import "./styles/Certifications.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const certificationsData = [
  {
    title: "PG-DAC",
    issuer: "CDAC ACTS, Pune",
    year: "2025",
    emoji: "💻",
    description: "Post Graduate Diploma in Advanced Computing, focusing on full-stack development."
  },
  {
    title: "AWS Cloud Foundations",
    issuer: "Amazon Web Services",
    year: "2024",
    emoji: "☁️",
    description: "Foundational understanding of AWS Cloud concepts, security, and architecture."
  },
  {
    title: "AWS DevOps Associate",
    issuer: "Amazon Web Services",
    year: "2024",
    emoji: "⚙️",
    description: "Expertise in provisioning, operating, and managing distributed application systems on the AWS platform."
  },
  {
    title: "ML with Python",
    issuer: "Udemy",
    year: "2023",
    emoji: "🤖",
    description: "Comprehensive training on building and deploying machine learning models using Python."
  },
  {
    title: "Database Management",
    issuer: "Infosys",
    year: "2023",
    emoji: "🗄️",
    description: "In-depth understanding of database design, SQL querying, and relational database systems."
  },
  {
    title: "Advanced JavaScript",
    issuer: "Infosys",
    year: "2023",
    emoji: "⚡",
    description: "Mastery of advanced JS concepts, including closures, async programming, and ES6+ features."
  },
  {
    title: "Web Dev Bootcamp",
    issuer: "Udemy",
    year: "2022",
    emoji: "🌐",
    description: "Intensive training on modern web technologies including HTML, CSS, JavaScript, and backend frameworks."
  }
];

const Certifications = () => {
  useGSAP(() => {
    gsap.from(".cert-card", {
      scrollTrigger: {
        trigger: ".cert-section",
        start: "top 80%",
      },
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
    });
  }, []);

  return (
    <div className="cert-section" id="certifications">
      <div className="cert-container section-container">
        <h2>
          My <span>Certifications</span>
        </h2>
        
        <div className="cert-grid">
          {certificationsData.map((cert, index) => (
            <div 
              className="cert-card" 
              key={index}
            >
              <div className="cert-header">
                <span className="cert-emoji">{cert.emoji}</span>
                <span className="cert-year">{cert.year}</span>
              </div>
              <h3>{cert.title}</h3>
              <p className="cert-issuer">{cert.issuer}</p>
              <p>{cert.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Certifications;
