import { useState, useEffect } from "react";

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

    // Mini-cards
    const weatherCards = weather
        ? [
            { label: "Umidade", value: `${weather.humidity}%`, icon: "💧" },
            { label: "Vento", value: `${weather.windSpeed} m/s, ${weather.windDeg}°`, icon: "🌬" },
            { label: "Nuvens", value: `${weather.cloudiness}%`, icon: "☁" },
            weather.rain1h !== null && { label: "Chuva 1h", value: `${weather.rain1h} mm`, icon: "🌧" },
            weather.rain3h !== null && { label: "Chuva 3h", value: `${weather.rain3h} mm`, icon: "🌧" },
            weather.snow1h !== null && { label: "Neve 1h", value: `${weather.snow1h} mm`, icon: "❄" },
            weather.snow3h !== null && { label: "Neve 3h", value: `${weather.snow3h} mm`, icon: "❄" },
            { label: "Pressão", value: `${weather.pressure} hPa`, icon: "🔽" },
            { label: "Sensação", value: `${weather.feelsLike?.toFixed(1)}°C`, icon: "🌡" },
            { label: "Min/Max", value: `${weather.tempMin?.toFixed(1)}°C / ${weather.tempMax?.toFixed(1)}°C`, icon: "⛅" },
            { label: "Nascer do Sol", value: new Date(weather.sunrise * 1000).toLocaleTimeString(), icon: "🌅" },
            { label: "Pôr do Sol", value: new Date(weather.sunset * 1000).toLocaleTimeString(), icon: "🌇" },
        ].filter(Boolean)
        : [];

    // Dados para os Gráficos
    const forecastData = forecast.map(f => ({
        time: new Date(f.dt * 1000).toLocaleString(undefined, { hour: '2-digit', day: '2-digit' }),
        temperature: f.temperature,
        humidity: f.humidity,
        wind: f.windSpeed,
        clouds: f.cloudiness,
        rain: f.rain3h || 0
    }));

    return (
        <div
            className={`relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-r ${getBackgroundClass()} transition-all duration-700 overflow-hidden pt-10`}
        >
            {/* Animação do clima */}
            <div className="absolute inset-0 z-0">
                <WeatherAnimation weather={weather} />
            </div>

            {/* Card principal */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl w-[90%] max-w-md text-center transform transition duration-500 hover:scale-105">
                <h1 className="text-3xl font-bold mb-4 text-gray-800">🌦 WeatherNow</h1>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Digite a cidade"
                        className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        onClick={() => getWeather()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-xl transition duration-300"
                    >
                        Buscar
                    </button>
                </div>

                {getHistory().length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                        {getHistory().map((c, idx) => (
                            <button
                                key={idx}
                                className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 font-semibold"
                                onClick={() => getWeather(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center mt-4">
                        <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {error && <p className="text-red-500 mt-3">{error}</p>}

                {weather && (
                    <div className="mt-4 animate-fadeIn">
                        <h2 className="text-2xl font-semibold">{weather.city}</h2>
                        <div className="flex justify-center items-center gap-4 mt-2">
                            <img
                                src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                                alt={weather.description}
                                className="w-16 h-16"
                            />
                            <p className="text-5xl font-bold">{weather.temperature.toFixed(1)}°C</p>
                        </div>
                        <p className="mt-1 text-lg capitalize">{weather.description}</p>
                    </div>
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
                    <h3 className="font-semibold mb-2">🌧 Precipitação (mm)</h3>
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
                        Previsão 5 Dias
                    </h2>

                    {/* Temperatura */}
                    <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                        <h3 className="font-semibold mb-2">🌡 Temperatura (°C)</h3>
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
                        <h3 className="font-semibold mb-2">🌧 Chuva (mm)</h3>
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
                        <h3 className="font-semibold mb-2">🌬 Vento (m/s)</h3>
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
                        <h3 className="font-semibold mb-2">☁ Nuvens (%)</h3>
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
                        <h3 className="font-semibold mb-2">💧 Umidade (%)</h3>
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