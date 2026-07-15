import json
from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, END
from .schemas import AgentResponse
from .router import route_event
from .workflows.crowd_workflow import run_crowd_workflow
from .workflows.incident_workflow import run_incident_workflow
from .workflows.routing_workflow import run_routing_workflow

class AgentState(TypedDict):
    event_data: Dict[str, Any]
    response: AgentResponse

def router_node(state: AgentState):
    """
    Decides the next workflow to execute.
    """
    workflow_name = route_event(state["event_data"])
    return workflow_name

def crowd_node(state: AgentState):
    response = run_crowd_workflow(state["event_data"])
    return {"response": response}

def incident_node(state: AgentState):
    response = run_incident_workflow(state["event_data"])
    return {"response": response}

def routing_node(state: AgentState):
    response = run_routing_workflow(state["event_data"])
    return {"response": response}

def create_agent_graph():
    """
    Creates and compiles the stateless LangGraph execution.
    """
    builder = StateGraph(AgentState)
    
    # Add nodes
    builder.add_node("crowd_workflow", crowd_node)
    builder.add_node("incident_workflow", incident_node)
    builder.add_node("routing_workflow", routing_node)
    
    # Define entry point routing
    builder.set_conditional_entry_point(
        router_node,
        {
            "crowd_workflow": "crowd_workflow",
            "incident_workflow": "incident_workflow",
            "routing_workflow": "routing_workflow"
        }
    )
    
    # All workflows end
    builder.add_edge("crowd_workflow", END)
    builder.add_edge("incident_workflow", END)
    builder.add_edge("routing_workflow", END)
    
    return builder.compile()

# Global graph instance
graph = create_agent_graph()

def analyze_event(event_data: Dict[str, Any]) -> AgentResponse:
    """
    Main entry point to run the agent graph.
    """
    initial_state = {"event_data": event_data}
    result = graph.invoke(initial_state)
    return result["response"]
