import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const Work = () => {
  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>01</h3>
                <div>
                  <h4>OptiRoute</h4>
                  <p>Full-Stack Platform</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Java, Spring Boot, React.js, MySQL, Docker, JWT</p>
            </div>
            <WorkImage image="/images/optiroute.jpg" alt="OptiRoute" link="https://github.com/miheer2003/OptiRoute" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>02</h3>
                <div>
                  <h4>Sign Language Recognition</h4>
                  <p>AI / Deep Learning</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Python, TensorFlow, Keras, OpenCV, CNN, pyttsx3</p>
            </div>
            <WorkImage image="/images/sign-language.jpg" alt="Sign Language Recognition" link="https://github.com/miheer2003/Sign-Language-Recognition-Using-ML" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>03</h3>
                <div>
                  <h4>Software Dev Optimization</h4>
                  <p>Machine Learning</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Python, Scikit-learn, Decision Tree, Random Forest</p>
            </div>
            <WorkImage image="/images/devoptimizer.jpg" alt="Software Dev Optimization" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>04</h3>
                <div>
                  <h4>Virtual Calculator</h4>
                  <p>Computer Vision / AI</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Python, OpenCV, MediaPipe, Hand Tracking</p>
            </div>
            <WorkImage image="/images/virtual-calculator.jpg" alt="Virtual Calculator" link="https://github.com/miheer2003/Virtual-Calculator" />
          </div>
          <div className="work-box">
            <div className="work-info">
              <div className="work-title">
                <h3>05</h3>
                <div>
                  <h4>Bazaar Aaina</h4>
                  <p>Full-Stack Project</p>
                </div>
              </div>
              <h4>Tools and features</h4>
              <p>Next.js, Node.js, Express, Machine Learning</p>
            </div>
            <WorkImage image="/images/bazaar-aaina.jpg" alt="Bazaar Aaina" link="https://github.com/miheer2003/Bazaar-Aaina" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
