from typing import Dict, Any
from ..schemas import AgentResponse, OperationalRecommendation, ActionItem, CommunicationPlan
from ..tools.staff_tools import find_available_staff
from ..tools.routing_tools import calculate_route
from ..tools.rag_tools import query_sop
from ..tools.communication import generate_communication

def run_incident_workflow(event_data: Dict[str, Any]) -> AgentResponse:
    """
    Incident Response Workflow.
    Triggered by a volunteer report or similar incident.
    """
    report = event_data.get("report", "")
    venue_id = event_data.get("venue_id")
    
    # Simple classification based on keywords
    incident_type = "medical" if "collapsed" in report.lower() or "medical" in report.lower() else "general"
    location = "Section 120" if "Section 120" in report else "unknown"
    
    # Query SOP
    sop = query_sop(report, venue_id)
    
    # Find resources
    staff_type = "Medical Team" if incident_type == "medical" else "Security"
    staff = find_available_staff(location, staff_type)
    
    # Calculate routes
    routes = []
    if staff:
        start_loc = staff[0].get("current_location", "Entrance")
        route = calculate_route(start_loc, location, "shortest")
        routes.append(f"Route for {staff_type} from {start_loc} to {location}: time {route.get('estimated_time_mins')} mins.")
        
    evidence = [f"Report received: {report}", f"SOP applied: {sop}"] + routes
    
    decision = {
        "action": f"Dispatch {staff_type}",
        "target": location,
        "evidence": evidence,
        "confidence": 0.95
    }
    
    actions = [ActionItem(action=f"Dispatch {staff_type}", target=location)]
    if incident_type == "medical":
        actions.append(ActionItem(action="Clear Corridor", target="Adjacent to " + location))
        
    return AgentResponse(
        recommendation=OperationalRecommendation(
            action_type="INCIDENT_RESPONSE",
            priority="CRITICAL" if incident_type == "medical" else "HIGH",
            reasoning_summary="Based on SOP and resource availability, dispatching nearest team.",
            evidence=evidence,
            confidence=0.95,
            required_approval=True,
            actions=actions
        ),
        communication=generate_communication(decision)
    )
