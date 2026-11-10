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


def test_dunder_subclass_traversal_blocked():
    """Verifies that Python MRO and subclass traversal exploits are blocked by AST."""
    dunder_code = """
x = ().__class__.__bases__[0].__subclasses__()
"""
    is_safe, violations = validate_python_code(dunder_code)
    assert is_safe is False
    assert any("__subclasses__" in v or "__bases__" in v for v in violations)


def test_importlib_blocked():
    """Verifies dynamic module loading via importlib is strictly blocked."""
    importlib_code = """
import importlib
mod = importlib.import_module("os")
"""
    is_safe, violations = validate_python_code(importlib_code)
    assert is_safe is False
    assert any("importlib" in v for v in violations)


def test_network_egress_modules_blocked():
    """Verifies that unauthorized outbound networking libraries are forbidden."""
    for mod in ["requests", "httpx", "urllib"]:
        code = f"import {mod}"
        is_safe, violations = validate_python_code(code)
        assert is_safe is False, f"Module {mod} was unexpectedly allowed"


def test_validate_or_raise_helper():
    from app.execution.ast_guard import SecurityViolationError, validate_or_raise

    with pytest.raises(SecurityViolationError):
        validate_or_raise("import sys; sys.exit(1)")

    # Should not raise
    validate_or_raise("x = 42\ny = x * 2")


