import csv
import io
from typing import List, Dict, Any
from datetime import datetime


def generate_csv(records: List[Dict[str, Any]]) -> bytes:
    """Generate CSV bytes from a list of attendance records."""
    if not records:
        return b"No data available"

    output = io.StringIO()
    fieldnames = [
        "Student Name", "Roll Number", "Department",
        "Subject", "Date", "Time", "Status",
        "Verification Method", "Recognition Score"
    ]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for r in records:
        ts = r.get("timestamp")
        if isinstance(ts, datetime):
            time_str = ts.strftime("%H:%M:%S")
        else:
            time_str = str(ts) if ts else ""
        writer.writerow({
            "Student Name": r.get("student_name", ""),
            "Roll Number": r.get("roll_number", ""),
            "Department": r.get("department", ""),
            "Subject": r.get("subject_name", ""),
            "Date": r.get("date", ""),
            "Time": time_str,
            "Status": r.get("status", ""),
            "Verification Method": r.get("verification_method", ""),
            "Recognition Score": f"{r.get('recognition_score', ''):.2f}" if r.get("recognition_score") else ""
        })
    return output.getvalue().encode("utf-8")


def generate_pdf(records: List[Dict[str, Any]], title: str = "Attendance Report") -> bytes:
    """Generate PDF bytes using fpdf2."""
    try:
        from fpdf import FPDF

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, title, ln=True, align="C")
        pdf.set_font("Helvetica", "", 10)
        pdf.cell(0, 6, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True, align="C")
        pdf.ln(5)

        # Table header
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(79, 70, 229)
        pdf.set_text_color(255, 255, 255)
        cols = ["Student", "Roll No", "Subject", "Date", "Status", "Method", "Score"]
        widths = [40, 25, 35, 22, 18, 18, 16]
        for col, w in zip(cols, widths):
            pdf.cell(w, 8, col, border=1, fill=True)
        pdf.ln()

        # Rows
        pdf.set_font("Helvetica", "", 8)
        pdf.set_text_color(0, 0, 0)
        for i, r in enumerate(records):
            pdf.set_fill_color(245, 245, 250) if i % 2 == 0 else pdf.set_fill_color(255, 255, 255)
            score = f"{r.get('recognition_score', 0):.2f}" if r.get("recognition_score") else "-"
            row_data = [
                r.get("student_name", "")[:20],
                r.get("roll_number", ""),
                r.get("subject_name", "")[:18],
                r.get("date", ""),
                r.get("status", ""),
                r.get("verification_method", "")[:8],
                score
            ]
            for val, w in zip(row_data, widths):
                pdf.cell(w, 7, str(val), border=1, fill=True)
            pdf.ln()

        return pdf.output()
    except ImportError:
        return b"PDF generation unavailable. Install fpdf2."
