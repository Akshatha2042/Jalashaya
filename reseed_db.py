import os
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.repositories.lake_repository import LakeRepository
from backend.app.models.lake import (
    Lake, SatelliteObservation, WaterDetectionResult, ComparisonResult, ScenarioSimulation
)

print("Dropping existing tables and recreating with new columns...")
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
print("Schemas created successfully.")

db = SessionLocal()
try:
    repo = LakeRepository(db)
    repo.seed_initial_inventory_if_empty()
    print("New authoritative 185-lake inventory seeded successfully!")
    
    total = db.query(Lake).count()
    free_cnt = db.query(Lake).filter(Lake.encroachment_status.ilike("%Free%")).count()
    enc_cnt = db.query(Lake).filter(Lake.encroachment_status.ilike("%Encroached%")).count()
    print(f"Verified Lakes in DB: Total={total} | Free={free_cnt} | Encroached={enc_cnt}")
finally:
    db.close()
