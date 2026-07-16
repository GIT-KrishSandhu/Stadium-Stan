import uuid
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.event_bus import event_bus
from packages.digital_twin.simulation.engine import get_engine

router = APIRouter(prefix="/api/v1/simulations", tags=["simulations"])

class SimulationRequest(BaseModel):
    venue_id: str
    scenario: str
    parameters: dict

class PreviewResponse(BaseModel):
    action: str
    target: str
    predicted_occupancy: dict = {}
    risk_reduction: float = 0.0

@router.post("/preview", response_model=PreviewResponse)
async def preview_simulation(request: SimulationRequest):
    engine = get_engine(event_bus)
    
    action = request.scenario
    target = request.parameters.get("target") or request.parameters.get("gate_id")
    if not target:
        raise HTTPException(status_code=400, detail="Missing target parameter")
        
    impact = await engine.simulate_action(request.venue_id, action, target, commit=False)
    
    return PreviewResponse(
        action=impact.get("action", action),
        target=impact.get("target", target),
        predicted_occupancy=impact.get("predicted_occupancy", {}),
        risk_reduction=impact.get("risk_reduction", 0.0)
    )
