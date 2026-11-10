"""AST Security Validator for Python code execution."""

import ast
from typing import List, Tuple


class SecurityViolationError(Exception):
    """Raised when Python code violates the AST execution security policy."""

    def __init__(self, violations: List[str]) -> None:
        self.violations = violations
        super().__init__(f"Security Policy Violation: {'; '.join(violations)}")


class SecurityVisitor(ast.NodeVisitor):
    """Inspects AST nodes for dangerous imports, system calls, attribute traversal, and evasion tactics."""

    FORBIDDEN_MODULES = {
        "os", "sys", "subprocess", "socket", "shutil", "posix", "nt",
        "pty", "signal", "ctypes", "multiprocessing", "pickle", "_thread",
        "winreg", "msvcrt", "builtins", "importlib", "pathlib", "urllib",
        "requests", "httpx", "http", "ftplib", "telnetlib", "tempfile",
        "code", "codeop", "compileall", "webbrowser"
    }

    FORBIDDEN_CALLS = {
        "eval", "exec", "__import__", "compile", "open", "breakpoint",
        "globals", "locals", "vars", "getattr", "setattr", "delattr",
        "input", "help", "quit", "exit"
    }

    FORBIDDEN_ATTRIBUTES = {
        "__subclasses__", "__bases__", "__base__", "__mro__", "__globals__",
        "__code__", "__builtins__", "__import__", "__dict__",
        "system", "popen", "spawn", "fork", "execv", "kill", "unlink", "remove", "rmdir"
    }

    def __init__(self) -> None:
        self.violations: List[str] = []

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            base_module = alias.name.split(".")[0]
            if base_module in self.FORBIDDEN_MODULES:
                self.violations.append(f"Forbidden module import: '{alias.name}'")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        if node.module:
            base_module = node.module.split(".")[0]
            if base_module in self.FORBIDDEN_MODULES:
                self.violations.append(f"Forbidden from-import: '{node.module}'")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        # Check direct calls like eval(), exec(), open()
        if isinstance(node.func, ast.Name):
            if node.func.id in self.FORBIDDEN_CALLS:
                self.violations.append(f"Forbidden function call: '{node.func.id}()'")
        # Check attribute calls like os.system() or obj.__subclasses__()
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in self.FORBIDDEN_ATTRIBUTES or node.func.attr in self.FORBIDDEN_CALLS:
                self.violations.append(f"Forbidden invocation on attribute: '.{node.func.attr}()'")
        self.generic_visit(node)

    def visit_Attribute(self, node: ast.Attribute) -> None:
        # Check attribute access traversal like ().__class__.__bases__
        if node.attr in self.FORBIDDEN_ATTRIBUTES:
            self.violations.append(f"Forbidden dunder attribute access: '.{node.attr}'")
        self.generic_visit(node)


def validate_python_code(code_str: str) -> Tuple[bool, List[str]]:
    """Parses and checks Python code against the security policy."""
    try:
        tree = ast.parse(code_str)
        visitor = SecurityVisitor()
        visitor.visit(tree)
        if visitor.violations:
            return False, visitor.violations
        return True, []
    except SyntaxError as e:
        return False, [f"Syntax error in code: {e}"]


def validate_or_raise(code_str: str) -> None:
    """Validates code and raises SecurityViolationError if any rule is breached."""
    is_safe, violations = validate_python_code(code_str)
    if not is_safe:
        raise SecurityViolationError(violations)
