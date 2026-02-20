import { useState } from "react";
import WeatherAnimation from "./WeatherAnimation";

const API_BASE = "https://weathernow-api-crhf.onrender.com";

export default function App() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function getWeather() {
        if (!city) return;

        setLoading(true);
        setError("");
        setWeather(null);

        try {
            const response = await fetch(
                `${API_BASE}/api/weather/${encodeURIComponent(city)}`
            );

            if (!response.ok) throw new Error();

            const data = await response.json();
            setWeather(data);
        } catch {
            setError("Cidade não encontrada.");
        }

        setLoading(false);
    }

    // Fundo dinâmico inteligente
    function getBackgroundClass() {
        if (!weather) return "from-blue-500 to-cyan-400"; // fundo padrão inicial

        const desc = weather.description.toLowerCase();

        if (desc.includes("chuva") || desc.includes("rain")) return "from-gray-700 to-blue-900";
        if (desc.includes("nublado") || desc.includes("cloud")) return "from-gray-400 to-gray-600";
        if (desc.includes("céu limpo") || desc.includes("clear") || desc.includes("sol")) return "from-yellow-400 to-orange-500";

        return "from-blue-500 to-cyan-400";
    }

    return (
        <div
            className={`relative min-h-screen flex items-center justify-center bg-gradient-to-r ${getBackgroundClass()} transition-all duration-700 overflow-hidden`}
        >
            {/* Animação do clima sempre atrás do card */}
            <div className="absolute inset-0 z-0">
                <WeatherAnimation weather={weather} />
            </div>

            {/* Card branco */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-[90%] max-w-md text-center transform transition duration-500 hover:scale-105">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">🌦 WeatherNow</h1>
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Digite a cidade"
                        className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <button
                        onClick={getWeather}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 rounded-xl transition duration-300"
                    >
                        Buscar
                    </button>
                </div>

                {loading && (
                    <div className="flex justify-center mt-4">
                        <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {error && <p className="text-red-500 mt-3">{error}</p>}

                {weather && (
                    <div className="mt-6 text-gray-700 animate-fadeIn">
                        <h2 className="text-2xl font-semibold">{weather.city}</h2>
                        <p className="text-5xl font-bold mt-3">{weather.temperature.toFixed(1)}°C</p>
                        <p className="mt-3 text-lg">💧 Umidade: {weather.humidity}%</p>
                        <p className="capitalize mt-1 text-gray-600">{weather.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}