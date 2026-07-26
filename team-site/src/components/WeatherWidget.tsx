import { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Droplets, Sun, Wind } from 'lucide-react';


interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

interface WeatherResponse {
  task: string;
  provider: string;
  city: string;
  keyExposed: boolean;
  weather?: WeatherData;
  error?: string;
}

export function WeatherWidget() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather')
      .then((res) => res.json())
      .then((json: WeatherResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const getWeatherIcon = (iconCode?: string) => {
    if (!iconCode) return <Cloud size={32} />;
    if (iconCode.startsWith('01')) return <Sun size={32} className="text-amber" />;
    if (iconCode.startsWith('02') || iconCode.startsWith('03') || iconCode.startsWith('04')) return <CloudSun size={32} />;
    if (iconCode.startsWith('09') || iconCode.startsWith('10')) return <CloudRain size={32} />;
    return <Cloud size={32} />;
  };

  if (loading) {
    return (
      <aside className="panel weatherPanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Weather Conditions</p>
            <h2>Loading...</h2>
          </div>
        </div>
      </aside>
    );
  }

  if (!data || data.error || !data.weather) {
    return (
      <aside className="panel weatherPanel">
        <div className="panelHeader">
          <div>
            <p className="eyebrow">Weather Conditions</p>
            <h2>Unavailable</h2>
            {data?.error && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{data.error}</p>}
          </div>
        </div>
      </aside>
    );
  }

  const { weather, city } = data;

  return (
    <aside className="panel weatherPanel">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Weather Widget</p>
          <h2>{city}</h2>
        </div>
        <div className="weatherMainIcon">
          {getWeatherIcon(weather.icon)}
        </div>
      </div>

      <div className="weatherContent" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '32px', fontWeight: 'bold', letterSpacing: '-0.02em' }}>
            {Math.round(weather.temp)}°C
          </span>
          <span style={{ textTransform: 'capitalize', opacity: 0.7, fontSize: '14px' }}>
            {weather.description}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', opacity: 0.8, fontSize: '13px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Droplets size={16} />
            <span>Humidity: {weather.humidity}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wind size={16} />
            <span>Wind: {weather.windSpeed} m/s</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
