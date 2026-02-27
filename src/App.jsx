import { useState, useEffect } from "react";

import {
    Droplets,
    Wind,
    Cloud,
    CloudRain,
    CloudSnow,
    Gauge,
    Thermometer,
    Sunrise,
    Sunset,
    TrendingUp
} from "lucide-react";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

import WeatherAnimation from "./WeatherAnimation";

const API_BASE = "https://weathernow-api-crhf.onrender.com";
const API_BASE_LOCAL = "http://localhost:5268"; //para testes com o backend local

export default function App() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const precipitationData = weather
        ? [
            { name: '1h', value: weather.rain1h ?? 0 },
            { name: '3h', value: weather.rain3h ?? 0 },
            { name: 'Neve 1h', value: weather.snow1h ?? 0 },
            { name: 'Neve 3h', value: weather.snow3h ?? 0 },
        ]
        : [];

    // --- Geolocalização ---
    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLoading(true);
                try {
                    const response = await fetch(
                        `${API_BASE}/api/weather/coords?lat=${latitude}&lon=${longitude}`
                    );
                    if (!response.ok) throw new Error();
                    const data = await response.json();
                    setWeather(data);
                    setCity(data.city);
                } catch {
                    setError("Não foi possível obter clima da sua localização.");
                }
                setLoading(false);
            },
            (err) => {
                console.warn("Usuário negou geolocalização ou erro:", err);
            }
        );
    }, []);

    // Histórico
    function saveSearch(city) {
        let history = JSON.parse(localStorage.getItem("cityHistory") || "[]");
        history = [city, ...history.filter(c => c !== city)].slice(0, 10);
        localStorage.setItem("cityHistory", JSON.stringify(history));
    }

    function getHistory() {
        return JSON.parse(localStorage.getItem("cityHistory") || "[]");
    }

    // Fundo dinâmico inteligente
    function getBackgroundClass() {
        if (!weather) return "from-blue-500 to-cyan-400";

        const desc = weather.description.toLowerCase();
        if (desc.includes("chuva") || desc.includes("rain"))
            return "from-gray-700 to-blue-900";
        if (desc.includes("trovoadas") || desc.includes("thunderstorm"))
            return "from-purple-700 to-gray-900";
        if (desc.includes("nublado") || desc.includes("cloud"))
            return "from-gray-400 to-gray-600";
        if (desc.includes("céu limpo") || desc.includes("clear") || desc.includes("sol"))
            return "from-yellow-400 to-orange-500";

        return "from-blue-500 to-cyan-400";
    }

    // Busca clima atual
    async function getWeather(cityName) {
        const query = cityName || city;
        if (!query) return;

        setLoading(true);
        setError("");
        setWeather(null);
        setForecast([]);

        try {
            // Clima atual
            const resWeather = await fetch(`${API_BASE}/api/weather/${encodeURIComponent(query)}`);
            if (!resWeather.ok) throw new Error();
            const dataWeather = await resWeather.json();
            setWeather(dataWeather);

            // Previsão 5 dias
            const resForecast = await fetch(`${API_BASE}/api/weather/forecast/${encodeURIComponent(query)}`);
            if (resForecast.ok) {
                const dataForecast = await resForecast.json();
                setForecast(dataForecast.list);
            }

            saveSearch(query);
            setCity(query);
        } catch {
            setError("Cidade não encontrada.");
        }

        setLoading(false);
    }

    // Dados Forecast
    const forecastData = forecast.map(f => ({
        time: `${String(new Date(f.dt * 1000).getHours()).padStart(2, '0')}h`,
        temperature: f.temperature,
        humidity: f.humidity,
        wind: f.windSpeed,
        clouds: f.cloudiness,
        rain: f.rain3h || 0,
        icon: f.icon
    }));

    // Dados Mini-cards
    const weatherCards = weather
        ? [
            { label: "Umidade", value: `${weather.humidity}%`, icon: <Droplets size={22} /> },

            {
                label: "Vento",
                value: `${weather.windSpeed} m/s`,
                icon: <Wind size={22} />
            },

            {
                label: "Nuvens",
                value: `${weather.cloudiness}%`,
                icon: <Cloud size={22} />
            },

            weather.rain1h !== null && {
                label: "Chuva 1h",
                value: `${weather.rain1h} mm`,
                icon: <CloudRain size={22} />
            },

            weather.rain3h !== null && {
                label: "Chuva 3h",
                value: `${weather.rain3h} mm`,
                icon: <CloudRain size={22} />
            },

            weather.snow1h !== null && {
                label: "Neve 1h",
                value: `${weather.snow1h} mm`,
                icon: <CloudSnow size={22} />
            },

            weather.snow3h !== null && {
                label: "Neve 3h",
                value: `${weather.snow3h} mm`,
                icon: <CloudSnow size={22} />
            },

            {
                label: "Pressão",
                value: `${weather.pressure} hPa`,
                icon: <Gauge size={22} />
            },

            {
                label: "Sensação",
                value: `${weather.feelsLike?.toFixed(1)}°C`,
                icon: <Thermometer size={22} />
            },

            {
                label: "Min/Max",
                value: `${weather.tempMin?.toFixed(1)}° / ${weather.tempMax?.toFixed(1)}°`,
                icon: <TrendingUp size={22} />
            },

            {
                label: "Nascer do Sol",
                value: new Date(weather.sunrise * 1000).toLocaleTimeString(),
                icon: <Sunrise size={22} />
            },

            {
                label: "Pôr do Sol",
                value: new Date(weather.sunset * 1000).toLocaleTimeString(),
                icon: <Sunset size={22} />
            },
        ].filter(Boolean)
        : [];

    return (
        <div
            className={`relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-r ${getBackgroundClass()} transition-all duration-700 overflow-hidden pt-10`}
        >
            {/* Animação do clima */}
            <div className="absolute inset-0 z-0">
                <WeatherAnimation weather={weather} />
            </div>

            {/* Card principal */}
            <div className="relative z-10 
  bg-white/10 backdrop-blur-2xl 
  border border-white/20 
  p-6 rounded-3xl 
  shadow-[0_25px_60px_rgba(0,0,0,0.35)] 
  w-[92%] max-w-md text-white">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">
                        {weather?.city || "Buscar cidade"}
                    </h2>
                    <span className="opacity-60">⋯</span>
                </div>

                {/* Busca */}
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Digite a cidade"
                        className="flex-1 p-3 rounded-xl 
      bg-white/20 text-white 
      placeholder-white/70 
      border border-white/20 
      focus:outline-none focus:ring-2 focus:ring-white/40"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        onClick={() => getWeather()}
                        className="bg-white/20 hover:bg-white/30 px-4 rounded-xl transition"
                    >
                        Buscar
                    </button>
                </div>

                {/* Histórico */}
                {getHistory().length > 0 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                        {getHistory().map((c, idx) => (
                            <button
                                key={idx}
                                onClick={() => getWeather(c)}
                                className="px-3 py-1 text-sm 
          bg-white/15 hover:bg-white/25 
          border border-white/20 
          rounded-full whitespace-nowrap transition"
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}

                {weather && (
                    <>
                        {/* Temperatura Principal */}
                        <div className="flex flex-col items-center justify-center mt-4 text-center">
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                                alt={weather.description}
                                className="w-24 h-24 drop-shadow-xl"
                            />

                            <div className="text-6xl font-light leading-none">
                                {weather.temperature.toFixed(0)}°
                                <span className="text-2xl align-top">C</span>
                            </div>

                            <div className="text-sm opacity-80 mt-1 capitalize">
                                {weather.description}
                            </div>
                        </div>

                        {/* Forecast Horizontal (próximas horas) */}
                        {forecastData.length > 0 && (
                            <div className="mt-6">
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {forecastData.slice(0, 8).map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="min-w-[80px] 
                bg-white/15 
                border border-white/20 
                rounded-2xl 
                p-3 text-center 
                backdrop-blur-md"
                                        >
                                            <div className="text-xs mb-2 opacity-70">
                                                {item.time}
                                            </div>

                                            <div className="text-2xl mb-1">
                                                {item.icon ? (
                                                    <img
                                                        src={`https://openweathermap.org/img/wn/${item.icon}@2x.png`}
                                                        alt=""
                                                        className="w-8 h-8 mx-auto"
                                                    />
                                                ) : (
                                                    "☁️"
                                                )}
                                            </div>

                                            <div className="text-sm font-medium">
                                                {item.temperature.toFixed(0)}°
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mini-cards */}
            {weatherCards.length > 0 && (
                <div className="relative z-10 mt-6 w-[90%] max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-4">
                    {weatherCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center text-center hover:scale-105 transform transition duration-300"
                        >
                            <span className="text-2xl">{card.icon}</span>
                            <p className="font-semibold mt-1">{card.label}</p>
                            <p className="mt-1 text-gray-700">{card.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Precipitação */}
            {weather && (
                <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg mt-6 w-[90%] max-w-4xl">
                    <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                        <CloudRain size={18} />
                        Precipitação (mm)
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={precipitationData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                            <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Gráficos previsão 5 dias */}
            {forecastData.length > 0 && (
                <div className="relative z-10 mt-8 w-[90%] max-w-5xl space-y-6">
                    <h2 className="text-xl font-semibold text-center mb-2 text-white drop-shadow-lg">
                        Forecasting
                    </h2>

                    {/* Temperatura */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                            <Thermometer size={18} />
                            Temperatura (°C)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={forecastData}>
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="temperature" stroke="#f97316" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chuva */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                            <CloudRain size={18} />
                            Chuva (mm)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={forecastData}>
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Bar dataKey="rain" fill="#3b82f6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Vento */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                            <Wind size={18} />
                            Vento (m/s)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={forecastData}>
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="wind" stroke="#10b981" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Nuvens */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                            <Cloud size={18} />
                            Nuvens (%)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={forecastData}>
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="clouds" stroke="#6366f1" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Umidade */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="flex items-center gap-2 font-semibold mb-3 text-gray-700">
                            <Droplets size={18} />
                            Umidade (%)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={forecastData}>
                                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="text-center mt-12 py-6 text-xs text-gray-500 border-t border-gray-200">
                Desenvolvido por <span className="font-semibold">Elivelton Almeida</span> © {new Date().getFullYear()}
            </footer>
        </div>
    );
}