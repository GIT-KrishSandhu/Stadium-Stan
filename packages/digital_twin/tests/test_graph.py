import pytest
from graph.builder import build_networkx_graph
from graph.state import update_graph_state
from graph.pathfinding import find_shortest_route, find_accessible_route, find_congestion_aware_route

def setup_graph():
    nodes = [
        {"id": "A", "name": "Gate A", "node_type": "gate", "is_accessible": True},
        {"id": "B", "name": "Stairs", "node_type": "stairs", "is_accessible": False},
        {"id": "C", "name": "Elevator", "node_type": "elevator", "is_accessible": True},
        {"id": "D", "name": "Section 101", "node_type": "section", "is_accessible": True},
        {"id": "E", "name": "Shortcut", "node_type": "corridor", "is_accessible": True},
    ]
    edges = [
        {"source_id": "A", "target_id": "B", "distance": 10, "is_accessible": True},
        {"source_id": "B", "target_id": "D", "distance": 10, "is_accessible": True},
        {"source_id": "A", "target_id": "C", "distance": 15, "is_accessible": True},
        {"source_id": "C", "target_id": "D", "distance": 15, "is_accessible": True},
        {"source_id": "C", "target_id": "E", "distance": 5, "is_accessible": False},
        {"source_id": "E", "target_id": "D", "distance": 5, "is_accessible": True},
    ]
    return build_networkx_graph(nodes, edges)

def test_find_shortest_route():
    G = setup_graph()
    # Shortest path is A -> B -> D (distance 20)
    route = find_shortest_route(G, "A", "D")
    assert route == ["A", "B", "D"]

def test_find_accessible_route():
    G = setup_graph()
    # Accessible path must avoid B (node is stairs), so it could go A -> C -> D (30) or A -> C -> E -> D (25).
    # But C -> E edge is inaccessible!
    # So A -> C -> D is the only fully accessible route.
    route = find_accessible_route(G, "A", "D")
    assert route == ["A", "C", "D"]

def test_find_congestion_aware_route():
    G = setup_graph()
    # Make node B highly congested (e.g. occupancy > 80%)
    state = [{"node_id": "B", "occupancy": 0.9}]
    G = update_graph_state(G, state)
    
    # Base weight A->B=10, B->D=10. Congestion factor at B = (0.9 - 0.5)*2 = 0.8
    # Edge A->B weight becomes 10 * 1.8 = 18.
    # Total path A->B->D = 18 + 10 = 28
    # Path A->C->D = 15 + 15 = 30
    
    # Let's make it more congested so it reroutes
    state = [{"node_id": "B", "occupancy": 1.0}]
    G = update_graph_state(G, state)
    # Congestion factor = 1.0
    # Edge A->B weight = 10 * 2.0 = 20
    # Total A->B->D = 20 + 10 = 30. Tie.
    
    # Let's make occupancy 1.2 (over capacity) -> factor 1.4 -> weight 24.
    state = [{"node_id": "B", "occupancy": 1.2}]
    G = update_graph_state(G, state)
    route = find_congestion_aware_route(G, "A", "D")
    assert route == ["A", "C", "E", "D"]
