import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Droplets, Mountain, Thermometer, Zap, Target, TrendingDown, Waves, Wind } from 'lucide-react';
import { tajikistanGlaciers, Glacier, getGlacierById } from '@/data/glaciers';
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
  estimatedDamage: string;
  affectedPopulation: number;
}

interface SimulationPhase {
  id: string;
  name: string;
  description: string;
  progress: number;
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
  const [currentPhase, setCurrentPhase] = useState<SimulationPhase | null>(null);

  const stressTypes: { id: StressType; label: string; icon: typeof Zap; description: string }[] = [
    { id: 'rockfall', label: 'Обвал породы', icon: Mountain, description: 'Падение камней на ледник вызывает трещины и ускоряет таяние' },
    { id: 'seismic', label: 'Землетрясение', icon: Zap, description: 'Сейсмические волны создают трещины и нестабильность' },
    { id: 'warming', label: 'Потепление', icon: Thermometer, description: 'Повышение температуры ускоряет таяние поверхности' },
  ];

  const simulationPhases: SimulationPhase[] = useMemo(() => {
    const stressPhases = {
      rockfall: [
        { id: 'impact', name: 'Удар', description: 'Порода падает на ледник', progress: 15 },
        { id: 'cracks', name: 'Трещины', description: 'Образование трещин от удара', progress: 35 },
        { id: 'fragmentation', name: 'Дробление', description: 'Лёд дробится в зоне удара', progress: 55 },
        { id: 'melting', name: 'Таяние', description: 'Ускоренное таяние повреждённого льда', progress: 80 },
        { id: 'runoff', name: 'Сток', description: 'Талая вода стекает вниз', progress: 100 },
      ],
      seismic: [
        { id: 'waves', name: 'Волны', description: 'Сейсмические волны достигают ледника', progress: 10 },
        { id: 'vibration', name: 'Вибрация', description: 'Ледник вибрирует от толчков', progress: 30 },
        { id: 'crevasses', name: 'Разломы', description: 'Формирование глубоких трещин', progress: 50 },
        { id: 'calving', name: 'Откол', description: 'Откалывание ледяных глыб', progress: 75 },
        { id: 'collapse', name: 'Обрушение', description: 'Частичное обрушение структуры', progress: 100 },
      ],
      warming: [
        { id: 'heating', name: 'Нагрев', description: 'Температура поверхности растёт', progress: 20 },
        { id: 'surface', name: 'Поверхность', description: 'Таяние поверхностного слоя', progress: 40 },
        { id: 'moulins', name: 'Мулены', description: 'Вода проникает в трещины', progress: 60 },
        { id: 'basal', name: 'Основание', description: 'Подледниковое таяние', progress: 80 },
        { id: 'retreat', name: 'Отступление', description: 'Ледник отступает', progress: 100 },
      ],
    };
    return stressPhases[params.stressType];
  }, [params.stressType]);

