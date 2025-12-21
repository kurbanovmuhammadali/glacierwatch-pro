import React, { useState } from 'react';
import { Layers, Snowflake, ThermometerSnowflake, Droplets, Info, RotateCcw } from 'lucide-react';
import GlacierScene from '@/components/glacier/GlacierScene';

interface GlacierLayer {
  id: string;
  name: string;
  depth: string;
  description: string;
  color: string;
}

const glacierLayers: GlacierLayer[] = [
  {
    id: 'snow',
    name: 'Снежный покров',
    depth: '0-5 м',
    description: 'Свежий снег, накапливающийся каждый год. Под давлением превращается в фирн.',
    color: 'bg-white',
  },
  {
    id: 'firn',
    name: 'Фирн',
    depth: '5-30 м',
    description: 'Промежуточная стадия между снегом и льдом. Гранулированная структура с воздушными карманами.',
    color: 'bg-glacier-ice',
  },
  {
    id: 'ice',
    name: 'Ледниковый лёд',
    depth: '30-200 м',
    description: 'Плотный голубой лёд, образовавшийся под давлением. Возраст может достигать тысяч лет.',
    color: 'bg-glacier-deep',
  },
  {
    id: 'basal',
    name: 'Базальный слой',
    depth: '200+ м',
    description: 'Самый старый и плотный лёд. Содержит информацию о древнем климате.',
    color: 'bg-blue-900',
  },
];

const glacierFeatures = [
  {
    icon: Snowflake,
    title: 'Что такое ледник?',
    content: 'Ледник — это огромная масса льда, образовавшаяся из накопленного снега за тысячи лет. Ледники движутся под действием собственной тяжести, формируя ландшафт.',
  },
  {
    icon: ThermometerSnowflake,
    title: 'Почему ледники тают?',
    content: 'Глобальное потепление ускоряет таяние ледников. Повышение температуры на 1°C может увеличить скорость таяния на 20-30%. Это угрожает водным ресурсам миллионов людей.',
  },
  {
    icon: Droplets,
    title: 'Значение для Таджикистана',
    content: 'Ледники Таджикистана — главный источник пресной воды для Центральной Азии. Они питают реки Амударья и Сырдарья, обеспечивая водой 60 миллионов человек.',
  },
];

const EducationMode: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full">
      {/* 3D Glacier View */}
      <div className="absolute inset-0">
        <GlacierScene showEducational={true} />
      </div>

      {/* Educational Panel - Left */}
      <div className="absolute top-20 left-4 w-80 z-10">
        <div className="glass-panel rounded-xl p-4 glow-border">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-primary animate-pulse-glow" />
            <h2 className="font-display text-sm font-bold tracking-wider">
              СТРУКТУРА ЛЕДНИКА
            </h2>
          </div>

          {/* Layer visualization */}
          <div className="relative mb-4 rounded-lg overflow-hidden">
            {glacierLayers.map((layer, index) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                className={`
                  w-full p-3 text-left transition-all duration-300
                  ${layer.color}
                  ${activeLayer === layer.id ? 'ring-2 ring-primary scale-[1.02]' : 'hover:brightness-110'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === glacierLayers.length - 1 ? 'rounded-b-lg' : ''}
                `}
                style={{
                  opacity: activeLayer && activeLayer !== layer.id ? 0.5 : 1,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs text-background font-bold drop-shadow-md">
                    {layer.name}
                  </span>
                  <span className="text-[10px] text-background/80 drop-shadow-md">
                    {layer.depth}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Active layer description */}
          {activeLayer && (
            <div className="animate-fade-in-up bg-muted/50 rounded-lg p-3">
              <p className="text-sm text-foreground">
                {glacierLayers.find(l => l.id === activeLayer)?.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Info Cards - Right */}
      <div className="absolute top-20 right-4 w-80 z-10 space-y-3">
        {glacierFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="glass-panel rounded-xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <button
                onClick={() => setShowInfo(showInfo === index ? null : index)}
                className="w-full p-4 text-left flex items-center gap-3 hover:bg-muted/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-display text-sm font-medium flex-1">
                  {feature.title}
                </span>
                <Info className={`w-4 h-4 text-muted-foreground transition-transform ${showInfo === index ? 'rotate-180' : ''}`} />
              </button>
              
              {showInfo === index && (
                <div className="px-4 pb-4 animate-fade-in-up">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.content}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Hint */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-primary animate-spin-slow" />
          <span className="text-xs text-muted-foreground">
            Вращайте модель мышью • Прокрутка для масштабирования
          </span>
        </div>
      </div>
    </div>
  );
};

export default EducationMode;
