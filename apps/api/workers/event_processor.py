import asyncio
from sqlalchemy.orm import Session
from core.database import SessionLocal
from services.event_bus import event_bus
from models.operations import TelemetryEvent, Incident, Staff
from models.digital_twin import NodeState
from packages.digital_twin.prediction.risk_engine import calculate_node_risk

class EventProcessor:
    def __init__(self):
        self.running = False
        
    # We will use websockets to push broadcasts
    # Need a way to call the websocket manager. We'll import it loosely or pass a callback.
    _broadcast_callback = None
    
    @classmethod
    def set_broadcast_callback(cls, cb):
        cls._broadcast_callback = staticmethod(cb)
        
    async def broadcast(self, message: dict):
        if self._broadcast_callback:
            await self._broadcast_callback(message)

    async def process_event(self, event: dict, db: Session):
        event_type = event["event_type"]
        payload = event["payload"]
        
        # 1. Store in telemetry
        telemetry = TelemetryEvent(
            node_id=payload.get("target_node") or payload.get("location"),
            event_type=event_type,
            payload=payload
        )
        db.add(telemetry)
        
        # 2. Update Live State
        if event_type == "CROWD_ARRIVAL":
            node_id = payload["target_node"]
            added_people = payload["people_count"]
            state = db.query(NodeState).filter(NodeState.node_id == node_id).first()
            if state:
                state.occupancy += added_people
                
                # Recalculate risk (simplified capacity to 10000 for this example)
                risk_data = calculate_node_risk(state.occupancy, 10000, added_people)
                
                await self.broadcast({
                    "type": "TWIN_UPDATED",
                    "node": node_id,
                    "occupancy": state.occupancy
                })
                
                if risk_data["score"] > 0.8:
                    await self.broadcast({
                        "type": "RISK_UPDATED",
                        "risk": f"High congestion predicted at {node_id} (score: {risk_data['score']:.2f})"
                    })
                    
        elif event_type == "GATE_STATUS_CHANGE":
            node_id = payload["target_node"]
            status = payload["status"]
            state = db.query(NodeState).filter(NodeState.node_id == node_id).first()
            if state:
                state.status = status
                await self.broadcast({
                    "type": "TWIN_UPDATED",
                    "node": node_id,
                    "status": status
                })
                
        elif event_type == "INCIDENT_CREATED":
            incident = Incident(
                venue_id=payload.get("venue_id", "metlife"),
                node_id=payload["location"],
                incident_type="generated",
                severity=payload["severity"]
            )
            db.add(incident)
            await self.broadcast({
                "type": "TWIN_UPDATED",
                "node": payload["location"],
                "incident_severity": payload["severity"]
            })

        elif event_type == "STAFF_MOVEMENT":
            staff = db.query(Staff).filter(Staff.id == payload["staff_id"]).first()
            if staff:
                staff.current_node_id = payload["destination"]
                
        db.commit()

    async def process_execution_event(self, event: dict, db: Session):
        event_type = event["event_type"]
        payload = event["payload"]
        
        if event_type == "ACTION_EXECUTED":
            node_id = payload.get("node_id")
            action_id = payload.get("action_id")
            correlation_id = payload.get("correlation_id")
            
            # Send digital twin updated event via WS so UI can refresh Recommendation panel
            if node_id:
                await self.broadcast({
                    "type": "EXECUTION_COMPLETED",
                    "node": node_id,
                    "action_id": action_id,
                    "correlation_id": correlation_id
                })

    async def _consume_operations(self):
        async for event in event_bus.consume_events("operations"):
            if not self.running:
                break
            db = SessionLocal()
            try:
                await self.process_event(event, db)
            except Exception as e:
                print(f"Error processing operations event: {e}")
                db.rollback()
            finally:
                db.close()

    async def _consume_executions(self):
        async for event in event_bus.consume_events("execution_events"):
            if not self.running:
                break
            db = SessionLocal()
            try:
                await self.process_execution_event(event, db)
            except Exception as e:
                print(f"Error processing execution event: {e}")
                db.rollback()
            finally:
                db.close()

    async def _consume_volunteer_events(self):
        async for event in event_bus.consume_events("volunteer_events"):
            if not self.running:
                break
            try:
                await self.broadcast({
                    "type": "VOLUNTEER_EVENT",
                    "event": event
                })
            except Exception as e:
                print(f"Error processing volunteer event: {e}")

    async def _consume_incident_events(self):
        async for event in event_bus.consume_events("incident_events"):
            if not self.running:
                break
            db = SessionLocal()
            try:
                event_type = event["event_type"]
                payload = event["payload"]
                
                if event_type == "INCIDENT_REPORTED":
                    incident_id = payload["incident_id"]
                    incident = db.query(Incident).filter(Incident.id == incident_id).first()
                    if incident:
                        # Broadcast Digital Twin node incident updates
                        await self.broadcast({
                            "type": "TWIN_UPDATED",
                            "node": incident.node_id,
                            "incident_severity": incident.severity
                        })
                        
                        # Run the LangGraph AI recommendation workflow
                        from packages.agents.graph import analyze_event
                        from models import ResponseAction, StadiumNode
                        from datetime import datetime
                        
                        node_name = "unknown location"
                        if incident.node_id:
                            node = db.query(StadiumNode).filter(StadiumNode.id == incident.node_id).first()
                            if node:
                                node_name = node.name
                                
                        event_data = {
                            "venue_id": incident.venue_id,
                            "context_type": "incident_report",
                            "report": f"{incident.incident_type} reported at {node_name}",
                            "node_id": incident.node_id
                        }
                        
                        agent_res = analyze_event(event_data)
                        rec = agent_res.recommendation
                        
                        if rec.actions:
                            action_item = rec.actions[0]
                            ra = ResponseAction(
                                incident_id=incident.id,
                                node_id=incident.node_id,
                                action=f"{action_item.action} to {node_name}",
                                status="pending",
                                operational_summary=rec.reasoning_summary,
                                evidence=rec.evidence,
                                timeline=[
                                    {
                                        "event_type": "INCIDENT_REPORTED",
                                        "timestamp": datetime.utcnow().isoformat(),
                                        "actor": "volunteer" if "@stadiumstan.demo" in str(payload.get("email", "")) or "volunteer" in str(payload.get("actor", "")) else "fan",
                                        "notes": f"Incident of type {incident.incident_type.replace('_', ' ')} reported at {node_name}."
                                    },
                                    {
                                        "event_type": "AI_RECOMMENDATION_GENERATED",
                                        "timestamp": datetime.utcnow().isoformat(),
                                        "actor": "ai_agent",
                                        "notes": rec.reasoning_summary
                                    }
                                ]
                            )
                            db.add(ra)
                            db.commit()
                            
                            # Publish an event for recommendation creation
                            await event_bus.publish_event(
                                topic="operations",
                                event_type="RECOMMENDATION_CREATED",
                                payload={
                                    "action_id": ra.id,
                                    "incident_id": incident.id,
                                    "node_id": incident.node_id
                                }
                            )
                elif event_type == "INCIDENT_RESOLVED":
                    incident_id = payload["incident_id"]
                    incident = db.query(Incident).filter(Incident.id == incident_id).first()
                    if incident:
                        # Clear incident severity from node in digital twin
                        await self.broadcast({
                            "type": "TWIN_UPDATED",
                            "node": incident.node_id,
                            "incident_severity": None
                        })

                # Broadcast to Websockets for instant manager update
                await self.broadcast({
                    "type": "INCIDENT_EVENT",
                    "event": event
                })
            except Exception as e:
                print(f"Error processing incident event: {e}")
                db.rollback()
            finally:
                db.close()

    async def run(self):
        self.running = True
        print("EventProcessor started...")
        await asyncio.gather(
            self._consume_operations(),
            self._consume_executions(),
            self._consume_volunteer_events(),
            self._consume_incident_events()
        )

processor = EventProcessor()
