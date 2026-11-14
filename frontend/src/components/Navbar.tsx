import React from 'react';
import {
  Waves,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  RotateCcw,
  FileText
} from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';
import { AppScreen } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    selectedLake,
    resetCameraToBengaluru,
    setIsReportModalOpen
  } = useAppStore();

  const navItems: { screen: AppScreen; label: string; icon: React.ReactNode }[] = [
    { screen: 'command-center', label: 'Digital Twin', icon: <Compass className="w-3.5 h-3.5" /> },
    { screen: 'comparison-studio', label: 'Comparison', icon: <Sliders className="w-3.5 h-3.5" /> },
    { screen: 'restoration-lab', label: 'Restoration Lab', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { screen: 'methodology', label: 'Methodology', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
      {/* Brand Badge */}
      <div className="flex items-center space-x-2.5 bg-[#101A20]/80 backdrop-blur-xl border border-white/10 px-3.5 py-2 rounded-2xl shadow-2xl pointer-events-auto">
        <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-[#168CC5] to-[#47D4DF] text-[#101A20]">
          <Waves className="w-4 h-4 font-bold" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-wider text-white">JALASHAYA</span>
          <span className="text-[9px] font-mono text-[#47D4DF] ml-1.5 uppercase font-medium">Twin</span>
        </div>
      </div>

      {/* Screen Navigation Bar */}
      <nav className="flex items-center space-x-1 bg-[#101A20]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const isActive = activeScreen === item.screen;
          return (
            <button
              key={item.screen}
              onClick={() => setActiveScreen(item.screen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#168CC5] text-white shadow-water-glow'
                  : 'text-[#8D9A9A] hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Utilities */}
      <div className="flex items-center space-x-2 pointer-events-auto">
        <button
          onClick={resetCameraToBengaluru}
          title="Reset Camera to Bengaluru Overview"
          className="flex items-center space-x-1.5 bg-[#101A20]/80 backdrop-blur-xl border border-white/10 hover:border-[#47D4DF]/40 text-[#8D9A9A] hover:text-white px-3 py-2 rounded-2xl text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>

        {selectedLake && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center space-x-1.5 bg-[#168CC5] hover:bg-[#168CC5]/80 text-white font-medium px-3.5 py-2 rounded-2xl text-xs shadow-water-glow transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        )}

        <div className="hidden lg:flex items-center space-x-1.5 bg-[#101A20]/80 backdrop-blur-xl border border-white/10 px-2.5 py-2 rounded-2xl text-[10px] font-mono text-[#8D9A9A]">
          <span className="w-2 h-2 rounded-full bg-[#329B71] animate-pulse" />
          <span>GEE & Sentinel-2</span>
        </div>
      </div>
    </header>
  );
};
