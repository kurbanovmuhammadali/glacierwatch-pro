import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Droplets, Mountain, Thermometer, Zap, Target } from 'lucide-react';
import { tajikistanGlaciers, Glacier } from '@/data/glaciers';
import GlacierScene from '@/components/glacier/GlacierScene';

type StressType = 'rockfall' | 'seismic' | 'warming';

interface SimulationParams {
  glacier: Glacier | null;
  stressType: StressType;
  intensity: number;
  temperature: number;
}

interface SimulationResult {
  vulnerablePoint: { x: number; y: number };
  iceVolumeLoss: number;
  meltwaterVolume: number;
  crackDepth: number;
  floodRisk: 'low' | 'medium' | 'high';
  landslideRisk: 'low' | 'medium' | 'high';
  waterLossRisk: 'low' | 'medium' | 'high';
}

const SimulatorMode: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    glacier: null,
    stressType: 'warming',
    intensity: 50,
    temperature: 5,
  });
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const stressTypes: { id: StressType; label: string; icon: typeof Zap }[] = [
    { id: 'rockfall', label: 'Обвал породы', icon: Mountain },
    { id: 'seismic', label: 'Сейсмический толчок', icon: Zap },
    { id: 'warming', label: 'Быстрое потепление', icon: Thermometer },
  ];

  // Calculate vulnerable point based on glacier properties
  const calculateVulnerablePoint = (glacier: Glacier, stress: StressType): { x: number; y: number } => {
    // Simplified vulnerability calculation
    const baseX = 0.3 + (glacier.meltRate / 20) * 0.4;
    const baseY = stress === 'warming' ? 0.8 : 0.5;
    
    return {
      x: Math.min(0.9, baseX + (glacier.thickness / 1000) * 0.2),
      y: baseY - (glacier.elevation.min / 10000),
    };
  };

  // Run simulation
  const runSimulation = () => {
    if (!params.glacier) return;
    
    setIsSimulating(true);
    setProgress(0);
    setResult(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  // Generate results when progress completes
  useEffect(() => {
    if (progress >= 100 && params.glacier && isSimulating) {
      const glacier = params.glacier;
      const intensityFactor = params.intensity / 100;
      const tempFactor = params.temperature / 10;
      
      const iceVolumeLoss = glacier.volume * intensityFactor * tempFactor * 0.1;
      const meltwaterVolume = iceVolumeLoss * 0.9;
      const crackDepth = glacier.thickness * intensityFactor * 0.3;
      
      const getRisk = (value: number): 'low' | 'medium' | 'high' => {
        if (value < 0.3) return 'low';
        if (value < 0.7) return 'medium';
        return 'high';
      };
      
      setResult({
        vulnerablePoint: calculateVulnerablePoint(glacier, params.stressType),
        iceVolumeLoss: parseFloat(iceVolumeLoss.toFixed(2)),
        meltwaterVolume: parseFloat(meltwaterVolume.toFixed(2)),
        crackDepth: parseFloat(crackDepth.toFixed(0)),
        floodRisk: getRisk(intensityFactor * tempFactor),
        landslideRisk: getRisk(intensityFactor * (glacier.riskLevel === 'high' ? 1.5 : 1)),
        waterLossRisk: getRisk(iceVolumeLoss / glacier.volume),
      });
      
      setIsSimulating(false);
    }
  }, [progress, params, isSimulating]);

  const resetSimulation = () => {
    setIsSimulating(false);
    setProgress(0);
    setResult(null);
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
    }
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 3D View with simulation */}
      <div className="absolute inset-0">
        <GlacierScene
          selectedGlacier={params.glacier?.id}
          isMelting={isSimulating || !!result}
          meltProgress={progress / 100}
        />
      </div>

      {/* Control Panel - Left */}
      <div className="absolute top-20 left-4 w-80 z-10">
        <div className="glass-panel rounded-xl p-4 glow-border">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary animate-pulse-glow" />
            <h2 className="font-display text-sm font-bold tracking-wider">
              СИМУЛЯТОР ТАЯНИЯ
            </h2>
          </div>

          {/* Glacier Selection */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Выберите ледник
            </label>
            <select
              value={params.glacier?.id || ''}
              onChange={(e) => {
                const glacier = tajikistanGlaciers.find(g => g.id === e.target.value);
                setParams(prev => ({ ...prev, glacier: glacier || null }));
                resetSimulation();
              }}
              className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Выберите —</option>
              {tajikistanGlaciers.map(glacier => (
                <option key={glacier.id} value={glacier.id}>
                  {glacier.nameRu}
                </option>
              ))}
            </select>
          </div>

          {/* Stress Type */}
          <div className="mb-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Тип воздействия
            </label>
            <div className="grid grid-cols-3 gap-2">
              {stressTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => setParams(prev => ({ ...prev, stressType: type.id }))}
                    className={`
                      p-2 rounded-lg text-center transition-all duration-300
                      ${params.stressType === type.id 
                        ? 'bg-primary/20 border border-primary text-primary' 
                        : 'bg-muted/30 border border-transparent hover:bg-muted/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[10px] block">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Интенсивность
              </label>
              <span className="font-display text-sm text-primary">{params.intensity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={params.intensity}
              onChange={(e) => setParams(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Temperature */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Повышение температуры
              </label>
              <span className="font-display text-sm text-warning">+{params.temperature}°C</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={params.temperature}
              onChange={(e) => setParams(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-warning"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={!params.glacier || isSimulating}
              className={`
                flex-1 control-btn flex items-center justify-center gap-2
                ${!params.glacier || isSimulating 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary/20'
                }
              `}
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>Симуляция...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Запустить</span>
                </>
              )}
            </button>
            <button
              onClick={resetSimulation}
              className="control-btn px-4 hover:bg-muted/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          {isSimulating && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Анализ данных...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Panel - Right */}
      {result && (
        <div className="absolute top-20 right-4 w-80 z-10 animate-slide-in-right">
          <div className="glass-panel rounded-xl p-4 glow-border">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-display text-sm font-bold tracking-wider">
                РЕЗУЛЬТАТЫ СИМУЛЯЦИИ
              </h3>
            </div>

            {/* Vulnerable Point */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <p className="text-xs text-destructive uppercase tracking-wider mb-1">
                Уязвимая точка
              </p>
              <p className="text-sm">
                Система определила наиболее уязвимую зону ледника на основе геометрии и условий.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Droplets className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Потеря льда</span>
                </div>
                <p className="font-display text-lg data-readout text-warning">
                  {result.iceVolumeLoss} км³
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Droplets className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Талая вода</span>
                </div>
                <p className="font-display text-lg data-readout text-glacier-melt">
                  {result.meltwaterVolume} км³
                </p>
              </div>

              <div className="stat-card col-span-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mountain className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Глубина трещин</span>
                </div>
                <p className="font-display text-lg data-readout">
                  {result.crackDepth} м
                </p>
              </div>
            </div>

            {/* Risk Levels */}
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                Уровни риска
              </h4>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-sm">Наводнение</span>
                <span className={`font-display text-sm ${getRiskColor(result.floodRisk)}`}>
                  {getRiskLabel(result.floodRisk)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-sm">Оползни</span>
                <span className={`font-display text-sm ${getRiskColor(result.landslideRisk)}`}>
                  {getRiskLabel(result.landslideRisk)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-sm">Потеря водных ресурсов</span>
                <span className={`font-display text-sm ${getRiskColor(result.waterLossRisk)}`}>
                  {getRiskLabel(result.waterLossRisk)}
                </span>
              </div>
            </div>

            {/* Educational Note */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary">Важно:</strong> Таяние ледников Таджикистана угрожает 
                водоснабжению всей Центральной Азии. Каждый градус потепления ускоряет этот процесс.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatorMode;
