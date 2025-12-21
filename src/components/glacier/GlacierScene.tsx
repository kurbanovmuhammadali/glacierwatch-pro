import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import GlacierModel from './GlacierModel';

interface GlacierSceneProps {
  selectedGlacier?: string;
  isMelting?: boolean;
  meltProgress?: number;
  showEducational?: boolean;
}

const MountainTerrain: React.FC = () => {
  return (
    <group position={[0, -1, 0]}>
      {/* Base terrain */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a2e"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      {/* Mountain peaks */}
      {[
        { pos: [-5, 0, -8], scale: 3 },
        { pos: [6, 0, -10], scale: 4 },
        { pos: [-8, 0, -6], scale: 2.5 },
        { pos: [8, 0, -7], scale: 2 },
      ].map((mountain, i) => (
        <mesh 
          key={i} 
          position={mountain.pos as [number, number, number]}
          scale={mountain.scale}
        >
          <coneGeometry args={[1, 2, 6]} />
          <meshStandardMaterial
            color="#2a2a4a"
            roughness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
};

const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.3} color="#a0c4ff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={0.5}
        color="#00d4ff"
      />
      <pointLight
        position={[5, 3, -5]}
        intensity={0.3}
        color="#80e0ff"
      />
    </>
  );
};

const GlacierScene: React.FC<GlacierSceneProps> = ({
  selectedGlacier,
  isMelting = false,
  meltProgress = 0,
  showEducational = false,
}) => {
  return (
    <Canvas shadows className="w-full h-full">
      <PerspectiveCamera makeDefault position={[0, 3, 8]} fov={50} />
      
      <Suspense fallback={null}>
        <Lights />
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
          speed={0.5}
        />
        
        <MountainTerrain />
        
        {/* Main glacier */}
        <GlacierModel
          position={[0, 0.5, 0]}
          scale={1.5}
          glacierType="valley"
          isSelected={!!selectedGlacier}
          isMelting={isMelting}
          meltProgress={meltProgress}
        />
        
        {/* Additional smaller glaciers */}
        {showEducational && (
          <>
            <GlacierModel
              position={[-4, 0.3, -2]}
              scale={0.6}
              glacierType="mountain"
            />
            <GlacierModel
              position={[4, 0.4, -3]}
              scale={0.8}
              glacierType="piedmont"
            />
          </>
        )}
        
        <Environment preset="night" />
        <fog attach="fog" args={['#0a0f1a', 15, 40]} />
      </Suspense>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={20}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2 - 0.1}
        autoRotate={!selectedGlacier}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  );
};

export default GlacierScene;
