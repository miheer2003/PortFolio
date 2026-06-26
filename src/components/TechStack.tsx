import * as THREE from "three";
import { useRef, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Line, Html } from "@react-three/drei";

const techData = [
  { name: "Java", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
  { name: "Spring Boot", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg" },
  { name: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
  { name: "TensorFlow", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" },
  { name: "AWS", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
  { name: "Git", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
  { name: "C++", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" },
  { name: "React.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
  { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
  { name: "MySQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
  { name: "JavaScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
];

function OrbitRing({ radius }: { radius: number }) {
  // Create a stable circle line for the orbit path
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  return (
    <Line points={points} color="#C9A96E" lineWidth={1.5} transparent opacity={0.3} />
  );
}

function Planet({ data, index, total, radius }: { data: { name: string, url: string }; index: number; total: number; radius: number }) {
  const angle = (index / total) * Math.PI * 2;
  
  // Base stable position on the orbit ring
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  
  const [hovered, setHovered] = useState(false);

  return (
    <group position={[x, 0, z]}>
      {/* Html transform sprite creates a flawless 2D DOM element that perfectly faces the camera without WebGL lighting/texture washouts */}
      <Html transform sprite zIndexRange={[100, 0]}>
        <div 
          onPointerEnter={() => setHovered(true)} 
          onPointerLeave={() => setHovered(false)}
          style={{ 
            position: "relative", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            cursor: "pointer"
          }}
        >
          <img 
            src={data.url} 
            alt={data.name} 
            style={{ 
              width: hovered ? "120px" : "100px", 
              height: hovered ? "120px" : "100px", 
              objectFit: "contain",
              filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.5))", // optional depth
              transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            }} 
          />
          
          {/* Tooltip */}
          <div style={{
            position: "absolute",
            top: "100%",
            marginTop: "15px",
            background: "rgba(30, 30, 30, 0.9)",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "20px",
            fontSize: "16px",
            fontWeight: "600",
            whiteSpace: "nowrap",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-10px)",
            transition: "all 0.3s ease",
            pointerEvents: "none",
            boxShadow: "0px 4px 12px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            {data.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

function SolarSystem() {
  const groupRef = useRef<THREE.Group>(null);

  const innerPlanets = techData.slice(0, 4);
  const outerPlanets = techData.slice(4, 12);

  return (
    <group ref={groupRef}>
      {/* Central Sun / Glowing Core */}
      <mesh>
        <sphereGeometry args={[4.5, 64, 64]} />
        <meshStandardMaterial 
          color="#C9A96E" 
          emissive="#C9A96E" 
          emissiveIntensity={1.5} 
          roughness={0.2} 
          metalness={0.8}
        />
        {/* Title embedded inside the central planet */}
        <Html transform sprite zIndexRange={[50, 0]}>
          <div style={{
            color: "#0F0F0F",
            fontSize: "36px",
            fontWeight: 800,
            textAlign: "center",
            textTransform: "uppercase",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "'Shrikhand', cursive",
            letterSpacing: "2px",
            lineHeight: "1.1",
            textShadow: "0px 2px 10px rgba(255, 255, 255, 0.3)"
          }}>
            <div>MY</div>
            <div>TECHSTACK</div>
          </div>
        </Html>
      </mesh>
      
      {/* Inner Orbit (Radius 9) */}
      <OrbitRing radius={9} />
      {innerPlanets.map((data, i) => (
        <Planet key={`inner-${i}`} data={data} index={i} total={innerPlanets.length} radius={9} />
      ))}

      {/* Outer Orbit (Radius 15) */}
      <OrbitRing radius={15} />
      {outerPlanets.map((data, i) => (
        <Planet key={`outer-${i}`} data={data} index={i} total={outerPlanets.length} radius={15} />
      ))}
    </group>
  );
}

const TechStack = () => {
  return (
    <div className="techstack">
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: true }}
        camera={{ position: [0, 16, 32], fov: 45, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.0)} // Lower exposure so the sun isn't overblown
        className="tech-canvas"
        style={{ marginTop: "50px", height: "calc(100vh - 50px)" }}
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="#ffffff"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} color="#C9A96E" />

        <SolarSystem />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          autoRotate
          autoRotateSpeed={1.0}
          // Lock the vertical rotation to keep the solar system highly stable and flat
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.2} 
        />

        <Environment
          files={`${import.meta.env.BASE_URL}models/char_enviorment.hdr`}
          environmentIntensity={0.3}
          environmentRotation={[0, 4, 2]}
        />
      </Canvas>
    </div>
  );
};

export default TechStack;
