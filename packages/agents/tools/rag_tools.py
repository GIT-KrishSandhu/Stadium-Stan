def query_sop(query: str, venue_id: str) -> str:
    """
    Internal abstraction for querying Standard Operating Procedures (SOPs).
    Currently uses mock/local responses. No external calls.
    """
    if "medical" in query.lower() or "collapse" in query.lower():
        return "SOP 4A: For medical emergencies, dispatch nearest Medical Team immediately and clear adjacent corridors for stretcher access."
    if "congestion" in query.lower() or "gate" in query.lower():
        return "SOP 2B: When gate congestion exceeds 80%, open alternate gates and redirect arrivals."
        
    return "SOP 1A: Ensure safety and clear communication."
