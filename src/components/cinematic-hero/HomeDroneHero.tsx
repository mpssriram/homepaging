import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import * as THREE from "three";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import "./HomeDroneHero.css";

type PointerTarget = {
  x: number;
  y: number;
};

type DroneSceneProps = {
  active: boolean;
  pointerTarget: MutableRefObject<PointerTarget>;
  reducedMotion: boolean;
};

const ARM_LENGTH = 1.6;
const ARM_POSITIONS = [
  [1, 1],
  [-1, 1],
  [-1, -1],
  [1, -1],
] as const;

function SceneCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

function Wireframe({
  geometry,
  material = "primary",
  opacity,
}: {
  geometry: THREE.BufferGeometry;
  material?: "primary" | "dim" | "accent";
  opacity?: number;
}) {
  const color =
    material === "accent" ? "#ff3b6b" : "#8beaff";
  const fallbackOpacity =
    material === "dim" ? 0.45 : material === "accent" ? 0.85 : 0.85;

  return (
    <lineSegments>
      <edgesGeometry args={[geometry, 1]} />
      <lineBasicMaterial
        color={color}
        opacity={opacity ?? fallbackOpacity}
        transparent
      />
    </lineSegments>
  );
}

function ArmAssembly({
  active,
  reducedMotion,
  sx,
  sz,
}: {
  active: boolean;
  reducedMotion: boolean;
  sx: number;
  sz: number;
}) {
  const armGeometry = useMemo(
    () => new THREE.BoxGeometry(0.08, 0.08, ARM_LENGTH),
    [],
  );
  const motorGeometry = useMemo(
    () => new THREE.CylinderGeometry(0.18, 0.18, 0.16, 8),
    [],
  );
  const propGeometry = useMemo(
    () => new THREE.TorusGeometry(0.55, 0.02, 4, 24),
    [],
  );
  const tipX = sx * ARM_LENGTH / Math.SQRT2;
  const tipZ = sz * ARM_LENGTH / Math.SQRT2;
  const armX = sx * ARM_LENGTH * 0.5 / Math.SQRT2;
  const armZ = sz * ARM_LENGTH * 0.5 / Math.SQRT2;
  const armRotationY = Math.atan2(sx, sz);

  return (
    <group>
      <group position={[armX, 0, armZ]} rotation={[0, armRotationY, 0]}>
        <Wireframe geometry={armGeometry} material="dim" />
      </group>
      <group position={[tipX, 0, tipZ]}>
        <Wireframe geometry={motorGeometry} />
      </group>
      <group position={[tipX, 0.1, tipZ]} rotation={[Math.PI / 2, 0, 0]}>
        <Wireframe geometry={propGeometry} />
      </group>
      <PropellerBlades
        active={active}
        position={[tipX, 0.13, tipZ]}
        reducedMotion={reducedMotion}
      />
    </group>
  );
}

function PropellerBlades({
  active,
  position,
  reducedMotion,
}: {
  active: boolean;
  position: [number, number, number];
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.LineSegments>(null);
  const geometry = useMemo(() => {
    const bladeVertices: number[] = [];

    for (let i = 0; i < 2; i += 1) {
      const angle = (i / 2) * Math.PI;

      bladeVertices.push(
        -Math.cos(angle) * 0.5,
        0,
        -Math.sin(angle) * 0.5,
        Math.cos(angle) * 0.5,
        0,
        Math.sin(angle) * 0.5,
      );
    }

    const bladeGeometry = new THREE.BufferGeometry();
    bladeGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(bladeVertices, 3),
    );

    return bladeGeometry;
  }, []);

  useFrame(() => {
    if (ref.current && active && !reducedMotion) {
      ref.current.rotation.y += 0.5;
    }
  });

  return (
    <lineSegments ref={ref} position={position}>
      <primitive attach="geometry" object={geometry} />
      <lineBasicMaterial color="#8beaff" opacity={0.45} transparent />
    </lineSegments>
  );
}

