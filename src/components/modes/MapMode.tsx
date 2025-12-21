import React, { useState } from 'react';
import { MapPin, Mountain, Droplets, Thermometer, AlertTriangle, ChevronRight, X } from 'lucide-react';
import { tajikistanGlaciers, Glacier } from '@/data/glaciers';
import GlacierScene from '@/components/glacier/GlacierScene';

const MapMode: React.FC = () => {
  const [selectedGlacier, setSelectedGlacier] = useState<Glacier | null>(null);

  const getStatusColor = (status: Glacier['status']) => {
    switch (status) {
      case 'stable': return 'bg-success';
      case 'melting': return 'bg-warning';
      case 'critical': return 'bg-destructive';
    }
  };

  const getStatusLabel = (status: Glacier['status']) => {
    switch (status) {
      case 'stable': return 'Стабильный';
      case 'melting': return 'Тает';
      case 'critical': return 'Критический';
    }
  };

  const getRiskColor = (risk: Glacier['riskLevel']) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
    }
  };

  const getRiskLabel = (risk: Glacier['riskLevel']) => {
    switch (risk) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 3D Map View */}
      <div className="absolute inset-0">
        <GlacierScene 
          selectedGlacier={selectedGlacier?.id}
          showEducational={false}
        />
      </div>

      {/* Map Overlay - Tajikistan outline hint */}
      <div className="absolute top-20 left-4 right-4 md:right-auto md:w-80 z-10">
        <div className="glass-panel rounded-xl p-4 glow-border">
          <div className="flex items-center gap-2 mb-4">
            <Mountain className="w-5 h-5 text-primary" />
            <h2 className="font-display text-sm font-bold tracking-wider">
              ЛЕДНИКИ ТАДЖИКИСТАНА
            </h2>
          </div>
          
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
            {tajikistanGlaciers.map((glacier, index) => (
              <button
                key={glacier.id}
                onClick={() => setSelectedGlacier(glacier)}
                className={`
                  w-full text-left p-3 rounded-lg transition-all duration-300
                  animate-fade-in-up
                  ${selectedGlacier?.id === glacier.id 
                    ? 'bg-primary/20 border border-primary/50' 
                    : 'bg-muted/30 hover:bg-muted/50 border border-transparent'
                  }
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(glacier.status)} animate-pulse`} />
                    <span className="font-medium text-sm">{glacier.nameRu}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{glacier.area} км²</span>
                  <span>•</span>
                  <span>{glacier.region}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Glacier Info Panel */}
      {selectedGlacier && (
        <div className="absolute top-20 right-4 w-80 z-10 animate-slide-in-right">
          <div className="glass-panel rounded-xl p-4 glow-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-bold text-primary">
                {selectedGlacier.nameRu}
              </h3>
              <button
                onClick={() => setSelectedGlacier(null)}
                className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              {selectedGlacier.description}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Координаты</span>
                </div>
                <p className="font-display text-sm data-readout">
                  {selectedGlacier.coordinates.lat.toFixed(2)}°N, {selectedGlacier.coordinates.lng.toFixed(2)}°E
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Mountain className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Площадь</span>
                </div>
                <p className="font-display text-sm data-readout">
                  {selectedGlacier.area} км²
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Droplets className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Объём</span>
                </div>
                <p className="font-display text-sm data-readout">
                  {selectedGlacier.volume} км³
                </p>
              </div>

              <div className="stat-card">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Thermometer className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Температура</span>
                </div>
                <p className="font-display text-sm data-readout">
                  {selectedGlacier.temperature}°C
                </p>
              </div>
            </div>

            {/* Status and Risk */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedGlacier.status)}`} />
                <span className="text-sm">{getStatusLabel(selectedGlacier.status)}</span>
              </div>
              <div className={`flex items-center gap-2 ${getRiskColor(selectedGlacier.riskLevel)}`}>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Риск: {getRiskLabel(selectedGlacier.riskLevel)}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Высота:</span>
                <span className="font-display">{selectedGlacier.elevation.min} - {selectedGlacier.elevation.max} м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Толщина:</span>
                <span className="font-display">{selectedGlacier.thickness} м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Скорость таяния:</span>
                <span className="font-display text-warning">{selectedGlacier.meltRate} м/год</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-24 right-4 z-10">
        <div className="glass-panel rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Статус</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs">Стабильный</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs">Тает</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-xs">Критический</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapMode;
