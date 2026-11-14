import React from 'react';
import {
  Droplets,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  TrendingDown,
  Layers,
  Sliders,
  Maximize2,
  Cpu,
  FileText,
  MapPin,
  ChevronDown,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export const LandingPage: React.FC = () => {
  const { setActiveScreen, selectLake, lakes, selectedLake } = useAppStore();

  const handleLaunchMap = (lakeName?: string) => {
    setActiveScreen('command-center');
    if (lakeName) {
      const match = lakes.find((l) => l.official_name.toLowerCase().includes(lakeName.toLowerCase()));
      if (match) {
        selectLake(match.id);
      }
    } else if (!selectedLake && lakes.length > 0) {
      const match = lakes.find((l) => l.official_name.toLowerCase().includes('bellandur')) || lakes[0];
      selectLake(match.id);
    }
  };

  const handleLaunchComparison = () => {
    if (!selectedLake && lakes.length > 0) {
      const match = lakes.find((l) => l.official_name.toLowerCase().includes('bellandur')) || lakes[0];
      selectLake(match.id);
    }
    setActiveScreen('comparison-studio');
  };

  const handleLaunchSimulation = () => {
    if (!selectedLake && lakes.length > 0) {
      const match = lakes.find((l) => l.official_name.toLowerCase().includes('bellandur')) || lakes[0];
      selectLake(match.id);
    }
    setActiveScreen('restoration-lab');
  };

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState(null, '', `#${id}`);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* Floating Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                JALASHAYA <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 font-semibold border border-sky-200">Twin</span>
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-medium">Bengaluru Water Body Watch</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <a href="#audit" onClick={scrollToSection('audit')} className="hover:text-sky-600 transition-colors">Civic Audit</a>
            <a href="#features" onClick={scrollToSection('features')} className="hover:text-sky-600 transition-colors">Core Features</a>
            <a href="#flagship" onClick={scrollToSection('flagship')} className="hover:text-sky-600 transition-colors">Flagship Lakes</a>
            <a href="#simulation" onClick={scrollToSection('simulation')} className="hover:text-sky-600 transition-colors">Restoration Lab</a>
            <button onClick={() => setActiveScreen('methodology')} className="hover:text-sky-600 transition-colors font-medium">Methodology</button>
          </nav>

          <button
            onClick={() => handleLaunchMap()}
            className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-sky-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>Launch Digital Twin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-sky-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs font-medium text-slate-700 mb-6 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Bruhat Bengaluru Mahanagara Palike (BBMP) Lake Inventory Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Bengaluru Water Body Watch &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-cyan-600">
              Civic Digital Twin
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Surveillance and multi-temporal satellite intelligence across 185 civic lakes.
            Flagging human encroachment, tracking surface area shrinkage past critical 20% thresholds, and modeling hydrological rejuvenation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => handleLaunchMap()}
              className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3.5 rounded-xl font-semibold shadow-lg shadow-sky-600/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Interactive Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#audit"
              onClick={scrollToSection('audit')}
              className="flex items-center space-x-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-5 py-3.5 rounded-xl font-medium shadow-sm transition-all"
            >
              <span>View Civic Encroachment Audit</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Key Statistics Grid */}
          <div id="audit" className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block font-semibold">Active Inventory</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">185</div>
              <p className="text-xs text-slate-500 mt-1">Official BBMP recorded lakes surveyed across 8 zones</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-red-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center space-x-1.5 text-red-600">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Encroached</span>
              </div>
              <div className="text-3xl font-extrabold text-red-600 mt-1 font-mono">136 <span className="text-xs font-normal text-red-500">(73.5%)</span></div>
              <p className="text-xs text-slate-500 mt-1">Active public or private urban intrusion detected</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
              <div className="flex items-center space-x-1.5 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Intrusion-Free</span>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">49 <span className="text-xs font-normal text-emerald-500">(26.5%)</span></div>
              <p className="text-xs text-slate-500 mt-1">Rejuvenated, fenced, or pristine civic water bodies</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-1.5 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold">Flag Threshold</span>
              </div>
              <div className="text-3xl font-extrabold text-amber-600 mt-1 font-mono">≥ 20%</div>
              <p className="text-xs text-slate-500 mt-1">Automatic alert when water area contracts past baseline</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Section (03 Water Body Watch Compliance) */}
      <section id="features" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              03 Water Body Watch • Core Platform Features
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">
              Engineered for Complete Geospatial Precision
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Four robust tools designed for citizens, civic administrators, and lake conservation advocates.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div
              onClick={() => handleLaunchMap()}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-sky-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">1. Clickable Water Body Map</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Full-screen MapLibre GL 3D vector map of 185 lakes. Clicking any lake smoothly zooms in and opens detailed telemetry cards with custody, area, and status.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                <span>Explore Interactive Map →</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => handleLaunchMap()}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-cyan-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">2. Area-Over-Time Trend Chart</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Multi-temporal sparkline plotting surface water area across 2017, 2019, 2021, 2023, 2024, and 2026. Click any year dot node to inspect seasonal surface area in hectares.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-semibold text-cyan-600 group-hover:translate-x-1 transition-transform">
                <span>View Historical Trends →</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => handleLaunchMap('Bellandur')}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-red-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4 group-hover:bg-red-600 group-hover:text-white transition-colors">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">3. Automatic Shrinkage Flag</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Automated detection algorithm flags any water body experiencing ≥ 20% surface area loss since baseline observation, highlighting acute human encroachment.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                <span>Inspect Flagged Lakes (Bellandur) →</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div
              onClick={handleLaunchComparison}
              className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Maximize2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">4. Side-by-Side Satellite View</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Dual photographic observation studio and in-map interactive curtain swipe comparing 2017 baseline vs 2026 contemporary imagery showing buildings and roads.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Open Satellite Studio →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Lakes Showcase */}
      <section id="flagship" className="py-20 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-sky-600">Civic Audit Case Studies</span>
              <h2 className="text-3xl font-bold text-slate-900 mt-1">Bengaluru Flagship Water Bodies</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 md:mt-0 max-w-md">
              Click any lake card to fly directly to its 3D digital twin on the interactive geospatial map.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bellandur */}
            <div
              onClick={() => handleLaunchMap('Bellandur')}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-sky-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-500">Mahadevapura Zone</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  ⚠️ Encroached (-63.3%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                Bellandur Lake
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                Largest water body in Bengaluru. 205.5 hectares of historical water spread progressively accommodated by unauthorized residential layouts and commercial developments.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">2017: 324.5 ha</span>
                <span className="text-red-600 font-bold">2026: 108.5 ha</span>
              </div>
            </div>

            {/* Varthur */}
            <div
              onClick={() => handleLaunchMap('Varthur')}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-sky-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-500">Mahadevapura Zone</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                  ⚠️ Encroached (-58.2%)
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                Varthur Lake
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                Terminal reservoir of the Bellandur catchment cascade. Significant buffer zone violations and peripheral layout construction shrinking historical water retention.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">2017: 180.2 ha</span>
                <span className="text-red-600 font-bold">2026: 72.8 ha</span>
              </div>
            </div>

            {/* Sankey Tank */}
            <div
              onClick={() => handleLaunchMap('Sankey')}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-500">West Zone / Sadashivanagar</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  ✓ Intrusion-Free (Restored)
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Sankey Tank
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                Pristine urban wetland with perimeter bund protection, active rainwater harvesting, and zero detected cadastral violations.
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Cadastral: 15.2 ha</span>
                <span className="text-emerald-600 font-bold">100% Boundary Maintained</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restoration Simulation Lab Banner */}
      <section id="simulation" className="py-20 bg-gradient-to-r from-sky-900 to-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800">
              Hydrological Decision Support System
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Interactive Basin Restoration Simulator
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
              Empowering civic authorities and urban hydrologists to test mathematical polygon rejuvenation scenarios from 10% to 100%. Calculate recovered water spread, flood mitigation buffering, and storage volume before physical excavation begins.
            </p>
            <div className="mt-8 flex items-center space-x-3">
              <button
                onClick={handleLaunchSimulation}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition-all text-sm flex items-center space-x-2"
              >
                <Sliders className="w-4 h-4" />
                <span>Launch Simulation Lab</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Scientific Rigor */}
      <section id="tech" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block mb-4">
            Built On Standards-Compliant Scientific Geospatial Infrastructure
          </span>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-600">
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">FastAPI REST Backend</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">GeoPandas & Shapely</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">UTM Zone 43N (EPSG:32643)</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">Sentinel-2 10m NDWI (B3/B8)</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">EC JRC Global Surface Water</span>
            <span className="px-3.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-medium">MapLibre GL Vector Engine</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-8 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 JALASHAYA Project • Civic Water Body Watch for Greater Bengaluru.</p>
          <p>Data sources: OpenStreetMap, BBMP Lake Cadastre, Copernicus Sentinel-2 MSI, EC JRC.</p>
        </div>
      </footer>

      {/* Floating Bottom Quick Jump Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl rounded-full px-4 py-2 flex items-center gap-3 text-xs font-medium text-slate-700 transition-all">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 font-semibold"
        >
          <span>↑ Top</span>
        </button>
        <span className="text-slate-300">|</span>
        <a href="#audit" onClick={scrollToSection('audit')} className="hover:text-sky-600 transition-colors">
          Audit
        </a>
        <a href="#features" onClick={scrollToSection('features')} className="hover:text-sky-600 transition-colors">
          Features
        </a>
        <a href="#flagship" onClick={scrollToSection('flagship')} className="hover:text-sky-600 transition-colors">
          Flagship
        </a>
        <span className="text-slate-300">|</span>
        <button
          onClick={() => handleLaunchMap()}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
        >
          <span>Launch 3D Map</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
