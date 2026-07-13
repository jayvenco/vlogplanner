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

CONTENT_TEMPLATES = [
    {
        "key": "dag_in_het_leven",
        "name": "Dag-in-het-leven",
        "icon": "🌅",
        "structure": {
            "hook": "Begin met het leukste moment van de dag (kort fragment), dan pas de titel/intro.",
            "intro": "Vertel kort wie je bent en wat voor dag je gaat laten zien.",
            "body": "Volg de dag chronologisch: ochtend, middag, avond. Wissel rustige momenten af met iets grappigs of onverwachts.",
            "cta": "Vraag de kijker wat voor dag zij morgen hebben, of stel een vraag over de video.",
            "outro": "Bedank de kijker en kondig de volgende video kort aan.",
        },
        "recommended_length": "6-10 minuten",
        "thumbnail_tips": "Gebruik een blije, expressieve foto van jezelf met een kort tekstlabel zoals 'MIJN DAG!'.",
        "title_formulas": [
            "Een dag in mijn leven als ...",
            "24 uur ... (met een twist)",
            "Volg mij een hele dag: ...",
        ],
        "checklist": {
            "pre_productie": ["Dagplanning bedacht", "Camera batterij vol", "Geheugenkaart leeg"],
            "opname": ["Meerdere korte clips door de dag heen", "Praat steeds kort in camera", "Leukste moment apart opgenomen voor de hook"],
            "montage": ["Beste momenten geselecteerd", "Muziek toegevoegd die bij het ritme past", "Niet te lange stukjes achter elkaar"],
            "publicatie": ["Titel en thumbnail gemaakt", "Beschrijving geschreven", "Video geupload"],
        },
    },
    {
        "key": "tutorial",
        "name": "Tutorial / How-to",
        "icon": "🛠️",
        "structure": {
            "hook": "Laat het eindresultaat direct zien: 'Zo maak/doe je dit!'",
            "intro": "Vertel wat de kijker gaat leren en wat ze nodig hebben.",
            "body": "Leg het stap voor stap uit, in duidelijke, genummerde stappen. Eén stap per shot.",
            "cta": "Vraag de kijker om te laten weten hoe het bij hen ging.",
            "outro": "Herhaal kort de belangrijkste stap en bedank de kijker.",
        },
        "recommended_length": "4-8 minuten",
        "thumbnail_tips": "Toon het eindresultaat groot in beeld, met een stap-nummer of pijl erbij.",
        "title_formulas": [
            "Zo maak je ... (stap voor stap)",
            "... leren in 5 minuten",
            "De makkelijkste manier om ...",
        ],
        "checklist": {
            "pre_productie": ["Stappen op volgorde gezet", "Materialen verzameld", "Script per stap geschreven"],
            "opname": ["Elke stap apart gefilmd", "Close-up shots van details", "Dubbel gefilmd bij twijfel"],
            "montage": ["Stappen in de juiste volgorde", "Tekst/pijlen toegevoegd waar nodig", "Tempo lekker strak gehouden"],
            "publicatie": ["Titel met duidelijk resultaat", "Materialenlijst in beschrijving", "Video geupload"],
        },
    },
    {
        "key": "qa",
        "name": "Q&A",
        "icon": "❓",
        "structure": {
            "hook": "Begin met de leukste of grappigste vraag die je gaat beantwoorden.",
            "intro": "Leg uit dat het een Q&A is en waar de vragen vandaan komen.",
            "body": "Beantwoord de vragen één voor één, wissel serieuze en grappige vragen af.",
            "cta": "Vraag de kijkers om nieuwe vragen achter te laten voor de volgende Q&A.",
            "outro": "Bedank iedereen die een vraag heeft gestuurd.",
        },
        "recommended_length": "5-10 minuten",
        "thumbnail_tips": "Gebruik een verbaasd of lachend gezicht met een groot vraagteken erbij.",
        "title_formulas": [
            "Q&A: jullie vragen beantwoord!",
            "Ik beantwoord jullie gekste vragen",
            "ANTWOORD op ... (Q&A)",
        ],
        "checklist": {
            "pre_productie": ["Vragen verzameld", "Leukste vragen uitgekozen", "Antwoorden voorbereid"],
            "opname": ["Rustige plek gekozen", "Elke vraag apart genoemd", "Genoeg energie/afwisseling"],
            "montage": ["Tekst van de vraag in beeld gezet", "Saaie stukken eruit geknipt"],
            "publicatie": ["Titel gemaakt", "Bedankt naar vraag-stellers in beschrijving", "Video geupload"],
        },
    },
    {
        "key": "review",
        "name": "Review",
        "icon": "⭐",
        "structure": {
            "hook": "Laat direct zien wat je gaat reviewen en je eerste indruk.",
            "intro": "Vertel wat het product/de dienst is en waarom je het reviewt.",
            "body": "Bespreek voor- en nadelen, laat het in gebruik zien, geef voorbeelden.",
            "cta": "Vraag of de kijker het ook heeft/wil, en waarom.",
            "outro": "Geef een duidelijk eindoordeel of score.",
        },
        "recommended_length": "5-9 minuten",
        "thumbnail_tips": "Toon het product duidelijk samen met een score of duim omhoog/omlaag.",
        "title_formulas": [
            "... review: is het het waard?",
            "Eerlijke review van ...",
            "... getest! Mijn mening",
        ],
        "checklist": {
            "pre_productie": ["Product/dienst goed uitgeprobeerd", "Voor- en nadelen opgeschreven", "Score bepaald"],
            "opname": ["Product goed in beeld", "In gebruik laten zien", "Eerlijke mening in eigen woorden"],
            "montage": ["Belangrijkste punten benadrukt", "Tekst met voor/nadelen toegevoegd"],
            "publicatie": ["Titel met duidelijke mening", "Eventuele links in beschrijving", "Video geupload"],
        },
    },
    {
        "key": "storytime",
        "name": "Storytime",
        "icon": "📖",
        "structure": {
            "hook": "Begin bij het spannendste/gekste moment van het verhaal.",
            "intro": "Vertel kort waar en wanneer het verhaal zich afspeelt.",
            "body": "Vertel het verhaal chronologisch, bouw spanning op, gebruik je stem en gezicht.",
            "cta": "Vraag de kijker of hen ooit iets soortgelijks is overkomen.",
            "outro": "Sluit het verhaal af en bedank de kijker voor het luisteren.",
        },
        "recommended_length": "5-12 minuten",
        "thumbnail_tips": "Gebruik een expressief gezicht (verbaasd/geschrokken) met een korte pakkende tekst.",
        "title_formulas": [
            "STORYTIME: het gekste dat me ooit is overkomen",
            "Dit zou je nooit geloven... (storytime)",
            "Het verhaal van hoe ...",
        ],
        "checklist": {
            "pre_productie": ["Verhaal op volgorde gezet in hoofd/aantekeningen", "Spannendste moment bepaald voor de hook"],
            "opname": ["Rustige plek, goed geluid", "Genoeg expressie in stem en gezicht", "Niet te snel praten"],
            "montage": ["Spanning vastgehouden met opbouw/muziek", "Saaie stukken eruit geknipt"],
            "publicatie": ["Pakkende titel gemaakt", "Thumbnail met expressief gezicht", "Video geupload"],
        },
    },
]

