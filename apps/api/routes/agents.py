import sys
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from models import Incident, ResponseAction

# Add packages to path
sys.path.append(str(Path(__file__).resolve().parent.parent.parent.parent))

from packages.agents.graph import analyze_event

router = APIRouter(prefix="/api/v1/agents", tags=["agents"])

class AnalyzeRequest(BaseModel):
    venue_id: str
    context_type: str
    report: str = ""
    start: str = ""
    end: str = ""
    route_type: str = "shortest"

@router.post("/analyze")
def analyze(request: AnalyzeRequest, db: Session = Depends(get_db)):
    event_data = request.model_dump()
    
    # Run the agent graph
    try:
        agent_response = analyze_event(event_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    # If there's an operational recommendation that requires approval, create a ResponseAction
    rec = agent_response.recommendation
    if rec.required_approval and rec.actions:
        # We need an incident_id for ResponseAction. 
        # If this is crowd risk, we might create a generic incident or link to an existing one.
        # For simplicity, if there's no specific incident_id, we create a placeholder one or associate with venue.
        # Assuming venue_id is provided, create an Incident to track this recommendation.
        incident = Incident(
            venue_id=request.venue_id,
            incident_type="AI_RECOMMENDATION",
            severity=rec.priority,
            status="open"
        )
        db.add(incident)
        db.flush() # Get incident ID
        
        for action_item in rec.actions:
            ra = ResponseAction(
                incident_id=incident.id,
                action=f"{action_item.action} at {action_item.target}",
                status="pending"
            )
            db.add(ra)
            
        db.commit()
        
    return agent_response.model_dump()
