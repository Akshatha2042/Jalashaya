# JALASHAYA — Environment Setup & Credentials Guide

This guide details every environment variable configured in **JALASHAYA**, its scientific purpose, where and how to obtain credentials, and how to operate the platform.

---

## 1. Quick Verification: Zero-Credential Standby Mode

> [!NOTE]
> JALASHAYA is engineered with graceful fallback mechanisms. If you do not have external API keys immediately, the platform functions using **authoritative Bengaluru lake inventories, verified public Sentinel-2 passes, and cached multi-spectral NDWI extractions**.
> You do **not** need to configure external API keys to evaluate the 3D twin, inspect boundaries, move the timeline, compute change vectors, run the restoration lab, or generate reports.

---

## 2. Environment Variables Specification

Copy `.env.example` to `.env` in the root repository.

### A. Core Application & Server
| Variable | Default Value | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | `JALASHAYA` | Yes | Application identity header |
| `APP_ENV` | `development` | Yes | `development` or `production` |
| `APP_PORT` | `8000` | Yes | FastAPI backend server port |
| `APP_SECRET_KEY` | *(Generated random key)* | Yes | Session and cryptographic token signing |
| `CORS_ORIGINS` | `["http://localhost:5173", ...]` | Yes | Permitted origins for frontend communication |

---

### B. Database & Spatial Storage
| Variable | Default Value | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `sqlite:///./jalashaya.db` | Yes | Database connection string. Supports SQLite for local dev and `postgresql+psycopg://user:pass@host:5432/jalashaya` for production PostGIS. |
| `DB_ECHO` | `false` | No | Enables SQL statement debugging |

#### Setting up PostGIS (Optional / Production):
If you wish to run with native PostgreSQL + PostGIS instead of the local spatial engine:
```bash
docker run --name jalashaya-postgis -e POSTGRES_PASSWORD=postgrespassword -e POSTGRES_DB=jalashaya -p 5432:5432 -d postgis/postgis:16-3.4
```
Then update your `.env`:
```env
DATABASE_URL=postgresql+psycopg://postgres:postgrespassword@localhost:5432/jalashaya
```

---

### C. Google Earth Engine (GEE)
| Variable | Purpose | How to Obtain |
| :--- | :--- | :--- |
| `GEE_ENABLED` | Toggle GEE satellite queries (`true`/`false`) | Set `true` once credentials are provided |
| `GEE_PROJECT_ID` | Google Cloud project identifier | [Google Cloud Console](https://console.cloud.google.com/) |
| `GEE_SERVICE_ACCOUNT` | Service account email address | IAM & Admin &rarr; Service Accounts |
| `GEE_PRIVATE_KEY` | RSA Private Key for Earth Engine API | Service Account &rarr; Keys &rarr; Create JSON Key |
| `GEE_KEY_FILE_PATH` | Alternative local path to service account JSON | Path to `.json` file on backend server |

#### Steps to obtain GEE credentials:
1. Register your Google Cloud Project at [earthengine.google.com/signup](https://earthengine.google.com/signup).
2. Enable the **Earth Engine API** in your Google Cloud Console.
3. Create a Service Account with role **Earth Engine Resource Viewer / User**.
4. Download the private key JSON file and set `GEE_KEY_FILE_PATH=./secrets/gee-sa.json`.

---

### D. Sentinel Hub / Copernicus Data Space Ecosystem
| Variable | Purpose | How to Obtain |
| :--- | :--- | :--- |
| `SENTINEL_HUB_ENABLED` | Toggle live Copernicus querying (`true`/`false`) | Set `true` once credentials are provided |
| `SENTINEL_HUB_CLIENT_ID` | Sentinel Hub OAuth Client ID | [Copernicus Data Space](https://dataspace.copernicus.eu/) |
| `SENTINEL_HUB_CLIENT_SECRET` | Sentinel Hub OAuth Secret | Dashboard &rarr; OAuth Clients |

---

### E. Frontend Environment Variables
Set in `frontend/.env` or root:
| Variable | Value | Purpose |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend REST API endpoint |
| `VITE_CESIUM_ION_TOKEN` | *(Optional)* | Cesium Ion access token for 3D photogrammetric buildings / global terrain assets from Cesium Ion |
| `VITE_MAPTILER_API_KEY` | *(Optional)* | MapTiler vector basemap key (optional; system defaults to Esri World Imagery & OpenStreetMap) |

---

## 3. Consolidated List of Credentials to Provide Later

When you are ready to configure live cloud accounts, provide:
1. **Google Earth Engine:** Service Account JSON or (`GEE_PROJECT_ID`, `GEE_SERVICE_ACCOUNT`, `GEE_PRIVATE_KEY`)
2. **Sentinel Hub / Copernicus:** `SENTINEL_HUB_CLIENT_ID` and `SENTINEL_HUB_CLIENT_SECRET`
3. **Cesium Ion Token (Optional):** `VITE_CESIUM_ION_TOKEN` from [cesium.com/ion](https://cesium.com/ion)
4. **PostgreSQL Password (Optional):** If deploying to a remote PostgreSQL/PostGIS server.
