import sys
import os
import pytest
from unittest.mock import MagicMock

# Mock langchain_community for tests before any import
mock_chat_class = MagicMock()
mock_module = MagicMock()
mock_module.ChatLiteLLM = mock_chat_class
sys.modules["langchain_community"] = mock_module
sys.modules["langchain_community.chat_models"] = mock_module

from packages.agents.llm import get_llm, MockLLM

@pytest.fixture
def mock_env():
    # Store old env and mock
    old_env = dict(os.environ)
    yield
    # Restore
    os.environ.clear()
    os.environ.update(old_env)

def test_mockllm_fallback_without_keys(mock_env):
    """
    Test 3: MockLLM still works without keys.
    """
    os.environ["LLM_PROVIDER"] = "groq"
    if "GROQ_API_KEY" in os.environ:
        del os.environ["GROQ_API_KEY"]
        
    llm = get_llm()
    assert isinstance(llm, MockLLM)

def test_groq_provider_format_and_model_switching(mock_env):
    """
    Test 1 & 2: Changing LLM_MODEL changes model without code mod, and Groq creates correct format.
    """
    os.environ["LLM_PROVIDER"] = "groq"
    os.environ["GROQ_API_KEY"] = "fake_key"
    
    # Default behavior test
    if "LLM_MODEL" in os.environ:
        del os.environ["LLM_MODEL"]
        
    mock_chat_class.reset_mock()
    llm = get_llm()
    # It should fallback to llama-3.3-70b-versatile with groq prefix
    mock_chat_class.assert_called_with(model="groq/llama-3.3-70b-versatile")
    
    # Custom model switching test
    os.environ["LLM_MODEL"] = "gemma2-9b-it"
    llm = get_llm()
    mock_chat_class.assert_called_with(model="groq/gemma2-9b-it")

def test_azure_provider_validation(mock_env):
    """
    Azure test for validation of explicit deployment model name.
    """
    os.environ["LLM_PROVIDER"] = "azure"
    os.environ["AZURE_AI_ENDPOINT"] = "fake_endpoint"
    os.environ["AZURE_AI_KEY"] = "fake_key"
    
    # Missing LLM_MODEL should fallback to MockLLM
    if "LLM_MODEL" in os.environ:
        del os.environ["LLM_MODEL"]
        
    llm = get_llm()
    assert isinstance(llm, MockLLM)
    
    # Explicit LLM_MODEL
    os.environ["LLM_MODEL"] = "gpt-4-deployment"
    
    # Mock litellm settings inside llm.py
    import packages.agents.llm
    packages.agents.llm.litellm = MagicMock()
    
    mock_chat_class.reset_mock()
    llm = get_llm()
    mock_chat_class.assert_called_with(model="azure/gpt-4-deployment")
    assert packages.agents.llm.litellm.api_base == "fake_endpoint"
    assert packages.agents.llm.litellm.api_key == "fake_key"
