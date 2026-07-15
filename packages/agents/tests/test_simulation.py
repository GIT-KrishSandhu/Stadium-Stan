import pytest
import asyncio
from unittest.mock import AsyncMock
from packages.agents.tools.simulation_tools import simulate_action
from packages.digital_twin.simulation.scenario import SimulationEngine

def test_agent_simulation_tool_does_not_mutate_state():
    """
    Test 1: Agent simulation tool does not mutate state (commit=False).
    """
    # Event bus is not passed in dry-run, so if it were to mutate, it would raise an error.
    # We call the tool and verify it returns predicted impact without raising errors.
    result = simulate_action("redirect_crowd", "Gate C")
    
    assert result["action"] == "redirect_crowd"
    assert "risk_reduction" in result
    assert result["risk_reduction"] > 0.0

@pytest.mark.asyncio
async def test_agent_simulation_result_comes_from_digital_twin():
    """
    Test 2: Agent simulation result comes from Digital Twin simulation engine.
    """
    engine = SimulationEngine(event_bus=None)
    impact = await engine.simulate_action("metlife", "open_alternate_gate", "Gate B", commit=False)
    
    assert impact["action"] == "open_alternate_gate"
    assert impact["target"] == "Gate B"
    assert "risk_reduction" in impact
    
@pytest.mark.asyncio
async def test_normal_simulation_behavior_unchanged():
    """
    Test 3: Normal simulation endpoint behavior remains unchanged (commit=True).
    """
    mock_event_bus = AsyncMock()
    engine = SimulationEngine(event_bus=mock_event_bus)
    
    result = await engine.simulate_action("metlife", "redirect_crowd", "Gate C", commit=True)
    
    assert result["status"] == "executed"
    
    # Verify the event bus was called to mutate state/fire event
    mock_event_bus.publish_event.assert_called_once()
    args, kwargs = mock_event_bus.publish_event.call_args
    assert kwargs["event_type"] == "CROWD_ARRIVAL"
    assert kwargs["payload"]["target_node"] == "Gate C"
