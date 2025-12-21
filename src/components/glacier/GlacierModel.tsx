import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlacierModelProps {
  position?: [number, number, number];
  scale?: number;
  glacierType?: 'valley' | 'mountain' | 'piedmont';
  isSelected?: boolean;
  isMelting?: boolean;
  meltProgress?: number;
}

const GlacierModel: React.FC<GlacierModelProps> = ({
  position = [0, 0, 0],
  scale = 1,
  glacierType = 'valley',
  isSelected = false,
  isMelting = false,
  meltProgress = 0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Create glacier geometry based on type
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Create a realistic glacier shape
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    const segments = 32;
    const length = 3;
    const width = 1.5;
    const height = 0.8;
    
    // Generate terrain-like glacier surface with ridges and crevasses
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * length;
        const z = (j / segments - 0.5) * width;
        
        // Create glacier surface with natural variation
        const distFromCenter = Math.sqrt(x * x * 0.3 + z * z);
        const baseHeight = height * (1 - distFromCenter * 0.4);
        
        // Add ridges and crevasses
        const ridge = Math.sin(i * 0.5) * 0.1 + Math.sin(j * 0.8) * 0.05;
        const crevasse = Math.random() * 0.02;
        const noise = Math.sin(i * 2 + j * 3) * 0.03;
        
        // Taper at the end (glacier tongue)
        const taper = Math.max(0, 1 - Math.abs(x) / (length * 0.5));
        
        const y = Math.max(0, baseHeight * taper + ridge + noise - crevasse);
        
        vertices.push(x, y, z);
        normals.push(0, 1, 0);
        uvs.push(i / segments, j / segments);
      }
    }
    
    // Create indices for triangles
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + 1;
        const c = a + segments + 1;
        const d = c + 1;
        
        indices.push(a, c, b);
        indices.push(b, c, d);
      }
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, [glacierType]);

  // Ice material with realistic appearance
  const iceMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(0.54, 0.7, 0.75),
      metalness: 0.1,
      roughness: 0.3,
      transmission: 0.3,
      thickness: 0.5,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1,
      ior: 1.31, // Ice refractive index
      transparent: true,
      opacity: 0.95,
    });
  }, []);

  // Glow material for selection
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.52, 1, 0.6),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide,
    });
  }, []);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // Glow pulsing when selected
      if (glowRef.current && isSelected) {
        const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
      
      // Melting effect
      if (isMelting && iceMaterial) {
        const meltColor = new THREE.Color().setHSL(
          0.54 - meltProgress * 0.02,
          0.7 - meltProgress * 0.2,
          0.75 + meltProgress * 0.1
        );
        iceMaterial.color = meltColor;
        iceMaterial.opacity = 0.95 - meltProgress * 0.3;
        meshRef.current.scale.y = scale * (1 - meltProgress * 0.4);
      }
    }
  });

  return (
    <group position={position}>
      {/* Main glacier mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={iceMaterial}
        scale={scale}
        castShadow
        receiveShadow
      />
      
      {/* Selection glow */}
      {isSelected && (
        <mesh
          ref={glowRef}
          geometry={geometry}
          material={glowMaterial}
          scale={scale * 1.05}
        />
      )}
      
      {/* Ice layers (internal structure visualization) */}
      <mesh position={[0, -0.1 * scale, 0]} scale={[scale * 0.95, scale * 0.3, scale * 0.95]}>
        <boxGeometry args={[2.8, 0.3, 1.3]} />
        <meshPhysicalMaterial
          color={new THREE.Color().setHSL(0.55, 0.6, 0.6)}
          transparent
          opacity={0.6}
          metalness={0}
          roughness={0.5}
        />
      </mesh>
      
      {/* Deep ice layer */}
      <mesh position={[0, -0.3 * scale, 0]} scale={[scale * 0.9, scale * 0.2, scale * 0.9]}>
        <boxGeometry args={[2.6, 0.2, 1.2]} />
        <meshPhysicalMaterial
          color={new THREE.Color().setHSL(0.56, 0.7, 0.45)}
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
};

export default GlacierModel;
