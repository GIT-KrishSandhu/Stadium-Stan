import os
import json
from typing import Optional, Dict, Any, Type, Union
from pydantic import BaseModel

# Try to import litellm, fallback for mock testing if not fully installed in environment
try:
    import litellm
except ImportError:
    litellm = None

class MockLLM:
    """Mock LLM for deterministic testing and local development without API keys."""
    def __init__(self, default_response: Optional[BaseModel] = None):
        self.default_response = default_response
        self.last_prompt = None
        self.last_kwargs = None

    def with_structured_output(self, schema: Type[BaseModel]):
        # Store schema to mock returning it later
        self.schema = schema
        return self

    def invoke(self, messages: list, **kwargs) -> BaseModel:
        self.last_prompt = messages
        self.last_kwargs = kwargs
        
        # If a default response was provided, return it
        if self.default_response:
            return self.default_response
            
        # Otherwise, attempt to construct a dummy valid response based on schema
        if hasattr(self, 'schema'):
            # This is a very simplistic mock generation. In tests, we inject specific responses.
            if self.schema.__name__ == "AgentResponse":
                from .schemas import AgentResponse, OperationalRecommendation, CommunicationPlan, ActionItem
                return AgentResponse(
                    recommendation=OperationalRecommendation(
                        action_type="MOCK_ACTION",
                        priority="MEDIUM",
                        reasoning_summary="Mock reasoning.",
                        evidence=["Mock evidence 1"],
                        confidence=0.9,
                        required_approval=True,
                        actions=[ActionItem(action="Mock Action", target="Mock Target")]
                    ),
                    communication=CommunicationPlan(
                        manager_message="Mock manager msg",
                        volunteer_message="Mock volunteer msg",
                        fan_message="Mock fan msg"
                    )
                )
            
            # Fallback for generic schemas
            try:
                return self.schema()
            except Exception:
                pass
                
        return None

def get_llm():
    """
    Returns configured model client based on environment variables.
    Falls back to MockLLM if keys/configuration are not present.
    """
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    
    if provider == "mock":
        return MockLLM()
        
    if not litellm:
        print("Warning: litellm not installed. Falling back to MockLLM.")
        return MockLLM()
        
    if provider == "groq":
        if not os.getenv("GROQ_API_KEY"):
            print("Configuration Error: Missing GROQ_API_KEY")
            return MockLLM()
            
        model = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
        prefixed_model = f"groq/{model}"
        
        try:
            from langchain_community.chat_models import ChatLiteLLM
        except ImportError:
            if "ChatLiteLLM" in globals():
                ChatLiteLLM = globals()["ChatLiteLLM"]
            else:
                print("Warning: langchain_community not installed. Falling back to MockLLM.")
                return MockLLM()
        return ChatLiteLLM(model=prefixed_model)
            
    if provider == "azure":
        if not os.getenv("AZURE_AI_ENDPOINT") or not os.getenv("AZURE_AI_KEY"):
            print("Configuration Error: Missing AZURE_AI_ENDPOINT or AZURE_AI_KEY")
            return MockLLM()
            
        model = os.getenv("LLM_MODEL")
        if not model:
            print("Configuration Error: Azure requires an explicit LLM_MODEL deployment name")
            return MockLLM()
            
        prefixed_model = f"azure/{model}"
        
        try:
            from langchain_community.chat_models import ChatLiteLLM
        except ImportError:
            if "ChatLiteLLM" in globals():
                ChatLiteLLM = globals()["ChatLiteLLM"]
            else:
                print("Warning: langchain_community not installed. Falling back to MockLLM.")
                return MockLLM()
        # Configure LiteLLM for Azure
        litellm.api_base = os.getenv("AZURE_AI_ENDPOINT")
        litellm.api_key = os.getenv("AZURE_AI_KEY")
        return ChatLiteLLM(model=prefixed_model)

    # Default fallback
    return MockLLM()
