import React, { useState } from "react";

export default function WeatherAnimation({ weather }) {
    if (!weather) return null;

    const desc = weather.description.toLowerCase();

    if (desc.includes("trovoadas") || desc.includes("thunderstorm")) return <ThunderAnimation />;
    if (desc.includes("chuva") || desc.includes("rain")) return <RainAnimation />;
    if (desc.includes("nublado") || desc.includes("cloud")) return <CloudAnimation />;
    if (desc.includes("céu limpo") || desc.includes("clear") || desc.includes("sol")) return <SunAnimation />;

    return null;
}

// ---- Chuva ----
function RainAnimation() {
    const [drops] = useState(() =>
        [...Array(50)].map(() => ({
            left: Math.random() * 100,
            duration: 1 + Math.random() * 2,
            delay: Math.random() * 2,
        }))
    );

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {drops.map((drop, i) => (
                <div
                    key={i}
                    className="absolute w-px h-6 bg-blue-400 opacity-50 animate-fall"
                    style={{
                        left: `${drop.left}%`,
                        animationDuration: `${drop.duration}s`,
                        animationDelay: `${drop.delay}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ---- Trovoadas ----
function ThunderAnimation() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-900/20 animate-pulse" />
            <RainAnimation />
        </div>
    );
}

// ---- Nuvens ----
function CloudAnimation() {
    const [clouds] = useState(() =>
        [...Array(3)].map((_, i) => ({
            top: i * 20 + 10,
            left: -40 + i * 20,
            duration: 40 + i * 10,
        }))
    );

    return (
        <div className="absolute inset-0 pointer-events-none">
            {clouds.map((cloud, i) => (
                <div
                    key={i}
                    className="absolute bg-gray-300 rounded-full w-32 h-16 opacity-50 animate-cloud"
                    style={{
                        top: `${cloud.top}%`,
                        left: `${cloud.left}%`,
                        animationDuration: `${cloud.duration}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ---- Sol ----
function SunAnimation() {
    return (
        <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_50px_#facc15]" />
    );
}