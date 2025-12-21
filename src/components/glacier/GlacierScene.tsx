import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, PerspectiveCamera } from '@react-three/drei';
import GlacierModel from './GlacierModel';
import MountainTerrain from './MountainTerrain';
import { getGlacierById } from '@/data/glaciers';

interface GlacierSceneProps {
  selectedGlacier?: string;
  isMelting?: boolean;
  meltProgress?: number;
  showEducational?: boolean;
  showHistorical?: boolean;
  historicalYear?: number;
}

const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.35} color="#a8d4ff" />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight
        position={[-8, 6, 6]}
        intensity={0.6}
        color="#00d4ff"
      />
      <pointLight
        position={[8, 4, -6]}
        intensity={0.4}
        color="#80e0ff"
      />
      <hemisphereLight
        args={['#87ceeb', '#2a3040', 0.4]}
      />
    </>
  );
};

const GlacierScene: React.FC<GlacierSceneProps> = ({
  selectedGlacier,
  isMelting = false,
  meltProgress = 0,
  showEducational = false,
  showHistorical = false,
  historicalYear = 2024,
}) => {
  // Get glacier data for terrain customization
  const glacierData = useMemo(() => {
    if (selectedGlacier) {
      return getGlacierById(selectedGlacier);
    }
    return undefined;
  }, [selectedGlacier]);

  // Calculate historical scale factor
  const historicalScale = useMemo(() => {
    if (!showHistorical) return 1;
    // Simulate glacier retreat over time (1990-2050)
    const baseYear = 1990;
    const yearDiff = historicalYear - baseYear;
    const retreatRate = 0.005; // 0.5% per year
    return Math.max(0.4, 1 - yearDiff * retreatRate);
  }, [showHistorical, historicalYear]);

  return (
    <Canvas 
      shadows 
      className="w-full h-full"
      gl={{ 
        antialias: true,
        powerPreference: 'default',
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={45} />
      
      <Suspense fallback={null}>
        <Lights />
        <Stars
          radius={80}
          depth={40}
          count={2000}
          factor={3}
          saturation={0}
          fade
          speed={0.3}
        />
        
        <MountainTerrain 
          glacierData={glacierData ? {
            elevation: glacierData.elevation,
            area: glacierData.area,
            id: glacierData.id,
          } : undefined}
          simplified={showEducational}
        />
        
        {/* Main glacier */}
        <GlacierModel
          position={[0, 0.8, 0]}
          scale={1.8 * historicalScale}
          glacierType="valley"
          isSelected={!!selectedGlacier}
          isMelting={isMelting}
          meltProgress={meltProgress}
          glacierData={glacierData ? {
            thickness: glacierData.thickness,
            area: glacierData.area,
            elevation: glacierData.elevation,
          } : undefined}
        />
        
        {/* Educational mode - show different glacier types */}
        {showEducational && (
          <>
            <GlacierModel
              position={[-5, 0.5, -3]}
              scale={0.7 * historicalScale}
              glacierType="mountain"
            />
            <GlacierModel
              position={[5, 0.6, -4]}
              scale={0.9 * historicalScale}
              glacierType="piedmont"
            />
          </>
        )}
        
        <Environment preset="night" />
        <fog attach="fog" args={['#0a0f1a', 20, 50]} />
      </Suspense>
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        minPolarAngle={0.3}
        maxPolarAngle={Math.PI / 2 - 0.1}
        autoRotate={!selectedGlacier && !isMelting}
        autoRotateSpeed={0.2}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </Canvas>
  );
};

export default GlacierScene;
