from pydantic import BaseModel, Field
from typing import List, Optional

class ActionItem(BaseModel):
    action: str = Field(description="The specific action to perform, e.g., 'Dispatch Medical Team 2'")
    target: Optional[str] = Field(None, description="The target of the action, e.g., 'Gate A' or 'Section 120'")

class ImprovementEstimate(BaseModel):
    baseline_risk: float
    predicted_risk: float
    improvement_percentage: float

class RecommendationMetrics(BaseModel):
    confidence: float
    operational_urgency: str
    operational_impact: str
    predicted_risk_reduction: float
    estimated_execution_time: int # minutes
    required_resources: List[dict]
    reversibility: str

class TimelineEvent(BaseModel):
    event_type: str
    timestamp: str
    actor: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    notes: Optional[str] = None

class ExecutionResult(BaseModel):
    success: bool
    execution_duration: int # ms
    affected_nodes: List[str]
    affected_resources: List[str]
    events_published: int
    message: str
    metadata: Optional[dict] = None

class AlternativeRecommendation(BaseModel):
    title: str
    simulation_reference: str
    predicted_risk: float
    confidence: float
    reason_rejected: str

class OperationalRecommendation(BaseModel):
    action_type: str = Field(description="Type of action, e.g., 'CROWD_ACTION', 'INCIDENT_RESPONSE'")
    priority: str = Field(description="Priority level: LOW, MEDIUM, HIGH, CRITICAL")
    reasoning_summary: str = Field(description="Summary of the reasoning behind the recommendation")
    evidence: List[str] = Field(description="List of evidence points supporting the recommendation")
    metrics: Optional[RecommendationMetrics] = Field(default=None, description="Strongly typed metrics for the decision object")
    confidence: Optional[float] = Field(default=None, description="Confidence score")
    required_approval: bool = Field(default=True, description="Whether human approval is required (should be True for operations)")
    actions: List[ActionItem] = Field(description="List of specific actions to be approved")
    improvement_estimate: ImprovementEstimate = Field(default_factory=lambda: ImprovementEstimate(baseline_risk=0.0, predicted_risk=0.0, improvement_percentage=0.0))
    alternatives: List[AlternativeRecommendation] = Field(default_factory=list)

class CommunicationPlan(BaseModel):
    manager_message: str = Field(description="Technical explanation with operational details, evidence, and confidence")
    volunteer_message: str = Field(description="Short actionable instruction for volunteers")
    fan_message: str = Field(description="Simple, reassuring guidance for fans")

class AgentResponse(BaseModel):
    recommendation: OperationalRecommendation
    communication: CommunicationPlan
    route: Optional[dict] = None

