import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, Html, Line, Text, Billboard } from "@react-three/drei";

const techData = [
  { name: "Java", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg" },
  { name: "Spring Boot", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg" },
  { name: "Python", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" },
  { name: "TensorFlow", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" },
  { name: "AWS", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" },
  { name: "Docker", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg" },
  { name: "Git", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" },
  { name: "C++", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg" },
  { name: "React", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" },
  { name: "Node.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" },
  { name: "MySQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg" },
  { name: "JavaScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" },
  { name: "TypeScript", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" },
  { name: "HTML5", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" },
  { name: "CSS3", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" },
  { name: "MongoDB", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" },
  { name: "Linux", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg" },
  { name: "PostgreSQL", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" },
  { name: "Figma", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg" },
  { name: "Redux", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redux/redux-original.svg" },
  { name: "Tailwind", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" },
  { name: "Vite", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vitejs/vitejs-original.svg" },
  { name: "Three.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg" },
  { name: "Next.js", url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" }
];

function OrbitRing({ radius }: { radius: number }) {
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

function IconNode({ data, position, delay, globeRef }: { data: { name: string, url: string }, position: THREE.Vector3, delay: number, globeRef: any }) {
  const ref = useRef<THREE.Group>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();
  const isMobile = size.width < 768;
  
  // Icon dimensions
  const baseSize = isMobile ? "90px" : "80px";
  const hoverSize = isMobile ? "110px" : "110px";
  
  const currentScale = useRef(1);

  useFrame((state, delta) => {
    if (divRef.current) {
      // Independent floating effect
      const floatY = Math.sin(state.clock.getElapsedTime() * 1.5 + delay) * 10;
      // Smooth scale interpolation on hover
      const targetScale = hovered ? 1.15 : 1;
      currentScale.current += (targetScale - currentScale.current) * delta * 12;
      
      divRef.current.style.transform = `translateY(${floatY}px) scale(${currentScale.current})`;
    }
  });

  return (
    <group ref={ref} position={position}>
      <Html transform sprite zIndexRange={[100, 0]} occlude={[globeRef]}>
        <div 
          ref={divRef}
          onPointerEnter={() => setHovered(true)} 
          onPointerLeave={() => setHovered(false)}
          style={{ 
            position: "relative", 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center",
            cursor: "pointer",
            // We removed transform from transition since useFrame handles it now
          }}
        >
          {/* Main Logo Image */}
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            padding: "15px",
            boxShadow: hovered ? "0 0 30px rgba(201, 169, 110, 0.5)" : "0 10px 30px rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "all 0.3s ease"
          }}>
            <img 
              src={data.url} 
              alt={data.name} 
              style={{ 
                width: hovered ? hoverSize : baseSize, 
                height: hovered ? hoverSize : baseSize, 
                objectFit: "contain",
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }} 
            />
          </div>
          
          {/* Tooltip Name underneath */}
          <div style={{
            position: "absolute",
            top: "100%",
            marginTop: "20px",
            background: hovered ? "#C9A96E" : "rgba(30, 30, 30, 0.9)",
            color: hovered ? "#0F0F0F" : "#ffffff",
            padding: "8px 20px",
            borderRadius: "30px",
            fontSize: "18px",
            fontWeight: "700",
            whiteSpace: "nowrap",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(-15px)",
            transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            pointerEvents: "none",
            boxShadow: hovered ? "0px 10px 20px rgba(201, 169, 110, 0.3)" : "0px 4px 12px rgba(0,0,0,0.5)",
            border: hovered ? "1px solid #C9A96E" : "1px solid rgba(255,255,255,0.1)",
            letterSpacing: "1px"
          }}>
            {data.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

function LogoSphere({ radius = 12 }) {
  const count = techData.length;
  const { size } = useThree();
  const isMobile = size.width < 768;

  // Create a spherical Fibonacci distribution
  const nodes = useMemo(() => {
    const temp: { position: THREE.Vector3, data: any, delay: number }[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y
      const theta = phi * i; // golden angle increment
      
      const pos = new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius,
        Math.sin(theta) * r * radius
      );
      
      temp.push({
        position: pos,
        data: techData[i],
        delay: Math.random() * Math.PI * 2 // random start phase for floating animation
      });
    }
    return temp;
  }, [count, radius]);

  const groupRef = useRef<THREE.Group>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  const textGlobeRef = useRef<THREE.Mesh>(null);

  // Rotate and breathe the entire network web
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation
      groupRef.current.rotation.y += delta * 0.15;
      groupRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
      groupRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.15) * 0.05;
      
      // Gentle breathing effect (scaling in and out)
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 1.5) * 0.02;
      groupRef.current.scale.set(scale, scale, scale);
    }
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.25;
      globeRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.05;
    }
  });

  return (
    <group>
      {/* Central Wireframe Core */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[radius * 0.35, 32, 32]} />
        <meshBasicMaterial 
          color="#FF8C00" 
          wireframe={true} 
          transparent={true} 
          opacity={0.4} 
        />
      </mesh>

      {/* Title embedded inside the central planet but living in true 3D space */}
      <Billboard>
        <Text
          fontSize={isMobile ? 1.2 : 1.8}
          color="#FFFFFF"
          textAlign="center"
          lineHeight={1}
          letterSpacing={0.1}
          outlineWidth={0.03}
          outlineColor="#FF8C00"
          outlineOpacity={0.8}
        >
          MY{"\n"}TECHSTACK
        </Text>
      </Billboard>

      {/* Rotating Network Web */}
      <group ref={groupRef}>
        {nodes.map((node, index) => (
          <group key={`node-group-${index}`}>
            {/* Line coming from the center globe */}
            <Line 
              points={[[0, 0, 0], [node.position.x, node.position.y, node.position.z]]} 
              color="#FF8C00" 
              lineWidth={1} 
              transparent 
              opacity={0.08} 
            />
            <IconNode 
              position={node.position} 
              data={node.data} 
              delay={node.delay}
              globeRef={globeRef}
            />
          </group>
        ))}
      </group>
    </group>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    const isMobile = size.width < 768;
    if (isMobile) {
      camera.position.set(0, 0, 48); // Moved back for mobile
      (camera as THREE.PerspectiveCamera).fov = 60;
    } else {
      camera.position.set(0, 0, 36);
      (camera as THREE.PerspectiveCamera).fov = 45;
    }
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

const TechStack = () => {
  return (
    <div className="techstack">
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: true }}
        camera={{ position: [0, 0, 36], fov: 45, near: 1, far: 100 }}
        className="tech-canvas"
        style={{ marginTop: "50px", height: "calc(100vh - 50px)", overflow: "visible" }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[0, 5, -4]} intensity={2} color="#C9A96E" />
        
        <ResponsiveCamera />
        
        {/* Render the logo sphere */}
        <LogoSphere radius={14} />

        {/* Orbit controls allow the user to drag and rotate the sphere themselves */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
};

export default TechStack;
