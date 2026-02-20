import { useState } from "react";

const API_BASE = "https://weathernow-api-crhf.onrender.com";

function App() {
    const [city, setCity] = useState("");
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const getWeather = async () => {
        if (!city) return;

        setLoading(true);
        setError("");
        setWeather(null);

        try {
            const response = await fetch(
                `${API_BASE}/api/weather/${encodeURIComponent(city)}`
            );

            if (!response.ok) {
                throw new Error("Cidade não encontrada");
            }

            const data = await response.json();
            setWeather(data);
        } catch (err) {
            setError("Não foi possível buscar a cidade.");
        }

        setLoading(false);
    };

    // 🌈 Background dinâmico
    const getBackground = () => {
        if (!weather) return "bg-gradient-to-r from-blue-500 to-cyan-400";

        const desc = weather.description.toLowerCase();

        if (desc.includes("rain"))
            return "bg-gradient-to-r from-gray-700 to-blue-900";

        if (desc.includes("cloud"))
            return "bg-gradient-to-r from-gray-400 to-gray-600";

        if (desc.includes("clear"))
            return "bg-gradient-to-r from-yellow-400 to-orange-500";

        return "bg-gradient-to-r from-blue-500 to-cyan-400";
    };

    return (
        <div className={`min-h-screen flex items-center justify-center ${getBackground()} transition-all duration-700`}>
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[350px] md:w-[400px] text-center">

                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    🌦 WeatherNow
                </h1>

                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Digite a cidade"
                        className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <button
                        onClick={getWeather}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg transition"
                    >
                        Buscar
                    </button>
                </div>

                {loading && (
                    <p className="text-blue-600 animate-pulse">Buscando...</p>
                )}

                {error && (
                    <p className="text-red-500">{error}</p>
                )}

                {weather && (
                    <div className="mt-6 text-gray-700">
                        <h2 className="text-2xl font-semibold">{weather.city}</h2>

                        <p className="text-4xl font-bold mt-2">
                            {weather.temperature.toFixed(1)}°C
                        </p>

                        <p className="mt-2">💧 Umidade: {weather.humidity}%</p>
                        <p className="capitalize mt-1">{weather.description}</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default App;