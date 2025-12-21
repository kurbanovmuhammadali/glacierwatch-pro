import React, { useMemo } from 'react';
import * as THREE from 'three';

interface MountainTerrainProps {
  glacierData?: {
    elevation: { min: number; max: number };
    area: number;
    id: string;
  };
  simplified?: boolean;
}

const MountainTerrain: React.FC<MountainTerrainProps> = ({ glacierData, simplified = false }) => {
  // Generate terrain geometry
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const size = 40;
    const segments = simplified ? 32 : 48;
    
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    
    // Create more realistic mountain terrain
    const seed = glacierData?.id ? glacierData.id.charCodeAt(0) : 42;
    const seededRandom = (x: number, z: number) => {
      const n = Math.sin(x * 12.9898 + z * 78.233 + seed) * 43758.5453;
      return n - Math.floor(n);
    };
    
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const x = (i / segments - 0.5) * size;
        const z = (j / segments - 0.5) * size;
        
        // Base height based on distance from center
        const distFromCenter = Math.sqrt(x * x + z * z);
        
        // Create realistic mountain shapes
        let height = 0;
        
        // Main mountain range
        const mountainNoise1 = Math.sin(x * 0.3) * Math.cos(z * 0.2) * 2;
        const mountainNoise2 = Math.sin(x * 0.15 + 1) * Math.sin(z * 0.25) * 3;
        const mountainNoise3 = seededRandom(x * 0.5, z * 0.5) * 0.8;
        
        height += mountainNoise1 + mountainNoise2 + mountainNoise3;
        
        // Add peaks
        const peak1Dist = Math.sqrt((x + 8) ** 2 + (z + 10) ** 2);
        const peak2Dist = Math.sqrt((x - 10) ** 2 + (z + 8) ** 2);
        const peak3Dist = Math.sqrt((x - 5) ** 2 + (z - 12) ** 2);
        const peak4Dist = Math.sqrt((x + 12) ** 2 + (z - 6) ** 2);
        
        height += Math.max(0, 5 - peak1Dist * 0.5);
        height += Math.max(0, 6 - peak2Dist * 0.4);
        height += Math.max(0, 4.5 - peak3Dist * 0.45);
        height += Math.max(0, 3.5 - peak4Dist * 0.5);
        
        // Valley for glacier
        const valleyDist = Math.sqrt(x * x * 0.5 + z * z);
        if (valleyDist < 6) {
          height *= 0.3 + valleyDist * 0.12;
        }
        
        // Flatten far edges
        if (distFromCenter > size * 0.4) {
          const edge = (distFromCenter - size * 0.4) / (size * 0.1);
          height *= Math.max(0, 1 - edge);
        }
        
        // Scale height based on glacier elevation data
        if (glacierData) {
          const elevationScale = (glacierData.elevation.max - glacierData.elevation.min) / 3000;
          height *= 0.8 + elevationScale * 0.5;
        }
        
        vertices.push(x, Math.max(-2, height), z);
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
  }, [glacierData, simplified]);

  // Rock material
  const rockMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2a3040),
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });
  }, []);

  // Snow cap material
  const snowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe8f0f8),
      roughness: 0.7,
      metalness: 0.05,
    });
  }, []);

  return (
    <group position={[0, -2.5, 0]}>
      {/* Main terrain */}
      <mesh
        geometry={terrainGeometry}
        material={rockMaterial}
        receiveShadow
      />
      
      {/* Snow-capped peaks */}
      {!simplified && (
        <>
          <mesh position={[-8, 3.5, -10]}>
            <coneGeometry args={[1.2, 2, 6]} />
            <primitive object={snowMaterial} />
          </mesh>
          <mesh position={[10, 4.2, -8]}>
            <coneGeometry args={[1.5, 2.5, 6]} />
            <primitive object={snowMaterial} />
          </mesh>
          <mesh position={[-5, 2.8, -12]}>
            <coneGeometry args={[1, 1.8, 6]} />
            <primitive object={snowMaterial} />
          </mesh>
          <mesh position={[12, 2.2, -6]}>
            <coneGeometry args={[0.8, 1.5, 6]} />
            <primitive object={snowMaterial} />
          </mesh>
        </>
      )}
    </group>
  );
};

export default MountainTerrain;
