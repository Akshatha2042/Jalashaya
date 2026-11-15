# JALASHAYA — Functional & User Journey Test Report

**Audit Date:** November 15, 2026  
**Auditor:** Principal QA & Test Automation Specialist  
**Execution Platform:** Headless Chromium via Playwright & Pytest  

---

## 1. Automated Functional Journey Results

6 end-to-end tests executed via `pytest tests/test_qa_browser_e2e.py`:
- **Total Tests:** 6
- **Passed:** 6 (100%)
- **Failed:** 0
- **Execution Time:** 48.09s

---

## 2. User Journey Test Cases

### Journey 1: Landing Page Discovery & Navigation
- **Step:** User visits `http://localhost:5173/`.
- **Expected:** Landing page renders hero title "JALASHAYA", key metrics (185 lakes, 10m Sentinel-2, 6 time steps), and 4 feature cards.
- **Result:** **PASS**. Screenshot saved: `qa/screenshots/01_landing_page.png`.

### Journey 2: Feature Card 4 Click to Comparison Studio (BUG-03 Verification)
- **Step:** User clicks Feature Card 4 ("Side-by-Side Satellite View").
- **Expected:** Navigates smoothly to Comparison Studio modal without crashing.
- **Result:** **PASS**. Modal opens with Bellandur Lake, 2017 baseline vs 2026 contemporary view, water mask overlays, and metrics. Screenshot saved: `qa/screenshots/02_comparison_studio_dual.png`.

### Journey 3: Interactive Curtain Swipe Mode
- **Step:** User clicks "Curtain Swipe" button inside comparison studio.
- **Expected:** Split-screen slider with draggable divider renders smoothly.
- **Result:** **PASS**. Screenshot saved: `qa/screenshots/03_comparison_studio_curtain.png`.

### Journey 4: Digital Twin 3D Map Environment
- **Step:** User opens `http://localhost:5173/#map`.
- **Expected:** Full-screen MapLibre canvas renders Bengaluru lakes with color coding (red: encroached $\ge 20\%$, green: stable), top HUD navbar, telemetry card, and timeline slider.
- **Result:** **PASS**. Screenshot saved: `qa/screenshots/04_digital_twin_map.png`.

### Journey 5: Basin Restoration Simulation Lab
- **Step:** User opens `http://localhost:5173/#simulation-lab`.
- **Expected:** What-If Basin Restoration Lab modal opens with restoration target slider (0-100%), simulated area, and scientific disclaimer banner.
- **Result:** **PASS**. Screenshot saved: `qa/screenshots/05_restoration_lab.png`.

### Journey 6: Methodology & Documentation
- **Step:** User navigates to `http://localhost:5173/#methodology`.
- **Expected:** Scientific documentation with McFeeters NDWI mathematical formula, Sentinel-2 spectral bands, and remote sensing data sources.
- **Result:** **PASS**. Screenshot saved: `qa/screenshots/06_methodology_page.png`.

### Journey 7: Responsive Layouts
- **Step:** Verified viewport scaling on tablet ($768 \times 1024$) and mobile ($390 \times 844$).
- **Expected:** No horizontal overflow; all buttons accessible.
- **Result:** **PASS**. Screenshots saved: `qa/screenshots/07_responsive_tablet_768x1024.png` and `07_responsive_mobile_390x844.png`.
