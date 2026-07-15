import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Float, DateTime, Boolean
from core.database import Base
from sqlalchemy.orm import relationship

def generate_uuid():
    return str(uuid.uuid4())

class StadiumNode(Base):
    __tablename__ = "stadium_nodes"
    id = Column(String, primary_key=True, default=generate_uuid)
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    name = Column(String, nullable=False)
    node_type = Column(String, nullable=False)
    is_accessible = Column(Boolean, nullable=False, default=True)
    layout_x = Column(Float, nullable=False, default=0.0)
    layout_y = Column(Float, nullable=False, default=0.0)
    
    venue = relationship("Venue")

class StadiumEdge(Base):
    __tablename__ = "stadium_edges"
    id = Column(String, primary_key=True, default=generate_uuid)
    source_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=False)
    target_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=False)
    distance = Column(Float, nullable=False)
    is_accessible = Column(Boolean, nullable=False, default=True)
    
    source = relationship("StadiumNode", foreign_keys=[source_id])
    target = relationship("StadiumNode", foreign_keys=[target_id])

class NodeState(Base):
    __tablename__ = "node_state"
    id = Column(String, primary_key=True, default=generate_uuid)
    node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=False, unique=True)
    status = Column(String, nullable=False, default="normal")
    occupancy = Column(Float, default=0.0)
    temperature = Column(Float, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    node = relationship("StadiumNode")
