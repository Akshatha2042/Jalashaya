# JALASHAYA — QA Navigation & Routing Audit

**Document ID:** QA-NAV-2026-01  
**Focus:** Full Audit of Feature Pages, Click Handlers, URL Hashes, Navigation Drawers & Modals  
**Audit Standard:** Zero Broken Links, Zero Blank Pages, Full Direct Access & Browser History Support

---

## 1. Complete Navigation Inventory

| Navigation Element | Source Component | Target Action / View | Route / Hash | Audit Verdict |
|---|---|---|---|---|
| **Logo / Brand Header** | `Navbar.tsx`, `LandingPage.tsx` | Return to Landing Page | `#home` | **PASSED** |
| **Top Nav: Home** | `Navbar.tsx` | Sets `activeScreen = 'landing'` | `#home` | **PASSED** |
| **Top Nav: Digital Twin** | `Navbar.tsx` | Full 3D Map view | `#map` | **PASSED** |
| **Top Nav: Comparison** | `Navbar.tsx` | Side-by-Side Satellite Studio | `#comparison` | **PASSED** |
| **Top Nav: Restoration Lab**| `Navbar.tsx` | What-If Simulation Lab | `#simulation-lab` | **PASSED** (With auto-load fix) |
| **Top Nav: Methodology** | `Navbar.tsx` | Peer-Reviewed Methodology | `#methodology` | **PASSED** |
| **Top Nav: Reset Camera** | `Navbar.tsx` | Reset map bounds to Bengaluru | — | **PASSED** |
| **Top Nav: Report Button** | `Navbar.tsx` | Opens Evidence Report Modal | — | **PASSED** |
| **Landing Hero: Launch 3D Map**| `LandingPage.tsx` | Navigates to `#map` | `#map` | **PASSED** |
| **Landing Hero: View Audit** | `LandingPage.tsx` | Smooth scroll to `#audit` | `#audit` | **PASSED** |
| **Landing Nav: Civic Audit** | `LandingPage.tsx` | Smooth scroll to `#audit` | `#audit` | **PASSED** |
| **Landing Nav: Core Features**| `LandingPage.tsx` | Smooth scroll to `#features` | `#features` | **PASSED** |
| **Landing Nav: Flagship** | `LandingPage.tsx` | Smooth scroll to `#flagship` | `#flagship` | **PASSED** |
| **Landing Nav: Comparison** | `LandingPage.tsx` | Opens Satellite Comparison Studio | `#comparison` | **PASSED** |
| **Landing Nav: Restoration** | `LandingPage.tsx` | Smooth scroll to `#simulation` | `#simulation` | **PASSED** |
| **Landing Nav: Methodology** | `LandingPage.tsx` | Opens Methodology View | `#methodology` | **PASSED** |
| **Feature Card 1: Clickable Map**| `LandingPage.tsx` | Flies to interactive map | `#map` | **PASSED** |
| **Feature Card 2: Trend Chart** | `LandingPage.tsx` | Opens telemetry & trend chart | `#map` | **PASSED** |
| **Feature Card 3: Shrinkage Flag**| `LandingPage.tsx` | Selects Bellandur & flags drop | `#map` | **PASSED** |
| **Feature Card 4: Satellite Studio**| `LandingPage.tsx` | Launches Comparison Studio | `#comparison` | **PASSED** |
| **Flagship Card: Bellandur** | `LandingPage.tsx` | Selects Bellandur Lake | `#map` | **PASSED** |
| **Flagship Card: Varthur** | `LandingPage.tsx` | Selects Varthur Lake | `#map` | **PASSED** |
| **Flagship Card: Sankey** | `LandingPage.tsx` | Selects Sankey Tank | `#map` | **PASSED** |
| **Bottom Floating Jump Bar** | `LandingPage.tsx` | Top, Audit, Features, Flagship, Comparison | `#audit`..`#comparison` | **PASSED** |
| **Telemetry Card: Comparison**| `LakeTelemetryCard.tsx` | Opens Comparison Studio | `#comparison` | **PASSED** |
| **Telemetry Card: Simulation**| `LakeTelemetryCard.tsx` | Opens Restoration Lab | `#simulation-lab` | **PASSED** |
| **Telemetry Card: Report** | `LakeTelemetryCard.tsx` | Opens Evidence Report Modal | — | **PASSED** |
| **Left Drawer (3 Dots): Analytics**| `LeftMenuDrawer.tsx` | Opens Critical Shrinkage leaderboard | — | **PASSED** |
| **Left Drawer: Simulation Tab**| `LeftMenuDrawer.tsx` | Inline slider + Full Lab launch | `#simulation-lab` | **PASSED** |
| **Left Drawer: Tools Tab** | `LeftMenuDrawer.tsx` | Satellite Studio, Curtain Swipe, Report | `#comparison` | **PASSED** |

---

## 2. Root Cause Analysis of User Navigation Failures

1. **URL Hash Race Condition on Cold Load**:
   - When a user navigated to `http://localhost:5173/#comparison` or `#simulation-lab` on a fresh session, `selectedLake` was `null` because `fetchLakes()` was running asynchronously.
   - Both `ComparisonStudioModal.tsx` and `RestorationLabModal.tsx` had defensive guards: `if (!selectedLake) return null;`.
   - Consequently, the component rendered `null` (a blank screen), creating the impression of broken navigation.
   - **Resolution:** Both modals now feature an auto-fetch and auto-selection mechanism with a dedicated loading state, ensuring that cold-loading any URL hash immediately loads the data without ever rendering a blank page.

2. **Anchor Smooth Scroll vs Screen Toggle**:
   - Landing page sections (`#audit`, `#features`, `#flagship`, `#simulation`, `#tech`) coexist with top-level app screens (`#map`, `#comparison`, `#simulation-lab`, `#methodology`).
   - A global hash-change listener in `App.tsx` routes between top-level screen swaps and smooth section scrolls.
   - When returning to `#home`, `LandingPage` mounts seamlessly and the scroll position is preserved.

---

**Navigation Audit Verdict:** **PASSED**
