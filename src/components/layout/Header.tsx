import React from 'react';
import { Mountain, Snowflake, Activity } from 'lucide-react';

interface HeaderProps {
  currentMode: 'map' | 'education' | 'simulator';
  onModeChange: (mode: 'map' | 'education' | 'simulator') => void;
}

const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'map' as const, label: 'Карта ледников', icon: Mountain },
    { id: 'education' as const, label: '3D Модели', icon: Snowflake },
    { id: 'simulator' as const, label: 'Симулятор', icon: Activity },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Snowflake className="w-8 h-8 text-primary animate-spin-slow" />
              <div className="absolute inset-0 blur-md bg-primary/30" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-wider text-foreground">
                ГЛЯЦИО<span className="text-primary">АНАЛИЗ</span>
              </h1>
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Таджикистан
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <nav className="flex items-center gap-1">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onModeChange(mode.id)}
                  className={`
                    mode-tab flex items-center gap-2 rounded-lg
                    ${isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                    transition-all duration-300
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse-glow' : ''}`} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-muted-foreground font-display tracking-wide">
                СИСТЕМА АКТИВНА
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated scan line */}
      <div className="scan-line opacity-30" />
    </header>
  );
};

export default Header;
