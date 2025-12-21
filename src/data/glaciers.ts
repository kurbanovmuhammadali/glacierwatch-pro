// Real glaciers in Tajikistan with approximate data
export interface Glacier {
  id: string;
  name: string;
  nameRu: string;
  coordinates: { lat: number; lng: number };
  area: number; // km²
  volume: number; // km³
  elevation: { min: number; max: number };
  status: 'stable' | 'melting' | 'critical';
  meltRate: number; // meters per year
  temperature: number; // °C
  thickness: number; // meters
  riskLevel: 'low' | 'medium' | 'high';
  region: string;
  description: string;
}

export const tajikistanGlaciers: Glacier[] = [
  {
    id: 'fedchenko',
    name: 'Fedchenko Glacier',
    nameRu: 'Ледник Федченко',
    coordinates: { lat: 38.85, lng: 72.25 },
    area: 700,
    volume: 144,
    elevation: { min: 2900, max: 6940 },
    status: 'melting',
    meltRate: 12.5,
    temperature: -8,
    thickness: 1000,
    riskLevel: 'medium',
    region: 'Памир',
    description: 'Крупнейший ледник Таджикистана и один из самых длинных ледников мира за пределами полярных регионов. Длина составляет 77 км.',
  },
  {
    id: 'grumm-grzhimailo',
    name: 'Grumm-Grzhimailo Glacier',
    nameRu: 'Ледник Грумм-Гржимайло',
    coordinates: { lat: 38.75, lng: 72.1 },
    area: 143,
    volume: 18,
    elevation: { min: 3400, max: 6595 },
    status: 'melting',
    meltRate: 8.3,
    temperature: -12,
    thickness: 350,
    riskLevel: 'medium',
    region: 'Памир',
    description: 'Второй по величине ледник Памира. Назван в честь русского исследователя Григория Грумм-Гржимайло.',
  },
  {
    id: 'garmo',
    name: 'Garmo Glacier',
    nameRu: 'Ледник Гармо',
    coordinates: { lat: 38.95, lng: 72.0 },
    area: 114,
    volume: 12,
    elevation: { min: 2800, max: 6595 },
    status: 'critical',
    meltRate: 15.2,
    temperature: -6,
    thickness: 280,
    riskLevel: 'high',
    region: 'Памир',
    description: 'Находится в критическом состоянии из-за глобального потепления. Активное таяние угрожает местным водным ресурсам.',
  },
  {
    id: 'zeravshan',
    name: 'Zeravshan Glacier',
    nameRu: 'Зеравшанский ледник',
    coordinates: { lat: 39.45, lng: 68.35 },
    area: 134,
    volume: 14,
    elevation: { min: 2700, max: 5489 },
    status: 'melting',
    meltRate: 11.0,
    temperature: -5,
    thickness: 220,
    riskLevel: 'high',
    region: 'Фанские горы',
    description: 'Главный источник реки Зеравшан. Питает ирригационные системы Самарканда и Бухары.',
  },
  {
    id: 'fortambek',
    name: 'Fortambek Glacier',
    nameRu: 'Ледник Фортамбек',
    coordinates: { lat: 38.92, lng: 72.08 },
    area: 45,
    volume: 5.5,
    elevation: { min: 3100, max: 6000 },
    status: 'stable',
    meltRate: 4.2,
    temperature: -14,
    thickness: 180,
    riskLevel: 'low',
    region: 'Памир',
    description: 'Относительно стабильный ледник благодаря высокой высоте и низким температурам.',
  },
  {
    id: 'bivachny',
    name: 'Bivachny Glacier',
    nameRu: 'Ледник Бивачный',
    coordinates: { lat: 38.88, lng: 72.15 },
    area: 57,
    volume: 7,
    elevation: { min: 3200, max: 5800 },
    status: 'melting',
    meltRate: 9.8,
    temperature: -10,
    thickness: 200,
    riskLevel: 'medium',
    region: 'Памир',
    description: 'Приток ледника Федченко. Важный индикатор климатических изменений в регионе.',
  },
  {
    id: 'skogach',
    name: 'Skogach Glacier',
    nameRu: 'Ледник Скогач',
    coordinates: { lat: 39.1, lng: 71.8 },
    area: 38,
    volume: 4,
    elevation: { min: 3400, max: 5200 },
    status: 'critical',
    meltRate: 18.5,
    temperature: -4,
    thickness: 150,
    riskLevel: 'high',
    region: 'Памир',
    description: 'Один из наиболее быстро тающих ледников региона. Высокий риск схода селей.',
  },
  {
    id: 'sugran',
    name: 'Sugran Glacier',
    nameRu: 'Ледник Сугран',
    coordinates: { lat: 38.8, lng: 72.3 },
    area: 62,
    volume: 8,
    elevation: { min: 3000, max: 5600 },
    status: 'melting',
    meltRate: 7.6,
    temperature: -11,
    thickness: 240,
    riskLevel: 'medium',
    region: 'Памир',
    description: 'Долинный ледник с развитой системой ледниковых озёр.',
  },
];

export const getGlacierById = (id: string): Glacier | undefined => {
  return tajikistanGlaciers.find(g => g.id === id);
};

export const getGlaciersByStatus = (status: Glacier['status']): Glacier[] => {
  return tajikistanGlaciers.filter(g => g.status === status);
};

export const getGlaciersByRisk = (risk: Glacier['riskLevel']): Glacier[] => {
  return tajikistanGlaciers.filter(g => g.riskLevel === risk);
};
