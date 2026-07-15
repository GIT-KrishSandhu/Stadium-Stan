from typing import Dict, Any

def route_event(event_data: Dict[str, Any]) -> str:
    """
    Selects the workflow based on input event or request.
    """
    context_type = event_data.get("context_type", "")
    
    if context_type == "crowd_risk":
        return "crowd_workflow"
    elif context_type == "incident_report":
        return "incident_workflow"
    elif context_type == "routing_request":
        return "routing_workflow"
    
    # Default fallback
    if "report" in event_data:
        return "incident_workflow"
    
    return "crowd_workflow"
