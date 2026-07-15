import networkx as nx

def update_graph_state(G: nx.DiGraph, node_states: list[dict]) -> nx.DiGraph:
    """
    Injects live state (occupancy) into the graph and updates edge weights.
    node_states: list of dicts with 'node_id', 'occupancy'
    """
    for state in node_states:
        node_id = state["node_id"]
        if G.has_node(node_id):
            # Example congestion factor logic: if occupancy > 80%, factor increases
            occupancy = state.get("occupancy", 0.0)
            congestion_factor = max(0.0, (occupancy - 0.5) * 2.0) if occupancy > 0.5 else 0.0
            
            G.nodes[node_id]["occupancy"] = occupancy
            G.nodes[node_id]["congestion_factor"] = congestion_factor
            
            # Update all edges pointing to this node
            for u, v in G.in_edges(node_id):
                base_dist = G[u][v]["distance"]
                # Congestion penalizes travel time/weight
                new_weight = base_dist * (1 + congestion_factor)
                G[u][v]["weight"] = new_weight
                
    return G
