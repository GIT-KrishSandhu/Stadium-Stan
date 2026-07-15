from typing import Dict, Any, List

def get_stadium_state(venue_id: str) -> Dict[str, Any]:
    """
    Retrieves the current state of the stadium.
    Wraps existing digital twin and operational data retrieval.
    Returns nodes, live occupancy, risks, and incidents.
    """
    # In a real implementation, this would call digital_twin_service.get_digital_twin
    # and fetch incidents/node_states from the DB.
    # For now, we mock the return structure as expected by the workflows.
    
    return {
        "venue_id": venue_id,
        "nodes": [
            {"id": "Gate A", "type": "gate", "capacity": 1000},
            {"id": "Gate B", "type": "gate", "capacity": 1000},
            {"id": "Gate C", "type": "gate", "capacity": 1000},
            {"id": "Section 120", "type": "seating", "capacity": 500},
        ],
        "live_occupancy": {
            "Gate A": 0.92, # 92%
            "Gate B": 0.40,
            "Gate C": 0.35,
            "Section 120": 0.50
        },
        "risks": [
            {"location": "Gate A", "type": "congestion", "level": "HIGH"}
        ],
        "incidents": []
    }
