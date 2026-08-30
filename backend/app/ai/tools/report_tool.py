import os
from datetime import datetime

from langchain_core.tools import tool

REPORTS_DIR = "reports"


@tool
def generate_report(title: str, content: str) -> str:
    """
    Generate a downloadable text report from summarized or researched content.
    Use this only when the user explicitly asks to export, save, or generate
    a report/document — not for a normal chat answer.

    Args:
        title: Short title for the report, used to name the file.
        content: The full report body text.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)
    safe_title = "".join(
        c if c.isalnum() or c in (" ", "_", "-") else "" for c in title
    )
    filename = f"{REPORTS_DIR}/{safe_title.replace(' ', '_')}_{datetime.now():%Y%m%d%H%M%S}.txt"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"{title}\n\n{content}")

    return f"Report generated: {filename}"
