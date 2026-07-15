from .scenario import SimulationEngine

def get_engine(event_bus):
    return SimulationEngine(event_bus)
