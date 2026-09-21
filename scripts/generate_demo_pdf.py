"""
Script to generate a realistic Residential Rental Agreement PDF using ReportLab.
Includes 12 structured clauses with distinct parties, obligations, deadlines, and footer disclaimers.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    HRFlowable,
    Table,
    TableStyle,
    PageBreak,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            super().showPage()
        super().save()

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Red watermark/disclaimer header/footer
        footer_text = "DEMONSTRATION DOCUMENT — NOT A REAL LEGAL AGREEMENT — FOR INNOVATIVE DESIGN PROJECT"
        self.drawCentredString(letter[0] / 2.0, 30, footer_text)
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 30, page_str)
        self.drawString(54, 30, "ClausePilot Prototype Demo Contract")

        # Top running header
        self.drawString(54, letter[1] - 30, "RESIDENTIAL RENTAL AGREEMENT (SAMPLE)")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 34, letter[0] - 54, letter[1] - 34)
        self.line(54, 42, letter[0] - 54, 42)
        self.restoreState()


def create_demo_pdf(output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ContractTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#0f172a"),
        alignment=1,  # Centered
        spaceAfter=12,
    )

    subtitle_style = ParagraphStyle(
        "ContractSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#475569"),
        alignment=1,
        spaceAfter=16,
    )

    clause_title_style = ParagraphStyle(
        "ClauseTitle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=12,
        spaceAfter=4,
    )

    body_style = ParagraphStyle(
        "ContractBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=8,
    )

    badge_style = ParagraphStyle(
        "BadgeText",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#dc2626"),
        alignment=1,
    )

    story = []

    # Title & Header
    story.append(Paragraph("RESIDENTIAL RENTAL AGREEMENT", title_style))
    story.append(
        Paragraph(
            "This Agreement is executed between Landlord and Tenant for demonstration purposes only.",
            subtitle_style,
        )
    )

    story.append(
        HRFlowable(
            width="100%",
            thickness=1,
            color=colors.HexColor("#0284c7"),
            spaceBefore=0,
            spaceAfter=12,
        )
    )

    # Clause 1
    story.append(Paragraph("Clause 1 — Parties and Demised Premises", clause_title_style))
    story.append(
        Paragraph(
            "This Residential Tenancy Agreement is made and entered into on this 1st day of January 2026, "
            "by and between <b>Mr. Rajesh Sharma</b> (hereinafter referred to as the <b>'Landlord'</b>, which expression shall include his legal heirs, executors, and assigns) "
            "of the FIRST PART, and <b>Ms. Priya Verma</b> (hereinafter referred to as the <b>'Tenant'</b>, which expression shall include her permitted occupants and legal representatives) "
            "of the SECOND PART. The Landlord hereby lets and the Tenant agrees to take on rent the residential premises located at Flat 402, Greenview Heights, Sector 14, Gurugram, Haryana (the 'Demised Premises').",
            body_style,
        )
    )

    # Clause 2
    story.append(Paragraph("Clause 2 — Term and Commencement", clause_title_style))
    story.append(
        Paragraph(
            "The initial term of this tenancy shall be for a duration of 11 (eleven) months commencing on January 1, 2026, and expiring on November 30, 2026, unless renewed earlier by mutual written agreement. "
            "Any renewal shall require a fresh written agreement executed at least 30 days prior to the expiration of the ongoing term with mutually agreed escalation in rent.",
            body_style,
        )
    )

    # Clause 3
    story.append(Paragraph("Clause 3 — Monthly Rent and Late Fees", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant shall pay to the Landlord a monthly rent of <b>₹20,000</b> (Rupees Twenty Thousand only) on or before the <b>5th day of each calendar month</b> in advance via direct electronic bank transfer. "
            "In the event of default or delayed payment, the Tenant agrees to pay a late payment fee of <b>₹500 per day</b> of delay calculated from the 6th day of the month until the entire outstanding sum is remitted in full. Continued default exceeding 15 days shall constitute grounds for immediate termination.",
            body_style,
        )
    )

    # Clause 4
    story.append(Paragraph("Clause 4 — Security Deposit and Refund", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant shall deposit and maintain with the Landlord an interest-free refundable security deposit of <b>₹60,000</b> (Rupees Sixty Thousand only) upon execution of this agreement. "
            "The Landlord shall refund the security deposit <b>within 30 days</b> following the peaceful surrender of the premises, subject to permitted deductions for unpaid rent, unpaid utility dues, or documented structural damages beyond normal wear and tear.",
            body_style,
        )
    )

    # Clause 5
    story.append(Paragraph("Clause 5 — Utility Bills and Municipal Outgoings", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant shall promptly pay all charges for electricity, water, cooking gas, and high-speed internet consumed within <b>7 days of receiving the respective bill</b>. "
            "The Tenant shall furnish copies of paid utility receipts to the Landlord upon request no later than the 10th of each calendar month. The Landlord shall remain solely liable for statutory property tax and building capital society sinking funds.",
            body_style,
        )
    )

    story.append(PageBreak())

    # Clause 6
    story.append(Paragraph("Clause 6 — Maintenance and Structural Repairs", clause_title_style))
    story.append(
        Paragraph(
            "The Landlord shall complete necessary major structural and plumbing repairs <b>within 7 days</b> of written notification from the Tenant, provided such damage is not caused by the willful negligence or misuse of the Tenant. "
            "The Tenant is responsible for day-to-day cleanliness, waste disposal, and minor repairs of fuses, light bulbs, tap washers, and fittings at their own expense throughout the subsistence of the tenancy.",
            body_style,
        )
    )

    # Clause 7
    story.append(Paragraph("Clause 7 — Permitted Use and Prohibitions", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant agrees to use the premises strictly for private residential accommodation and shall not operate any commercial enterprise, business, or illegal activity therein. "
            "The Tenant shall not sublet, assign, or part with possession of the premises or any part thereof to any third party without obtaining prior written approval from the Landlord.",
            body_style,
        )
    )

    # Clause 8
    story.append(Paragraph("Clause 8 — Landlord Right of Inspection and Entry", clause_title_style))
    story.append(
        Paragraph(
            "The Landlord or their authorized agent shall give <b>at least 24 hours prior written notice</b> before entering the premises for physical inspection or repair assessment. "
            "The Tenant shall permit inspection access during reasonable daylight hours between 10:00 AM and 6:00 PM following due notice, except in case of urgent emergency involving water leakage or fire.",
            body_style,
        )
    )

    # Clause 9
    story.append(Paragraph("Clause 9 — Alterations and Improvements", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant shall not carry out any structural alterations, permanent wall drillings, or repaintings without prior written consent from the Landlord. "
            "In the event of unapproved modifications, the Tenant shall restore the premises to its pristine original condition at the Tenant's sole expense prior to final vacation.",
            body_style,
        )
    )

    story.append(PageBreak())

    # Clause 10
    story.append(Paragraph("Clause 10 — Termination and Notice Period", clause_title_style))
    story.append(
        Paragraph(
            "Either party may terminate this agreement prior to the expiry of the lease term by providing <b>at least 30 days prior written notice</b> to the other party. "
            "If the Tenant vacates without serving the mandatory 30 days notice, the Landlord shall be entitled to forfeit one month's rent in lieu of notice. The Landlord may terminate with 7 days notice in the event of persistent breach of covenant.",
            body_style,
        )
    )

    # Clause 11
    story.append(Paragraph("Clause 11 — Surrender of Premises and Key Handover", clause_title_style))
    story.append(
        Paragraph(
            "The Tenant shall surrender vacant possession and return all original keys and access fobs to the Landlord by <b>12:00 PM on the final day of the tenancy</b>. "
            "If the Tenant fails to vacate upon expiry or termination, the Tenant shall pay an unauthorized holding over charge of <b>₹2,000 per calendar day</b> until actual possession is delivered.",
            body_style,
        )
    )

    # Clause 12
    story.append(Paragraph("Clause 12 — Governing Law and Dispute Resolution", clause_title_style))
    story.append(
        Paragraph(
            "This Agreement shall be governed and construed in accordance with the laws of India and the courts at Gurugram shall have exclusive jurisdiction. "
            "Both parties agree to attempt amicable conciliation <b>within 15 days</b> of written notice of any controversy prior to initiating formal arbitration proceedings under the Arbitration and Conciliation Act, 1996.",
            body_style,
        )
    )

    # Execution Table
    story.append(Spacer(1, 24))
    sig_data = [
        [
            Paragraph("<b>IN WITNESS WHEREOF</b> the parties have set their signatures below:", body_style),
            "",
        ],
        [
            Paragraph("____________________________<br/><b>Mr. Rajesh Sharma</b><br/>(Landlord)", body_style),
            Paragraph("____________________________<br/><b>Ms. Priya Verma</b><br/>(Tenant)", body_style),
        ],
    ]
    sig_table = Table(sig_data, colWidths=[250, 250])
    sig_table.setStyle(
        TableStyle(
            [
                ("SPAN", (0, 0), (1, 0)),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 12),
            ]
        )
    )
    story.append(sig_table)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated demo agreement at: {output_path}")


if __name__ == "__main__":
    out = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "demo_agreement.pdf"))
    create_demo_pdf(out)
