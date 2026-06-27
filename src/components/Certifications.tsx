import "./styles/Certifications.css";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef, useEffect } from "react";

gsap.registerPlugin(useGSAP);

const certificationsData = [
  {
    title: "PG-DAC",
    issuer: "CDAC ACTS, Pune",
    year: "2025",
    image: "/images/certifications/pg-dac.png",
    description: "Post Graduate Diploma in Advanced Computing, focusing on full-stack development."
  },
  {
    title: "AWS Cloud Practitioner",
    issuer: "Amazon Web Services",
    year: "2024",
    image: "/images/certifications/aws-cloud-foundations.png",
    description: "Foundational understanding of AWS Cloud concepts, security, and architecture."
  },
  {
    title: "AWS Developer Associate",
    issuer: "Amazon Web Services",
    year: "2024",
    image: "/images/certifications/aws-developer.jpg",
    description: "Expertise in provisioning, operating, and managing distributed application systems on the AWS platform."
  },
  {
    title: "ML with Python",
    issuer: "Udemy",
    year: "2023",
    image: "/images/certifications/machine-learning.jpg",
    description: "Comprehensive training on building and deploying machine learning models using Python."
  },
  {
    title: "Database Management",
    issuer: "Infosys",
    year: "2023",
    image: "/images/certifications/database-management.jpg",
    description: "In-depth understanding of database design, SQL querying, and relational database systems."
  },
  {
    title: "Advanced JavaScript",
    issuer: "Infosys",
    year: "2023",
    image: "/images/certifications/javascript.jpg",
    description: "Mastery of advanced JS concepts, including closures, async programming, and ES6+ features."
  },
  {
    title: "Web Dev Bootcamp",
    issuer: "Udemy",
    year: "2022",
    image: "/images/certifications/web-dev.jpg",
    description: "Intensive training on modern web technologies including HTML, CSS, JavaScript, and backend frameworks."
  }
];

const Certifications = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-scroll animation for the cards
  useEffect(() => {
    const interval = setInterval(() => {
      if (gridRef.current) {
        const grid = gridRef.current;
        const card = grid.querySelector('.cert-card');
        if (card) {
          const cardWidth = card.clientWidth + 30; // Card width + gap
          const maxScroll = grid.scrollWidth - grid.clientWidth;
          
          // If we reach the end, scroll back to the start smoothly
          if (grid.scrollLeft >= maxScroll - 10) {
            grid.scrollLeft = 0;
          } else {
            grid.scrollLeft += cardWidth;
          }
        }
      }
    }, 3000); // Trigger every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
      </div>
        
      <div className="cert-grid" ref={gridRef}>
        {certificationsData.map((cert, index) => (
          <div 
            className="cert-card" 
            key={index}
          >
            {cert.image && (
              <div className="cert-image-wrapper">
                <img src={cert.image} alt={cert.title} />
              </div>
            )}
            <div className="cert-header">
              {cert.emoji ? (
                <span className="cert-emoji">{cert.emoji}</span>
              ) : (
                <div style={{ flex: 1 }}></div> /* Spacer if no emoji */
              )}
              <span className="cert-year">{cert.year}</span>
            </div>
            <h3>{cert.title}</h3>
            <p className="cert-issuer">{cert.issuer}</p>
            <p>{cert.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certifications;
