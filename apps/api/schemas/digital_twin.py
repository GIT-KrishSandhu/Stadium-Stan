from pydantic import BaseModel
from typing import List

class NodeResponse(BaseModel):
    id: str
    venue_id: str
    name: str
    node_type: str
    layout_x: float = 0.0
    layout_y: float = 0.0

    class Config:
        from_attributes = True

class EdgeResponse(BaseModel):
    id: str
    source_id: str
    target_id: str
    distance: float

    class Config:
        from_attributes = True

class DigitalTwinResponse(BaseModel):
    venue_id: str
    nodes: List[NodeResponse]
    edges: List[EdgeResponse]

from enum import Enum

class RiskTrend(str, Enum):
    DECREASING = "DECREASING"
    STABLE = "STABLE"
    INCREASING = "INCREASING"
    SPIKE = "SPIKE"

class OccupancyPoint(BaseModel):
    t: int
    value: int

class ResourceAvailability(BaseModel):
    type: str
    available: int
    assigned: int
    estimated_arrival: int = 0

class OperationalContextResponse(BaseModel):
    current_occupancy: int
    occupancy_history: List[OccupancyPoint]
    occupancy_forecast: List[OccupancyPoint]
    current_risk: float
    risk_trend: RiskTrend
    incidents: List[dict] = []
    resources: List[ResourceAvailability] = []
    metadata: dict = {}
    accessibility: bool = True