CONTENT_TEMPLATES_BY_KEY = {t["key"]: t for t in CONTENT_TEMPLATES}

# Simple keyword -> template-key mapping used by the recommendation module (§5).
THEME_TEMPLATE_KEYWORDS = {
    "tutorial": ["hoe", "leren", "uitleg", "tips", "diy", "maken", "knutsel"],
    "review": ["review", "test", "unboxing", "vergelijk", "product"],
    "qa": ["vraag", "q&a", "antwoord", "vragen"],
    "storytime": ["verhaal", "storytime", "gebeurd", "ervaring"],
    "dag_in_het_leven": ["dag", "vlog", "leven", "routine"],
}

AGE_GROUP_GUIDANCE = {
    "13-17": "Kort en energiek: 5-8 minuten, snel tempo, veel wisselingen van beeld, speelse muziek.",
    "18-24": "Casual en persoonlijk: 8-12 minuten, ontspannen tempo, humor en herkenbaarheid.",
    "25-34": "Informatief met persoonlijke touch: 10-15 minuten, iets rustiger tempo, duidelijke structuur.",
    "35+": "Rustig en to-the-point: 10-20 minuten, rustig tempo, duidelijke uitleg zonder haast.",
}

MOTIVATIONAL_QUOTES = [
    "Leuke video!",
    "Goed bezig!",
    "Nog één stap!",
    "Je kunt dit!",
    "Begin vandaag met iets leuks!",
    "Elke video maakt je beter!",
    "Jij bent de ster van je eigen kanaal!",
]
