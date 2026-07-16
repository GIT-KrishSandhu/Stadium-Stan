from typing import Dict, Any
from ..schemas import AgentResponse, OperationalRecommendation, ActionItem, CommunicationPlan
from ..tools.routing_tools import calculate_route

def run_routing_workflow(event_data: Dict[str, Any]) -> AgentResponse:
    """
    Routing Workflow.
    Explains algorithmic routing results, but never invents the route.
    """
    start = event_data.get("start", "Entrance")
    end = event_data.get("end", "Gate A")
    route_type = event_data.get("route_type", "shortest")
    
    # Calculate route
    route = calculate_route(start, end, route_type)
    path = " -> ".join(route.get("path", []))
    
    evidence = [
        f"Calculated {route_type} route.",
        f"Path: {path}",
        f"Estimated time: {route.get('estimated_time_mins')} mins"
    ]
    
    return AgentResponse(
        recommendation=OperationalRecommendation(
            action_type="ROUTING_EXPLANATION",
            priority="LOW",
            reasoning_summary="Providing route information.",
            evidence=evidence,
            confidence=1.0,
            required_approval=False,
            actions=[]
        ),
        communication=CommunicationPlan(
            manager_message=f"Routing info: {path}. ETA {route.get('estimated_time_mins')} mins.",
            volunteer_message=f"Direct people from {route.get('start')} to {route.get('end')} via {path}.",
            fan_message=f"Your route from {route.get('start')} to {route.get('end')} takes approximately {route.get('estimated_time_mins')} minutes."
        ),
        route={
            "path_ids": route.get("path_ids", []),
            "path_names": route.get("path", []),
            "estimated_time_mins": route.get("estimated_time_mins", 0)
        }
    )
