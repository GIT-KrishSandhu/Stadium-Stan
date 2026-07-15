from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from core.database import get_db
from models.operations import Assignment, Staff, ResponseAction, Incident
from services.event_bus import event_bus
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])

class StatusUpdate(BaseModel):
    status: str
    location_node_id: str | None = None

class IncidentReport(BaseModel):
    incident_type: str
    severity: str
    description: str | None = None
    node_id: str | None = None

def get_current_volunteer_id():
    return "vol-1" # Placeholder for demo purposes

@router.get("/assignments")
def get_volunteer_assignments(db: Session = Depends(get_db)):
    volunteer_id = get_current_volunteer_id()
    
    assignments = db.query(Assignment).filter(
        Assignment.volunteer_id == volunteer_id
    ).order_by(Assignment.created_at.desc()).all()
    
    result = []
    for a in assignments:
        action = db.query(ResponseAction).filter(ResponseAction.id == a.action_id).first() if a.action_id else None
        incident = db.query(Incident).filter(Incident.id == a.incident_id).first() if a.incident_id else None
        
        result.append({
            "id": a.id,
            "action_id": a.action_id,
            "incident_id": a.incident_id,
            "location_node_id": a.location_node_id,
            "status": a.status,
            "priority": a.priority,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "action_details": action.action if action else "General Task",
            "incident_details": incident.incident_type if incident else None
        })
    return result

@router.post("/assignments/{assignment_id}/status")
async def update_assignment_status(assignment_id: str, payload: StatusUpdate, db: Session = Depends(get_db)):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
        
    old_status = assignment.status
    assignment.status = payload.status
    
    if payload.location_node_id:
        assignment.location_node_id = payload.location_node_id
        
    db.commit()
    
    if assignment.action_id:
        action = db.query(ResponseAction).filter(ResponseAction.id == assignment.action_id).first()
        if action:
            from datetime import datetime
            timeline = action.timeline or []
            event = {
                "event_type": f"VOLUNTEER_{payload.status.upper()}",
                "timestamp": datetime.utcnow().isoformat(),
                "actor": "volunteer",
                "notes": f"Volunteer changed status to {payload.status}"
            }
            action.timeline = timeline + [event]
            
            if payload.status == "completed":
                action.execution_status = "COMPLETED"
                action.execution_result = {
                    "success": True,
                    "message": "Task completed by volunteer on the ground."
                }
                
                # Retrieve and resolve the incident if linked
                if assignment.incident_id:
                    incident = db.query(Incident).filter(Incident.id == assignment.incident_id).first()
                    if incident:
                        incident.status = "resolved"
                        db.commit()
                        
                        # Emit INCIDENT_RESOLVED domain event
                        await event_bus.publish_event(
                            topic="incident_events",
                            event_type="INCIDENT_RESOLVED",
                            payload={
                                "incident_id": incident.id,
                                "node_id": incident.node_id,
                                "type": incident.incident_type
                            }
                        )
            db.commit()

    await event_bus.publish_event(
        topic="volunteer_events",
        event_type="ASSIGNMENT_STATUS_CHANGED",
        payload={
            "assignment_id": assignment_id,
            "status": payload.status,
            "location_node_id": assignment.location_node_id
        }
    )
    
    return {"message": "Status updated", "status": payload.status}

@router.post("/status")
async def update_volunteer_status(payload: StatusUpdate, db: Session = Depends(get_db)):
    volunteer_id = get_current_volunteer_id()
    staff = db.query(Staff).filter(Staff.id == volunteer_id).first()
    if staff and payload.location_node_id:
        staff.current_node_id = payload.location_node_id
        db.commit()
        
    await event_bus.publish_event(
        topic="volunteer_events",
        event_type="VOLUNTEER_STATUS_CHANGED",
        payload={
            "volunteer_id": volunteer_id,
            "status": payload.status,
            "location_node_id": payload.location_node_id
        }
    )
    return {"message": "Status updated"}

@router.post("/incidents")
async def report_incident(payload: IncidentReport, db: Session = Depends(get_db)):
    incident = Incident(
        venue_id="metlife",
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
            "actor": "volunteer",
            "email": "volunteer1@stadiumstan.demo"
        }
    )
    
    return incident