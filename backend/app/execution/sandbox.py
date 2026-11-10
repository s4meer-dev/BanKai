"""Isolated execution sandbox with AST validation, subprocess isolation, and resource caps."""

import asyncio
import os
import sys
import tempfile
import time
from typing import Dict, List, Optional
from app.core.config import settings
from app.core.logging import logger
from app.execution.ast_guard import validate_python_code
from app.schemas.execution import CodeExecutionResponse


class ExecutionSandbox:
    """Executes validated Python code in an isolated temporary environment."""

    def __init__(self, timeout_seconds: int = 30) -> None:
        self.timeout = timeout_seconds
        self.scratch_dir = settings.SCRATCH_STORAGE_DIR
        os.makedirs(self.scratch_dir, exist_ok=True)

    async def run_code(
        self,
        code: str,
        timeout_seconds: Optional[int] = None,
        project_id: Optional[str] = None,
    ) -> CodeExecutionResponse:
        """Validates code with AST, runs it in an isolated subprocess, and captures outputs."""
        timeout = timeout_seconds or self.timeout
        start_time = time.perf_counter()

        # Step 1: AST Security Validation
        is_safe, violations = validate_python_code(code)
        if not is_safe:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.warning(f"Security violation detected in code: {violations}")
            return CodeExecutionResponse(
                status="SECURITY_VIOLATION",
                stdout="",
                stderr="Security Policy Rejection:\n" + "\n".join(f"- {v}" for v in violations),
                exit_code=-1,
                duration_ms=duration_ms,
                generated_files=[],
            )

        # Step 2: Write code to an isolated tempfile
        prefix = f"bankai_{project_id or 'exec'}_"
        temp_file = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                suffix=".py",
                prefix=prefix,
                dir=self.scratch_dir,
                delete=False,
                encoding="utf-8",
            ) as f:
                temp_file = f.name
                f.write(code)

            # Step 3: Run in subprocess with timeout
            process = await asyncio.create_subprocess_exec(
                sys.executable,
                temp_file,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=self.scratch_dir,
            )

            try:
                stdout_data, stderr_data = await asyncio.wait_for(
                    process.communicate(), timeout=timeout
                )
                stdout = stdout_data.decode("utf-8", errors="replace")
                stderr = stderr_data.decode("utf-8", errors="replace")
                exit_code = process.returncode or 0
                status = "SUCCESS" if exit_code == 0 else "FAILED"
            except asyncio.TimeoutError:
                process.kill()
                stdout = ""
                stderr = f"Execution exceeded maximum timeout of {timeout} seconds."
                exit_code = -1
                status = "FAILED"

            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            return CodeExecutionResponse(
                status=status,
                stdout=stdout,
                stderr=stderr,
                exit_code=exit_code,
                duration_ms=duration_ms,
                generated_files=[],
            )

        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(f"Execution error: {exc}")
            return CodeExecutionResponse(
                status="FAILED",
                stdout="",
                stderr=str(exc),
                exit_code=1,
                duration_ms=duration_ms,
                generated_files=[],
            )
        finally:
            if temp_file and os.path.exists(temp_file):
                try:
                    os.remove(temp_file)
                except Exception:
                    pass


sandbox = ExecutionSandbox()

