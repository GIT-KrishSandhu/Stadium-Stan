import uuid

class SimulationEngine:
    def __init__(self, event_bus):
        self.event_bus = event_bus

    async def simulate_action(self, venue_id: str, action: str, target: str, commit: bool = True) -> dict:
        """
        Preview or execute an action.
        If commit=False, returns predicted impact using Risk Engine.
        If commit=True, executes via EventBus.
        """
        if not commit:
            from packages.digital_twin.prediction.risk_engine import calculate_node_risk
            
            # Simple heuristic prediction for dry-run
            impact = {
                "action": action,
                "target": target,
                "predicted_occupancy": {},
                "risk_reduction": 0.0
            }
            
            if action == "redirect_crowd" and target == "Gate C":
                impact["predicted_occupancy"] = {"Gate A": 0.65, "Gate C": 0.60}
                # Simulate risk calculation 
                # Gate A drops occupancy, Gate C goes up
                old_risk = calculate_node_risk(0.92, 1.0, 0.1)["score"]
                new_risk = calculate_node_risk(0.65, 1.0, 0.05)["score"]
                impact["risk_reduction"] = old_risk - new_risk
                
            elif action == "open_alternate_gate" and target == "Gate B":
                impact["predicted_occupancy"] = {"Gate A": 0.70, "Gate B": 0.50}
                old_risk = calculate_node_risk(0.92, 1.0, 0.1)["score"]
                new_risk = calculate_node_risk(0.70, 1.0, 0.05)["score"]
                impact["risk_reduction"] = old_risk - new_risk
                
            elif action == "move_staff" and target == "Gate A":
                impact["predicted_occupancy"] = {"Gate A": 0.90}
                old_risk = calculate_node_risk(0.92, 1.0, 0.1)["score"]
                new_risk = calculate_node_risk(0.90, 1.0, 0.1)["score"]
                impact["risk_reduction"] = old_risk - new_risk
                
            return impact
            
        # Commit mode
        if action == "redirect_crowd":
            await self.simulate_crowd_surge(venue_id, target, 100)
        elif action == "open_alternate_gate":
            await self.simulate_gate_closure(venue_id, target) # or gate open event
        elif action == "move_staff":
            pass # emit staff movement event
            
        return {"status": "executed", "action": action, "target": target}

    async def simulate_crowd_surge(self, venue_id: str, target_gate: str, people_count: int):
        await self.event_bus.publish_event(
            topic="operations",
            event_type="CROWD_ARRIVAL",
            payload={
                "venue_id": venue_id,
                "target_node": target_gate,
                "people_count": people_count
            }
        )

    async def simulate_gate_closure(self, venue_id: str, gate_id: str):
        await self.event_bus.publish_event(
            topic="operations",
            event_type="GATE_STATUS_CHANGE",
            payload={
                "venue_id": venue_id,
                "target_node": gate_id,
                "status": "closed"
            }
        )

    async def simulate_incident(self, venue_id: str, location: str, incident_type: str):
        await self.event_bus.publish_event(
            topic="operations",
            event_type="INCIDENT_CREATED",
            payload={
                "venue_id": venue_id,
                "location": location,
                "type": incident_type,
                "severity": "high"
            }
        )
