import os
import json
import logging
from typing import Dict, Any, Optional, List
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

class GEEClient:
    """
    Google Earth Engine Client Manager.
    Handles service account authentication, token management, and Earth Engine API queries.
    Gracefully identifies unconfigured status without throwing unexpected errors.
    """
    def __init__(self):
        self.is_initialized = False
        self.init_error: Optional[str] = None
        self._initialize()

    def _resolve_key_file(self) -> Optional[str]:
        candidates = [
            settings.GEE_KEY_FILE_PATH,
            os.path.join(os.getcwd(), "backend", "secrets", "gee-sa.json"),
            os.path.join(os.getcwd(), "secrets", "gee-sa.json"),
            os.path.join(os.path.dirname(__file__), "..", "..", "secrets", "gee-sa.json"),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "secrets", "gee-sa.json"))
        ]
        for path in candidates:
            if path and os.path.exists(path):
                return os.path.abspath(path)
        return None

    def _initialize(self):
        if not settings.GEE_ENABLED:
            self.init_error = "GEE is disabled in configuration (GEE_ENABLED=false)."
            return

        try:
            import ee
            key_file = self._resolve_key_file()

            if key_file:
                # Load service account credentials from JSON file
                with open(key_file, "r") as f:
                    sa_info = json.load(f)

                service_account = settings.GEE_SERVICE_ACCOUNT or sa_info.get("client_email")
                project_id = settings.GEE_PROJECT_ID or sa_info.get("project_id")

                try:
                    credentials = ee.ServiceAccountCredentials(service_account, key_file)
                    ee.Initialize(credentials, project=project_id)
                    self.is_initialized = True
                    logger.info(f"Google Earth Engine initialized successfully for project '{project_id}' via {key_file}.")
                except Exception as auth_err:
                    self.init_error = f"Earth Engine authentication failed: {str(auth_err)}"
                    logger.warning(self.init_error)

            elif settings.GEE_SERVICE_ACCOUNT and settings.GEE_PRIVATE_KEY and not settings.GEE_PRIVATE_KEY.startswith("YOUR_"):
                credentials = ee.ServiceAccountCredentials(
                    settings.GEE_SERVICE_ACCOUNT,
                    key_data=settings.GEE_PRIVATE_KEY
                )
                ee.Initialize(credentials, project=settings.GEE_PROJECT_ID)
                self.is_initialized = True
                logger.info(f"Google Earth Engine initialized successfully via private key string.")
            else:
                self.init_error = "GEE key file not found. Operating in cached / local satellite mode."
                logger.info(self.init_error)

        except ImportError:
            self.init_error = "earthengine-api package not installed."
            logger.warning(self.init_error)
        except Exception as e:
            self.init_error = f"GEE initialization error: {str(e)}"
            logger.error(self.init_error)

    def get_status(self) -> Dict[str, Any]:
        """Returns the live status of the Google Earth Engine provider."""
        key_file = self._resolve_key_file()
        return {
            "name": "Google Earth Engine",
            "enabled": settings.GEE_ENABLED,
            "connected": self.is_initialized,
            "project_id": settings.GEE_PROJECT_ID,
            "service_account": settings.GEE_SERVICE_ACCOUNT,
            "key_file_found": bool(key_file),
            "key_file_path": key_file if key_file else None,
            "status": "OPERATIONAL" if self.is_initialized else ("AWAITING_ACTIVATION" if key_file else "AWAITING_CREDENTIALS"),
            "message": "Operational & Authenticated" if self.is_initialized else (self.init_error or "Awaiting configuration.")
        }

gee_client = GEEClient()
