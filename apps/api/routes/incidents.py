from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.operations import Incident
from services.event_bus import event_bus
from pydantic import BaseModel

router = APIRouter(prefix="/incidents", tags=["incidents"])

class IncidentCreate(BaseModel):
    incident_type: str
    severity: str
    node_id: str | None = None
    venue_id: str = "metlife"

@router.get("/")
def get_all_incidents(db: Session = Depends(get_db)):
    incidents = db.query(Incident).all()
    return incidents

@router.post("/")
async def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident = Incident(
        venue_id=payload.venue_id,
        node_id=payload.node_id,
        incident_type=payload.incident_type,
        severity=payload.severity,
        status="open"
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    
    await event_bus.publish_event(
        topic="incident_events",
        event_type="INCIDENT_REPORTED",
        payload={
            "incident_id": incident.id,
            "node_id": incident.node_id,
            "type": incident.incident_type,
            "actor": "fan",
            "email": "fan@stadiumstan.demo"
        }
    )
    
    return incident

@router.get("/{id}")
def get_incident(id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

