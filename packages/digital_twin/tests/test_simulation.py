import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import asyncio

import os
import sys
# Make apps/api available for testing
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../apps/api")))

from core.database import Base
from models.digital_twin import StadiumNode, StadiumEdge, NodeState
from models.operations import TelemetryEvent, Incident
from workers.event_processor import EventProcessor

# Setup a local in-memory DB for testing
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Seed static graph (won't be mutated)
    node1 = StadiumNode(id="gate_a", venue_id="metlife", name="Gate A", node_type="gate")
    db.add(node1)
    
    # Seed Live State
    state1 = NodeState(node_id="gate_a", occupancy=100.0, status="normal")
    db.add(state1)
    db.commit()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.mark.asyncio
async def test_crowd_surge(db_session):
    processor = EventProcessor()
    
    # Capture broadcasts
    broadcasts = []
    async def mock_broadcast(msg):
        broadcasts.append(msg)
    EventProcessor.set_broadcast_callback(mock_broadcast)
    
    event = {
        "event_type": "CROWD_ARRIVAL",
        "payload": {
            "venue_id": "metlife",
            "target_node": "gate_a",
            "people_count": 5000
        }
    }
    
    await processor.process_event(event, db_session)
    
    # 1. Check live state changed
    state = db_session.query(NodeState).filter(NodeState.node_id == "gate_a").first()
    assert state.occupancy == 5100.0
    
    # 2. Check static graph unmutated
    node = db_session.query(StadiumNode).filter(StadiumNode.id == "gate_a").first()
    assert node.name == "Gate A" # Not deleted or changed
    
    # 3. Check Telemetry persisted
    telemetry = db_session.query(TelemetryEvent).first()
    assert telemetry.event_type == "CROWD_ARRIVAL"
    assert telemetry.payload["people_count"] == 5000
    
    # 4. Check websocket serialization
    assert len(broadcasts) >= 1
    assert broadcasts[0]["type"] == "TWIN_UPDATED"
    assert broadcasts[0]["occupancy"] == 5100.0
    
@pytest.mark.asyncio
async def test_gate_closure(db_session):
    processor = EventProcessor()
    
    event = {
        "event_type": "GATE_STATUS_CHANGE",
        "payload": {
            "venue_id": "metlife",
            "target_node": "gate_a",
            "status": "closed"
        }
    }
    
    await processor.process_event(event, db_session)
    state = db_session.query(NodeState).filter(NodeState.node_id == "gate_a").first()
    assert state.status == "closed"
    
@pytest.mark.asyncio
async def test_incident_creation(db_session):
    processor = EventProcessor()
    
    event = {
        "event_type": "INCIDENT_CREATED",
        "payload": {
            "venue_id": "metlife",
            "location": "gate_a",
            "severity": "high"
        }
    }
    
    await processor.process_event(event, db_session)
    incident = db_session.query(Incident).first()
    assert incident.node_id == "gate_a"
    assert incident.severity == "high"
