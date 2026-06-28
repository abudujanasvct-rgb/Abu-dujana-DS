import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import './Background3D.css';

function WireGrid() {
  const meshRef = useRef();
  const materialRef = useRef();

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(30, 30, 40, 40);
    return geo;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave =
        Math.sin(x * 0.4 + t * 0.6) * 0.35 +
        Math.cos(y * 0.35 + t * 0.45) * 0.35;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -1.5, -2]}>
      <meshBasicMaterial
        ref={materialRef}
        color="#d98e48"
        wireframe
        transparent
        opacity={0.16}
      />
    </mesh>
  );
}

function FloatingNodes() {
  const groupRef = useRef();
  const count = 28;

  const nodes = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6 - 3
      ],
      speed: 0.15 + Math.random() * 0.25,
      offset: Math.random() * Math.PI * 2
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.children.forEach((mesh, i) => {
      const n = nodes[i];
      mesh.position.y = n.position[1] + Math.sin(t * n.speed + n.offset) * 0.4;
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh key={i} position={n.position}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshBasicMaterial color="#d98e48" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="bg3d-wrapper" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 55 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        dpr={[1, 1.5]}
      >
        <WireGrid />
        <FloatingNodes />
      </Canvas>
    </div>
  );
}
