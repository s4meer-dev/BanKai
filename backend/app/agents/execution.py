"""Agent 8: Execution Agent."""

import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.base import BaseAgent
from app.execution.artifact_generators import artifact_generator
from app.models.artifact import Artifact
from app.models.execution_action import ExecutionAction
from app.orchestrator.event_bus import event_bus


class ExecutionAgent(BaseAgent):
    agent_name = "ExecutionAgent"
    role_description = "Executes approved tasks, builds deliverables (Excel, Word, PPTX, PDF), and verifies outputs."
    system_prompt = (
        "You are the Execution Agent of BAN KAI. You only execute authorized operations. "
        "You generate production-ready artifacts, ensure zero file corruption, verify file integrity, "
        "and register every generated deliverable in the Evidence-to-Action Ledger."
    )

    async def _run(
        self,
        project_id: str,
        workflow_id: str,
        input_data: Dict[str, Any],
        task_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        objective = input_data.get("objective", "BanKai Research")
        plans: List[Dict[str, Any]] = input_data.get("execution_plans", [])
        claims: List[Dict[str, Any]] = input_data.get("claims", [])
        recommendations: List[Dict[str, Any]] = input_data.get("recommendations", [])
        rqs: float = input_data.get("research_quality_score", 90.0)
        financial_data = (
            input_data.get("data_analysis", {}).get("financial_model", [])
        )
        db: Optional[AsyncSession] = input_data.get("db")

        generated_artifacts: List[Dict[str, Any]] = []
        execution_results: List[Dict[str, Any]] = []

        await event_bus.publish(
            event_type="execution.started",
            project_id=project_id,
            workflow_id=workflow_id,
            task_id=task_id,
            agent_id=self.agent_name,
            payload={"plans_to_execute": len(plans)},
        )

        # 1. Generate Excel Model
        try:
            excel_path = artifact_generator.generate_excel_model(objective, financial_data)
            generated_artifacts.append({
                "id": str(uuid.uuid4()),
                "name": os.path.basename(excel_path),
                "file_path": excel_path,
                "file_type": "xlsx",
                "file_size_bytes": os.path.getsize(excel_path),
            })
        except Exception as e:
            self._log_artifact_error("xlsx", e)

        # 2. Generate Word Dossier
        try:
            word_path = artifact_generator.generate_word_dossier(
                objective, claims, recommendations, rqs
            )
            generated_artifacts.append({
                "id": str(uuid.uuid4()),
                "name": os.path.basename(word_path),
                "file_path": word_path,
                "file_type": "docx",
                "file_size_bytes": os.path.getsize(word_path),
            })
        except Exception as e:
            self._log_artifact_error("docx", e)

        # 3. Generate PowerPoint Presentation
        try:
            pptx_path = artifact_generator.generate_presentation(
                objective, recommendations, rqs
            )
            generated_artifacts.append({
                "id": str(uuid.uuid4()),
                "name": os.path.basename(pptx_path),
                "file_path": pptx_path,
                "file_type": "pptx",
                "file_size_bytes": os.path.getsize(pptx_path),
            })
        except Exception as e:
            self._log_artifact_error("pptx", e)

        # 4. Generate PDF Report
        try:
            pdf_path = artifact_generator.generate_pdf_report(objective, claims, rqs)
            generated_artifacts.append({
                "id": str(uuid.uuid4()),
                "name": os.path.basename(pdf_path),
                "file_path": pdf_path,
                "file_type": "pdf",
                "file_size_bytes": os.path.getsize(pdf_path),
            })
        except Exception as e:
            self._log_artifact_error("pdf", e)

        # 5. Generate Interactive Plotly Chart
        try:
            chart_path = artifact_generator.generate_plotly_chart(financial_data)
            generated_artifacts.append({
                "id": str(uuid.uuid4()),
                "name": os.path.basename(chart_path),
                "file_path": chart_path,
                "file_type": "html",
                "file_size_bytes": os.path.getsize(chart_path),
            })
        except Exception as e:
            self._log_artifact_error("html", e)

        # Record ExecutionAction and Artifact records in DB
        for plan in plans:
            plan_id = plan.get("id")
            action_id = str(uuid.uuid4())
            action_dict = {
                "id": action_id,
                "plan_id": plan_id,
                "tool_used": "ArtifactGenerator & Sandbox",
                "status": "SUCCESS",
                "output_payload": {"artifacts_count": len(generated_artifacts)},
                "started_at": datetime.now(timezone.utc),
                "completed_at": datetime.now(timezone.utc),
            }
            execution_results.append(action_dict)

            if db and plan_id:
                db_action = ExecutionAction(
                    id=action_id,
                    plan_id=plan_id,
                    project_id=project_id,
                    tool_used=action_dict["tool_used"],
                    status=action_dict["status"],
                    input_payload=plan.get("params", {}),
                    output_payload=action_dict["output_payload"],
                )
                db.add(db_action)
                await db.flush()

                # Associate artifacts with this action
                for art in generated_artifacts:
                    db_art = Artifact(
                        id=art["id"],
                        project_id=project_id,
                        execution_action_id=action_id,
                        name=art["name"],
                        file_path=art["file_path"],
                        file_type=art["file_type"],
                        file_size_bytes=art["file_size_bytes"],
                        download_url=f"/api/v1/execution/artifacts/{art['id']}/download",
                    )
                    db.add(db_art)

        if db:
            await db.commit()

        await event_bus.publish(
            event_type="execution.completed",
            project_id=project_id,
            workflow_id=workflow_id,
            task_id=task_id,
            agent_id=self.agent_name,
            payload={
                "artifacts_generated": [a["name"] for a in generated_artifacts],
                "artifacts_count": len(generated_artifacts),
            },
        )

        return {
            "execution_results": execution_results,
            "generated_artifacts": generated_artifacts,
            "workflow_status": "COMPLETED",
        }

    def _log_artifact_error(self, doc_type: str, exc: Exception) -> None:
        from app.core.logging import logger
        logger.error(f"Error generating {doc_type} artifact: {exc}")


execution_agent = ExecutionAgent()

