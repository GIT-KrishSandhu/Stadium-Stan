def calculate_node_risk(occupancy: float, capacity: float, flow_rate: float, active_incidents: int = 0) -> dict:
    """
    Calculates a risk score from 0.0 to 1.0.
    Returns a structured dictionary with risk details.
    """
    if capacity <= 0:
        return {
            "risk_type": "critical",
            "score": 1.0,
            "estimated_failure_minutes": 0.0
        }
        
    occupancy_ratio = occupancy / capacity
    flow_ratio = flow_rate / capacity
    
    # Heuristic: Risk is current occupancy plus 5 minutes of expected flow + penalty for incidents
    risk_score = occupancy_ratio + (flow_ratio * 5.0) + (active_incidents * 0.2)
    risk_score = min(1.0, max(0.0, risk_score))
    
    failure_mins = predict_congestion(occupancy, capacity, flow_rate)
    
    risk_type = "normal"
    if risk_score > 0.8:
        risk_type = "congestion"
    if active_incidents > 0:
        risk_type = "incident"
        
    return {
        "risk_type": risk_type,
        "score": risk_score,
        "estimated_failure_minutes": failure_mins
    }

def predict_congestion(occupancy: float, capacity: float, flow_rate: float) -> float:
    """
    Predicts estimated failure time in minutes (time until capacity reaches 100%).
    Returns -1.0 if flow_rate is <= 0 (will not reach capacity).
    """
    if capacity <= 0:
        return 0.0
    
    if flow_rate <= 0:
        if occupancy >= capacity:
            return 0.0
        return -1.0
        
    remaining_capacity = capacity - occupancy
    if remaining_capacity <= 0:
        return 0.0
        
    return remaining_capacity / flow_rate
