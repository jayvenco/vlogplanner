from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem

from models import Project, ChecklistSection

SECTION_TITLES = {
    ChecklistSection.voorbereiding: "Voorbereiding",
    ChecklistSection.tijdens_filmen: "Tijdens filmen",
    ChecklistSection.na_filmen: "Na filmen",
}

BLOCK_TITLES = {
    "intro": "Intro",
    "scene1": "Scene 1",
    "scene2": "Scene 2",
    "scene3": "Scene 3",
    "einde": "Einde",
}


def generate_project_pdf(project: Project) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2 * cm, bottomMargin=2 * cm)
    styles = getSampleStyleSheet()
    heading = ParagraphStyle("Heading1Custom", parent=styles["Heading1"], spaceAfter=12)
    subheading = ParagraphStyle("Heading2Custom", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6)
    body = styles["BodyText"]

    story = [Paragraph(project.title or "Zonder titel", heading)]
    story.append(Paragraph(f"Status: {project.status.value}", body))
    if project.description:
        story.append(Spacer(1, 8))
        story.append(Paragraph(project.description, body))

    story.append(Paragraph("Storyboard", subheading))
    for scene in project.storyboard_scenes:
        title = scene.title or BLOCK_TITLES.get(scene.block.value, scene.block.value)
        story.append(Paragraph(f"<b>{BLOCK_TITLES.get(scene.block.value, scene.block.value)}:</b> {title}", body))
        if scene.notes:
            story.append(Paragraph(scene.notes, body))
        story.append(Spacer(1, 4))

    story.append(Paragraph("Checklist", subheading))
    for section in [ChecklistSection.voorbereiding, ChecklistSection.tijdens_filmen, ChecklistSection.na_filmen]:
        items = [i for i in project.checklist_items if i.section == section]
        if not items:
            continue
        story.append(Paragraph(SECTION_TITLES[section], styles["Heading3"]))
        list_items = [
            ListItem(Paragraph(("&#9745; " if item.is_checked else "&#9744; ") + item.text, body))
            for item in items
        ]
        story.append(ListFlowable(list_items, bulletType="bullet"))

    doc.build(story)
    buffer.seek(0)
    return buffer
