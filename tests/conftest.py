import pytest

@pytest.fixture
def sample_machine():
    return {'machine_code': 'CNC-01', 'name': '5-Axis CNC Mill'}
