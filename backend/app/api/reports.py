from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from typing import Optional

from app.auth.dependencies import require_faculty
from app.services import attendance_service
from app.services.report_service import generate_csv, generate_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/export")
async def export_report(
    format: str = Query("csv", regex="^(csv|pdf)$"),
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    subject_id: Optional[str] = None,
    faculty_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(require_faculty)
):
    """Export attendance report as CSV or PDF."""
    result = await attendance_service.get_attendance_list(
        page=1, page_size=5000,
        date_from=date_from, date_to=date_to,
        subject_id=subject_id, faculty_id=faculty_id, status=status
    )
    records = result.get("records", [])

    if format == "csv":
        content = generate_csv(records)
        return Response(
            content=content,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=attendance_report.csv"}
        )
    else:
        content = generate_pdf(records)
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=attendance_report.pdf"}
        )
