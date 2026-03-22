import React, { useState, useEffect } from 'react';

function App() {
    // Load saved day from local storage, or start at Day 1
    const [day, setDay] = useState(() => {
        const saved = localStorage.getItem('life-tracker-day');
        return saved ? parseInt(saved) : 1;
    });

    // Save to local storage whenever 'day' changes
    useEffect(() => {
        localStorage.setItem('life-tracker-day', day);
    }, [day]);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-center mb-2 tracking-tight">
                    Day <span className="text-blue-500">{day}</span>
                </h1>
                <p className="text-slate-400 text-center mb-8 uppercase tracking-widest text-xs">
                    300-Day Challenge
                </p>

                {/* Progress Ring or Bar */}
                <div className="w-full bg-slate-800 h-3 rounded-full mb-10 overflow-hidden">
                    <div
                        className="bg-blue-500 h-full transition-all duration-700 ease-out"
                        style={{ width: `${(day / 300) * 100}%` }}
                    ></div>
                </div>

                <button
                    onClick={() => setDay(d => Math.min(d + 1, 300))}
                    className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-lg transition-transform active:scale-95"
                >
                    Check In for Today
                </button>

                <button
                    onClick={() => { if (confirm("Reset progress?")) setDay(1) }}
                    className="w-full mt-4 text-slate-500 text-sm hover:text-red-400 transition-colors"
                >
                    Reset Challenge
                </button>
            </div>
        </div>
    );
}

export default App;