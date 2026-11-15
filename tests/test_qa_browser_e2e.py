import pytest
import os
import time
from playwright.sync_api import sync_playwright

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
SCREENSHOT_DIR = os.path.join(os.getcwd(), "qa", "screenshots")

@pytest.fixture(scope="module")
def browser_context():
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

def test_e2e_landing_page(browser_context):
    """Verify landing page loads, civic audit stats render, and screenshots are captured."""
    context = browser_context.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    console_errors = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

    page.goto(FRONTEND_URL, wait_until="networkidle")
    time.sleep(1)

    # 1. Assert title and brand
    assert "JALASHAYA" in page.content()
    assert "185" in page.content()  # Active inventory count
    assert "136" in page.content()  # Encroached count

    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_landing_page.png"), full_page=False)
    context.close()

def test_e2e_navigation_feature_card_to_comparison(browser_context):
    """Verify clicking Feature 4 (Side-by-Side Satellite View) opens Comparison Studio."""
    context = browser_context.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{FRONTEND_URL}/#features", wait_until="networkidle")
    time.sleep(1)

    # Click Feature 4 card
    card_4 = page.locator("text=Side-by-Side Satellite View").first
    assert card_4.is_visible()
    card_4.click()
    page.wait_for_selector("text=Satellite Comparison Studio", timeout=10000)

    # Assert Comparison Studio Modal is open and not blank
    assert page.locator("text=Satellite Comparison Studio").first.is_visible()
    assert page.locator("text=Bellandur Lake").first.is_visible()
    assert page.locator("text=Baseline Satellite Image").first.is_visible()
    assert page.locator("text=Contemporary Satellite Image").first.is_visible()

    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_comparison_studio_dual.png"))

    # Switch to In-Modal Curtain Swipe
    curtain_btn = page.locator("text=Curtain Swipe").first
    if curtain_btn.is_visible():
        curtain_btn.click()
        time.sleep(0.5)
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_comparison_studio_curtain.png"))

    context.close()

def test_e2e_digital_twin_map_and_hud(browser_context):
    """Verify 3D digital twin map, top HUD navbar, telemetry card, and timeline."""
    context = browser_context.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{FRONTEND_URL}/#map", wait_until="networkidle")
    time.sleep(2)

    # Verify map canvas and HUD components
    assert page.locator(".maplibregl-canvas").first.is_visible()
    assert page.locator("text=Digital Twin").first.is_visible()
    assert page.locator("text=Bellandur Lake").first.is_visible()

    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_digital_twin_map.png"))
    context.close()

def test_e2e_restoration_lab_modal(browser_context):
    """Verify Restoration Lab modal opens with simulation slider and metrics."""
    context = browser_context.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{FRONTEND_URL}/#simulation-lab", wait_until="networkidle")
    page.wait_for_selector("text=Basin Restoration Lab", timeout=10000)

    # Verify restoration modal elements
    assert page.locator("text=Basin Restoration Lab").first.is_visible()
    assert page.locator("input[type=range]").first.is_visible()

    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_restoration_lab.png"))
    context.close()

def test_e2e_methodology_view(browser_context):
    """Verify Methodology and Data Sources scientific documentation page."""
    context = browser_context.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()
    page.goto(f"{FRONTEND_URL}/#methodology", wait_until="networkidle")
    time.sleep(1)

    assert page.locator("text=Scientific Methodology").first.is_visible()
    assert page.locator("text=McFeeters").first.is_visible()

    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_methodology_page.png"))
    context.close()

def test_e2e_responsive_viewports(browser_context):
    """Test mobile and tablet viewports for layout breakage."""
    viewports = [
        {"name": "tablet_768x1024", "width": 768, "height": 1024},
        {"name": "mobile_390x844", "width": 390, "height": 844}
    ]
    for vp in viewports:
        context = browser_context.new_context(viewport={"width": vp["width"], "height": vp["height"]})
        page = context.new_page()
        page.goto(FRONTEND_URL, wait_until="networkidle")
        time.sleep(1)
        assert page.locator("text=JALASHAYA").first.is_visible()
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, f"07_responsive_{vp['name']}.png"))
        context.close()