function Beacon({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.visible =
      reducedMotion || !active || Math.sin(clock.elapsedTime * 3) > -0.4;
  });

  return (
    <mesh ref={ref} position={[0, 1, 0]}>
      <sphereGeometry args={[0.045, 8, 6]} />
      <meshBasicMaterial color="#ff3b6b" />
    </mesh>
  );
}

function Drone({
  active,
  pointerTarget,
  reducedMotion,
}: DroneSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const smooth = useRef({ x: 0, y: 0 });
  const bodyGeometry = useMemo(
    () => new THREE.OctahedronGeometry(0.55, 0),
    [],
  );
  const antennaGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0.5, 0, 0, 1, 0], 3),
    );

    return geometry;
  }, []);
  const sensorGeometry = useMemo(
    () =>
      new THREE.SphereGeometry(
        0.18,
        8,
        6,
        0,
        Math.PI * 2,
        Math.PI / 2,
        Math.PI / 2,
      ),
    [],
  );
  const stabilizerGeometry = useMemo(
    () => new THREE.TorusGeometry(0.85, 0.012, 4, 36),
    [],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;

    if (!group) {
      return;
    }

    if (reducedMotion) {
      group.rotation.set(0.12, 0.4, 0);
      group.position.set(0.25, 0, 0);
      return;
    }

    if (!active) {
      return;
    }

    group.rotation.y += 0.0045;
    smooth.current.x += (pointerTarget.current.x - smooth.current.x) * 0.05;
    smooth.current.y += (pointerTarget.current.y - smooth.current.y) * 0.05;
    group.rotation.x = smooth.current.y * 0.18;
    group.position.x = 0.25 + smooth.current.x * 0.3;
    group.position.y =
      Math.sin(clock.elapsedTime * 0.6) * 0.12 + smooth.current.y * 0.12;
  });

  return (
    <group ref={groupRef} name="Drone" position={[0.25, 0, 0]} scale={1.95}>
      <Wireframe geometry={bodyGeometry} />
      <mesh>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial color="#ff3b6b" />
      </mesh>
      {ARM_POSITIONS.map(([sx, sz]) => (
        <ArmAssembly
          active={active}
          key={`${sx}-${sz}`}
          reducedMotion={reducedMotion}
          sx={sx}
          sz={sz}
        />
      ))}
      <lineSegments geometry={antennaGeometry}>
        <lineBasicMaterial color="#8beaff" opacity={0.45} transparent />
      </lineSegments>
      <Beacon active={active} reducedMotion={reducedMotion} />
      <group position={[0, -0.5, 0]}>
        <Wireframe geometry={sensorGeometry} material="dim" />
      </group>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <Wireframe geometry={stabilizerGeometry} material="dim" />
      </group>
    </group>
  );
}

