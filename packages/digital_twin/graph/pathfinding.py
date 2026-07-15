import networkx as nx
from typing import List

def find_shortest_route(G: nx.DiGraph, source_id: str, target_id: str) -> List[str]:
    """Finds route based purely on physical distance."""
    try:
        return nx.shortest_path(G, source=source_id, target=target_id, weight="distance")
    except nx.NetworkXNoPath:
        return []

def find_accessible_route(G: nx.DiGraph, source_id: str, target_id: str) -> List[str]:
    """Finds route traversing only accessible nodes and edges."""
    
    # Identify accessible nodes (source/target are kept to allow routing)
    accessible_nodes = [
        n for n, attr in G.nodes(data=True) 
        if attr.get("is_accessible", True) or n in (source_id, target_id)
    ]
    
    # Create subgraph with accessible nodes
    subgraph = G.subgraph(accessible_nodes).copy()
    
    # Remove inaccessible edges dynamically
    edges_to_remove = [
        (u, v) for u, v, attr in subgraph.edges(data=True)
        if not attr.get("is_accessible", True)
    ]
    subgraph.remove_edges_from(edges_to_remove)
    
    try:
        return nx.shortest_path(subgraph, source=source_id, target=target_id, weight="distance")
    except nx.NetworkXNoPath:
        return []

def find_congestion_aware_route(G: nx.DiGraph, source_id: str, target_id: str) -> List[str]:
    """Finds route minimizing dynamically updated weight (distance * congestion)."""
    try:
        return nx.shortest_path(G, source=source_id, target=target_id, weight="weight")
    except nx.NetworkXNoPath:
        return []
