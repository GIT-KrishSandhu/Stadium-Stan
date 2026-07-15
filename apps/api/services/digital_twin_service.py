from sqlalchemy.orm import Session
from models import StadiumNode, StadiumEdge

def get_digital_twin(db: Session, venue_id: str):
    nodes = db.query(StadiumNode).filter(StadiumNode.venue_id == venue_id).all()
    node_ids = [n.id for n in nodes]
    
    # Edges where both source and target are in the venue's nodes
    edges = db.query(StadiumEdge).filter(
        StadiumEdge.source_id.in_(node_ids),
        StadiumEdge.target_id.in_(node_ids)
    ).all()
    
    return {
        "venue_id": venue_id,
        "nodes": nodes,
        "edges": edges
    }
