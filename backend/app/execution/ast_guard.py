"""AST Security Validator for Python code execution."""

import ast
from typing import List, Tuple


class SecurityVisitor(ast.NodeVisitor):
    """Inspects AST nodes for dangerous imports, system calls, and attribute access."""

    FORBIDDEN_MODULES = {
        "os", "sys", "subprocess", "socket", "shutil", "posix", "nt",
        "pty", "signal", "ctypes", "multiprocessing", "pickle", "_thread",
        "winreg", "msvcrt", "builtins"
    }

    FORBIDDEN_CALLS = {
        "eval", "exec", "__import__", "compile", "open", "breakpoint",
        "globals", "locals", "vars", "getattr", "setattr", "delattr"
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
        # Check direct calls like eval()
        if isinstance(node.func, ast.Name):
            if node.func.id in self.FORBIDDEN_CALLS:
                self.violations.append(f"Forbidden function call: '{node.func.id}()'")
        # Check attribute calls like os.system()
        elif isinstance(node.func, ast.Attribute):
            if node.func.attr in {"system", "popen", "spawn", "fork", "execv", "kill"}:
                self.violations.append(f"Forbidden system invocation: '.{node.func.attr}()'")
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
