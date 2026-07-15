from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from schemas.venues import VenueResponse
from schemas.digital_twin import DigitalTwinResponse
from services import venues_service, digital_twin_service

router = APIRouter(prefix="/venues", tags=["venues"])

@router.get("", response_model=List[VenueResponse])
def read_venues(db: Session = Depends(get_db)):
    return venues_service.get_venues(db)

@router.get("/{id}/twin", response_model=DigitalTwinResponse)
def read_digital_twin(id: str, db: Session = Depends(get_db)):
    venue = venues_service.get_venue(db, id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return digital_twin_service.get_digital_twin(db, id)

@router.post("/reset")
def reset_database():
    try:
        from core.seed import seed_database
        seed_database()
        return {"status": "success", "message": "Database reset and re-seeded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
