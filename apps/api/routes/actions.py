from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import ResponseAction

router = APIRouter(prefix="/api/v1/actions", tags=["actions"])

@router.get("/")
def get_all_actions(db: Session = Depends(get_db)):
    actions = db.query(ResponseAction).all()
    return actions

@router.get("/pending")
def get_pending_actions(db: Session = Depends(get_db)):
    actions = db.query(ResponseAction).filter(ResponseAction.status == "pending").all()
    return actions

from pydantic import BaseModel

class ModifyActionRequest(BaseModel):
    action: str

from datetime import datetime

def _append_timeline(action_obj, event_type, actor="manager", old_value=None, new_value=None, notes=None):
    timeline = action_obj.timeline or []
    event = {
        "event_type": event_type,
        "timestamp": datetime.utcnow().isoformat(),
        "actor": actor,
        "old_value": old_value,
        "new_value": new_value,
        "notes": notes
    }
    # Reassign to trigger SQLAlchemy JSON detection
    action_obj.timeline = timeline + [event]

from fastapi import BackgroundTasks
from services.execution import execution_service
import uuid

@router.post("/{id}/approve")
def approve_action(id: str, db: Session = Depends(get_db)):
    action = db.query(ResponseAction).filter(ResponseAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    old_status = action.status
    action.status = "approved"
    action.execution_status = "READY_FOR_EXECUTION"
    _append_timeline(action, "APPROVED", old_value=old_status, new_value="approved")
    
    db.commit()
    return {"status": "success", "action_id": id, "state": "approved", "execution_status": "READY_FOR_EXECUTION"}

@router.post("/{id}/execute", status_code=202)
def execute_action(id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    action = db.query(ResponseAction).filter(ResponseAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
        
    if action.execution_status != "READY_FOR_EXECUTION":
        raise HTTPException(status_code=400, detail="Action is not ready for execution. It may be already executing or completed.")
        
    correlation_id = str(uuid.uuid4())
    action.correlation_id = correlation_id
    db.commit()
    
    background_tasks.add_task(execution_service.execute_action, action.id, db, correlation_id)
    
    return {"status": "accepted", "action_id": id, "correlation_id": correlation_id}

@router.put("/{id}/modify")
def modify_action(id: str, request: ModifyActionRequest, db: Session = Depends(get_db)):
    action = db.query(ResponseAction).filter(ResponseAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    old_action = action.action
    action.action = request.action
    _append_timeline(action, "MODIFIED", old_value=old_action, new_value=request.action)
    
    db.commit()
    return {"status": "success", "action_id": id, "new_action": request.action}

@router.post("/{id}/reject")
def reject_action(id: str, db: Session = Depends(get_db)):
    action = db.query(ResponseAction).filter(ResponseAction.id == id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    old_status = action.status
    action.status = "rejected"
    _append_timeline(action, "REJECTED", old_value=old_status, new_value="rejected")
    
    db.commit()
    return {"status": "success", "action_id": id, "state": "rejected"}
