import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Float, DateTime, JSON
from core.database import Base
from sqlalchemy.orm import relationship

def generate_uuid():
    return str(uuid.uuid4())

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"
    id = Column(String, primary_key=True, default=generate_uuid)
    node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=True)  # Can be null for venue-wide events
    event_type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"
    id = Column(String, primary_key=True, default=generate_uuid)
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=True)
    incident_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    status = Column(String, nullable=False, default="open")

class ResponseAction(Base):
    __tablename__ = "response_actions"
    id = Column(String, primary_key=True, default=generate_uuid)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True) # Can be null if it's a proactive recommendation
    action = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    
    # Provenance
    simulation_id = Column(String, nullable=True)
    simulation_version = Column(String, nullable=True)
    simulation_timestamp = Column(DateTime, nullable=True)
    node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=True)
    
    # Decision object data
    operational_summary = Column(String, nullable=True)
    metrics = Column(JSON, nullable=True) # RecommendationMetrics
    evidence = Column(JSON, nullable=True)
    improvement_estimate = Column(JSON, nullable=True)
    alternatives = Column(JSON, nullable=True)
    timeline = Column(JSON, nullable=True) # List of TimelineEvent
    
    # Execution Tracking
    execution_status = Column(String, nullable=False, default="PENDING")
    execution_result = Column(JSON, nullable=True) # ExecutionResult
    correlation_id = Column(String, nullable=True)

class Staff(Base):
    __tablename__ = "staff"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    venue_id = Column(String, ForeignKey("venues.id"), nullable=False)
    current_node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=True)
    role = Column(String, nullable=False)

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(String, primary_key=True, default=generate_uuid)
    action_id = Column(String, ForeignKey("response_actions.id"), nullable=True)
    volunteer_id = Column(String, ForeignKey("staff.id"), nullable=False)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    location_node_id = Column(String, ForeignKey("stadium_nodes.id"), nullable=True)
    status = Column(String, nullable=False, default="pending")
    priority = Column(String, nullable=False, default="normal")
    created_at = Column(DateTime, default=datetime.utcnow)

