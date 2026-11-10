"""Tests for Python AST safety guard."""

import pytest
from app.execution.ast_guard import validate_python_code


def test_safe_code_passes():
    safe_code = """
import numpy as np
import pandas as pd

data = [1, 2, 3, 4, 5]
mean_val = np.mean(data)
df = pd.DataFrame({'nums': data})
print(f"Mean: {mean_val}")
"""
    is_safe, violations = validate_python_code(safe_code)
    assert is_safe is True
    assert len(violations) == 0


def test_dangerous_os_import_blocked():
    malicious_code = """
import os
os.system('rm -rf /')
"""
    is_safe, violations = validate_python_code(malicious_code)
    assert is_safe is False
    assert any("os" in v for v in violations)


def test_eval_blocked():
    eval_code = """
x = eval("__import__('os').system('ls')")
"""
    is_safe, violations = validate_python_code(eval_code)
    assert is_safe is False
    assert any("eval" in v for v in violations)


def test_subprocess_blocked():
    subp_code = """
import subprocess
subprocess.run(['echo', 'pwned'])
"""
    is_safe, violations = validate_python_code(subp_code)
    assert is_safe is False
    assert any("subprocess" in v for v in violations)
