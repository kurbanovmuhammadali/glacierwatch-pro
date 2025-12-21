import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import StatsPanel from '@/components/layout/StatsPanel';
import MapMode from '@/components/modes/MapMode';
import EducationMode from '@/components/modes/EducationMode';
import SimulatorMode from '@/components/modes/SimulatorMode';

type AppMode = 'map' | 'education' | 'simulator';

const Index: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>('map');

  const renderMode = () => {
    switch (currentMode) {
      case 'map':
        return <MapMode />;
      case 'education':
        return <EducationMode />;
      case 'simulator':
        return <SimulatorMode />;
      default:
        return <MapMode />;
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-float animation-delay-200" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-glacier-melt/5 rounded-full blur-3xl animate-float animation-delay-400" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <Header currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Main Content */}
      <main className="pt-16 h-screen">
        {renderMode()}
      </main>

      {/* Stats Panel */}
      <StatsPanel />
    </div>
  );
};

export default Index;