function DroneScene({
  active,
  pointerTarget,
  reducedMotion,
}: DroneSceneProps) {
  const haloGeometry = useMemo(
    () => new THREE.TorusGeometry(4.25, 0.008, 4, 96),
    [],
  );

  return (
    <>
      <SceneCamera />
      <Drone
        active={active}
        pointerTarget={pointerTarget}
        reducedMotion={reducedMotion}
      />
      <group position={[0.25, -2.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <Wireframe geometry={haloGeometry} material="dim" opacity={0.28} />
      </group>
    </>
  );
}

function HimalayanRidge() {
  return (
    <div className="home-drone-hero__ridge" aria-hidden="true">
      <svg viewBox="0 0 1200 220" preserveAspectRatio="none">
        <path
          className="home-drone-hero__ridge-back"
          d="M0 180L60 150L120 165L200 120L260 140L340 100L420 135L500 115L580 150L660 118L740 142L820 108L920 130L1000 118L1080 150L1140 128L1200 150V220H0Z"
        />
        <path
          className="home-drone-hero__ridge-mid"
          d="M0 210L80 180L160 195L240 165L330 182L410 160L490 180L580 158L660 182L740 170L820 188L900 168L990 182L1080 160L1170 180L1200 170V220H0Z"
        />
        <path
          className="home-drone-hero__ridge-front"
          d="M0 218H1200V220H0Z"
        />
      </svg>
    </div>
  );
}

export function HomeDroneHero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const pointerTarget = useRef<PointerTarget>({ x: 0, y: 0 });
  const isInView = useInView(sectionRef, {
    margin: "320px 0px 320px 0px",
  });
  const isDroneActive = isInView && !reducedMotion;
  const [hasPreparedScene, setHasPreparedScene] = useState(false);
  const currentYear = new Date().getFullYear();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 45%"],
  });
  const sectionOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [1, 1] : [0.7, 1],
  );
  const sectionY = useTransform(
    scrollYProgress,
    [0, 1],
    reducedMotion ? [0, 0] : [40, 0],
  );
  const calloutOpacity = useTransform(scrollYProgress, [0.48, 0.66], [0, 1]);

  useEffect(() => {
    if (isInView) {
      setHasPreparedScene(true);
    }
  }, [isInView]);

  useEffect(() => {
    if (reducedMotion || !isDroneActive) {
      return;
    }

    const updatePointer = (event: PointerEvent) => {
      pointerTarget.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTarget.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => window.removeEventListener("pointermove", updatePointer);
  }, [isDroneActive, reducedMotion]);

  return (
    <motion.section
      aria-labelledby="home-drone-heading"
      className="home-drone-hero"
      ref={sectionRef}
      style={{ opacity: sectionOpacity, y: sectionY }}
    >
      <div className="home-drone-hero__ambient" aria-hidden="true" />
      <HimalayanRidge />
      <div className="home-drone-hero__inner">
        <div className="home-drone-hero__visual" aria-hidden="true">
          {hasPreparedScene ? (
            <Canvas
              aria-hidden="true"
              camera={{ position: [-2.5, 1.2, 10], fov: 28 }}
              dpr={[0.8, 1.15]}
              frameloop={isDroneActive ? "always" : "demand"}
              gl={{
                alpha: true,
                antialias: false,
                powerPreference: "high-performance",
              }}
              style={{ pointerEvents: "none" }}
            >
              <DroneScene
                active={isDroneActive}
                pointerTarget={pointerTarget}
                reducedMotion={reducedMotion}
              />
            </Canvas>
          ) : null}
          <motion.div
            className="home-drone-hero__unit-callout"
            style={{ opacity: calloutOpacity }}
          >
            <strong>DC-01</strong>
            <span>ACQUIRED / TRACKING</span>
          </motion.div>
          <div className="home-drone-hero__unit-callout home-drone-hero__unit-callout--secondary">
            <strong>UNIT / DRONE</strong>
            <span>Wireframe / Cyan</span>
          </div>
        </div>

        <div className="home-drone-hero__copy">
          <p className="home-drone-hero__eyebrow">
            <span />
            Student dev community / IIT Mandi / {currentYear}
          </p>
          <h1 className="home-drone-hero__title" id="home-drone-heading">
            <span>Build with</span>
            <span>the cell.</span>
          </h1>
          <p className="home-drone-hero__lede">
            A community of student builders at IIT Mandi who learn, ship, and
            help each other make real things.
          </p>
          <div className="home-drone-hero__actions">
            <a href="/community">Enter Community</a>
            <a href="/projects">See Projects</a>
          </div>
        </div>
      </div>
      <div className="home-drone-hero__status" aria-label="Dev Cell status">
        <span>
          <i className="home-drone-hero__dot" />
          <b>Open Lab</b> / Friday 18:00 / Lab Block
        </span>
        <span>
          <i className="home-drone-hero__dot home-drone-hero__dot--pink" />
          <b>Build Night</b> / Tue 19:00 / Dev Cell Room
        </span>
        <span>
          <b>Crew</b> / 14 Active
        </span>
        <span>
          <b>Builds</b> / 6 Live
        </span>
      </div>
    </motion.section>
  );
}

export default HomeDroneHero;
