import networkx as nx

def build_networkx_graph(nodes: list[dict], edges: list[dict]) -> nx.DiGraph:
    """
    Converts database node and edge representations into a NetworkX directed graph.
    nodes: list of dicts with keys 'id', 'name', 'node_type', 'is_accessible'
    edges: list of dicts with keys 'source_id', 'target_id', 'distance'
    """
    G = nx.DiGraph()
    
    for node in nodes:
        G.add_node(
            node["id"],
            name=node["name"],
            node_type=node["node_type"],
            is_accessible=node.get("is_accessible", True),
            congestion_factor=0.0  # default, to be updated by state.py
        )
        
    for edge in edges:
        # Distance is base weight
        G.add_edge(
            edge["source_id"], 
            edge["target_id"], 
            distance=edge["distance"],
            weight=edge["distance"],  # default weight is purely distance
            is_accessible=edge.get("is_accessible", True)
        )
        
    return G
