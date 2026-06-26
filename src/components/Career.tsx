import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Diploma in Computer Science</h4>
                <h5>Sandip Polytechnic, MSBTE</h5>
              </div>
              <h3>2019 – 2022</h3>
            </div>
            <p>
              Graduated with 80.11%. Relevant coursework in Programming in C,
              OOP (C++), Data Structures, Operating Systems, Computer Networks,
              and Web Development.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>B.Tech in Computer Engineering</h4>
                <h5>MIT ADT University</h5>
              </div>
              <h3>2022 – 2025</h3>
            </div>
            <p>
              First Class. Coursework in OOP, DSA, DBMS, Computer Networks,
              Software Engineering, Operating Systems, and Web Development.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Development Intern</h4>
                <h5>Xpedio Live, Pune</h5>
              </div>
              <h3>2025</h3>
            </div>
            <p>
              Built a full-stack Doctor Management Application using React.js
              and Spring Boot. Designed 10+ RESTful APIs with optimised MySQL
              queries, reducing data load time by 35%.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>PG-DAC in Advanced Computing</h4>
                <h5>CDAC ACTS, Pune</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Post Graduate Diploma in Advanced Computing (Aug 2025 – Jan 2026).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