  // Calculate vulnerable point based on glacier properties
  const calculateVulnerablePoint = (glacier: Glacier, stress: StressType): { x: number; y: number } => {
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
    setCurrentPhase(simulationPhases[0]);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 60);
  };

  // Update phase based on progress
  useEffect(() => {
    if (isSimulating && progress > 0) {
      const phase = simulationPhases.find(p => progress <= p.progress) || simulationPhases[simulationPhases.length - 1];
      if (phase.id !== currentPhase?.id) {
        setCurrentPhase(phase);
      }
    }
  }, [progress, isSimulating, simulationPhases, currentPhase]);

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
      
      // Calculate affected population based on glacier importance
      const populationFactor = glacier.area / 100 * 50000;
      
      setResult({
        vulnerablePoint: calculateVulnerablePoint(glacier, params.stressType),
        iceVolumeLoss: parseFloat(iceVolumeLoss.toFixed(2)),
        meltwaterVolume: parseFloat(meltwaterVolume.toFixed(2)),
        crackDepth: parseFloat(crackDepth.toFixed(0)),
        floodRisk: getRisk(intensityFactor * tempFactor),
        landslideRisk: getRisk(intensityFactor * (glacier.riskLevel === 'high' ? 1.5 : 1)),
        waterLossRisk: getRisk(iceVolumeLoss / glacier.volume),
        estimatedDamage: `${(iceVolumeLoss * 10).toFixed(0)} млн $`,
        affectedPopulation: Math.round(populationFactor * intensityFactor),
      });
      
      setIsSimulating(false);
    }
  }, [progress, params, isSimulating]);

  const resetSimulation = () => {
    setIsSimulating(false);
    setProgress(0);
    setResult(null);
    setCurrentPhase(null);
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

  const getStressIcon = () => {
    switch (params.stressType) {
      case 'rockfall': return Mountain;
      case 'seismic': return Waves;
      case 'warming': return Wind;
    }
  };

  const StressIcon = getStressIcon();

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

      {/* Simulation Phase Indicator */}
      {isSimulating && currentPhase && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-fade-in-up">
          <div className="glass-panel rounded-xl p-4 min-w-[300px] text-center glow-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <StressIcon className="w-6 h-6 text-warning animate-pulse" />
              <span className="font-display text-lg text-primary">{currentPhase.name}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{currentPhase.description}</p>
            <div className="flex gap-1">
              {simulationPhases.map((phase, i) => (
                <div
                  key={phase.id}
                  className={`
                    h-1 flex-1 rounded-full transition-all duration-300
                    ${progress >= phase.progress ? 'bg-primary' : 
                      phase.id === currentPhase.id ? 'bg-primary/50 animate-pulse' : 'bg-muted/50'}
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      )}

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
                  {glacier.nameRu} ({glacier.area} км²)
                </option>
              ))}
            </select>
          </div>

          {/* Selected Glacier Info */}
          {params.glacier && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg animate-fade-in-up">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Регион:</span>
                <span>{params.glacier.region}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Высота:</span>
                <span>{params.glacier.elevation.min}-{params.glacier.elevation.max} м</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Толщина:</span>
                <span>{params.glacier.thickness} м</span>
              </div>
            </div>
          )}

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
                    title={type.description}
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
            {params.stressType && (
              <p className="text-[10px] text-muted-foreground mt-2">
                {stressTypes.find(t => t.id === params.stressType)?.description}
              </p>
            )}
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
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Слабое</span>
              <span>Среднее</span>
              <span>Сильное</span>
            </div>
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
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>+1°C</span>
              <span>+5°C</span>
              <span>+10°C</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={!params.glacier || isSimulating}
              className={`
                flex-1 control-btn flex items-center justify-center gap-2 py-3
                ${!params.glacier || isSimulating 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-primary/20'
                }
              `}
            >
              {isSimulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span>{progress}%</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Запустить симуляцию</span>
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
        </div>
      </div>

      {/* Results Panel - Right */}
      {result && (
        <div className="absolute top-20 right-4 w-80 z-10 animate-slide-in-right">
          <div className="glass-panel rounded-xl p-4 glow-border">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-warning animate-pulse" />
              <h3 className="font-display text-sm font-bold tracking-wider">
                РЕЗУЛЬТАТЫ СИМУЛЯЦИИ
              </h3>
            </div>

            {/* Vulnerable Point */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-destructive" />
                <p className="text-xs text-destructive uppercase tracking-wider font-bold">
                  Уязвимая зона определена
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Система рассчитала точку максимального воздействия на основе геометрии ледника и типа стресса.
              </p>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingDown className="w-3 h-3" />
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

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mountain className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Глубина трещин</span>
                </div>
                <p className="font-display text-lg data-readout">
                  {result.crackDepth} м
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Ущерб</span>
                </div>
                <p className="font-display text-lg data-readout text-destructive">
                  {result.estimatedDamage}
                </p>
              </div>
            </div>

            {/* Affected Population */}
            <div className="bg-muted/30 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Затронуто населения:</span>
                <span className="font-display text-lg text-warning">
                  ~{result.affectedPopulation.toLocaleString()} чел.
                </span>
              </div>
            </div>

            {/* Risk Levels */}
            <div className="space-y-2">
              <h4 className="text-xs text-muted-foreground uppercase tracking-wider">
                Уровни риска
              </h4>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Waves className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Наводнение</span>
                </div>
                <span className={`font-display text-sm ${getRiskColor(result.floodRisk)}`}>
                  {getRiskLabel(result.floodRisk)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Оползни</span>
                </div>
                <span className={`font-display text-sm ${getRiskColor(result.landslideRisk)}`}>
                  {getRiskLabel(result.landslideRisk)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Потеря водных ресурсов</span>
                </div>
                <span className={`font-display text-sm ${getRiskColor(result.waterLossRisk)}`}>
                  {getRiskLabel(result.waterLossRisk)}
                </span>
              </div>
            </div>

            {/* Educational Note */}
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary">Научный факт:</strong> При повышении температуры на +{params.temperature}°C 
                скорость таяния увеличивается на {(params.temperature * 25).toFixed(0)}%. Это угрожает водоснабжению 
                всей Центральной Азии.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulatorMode;
