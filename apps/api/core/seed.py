import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.database import SessionLocal, engine
from models import (
    Organization, Event, Venue, StadiumNode, StadiumEdge, NodeState, Base,
    User, UserRole, TelemetryEvent, Incident, ResponseAction, Staff, Assignment
)

def seed_database():
    db = SessionLocal()
    
    # Clean up existing data to be idempotent for testing
    print("Cleaning database...")
    db.query(Assignment).delete()
    db.query(ResponseAction).delete()
    db.query(Incident).delete()
    db.query(Staff).delete()
    db.query(StadiumEdge).delete()
    db.query(NodeState).delete()
    db.query(StadiumNode).delete()
    db.query(UserRole).delete()
    db.query(User).delete()
    db.query(Venue).delete()
    db.query(Event).delete()
    db.query(Organization).delete()
    db.commit()

    print("Seeding Organization...")
    org = Organization(name="FIFA")
    db.add(org)
    db.commit()

    print("Seeding Event...")
    event = Event(organization_id=org.id, name="FIFA World Cup 2026")
    db.add(event)
    db.commit()

    print("Seeding Venue...")
    venue = Venue(id="metlife", name="MetLife Stadium", location="East Rutherford, NJ")
    db.add(venue)
    db.commit()

    print("Seeding Nodes...")
    gate_a = StadiumNode(venue_id=venue.id, name="Gate A", node_type="gate", layout_x=100.0, layout_y=100.0)
    gate_b = StadiumNode(venue_id=venue.id, name="Gate B", node_type="gate", layout_x=500.0, layout_y=100.0)
    corridor_1 = StadiumNode(venue_id=venue.id, name="Corridor 1", node_type="corridor", layout_x=300.0, layout_y=250.0)
    section_101 = StadiumNode(venue_id=venue.id, name="Section 101", node_type="section", layout_x=300.0, layout_y=500.0)
    medical_station = StadiumNode(venue_id=venue.id, name="Medical Station", node_type="medical", layout_x=100.0, layout_y=400.0)
    elevator = StadiumNode(venue_id=venue.id, name="Elevator", node_type="elevator", layout_x=500.0, layout_y=400.0)
    
    # New nodes for Fan Portal representation
    restroom_a = StadiumNode(venue_id=venue.id, name="Restroom A", node_type="restroom", layout_x=200.0, layout_y=350.0)
    food_court = StadiumNode(venue_id=venue.id, name="Food Court", node_type="food", layout_x=400.0, layout_y=350.0)
    emergency_exit = StadiumNode(venue_id=venue.id, name="Emergency Exit East", node_type="emergency_exit", layout_x=600.0, layout_y=250.0)
    
    nodes = [gate_a, gate_b, corridor_1, section_101, medical_station, elevator, restroom_a, food_court, emergency_exit]
    db.add_all(nodes)
    db.commit()
    
    print("Seeding Edges...")
    edges = [
        StadiumEdge(source_id=gate_a.id, target_id=corridor_1.id, distance=50.0, is_accessible=True),
        StadiumEdge(source_id=corridor_1.id, target_id=gate_a.id, distance=50.0, is_accessible=True),
        
        StadiumEdge(source_id=gate_b.id, target_id=corridor_1.id, distance=60.0, is_accessible=False),
        StadiumEdge(source_id=corridor_1.id, target_id=gate_b.id, distance=60.0, is_accessible=False),
        
        StadiumEdge(source_id=corridor_1.id, target_id=section_101.id, distance=20.0, is_accessible=True),
        StadiumEdge(source_id=section_101.id, target_id=corridor_1.id, distance=20.0, is_accessible=True),
        
        StadiumEdge(source_id=corridor_1.id, target_id=medical_station.id, distance=30.0, is_accessible=True),
        StadiumEdge(source_id=medical_station.id, target_id=corridor_1.id, distance=30.0, is_accessible=True),
        
        StadiumEdge(source_id=corridor_1.id, target_id=elevator.id, distance=15.0, is_accessible=True),
        StadiumEdge(source_id=elevator.id, target_id=corridor_1.id, distance=15.0, is_accessible=True),
        
        StadiumEdge(source_id=corridor_1.id, target_id=restroom_a.id, distance=10.0, is_accessible=True),
        StadiumEdge(source_id=restroom_a.id, target_id=corridor_1.id, distance=10.0, is_accessible=True),
        
        StadiumEdge(source_id=corridor_1.id, target_id=food_court.id, distance=15.0, is_accessible=True),
        StadiumEdge(source_id=food_court.id, target_id=corridor_1.id, distance=15.0, is_accessible=True),
        
        StadiumEdge(source_id=corridor_1.id, target_id=emergency_exit.id, distance=40.0, is_accessible=True),
        StadiumEdge(source_id=emergency_exit.id, target_id=corridor_1.id, distance=40.0, is_accessible=True),
    ]
    db.add_all(edges)
    db.commit()

    print("Seeding Node States...")
    for node in nodes:
        # Gates initialized with 300, others 0
        occ = 350.0 if node.node_type == 'gate' else 0.0
        state = NodeState(node_id=node.id, status="normal", occupancy=occ)
        db.add(state)
    db.commit()

    print("Seeding Users & Roles...")
    user_manager = User(email="manager@stadiumstan.demo", name="Manager")
    user_volunteer = User(email="volunteer1@stadiumstan.demo", name="Volunteer 1")
    db.add_all([user_manager, user_volunteer])
    db.commit()
    
    role_manager = UserRole(user_id=user_manager.id, role="manager")
    role_volunteer = UserRole(user_id=user_volunteer.id, role="volunteer")
    db.add_all([role_manager, role_volunteer])
    db.commit()

    print("Seeding Staff vol-1...")
    staff_volunteer = Staff(id="vol-1", user_id=user_volunteer.id, venue_id=venue.id, role="volunteer", current_node_id=gate_a.id)
    db.add(staff_volunteer)
    db.commit()

    print("Seeding Initial Active & Completed Incidents...")
    inc_resolved = Incident(
        venue_id=venue.id,
        node_id=gate_b.id,
        incident_type="equipment_failure",
        severity="medium",
        status="resolved"
    )
    inc_open = Incident(
        venue_id=venue.id,
        node_id=section_101.id,
        incident_type="crowd_congestion",
        severity="high",
        status="open"
    )
    inc_lost = Incident(
        venue_id=venue.id,
        node_id=food_court.id,
        incident_type="lost_person",
        severity="high",
        status="open"
    )
    inc_blocked = Incident(
        venue_id=venue.id,
        node_id=corridor_1.id,
        incident_type="blocked_path",
        severity="medium",
        status="open"
    )
    db.add_all([inc_resolved, inc_open, inc_lost, inc_blocked])
    db.commit()

    print("Seeding Response Actions...")
    ra = ResponseAction(
        incident_id=inc_open.id,
        node_id=section_101.id,
        action="Clear Corridor to Corridor 1",
        status="pending",
        operational_summary="High crowd congestion detected at Section 101. Request corridor clearance protocols.",
        evidence=["Occupancy above 85% at Section 101.", "Simulation indicates clearing Corridor 1 reduces risk by 20%."],
        timeline=[
            {
                "event_type": "INCIDENT_REPORTED",
                "timestamp": "2026-07-15T07:00:00Z",
                "actor": "system",
                "notes": "Automated alarm: crowd congestion detected."
            },
            {
                "event_type": "AI_RECOMMENDATION_GENERATED",
                "timestamp": "2026-07-15T07:00:05Z",
                "actor": "ai_agent",
                "notes": "AI recommendation generated. Action: Clear Corridor."
            }
        ]
    )
    db.add(ra)
    db.commit()

    ra_lost = ResponseAction(
        incident_id=inc_lost.id,
        node_id=food_court.id,
        action="Broadcast Missing Child Alert to MetLife Stadium",
        status="pending",
        operational_summary="Lost child reported at Food Court. Security dispatched to scan coordinates and broadcast safety alert.",
        evidence=["Report submitted by parent at Food Court information desk.", "Security cameras show last known position near restroom entrance."],
        timeline=[
            {
                "event_type": "INCIDENT_REPORTED",
                "timestamp": "2026-07-15T07:15:00Z",
                "actor": "fan",
                "notes": "Parent reported lost child (5yo, blue t-shirt) at Food Court."
            },
            {
                "event_type": "AI_RECOMMENDATION_GENERATED",
                "timestamp": "2026-07-15T07:15:12Z",
                "actor": "ai_agent",
                "notes": "AI recommendation generated: Broadcast child description and alert nearby security patrols."
            }
        ]
    )
    db.add(ra_lost)
    db.commit()

    ra_blocked = ResponseAction(
        incident_id=inc_blocked.id,
        node_id=corridor_1.id,
        action="Deploy Security Staff to Corridor 1",
        status="pending",
        operational_summary="Temporary obstruction blocking Corridor 1 walkway. Dispatch security patrol to clear barriers.",
        evidence=["Multiple fan feedback alerts flagging blocked path.", "Corridor occupancy flow rates dropped by 45%."],
        timeline=[
            {
                "event_type": "INCIDENT_REPORTED",
                "timestamp": "2026-07-15T07:20:00Z",
                "actor": "volunteer",
                "notes": "Walkway path blocked by misplaced event signage."
            },
            {
                "event_type": "AI_RECOMMENDATION_GENERATED",
                "timestamp": "2026-07-15T07:20:07Z",
                "actor": "ai_agent",
                "notes": "AI recommendation generated: Deploy staff to relocate barricades."
            }
        ]
    )
    db.add(ra_blocked)
    db.commit()

    ra_resolved = ResponseAction(
        incident_id=inc_resolved.id,
        node_id=gate_b.id,
        action="Fix Turnstile to Gate B",
        status="approved",
        execution_status="COMPLETED",
        execution_result={"success": True, "message": "Turnstile rebooted."},
        operational_summary="Gate B turnstile failure. Requesting check-in and reboot.",
        evidence=["Gate B flow rate dropped to 0.", "Turnstile status reported offline."],
        timeline=[
            {
                "event_type": "INCIDENT_REPORTED",
                "timestamp": "2026-07-15T06:30:00Z",
                "actor": "volunteer",
                "notes": "Equipment failure reported at Gate B."
            },
            {
                "event_type": "AI_RECOMMENDATION_GENERATED",
                "timestamp": "2026-07-15T06:30:10Z",
                "actor": "ai_agent",
                "notes": "AI recommendation generated: Dispatch technician."
            },
            {
                "event_type": "APPROVED",
                "timestamp": "2026-07-15T06:31:00Z",
                "actor": "manager",
                "notes": "Manager approved turnstile reboot dispatch."
            },
            {
                "event_type": "VOLUNTEER_COMPLETED",
                "timestamp": "2026-07-15T06:40:00Z",
                "actor": "volunteer",
                "notes": "Turnstile rebooted. Flow rate restored."
            }
        ]
    )
    db.add(ra_resolved)
    db.commit()

    print("Seeding Assignments...")
    assignment_resolved = Assignment(
        action_id=ra_resolved.id,
        volunteer_id=staff_volunteer.id,
        incident_id=inc_resolved.id,
        location_node_id=gate_b.id,
        status="completed",
        priority="normal"
    )
    db.add(assignment_resolved)
    db.commit()

    print("Seeding Telemetry History Events...")
    telemetry_list = [
        TelemetryEvent(node_id=gate_a.id, event_type="CROWD_ARRIVAL", payload={"target_node": gate_a.id, "people_count": 220}),
        TelemetryEvent(node_id=gate_b.id, event_type="CROWD_ARRIVAL", payload={"target_node": gate_b.id, "people_count": 180}),
        TelemetryEvent(node_id=gate_a.id, event_type="GATE_STATUS_CHANGE", payload={"target_node": gate_a.id, "status": "normal"}),
        TelemetryEvent(node_id=gate_b.id, event_type="GATE_STATUS_CHANGE", payload={"target_node": gate_b.id, "status": "normal"}),
    ]
    db.add_all(telemetry_list)
    db.commit()


    print("Seed complete.")
    db.close()

if __name__ == "__main__":
    seed_database()
