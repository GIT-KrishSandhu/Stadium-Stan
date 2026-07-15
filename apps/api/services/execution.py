import time
import asyncio
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from models import ResponseAction
from services.event_bus import event_bus

class ExecutionService:
    async def execute_action(self, action_id: str, db: Session, correlation_id: str) -> None:
        """
        Background task to execute an approved action.
        """
        # Fetch the action synchronously inside the thread/session
        action = db.query(ResponseAction).filter(ResponseAction.id == action_id).first()
        if not action or action.execution_status != "READY_FOR_EXECUTION":
            # Idempotency / Safety check
            return

        # Start execution
        action.execution_status = "EXECUTING"
        self._append_timeline(action, "EXECUTION_STARTED", actor="system", notes=f"Correlation ID: {correlation_id}")
        db.commit()

        start_time = time.time()

        try:
            # Domain Event: ACTION_EXECUTION_STARTED
            await event_bus.publish_event(
                topic="execution_events",
                event_type="ACTION_EXECUTION_STARTED",
                payload={
                    "action_id": action.id,
                    "correlation_id": correlation_id,
                    "node_id": action.node_id
                }
            )

            # Simulated physical execution duration (e.g. dispatching API calls to hardware/staff)
            await asyncio.sleep(2)

            # Domain Event: ACTION_EXECUTED
            await event_bus.publish_event(
                topic="execution_events",
                event_type="ACTION_EXECUTED",
                payload={
                    "action_id": action.id,
                    "correlation_id": correlation_id,
                    "node_id": action.node_id,
                    "action_type": action.action
                }
            )

            duration_ms = int((time.time() - start_time) * 1000)
            
            # Check if this action should generate a volunteer assignment
            action_text = action.action.lower()
            if any(keyword in action_text for keyword in ["dispatch", "deploy", "send", "staff", "volunteer", "security", "medical", "check", "inspect"]):
                from models.operations import Assignment, Staff
                
                # Assign to a generic volunteer or randomly select one
                staff_member = db.query(Staff).first()
                volunteer_id = staff_member.id if staff_member else "vol-1"
                
                assignment = Assignment(
                    action_id=action.id,
                    volunteer_id=volunteer_id,
                    incident_id=action.incident_id,
                    location_node_id=action.node_id,
                    status="pending",
                    priority="high" if "emergency" in action_text else "normal"
                )
                db.add(assignment)
                db.commit()
                db.refresh(assignment)
                
                # Don't mark as completed yet, wait for volunteer to complete
                self._append_timeline(action, "ASSIGNMENT_CREATED", actor="system", notes=f"Assigned to {volunteer_id}")
                db.commit()
                
                await event_bus.publish_event(
                    topic="volunteer_events",
                    event_type="NEW_ASSIGNMENT",
                    payload={
                        "assignment_id": assignment.id,
                        "action_id": action.id,
                        "volunteer_id": volunteer_id
                    }
                )
            else:
                action.execution_status = "COMPLETED"
                action.execution_result = {
                    "success": True,
                    "execution_duration": duration_ms,
                    "affected_nodes": [action.node_id] if action.node_id else [],
                    "affected_resources": [],
                    "events_published": 2,
                    "message": "Action successfully orchestrated."
                }
                self._append_timeline(action, "EXECUTION_COMPLETED", actor="system")
                db.commit()

        except Exception as e:
            duration_ms = int((time.time() - start_time) * 1000)
            action.execution_status = "FAILED"
            action.execution_result = {
                "success": False,
                "execution_duration": duration_ms,
                "affected_nodes": [action.node_id] if action.node_id else [],
                "affected_resources": [],
                "events_published": 1,
                "message": str(e)
            }
            self._append_timeline(action, "EXECUTION_FAILED", actor="system", notes=str(e))
            db.commit()
            
            await event_bus.publish_event(
                topic="execution_events",
                event_type="ACTION_FAILED",
                payload={
                    "action_id": action.id,
                    "correlation_id": correlation_id,
                    "error": str(e)
                }
            )

    def _append_timeline(self, action_obj, event_type, actor="manager", old_value=None, new_value=None, notes=None):
        from datetime import datetime
        timeline = action_obj.timeline or []
        event = {
            "event_type": event_type,
            "timestamp": datetime.utcnow().isoformat(),
            "actor": actor,
            "old_value": old_value,
            "new_value": new_value,
            "notes": notes
        }
        action_obj.timeline = timeline + [event]

execution_service = ExecutionService()
