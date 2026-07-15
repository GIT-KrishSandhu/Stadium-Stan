from typing import Dict, Any
import asyncio
from ...digital_twin.simulation.scenario import SimulationEngine

def simulate_action(action: str, target: str) -> Dict[str, Any]:
    """
    Wraps existing simulation engine.
    Predicts the operational impact of an action using dry-run/preview mode.
    Agents only use commit=False.
    """
    engine = SimulationEngine(event_bus=None) # Event bus not needed for dry run
    
    # SimulationEngine.simulate_action is async, but this tool is currently synchronous
    # for simplicity in agent workflows. We use asyncio.run or loop run_until_complete.
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # In a real environment with running loop, we'd handle this differently or make the workflow async
            # For testing, a new loop or nest_asyncio might be needed, but we'll mock it synchronously for now
            pass
    except RuntimeError:
        pass
        
    return asyncio.run(engine.simulate_action(venue_id="metlife", action=action, target=target, commit=False))
