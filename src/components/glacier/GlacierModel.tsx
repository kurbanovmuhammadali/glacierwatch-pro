import React, { useRef, useMemo, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlacierModelProps {
  position?: [number, number, number];
  scale?: number;
  glacierType?: 'valley' | 'mountain' | 'piedmont';
  isSelected?: boolean;
  isMelting?: boolean;
  meltProgress?: number;
  glacierData?: {
    thickness: number;
    area: number;
    elevation: { min: number; max: number };
  };
}

const GlacierModel = forwardRef<THREE.Group, GlacierModelProps>(({
  position = [0, 0, 0],
  scale = 1,
  glacierType = 'valley',
  isSelected = false,
  isMelting = false,
  meltProgress = 0,
  glacierData,
}, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerGlowRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Create glacier geometry based on type and data
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    const segments = 24; // Reduced for better performance
    
    // Adjust shape based on glacier type
    let length = 3;
    let width = 1.5;
    let height = 0.8;
    
    if (glacierType === 'mountain') {
      length = 2;
      width = 1.8;
      height = 1.2;
    } else if (glacierType === 'piedmont') {
      length = 2.5;
      width = 2.5;
      height = 0.5;
    }
    
    // Scale based on glacier data
    if (glacierData) {
      const areaScale = Math.sqrt(glacierData.area) / 20;
      length *= Math.min(2, areaScale);
      width *= Math.min(2, areaScale);
      height *= (glacierData.thickness / 500);
    }
    
    // Generate glacier surface
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * length;
        const z = (j / segments - 0.5) * width;
        
        const distFromCenter = Math.sqrt(x * x * 0.3 + z * z);
        const baseHeight = height * (1 - distFromCenter * 0.4);
        
        // Add realistic features
        const ridge = Math.sin(i * 0.5) * 0.08 + Math.sin(j * 0.7) * 0.04;
        const crevasse = Math.sin(i * 3 + j * 2) > 0.8 ? 0.03 : 0;
        const noise = Math.sin(i * 2 + j * 3) * 0.025;
        
        const taper = Math.max(0, 1 - Math.abs(x) / (length * 0.5));
        const y = Math.max(0, baseHeight * taper + ridge + noise - crevasse);
        
        vertices.push(x, y, z);
        normals.push(0, 1, 0);
        uvs.push(i / segments, j / segments);
      }
    }
    
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
  }, [glacierType, glacierData]);

  // Ice material
  const iceMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color().setHSL(0.54, 0.75, 0.78),
      metalness: 0.05,
      roughness: 0.25,
      transmission: 0.35,
      thickness: 0.5,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
      envMapIntensity: 1.2,
      ior: 1.31,
      transparent: true,
      opacity: 0.97,
    });
  }, []);

  // Bright glow material for selection
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00ffff),
      transparent: true,
      opacity: 0.5,
      side: THREE.BackSide,
    });
  }, []);

  // Outer glow for extra visibility
  const outerGlowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x00aaff),
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
  }, []);

  // Melting particles
  const particleGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const velocities: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      positions.push(
        (Math.random() - 0.5) * 3,
        Math.random() * 0.5,
        (Math.random() - 0.5) * 2
      );
      velocities.push(
        (Math.random() - 0.5) * 0.02,
        -Math.random() * 0.05 - 0.02,
        (Math.random() - 0.5) * 0.02
      );
    }
    
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));
    
    return geo;
  }, []);

  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(0x88ddff),
      size: 0.05,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
  }, []);

  // Animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.015;
      
      // Selection glow pulsing
      if (glowRef.current && isSelected) {
        const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
      
      if (outerGlowRef.current && isSelected) {
        const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.15;
        (outerGlowRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
      }
      
      // Melting effect
      if (isMelting && iceMaterial) {
        const meltColor = new THREE.Color().setHSL(
          0.54 - meltProgress * 0.04,
          0.75 - meltProgress * 0.25,
          0.78 + meltProgress * 0.12
        );
        iceMaterial.color = meltColor;
        iceMaterial.opacity = 0.97 - meltProgress * 0.35;
        meshRef.current.scale.y = scale * (1 - meltProgress * 0.5);
        meshRef.current.scale.x = scale * (1 + meltProgress * 0.1);
        meshRef.current.scale.z = scale * (1 + meltProgress * 0.1);
      }
      
      // Animate particles during melting
      if (particlesRef.current && isMelting && meltProgress > 0) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const velocities = particlesRef.current.geometry.attributes.velocity.array as Float32Array;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i] * meltProgress;
          positions[i + 1] += velocities[i + 1] * meltProgress;
          positions[i + 2] += velocities[i + 2] * meltProgress;
          
          if (positions[i + 1] < -0.5) {
            positions[i + 1] = 0.5;
            positions[i] = (Math.random() - 0.5) * 3;
            positions[i + 2] = (Math.random() - 0.5) * 2;
          }
        }
        
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        (particlesRef.current.material as THREE.PointsMaterial).opacity = meltProgress * 0.8;
      }
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Main glacier mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={iceMaterial}
        scale={scale}
        castShadow
        receiveShadow
      />
      
      {/* Selection glow - inner */}
      {isSelected && (
        <mesh
          ref={glowRef}
          geometry={geometry}
          material={glowMaterial}
          scale={scale * 1.08}
        />
      )}
      
      {/* Selection glow - outer */}
      {isSelected && (
        <mesh
          ref={outerGlowRef}
          geometry={geometry}
          material={outerGlowMaterial}
          scale={scale * 1.2}
        />
      )}
      
      {/* Ice layers */}
      <mesh position={[0, -0.08 * scale, 0]} scale={[scale * 0.95, scale * 0.25, scale * 0.95]}>
        <boxGeometry args={[2.8, 0.25, 1.3]} />
        <meshPhysicalMaterial
          color={new THREE.Color().setHSL(0.55, 0.65, 0.65)}
          transparent
          opacity={0.65}
          metalness={0}
          roughness={0.45}
        />
      </mesh>
      
      {/* Deep ice layer */}
      <mesh position={[0, -0.25 * scale, 0]} scale={[scale * 0.9, scale * 0.18, scale * 0.9]}>
        <boxGeometry args={[2.6, 0.18, 1.2]} />
        <meshPhysicalMaterial
          color={new THREE.Color().setHSL(0.56, 0.75, 0.5)}
          transparent
          opacity={0.85}
          metalness={0.05}
          roughness={0.35}
        />
      </mesh>
      
      {/* Melting particles */}
      {isMelting && (
        <points
          ref={particlesRef}
          geometry={particleGeometry}
          material={particleMaterial}
          scale={scale}
        />
      )}
    </group>
  );
});

GlacierModel.displayName = 'GlacierModel';

export default GlacierModel;
