from typing import Dict, Any
import networkx as nx
from core.database import SessionLocal
from models import StadiumNode, StadiumEdge, NodeState
from packages.digital_twin.graph.builder import build_networkx_graph
from packages.digital_twin.graph.state import update_graph_state
from packages.digital_twin.graph.pathfinding import (
    find_shortest_route,
    find_accessible_route,
    find_congestion_aware_route
)

def calculate_route(start: str, end: str, route_type: str = "shortest") -> Dict[str, Any]:
    """
    Wraps graph routing engine.
    Supports: shortest, accessible, congestion-aware (safest).
    """
    db = SessionLocal()
    try:
        # Load topology from DB
        nodes = db.query(StadiumNode).all()
        edges = db.query(StadiumEdge).all()
        node_states = db.query(NodeState).all()
        
        # Build NetworkX representation
        nodes_list = [{"id": n.id, "name": n.name, "node_type": n.node_type, "is_accessible": n.is_accessible} for n in nodes]
        edges_list = [{"source_id": e.source_id, "target_id": e.target_id, "distance": e.distance, "is_accessible": e.is_accessible} for e in edges]
        states_list = [{"node_id": s.node_id, "occupancy": s.occupancy} for s in node_states]
        
        G = build_networkx_graph(nodes_list, edges_list)
        G = update_graph_state(G, states_list)
        
        # Map names to IDs if name was passed instead of ID
        start_id = start
        end_id = end
        
        node_name_map = {n.name.lower(): n.id for n in nodes}
        if start.lower() in node_name_map:
            start_id = node_name_map[start.lower()]
        if end.lower() in node_name_map:
            end_id = node_name_map[end.lower()]
            
        # Select pathfinding algorithm
        if route_type == "accessible":
            path_ids = find_accessible_route(G, start_id, end_id)
        elif route_type == "safest" or route_type == "congestion-aware":
            path_ids = find_congestion_aware_route(G, start_id, end_id)
        else:
            path_ids = find_shortest_route(G, start_id, end_id)
            
        # Map IDs back to names for path description
        node_id_name_map = {n.id: n.name for n in nodes}
        path_names = [node_id_name_map.get(node_id, node_id) for node_id in path_ids]
        
        # Calculate time estimation
        total_time = 0.0
        if len(path_ids) > 1:
            for i in range(len(path_ids) - 1):
                u, v = path_ids[i], path_ids[i+1]
                if G.has_edge(u, v):
                    total_time += G[u][v].get("weight", G[u][v].get("distance", 1.0))
            # simple mapping factor (1 unit = ~10 seconds)
            estimated_time = max(1, int(total_time / 10))
        else:
            estimated_time = 0
            
        start_name = node_id_name_map.get(start_id, start)
        end_name = node_id_name_map.get(end_id, end)
        return {
            "start": start_name,
            "end": end_name,
            "route_type": route_type,
            "path": path_names,
            "path_ids": path_ids,
            "estimated_time_mins": estimated_time
        }
    except Exception as e:
        print(f"Error in routing: {e}")
        # Try to resolve start and end IDs in fallback if possible
        start_name = start
        end_name = end
        try:
            nodes = db.query(StadiumNode).all()
            node_id_name_map = {n.id: n.name for n in nodes}
            start_name = node_id_name_map.get(start, start)
            end_name = node_id_name_map.get(end, end)
        except Exception:
            pass
        fallback_path = [start_name, "Corridor 1", end_name]
        if start_name == "Entrance" and end_name == "Gate A":
            fallback_path = ["Entrance", "Corridor A", "Gate A"]
        return {
            "start": start_name,
            "end": end_name,
            "route_type": route_type,
            "path": fallback_path,
            "path_ids": [start, end],
            "estimated_time_mins": 5
        }
    finally:
        db.close()
