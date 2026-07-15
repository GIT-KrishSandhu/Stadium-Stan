import pytest
from prediction.risk_engine import calculate_node_risk, predict_congestion

def test_calculate_node_risk():
    # 50% full, no flow
    assert calculate_node_risk(50, 100, 0) == 0.5
    
    # 50% full, 10 people/min flow -> (10/100)*5 = 0.5 additional risk = 1.0
    assert calculate_node_risk(50, 100, 10) == 1.0
    
    # Cap at 1.0
    assert calculate_node_risk(100, 100, 10) == 1.0
    
    # Zero capacity
    assert calculate_node_risk(10, 0, 5) == 1.0

def test_predict_congestion():
    # 50 empty spots, filling at 10/min -> 5 minutes
    assert predict_congestion(50, 100, 10) == 5.0
    
    # Already full
    assert predict_congestion(100, 100, 10) == 0.0
    
    # Negative/zero flow
    assert predict_congestion(50, 100, 0) == -1.0
