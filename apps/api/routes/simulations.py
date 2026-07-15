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

class SimulationResponse(BaseModel):
    simulation_id: str
    status: str
    event_id: str

@router.post("/run", response_model=SimulationResponse)
async def run_simulation(request: SimulationRequest):
    engine = get_engine(event_bus)
    
    # We create a unique tracking ID for async tracking later
    sim_id = str(uuid.uuid4())
    
    if request.scenario == "crowd_surge":
        target = request.parameters.get("target")
        people = request.parameters.get("people", 0)
        if not target:
            raise HTTPException(status_code=400, detail="Missing target node")
            
        await engine.simulate_crowd_surge(request.venue_id, target, people)
        
    elif request.scenario == "gate_closure":
        gate_id = request.parameters.get("gate_id")
        if not gate_id:
            raise HTTPException(status_code=400, detail="Missing gate_id")
            
        await engine.simulate_gate_closure(request.venue_id, gate_id)
        
    elif request.scenario == "incident":
        location = request.parameters.get("location")
        inc_type = request.parameters.get("type", "unknown")
        if not location:
            raise HTTPException(status_code=400, detail="Missing location")
            
        await engine.simulate_incident(request.venue_id, location, inc_type)
    else:
        raise HTTPException(status_code=400, detail="Unknown scenario")
        
    return {
        "simulation_id": sim_id,
        "status": "queued",
        "event_id": f"evt_{sim_id}"
    }

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
