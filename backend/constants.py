"""Default seed content used when a new project is created, and copy shown on the dashboard."""

from models import ChecklistSection, StoryboardBlock

DEFAULT_CHECKLIST_ITEMS = [
    (ChecklistSection.voorbereiding, "Onderwerp gekozen"),
    (ChecklistSection.voorbereiding, "Titel bedacht"),
    (ChecklistSection.voorbereiding, "Thumbnail idee"),
    (ChecklistSection.voorbereiding, "Script gemaakt"),
    (ChecklistSection.voorbereiding, "Camera opgeladen"),
    (ChecklistSection.voorbereiding, "Batterij gecontroleerd"),
    (ChecklistSection.voorbereiding, "Geheugenkaart leeg"),
    (ChecklistSection.voorbereiding, "Opnamelocatie gekozen"),
    (ChecklistSection.voorbereiding, "Goede verlichting"),
    (ChecklistSection.voorbereiding, "Geluid gecontroleerd"),
    (ChecklistSection.tijdens_filmen, "Intro opgenomen"),
    (ChecklistSection.tijdens_filmen, "Duidelijk praten"),
    (ChecklistSection.tijdens_filmen, "In camera kijken"),
    (ChecklistSection.tijdens_filmen, "Niet te snel praten"),
    (ChecklistSection.tijdens_filmen, "B-roll gemaakt"),
    (ChecklistSection.tijdens_filmen, "Afsluiting opgenomen"),
    (ChecklistSection.na_filmen, "Beste clips gekozen"),
    (ChecklistSection.na_filmen, "Muziek toegevoegd"),
    (ChecklistSection.na_filmen, "Overgangen gecontroleerd"),
    (ChecklistSection.na_filmen, "Thumbnail gemaakt"),
    (ChecklistSection.na_filmen, "Titel ingevuld"),
    (ChecklistSection.na_filmen, "Beschrijving geschreven"),
    (ChecklistSection.na_filmen, "Upload klaar"),
]

DEFAULT_STORYBOARD_BLOCKS = [
    StoryboardBlock.intro,
    StoryboardBlock.scene1,
    StoryboardBlock.scene2,
    StoryboardBlock.scene3,
    StoryboardBlock.einde,
]

MOTIVATIONAL_QUOTES = [
    "Leuke video!",
    "Goed bezig!",
    "Nog één stap!",
    "Je kunt dit!",
    "Begin vandaag met iets leuks!",
    "Elke video maakt je beter!",
    "Jij bent de ster van je eigen kanaal!",
]
