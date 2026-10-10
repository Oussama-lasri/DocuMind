import json
import re
from pathlib import Path
from typing import Annotated
from uuid import uuid4

from langchain_core.tools import tool
from langgraph.prebuilt import InjectedState

REPORTS_DIR = Path(__file__).resolve().parents[1] / "reports"


@tool
def generate_report(
    title: str,
    content: str,
    user_id: Annotated[int, InjectedState("user_id")],
) -> str:
    """
    Generate a downloadable text report from summarized or researched content.
    Use this only when the user explicitly asks to export, save, or generate
    a report/document — not for a normal chat answer.

    Args:
        title: Short title for the report, used to name the file.
        content: The full report body text.
    """
    report_id = uuid4().hex
    safe_title = re.sub(r"[^A-Za-z0-9_-]+", "_", title).strip("_") or "report"
    filename = f"{safe_title[:80]}_{report_id[:8]}.txt"
    report_dir = REPORTS_DIR / str(user_id)
    report_dir.mkdir(parents=True, exist_ok=True)

    with (report_dir / f"{report_id}.txt").open("w", encoding="utf-8") as f:
        f.write(f"{title}\n\n{content}")

    # Keep the tool result machine-readable so the API can expose an
    # authenticated download URL without revealing the server file path.
    return json.dumps({"report_id": report_id, "filename": filename})


