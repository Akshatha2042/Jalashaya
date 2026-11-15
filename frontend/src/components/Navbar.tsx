import React from 'react';
import {
  Waves,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  RotateCcw,
  FileText,
  Home
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { AppScreen } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedLake,
    resetCameraToBengaluru,
    setIsReportModalOpen,
    lakes,
    fetchLakes,
    selectLake
  } = useAppStore();

  const handleNavClick = async (screen: AppScreen) => {
    if (screen === 'comparison-studio' || screen === 'restoration-lab') {
      if (!selectedLake) {
        let currentLakes = lakes;
        if (currentLakes.length === 0) {
          await fetchLakes();
          currentLakes = useAppStore.getState().lakes;
        }
        const bellandur = currentLakes.find((l) => l.id === 'lake-bellandur') || currentLakes[0];
        if (bellandur) {
          await selectLake(bellandur.id);
        }
      }
    }
    setActiveScreen(screen);
  };

  const navItems: { screen: AppScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'landing', label: 'Home', icon: <Home className="w-3.5 h-3.5" /> },
    { screen: 'command-center', label: 'Digital Twin', icon: <Compass className="w-3.5 h-3.5" /> },
    { screen: 'comparison-studio', label: 'Comparison', icon: <Sliders className="w-3.5 h-3.5" /> },
    { screen: 'restoration-lab', label: 'Restoration Lab', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { screen: 'methodology', label: 'Methodology', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  const encroachedCount = lakes.filter((l) =>
    (l.encroachment_status || '').toLowerCase().includes('encroached')
  ).length || 136;
  const freeCount = (lakes.length > 0 ? lakes.length : 185) - encroachedCount;

  return (
    <header className="absolute top-3.5 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* 1. Left: Brand & Civic Encroachment Audit Pill */}
      <div className="flex items-center space-x-2.5 pointer-events-auto">
        <button
          onClick={() => setActiveScreen('landing')}
          className="flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-md hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-sm">
            <Waves className="w-3.5 h-3.5 font-bold" />
          </div>
          <div>
            <span className="font-bold text-xs tracking-wider text-slate-900 group-hover:text-sky-600 transition-colors">JALASHAYA</span>
            <span className="text-[9px] font-mono text-sky-700 ml-1 uppercase font-bold bg-sky-50 px-1 py-0.2 rounded border border-sky-200">Twin</span>
          </div>
        </button>

        {/* Civic Encroachment Audit Indicator */}
        <div className="hidden lg:flex items-center space-x-2 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-md text-[11px] font-medium text-slate-600">
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-bold text-red-600 font-mono">{encroachedCount}</span>
            <span>Encroached</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-600 font-mono">{freeCount}</span>
            <span>Intrusion-Free</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-slate-400 font-mono text-[10px]">185 BBMP</span>
        </div>
      </div>

      {/* 2. Center: Screen Navigation Tabs */}
      <nav className="flex items-center space-x-1 bg-white/95 backdrop-blur-xl border border-slate-200/90 p-1 rounded-xl shadow-md pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => handleNavClick(item.screen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 3. Right: Reset Camera, Report & Live Status */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={resetCameraToBengaluru}
          title="Reset Camera to Bengaluru Overview"
          className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-medium shadow-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* 1-Click Fast Google Maps Satellite Integration */}
        <a
          href={
            selectedLake
              ? `https://www.google.com/maps/@${selectedLake.latitude},${selectedLake.longitude},16z/data=!3m1!1e3`
              : 'https://www.google.com/maps/@12.9716,77.5946,12z/data=!3m1!1e3'
          }
          target="_blank"
          rel="noopener noreferrer"
          title="Open Bengaluru in Google Maps (Satellite & 3D Aerial View)"
          className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all group"
        >
          <span className="text-[11px] text-emerald-600 group-hover:scale-110 transition-transform">🌐</span>
          <span className="hidden sm:inline">Google Maps ↗</span>
        </a>

        {selectedLake && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-sky-600/20 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        )}

        <div className="hidden xl:flex items-center space-x-1.5 bg-white/95 backdrop-blur-xl border border-slate-200/90 px-2.5 py-1.5 rounded-xl text-[10px] font-mono text-slate-600 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Sentinel-2 (10m)</span>
        </div>
      </div>
    </header>
  );
};
