import pytest
from packages.agents.llm import get_llm, MockLLM
from packages.agents.schemas import AgentResponse, OperationalRecommendation, ActionItem, CommunicationPlan
from packages.agents.workflows.crowd_workflow import run_crowd_workflow
from packages.agents.workflows.incident_workflow import run_incident_workflow
from packages.agents.workflows.routing_workflow import run_routing_workflow
from pydantic import ValidationError

def test_mock_llm_works_without_api_key():
    # Force mock
    import os
    os.environ["LLM_PROVIDER"] = "mock"
    llm = get_llm()
    assert isinstance(llm, MockLLM)
    
    # Test unstructured fallback
    result = llm.invoke([{"role": "user", "content": "hi"}])
    assert result is None
    
    # Test structured
    llm = llm.with_structured_output(AgentResponse)
    result = llm.invoke([{"role": "user", "content": "test"}])
    assert isinstance(result, AgentResponse)
    assert result.recommendation.action_type == "MOCK_ACTION"

def test_crowd_workflow_multiple_interventions():
    event_data = {"venue_id": "metlife", "context_type": "crowd_risk"}
    response = run_crowd_workflow(event_data)
    
    assert response.recommendation.action_type == "CROWD_ACTION"
    # Should recommend redirect_crowd to Gate C as it has 80% reduction in simulation_tools
    assert any(action.action == "redirect_crowd" and action.target == "Gate C" for action in response.recommendation.actions)
    
    # Verify evidence includes multiple tests
    evidence_str = " ".join(response.recommendation.evidence)
    assert "redirect_crowd" in evidence_str
    assert "open_alternate_gate" in evidence_str
    assert "move_staff" in evidence_str

def test_incident_workflow_valid_actions():
    event_data = {"venue_id": "metlife", "report": "Fan collapsed Section 120"}
    response = run_incident_workflow(event_data)
    
    assert response.recommendation.action_type == "INCIDENT_RESPONSE"
    assert response.recommendation.priority == "CRITICAL"
    
    actions = response.recommendation.actions
    assert any(a.action == "Dispatch Medical Team" for a in actions)
    assert any(a.action == "Clear Corridor" for a in actions)

def test_routing_workflow_never_invents_route():
    event_data = {"start": "Entrance", "end": "Gate A", "route_type": "shortest"}
    response = run_routing_workflow(event_data)
    
    assert response.recommendation.action_type == "ROUTING_EXPLANATION"
    assert response.recommendation.actions == []  # No actions, just explanation
    assert "Entrance -> Corridor A -> Gate A" in " ".join(response.recommendation.evidence)

def test_invalid_llm_output_fails_validation():
    with pytest.raises(ValidationError):
        # Missing required fields
        OperationalRecommendation(action_type="BAD")

def test_agent_recommendations_do_not_mutate_state():
    event_data = {"venue_id": "metlife", "context_type": "crowd_risk"}
    
    # Capture initial stadium state
    from packages.agents.tools.stadium_tools import get_stadium_state
    initial_state = get_stadium_state("metlife")
    
    # Run agent recommendation
    response = run_crowd_workflow(event_data)
    
    # State should not be changed by the recommendation generation
    post_state = get_stadium_state("metlife")
    assert initial_state == post_state
    
    # Verify that the recommendation requires approval (meaning it will create a PENDING action)
    assert response.recommendation.required_approval is True
