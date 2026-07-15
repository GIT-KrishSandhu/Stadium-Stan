from typing import Dict, Any
from ..schemas import CommunicationPlan

def generate_communication(decision: Dict[str, Any]) -> CommunicationPlan:
    """
    Shared helper to generate multi-persona communications from a decision.
    """
    action = decision.get("action", "unknown action")
    target = decision.get("target", "unknown location")
    evidence = ", ".join(decision.get("evidence", []))
    confidence = decision.get("confidence", 0.0)
    
    manager_msg = f"Operational Details: {action} at {target}. Evidence: {evidence}. Confidence: {confidence*100}%."
    volunteer_msg = f"Please {action} at {target} immediately."
    fan_msg = f"For your safety and convenience, please follow directions to {target}."
    
    return CommunicationPlan(
        manager_message=manager_msg,
        volunteer_message=volunteer_msg,
        fan_message=fan_msg
    )
