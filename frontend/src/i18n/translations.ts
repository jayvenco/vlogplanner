export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    remove: string;
    add: string;
    loading: string;
    busy: string;
    close: string;
    noDescription: string;
  };
  auth: {
    loginTitle: string;
    registerTitle: string;
    username: string;
    email: string;
    password: string;
    login: string;
    loggingIn: string;
    createAccount: string;
    creatingAccount: string;
    noAccount: string;
    registerHere: string;
    haveAccount: string;
    loginHere: string;
    loginFailed: string;
    registerFailed: string;
  };
  sidebar: {
    dashboard: string;
    projects: string;
    checklist: string;
    videoPlanner: string;
    ideas: string;
    templates: string;
    trends: string;
    inspiration: string;
    tasks: string;
    tips: string;
    diary: string;
    settings: string;
    logout: string;
  };
  dashboard: {
    title: string;
    projects: string;
    openTasks: string;
    ideas: string;
    latestProject: string;
    badges: string;
    startToday: string;
    startFirstProject: string;
  };
  projects: {
    title: string;
    newProject: string;
    cancel: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    creating: string;
    createProject: string;
    empty: string;
  };
  projectDetail: {
    exportPdf: string;
    deleteProject: string;
    deleteConfirm: string;
    tabOverview: string;
    tabChecklist: string;
    tabStoryboard: string;
    tabTemplate: string;
    tabDiary: string;
    status: string;
    checklistProgress: string;
  };
  statusBadge: {
    idee: string;
    script: string;
    opnemen: string;
    bewerken: string;
    klaar: string;
    gepubliceerd: string;
  };
  checklist: {
    pageTitle: string;
    emptyNoProjects: string;
    chooseProject: string;
    sectionPrep: string;
    sectionFilming: string;
    sectionAfter: string;
    addPlaceholder: string;
    add: string;
  };
  storyboard: {
    intro: string;
    scene1: string;
    scene2: string;
    scene3: string;
    einde: string;
    titlePlaceholder: string;
    notesPlaceholder: string;
  };
  videoPlanner: {
    title: string;
    intro: string;
    steps: { title: string; icon: string; points: string[] }[];
  };
  tips: {
    title: string;
    categories: { title: string; icon: string; tips: string[] }[];
  };
  projectTemplate: {
    guideTitle: string;
    themeLabel: string;
    themePlaceholder: string;
    sourcesLabel: string;
    sourcesPlaceholder: string;
    imagesLabel: string;
    imagesPlaceholder: string;
    urlsLabel: string;
    urlsPlaceholder: string;
    buildupTitle: string;
    introLabel: string;
    introHint: string;
    middleLabel: string;
    middleHint: string;
    endLabel: string;
    endHint: string;
    sectionPlaceholder: string;
    askAiTitle: string;
    askAiPlaceholder: string;
    askAiButton: string;
    askAiThinking: string;
    askAiError: string;
  };
  ideas: {
    pageTitle: string;
    filterTheme: string;
    filterAge: string;
    allThemes: string;
    allAges: string;
    columnBacklog: string;
    columnBezig: string;
    columnAfgerond: string;
    newIdea: string;
    dropHere: string;
    modalTitle: string;
    titleLabel: string;
    descriptionLabel: string;
    themeLabel: string;
    ageLabel: string;
    dateLabel: string;
    notesLabel: string;
    templateLabel: string;
    noTemplate: string;
    aiSectionTitle: string;
    aiDisabledMessage: string;
    generateScript: string;
    generateTitles: string;
    generateThumbnailText: string;
    generateDescription: string;
    generateHashtags: string;
    regenerate: string;
    generating: string;
  };
  templatesLibrary: {
    pageTitle: string;
    recommendedLength: string;
    thumbnailTips: string;
    titleFormulas: string;
    checklistPrep: string;
    checklistFilming: string;
    checklistEditing: string;
    checklistPublishing: string;
  };
  trends: {
    pageTitle: string;
    tabTrending: string;
    tabRecommendation: string;
    category: string;
    refresh: string;
    notConfigured: string;
    views: string;
    perDay: string;
    trendingKeywords: string;
    recTargetAge: string;
    recTheme: string;
    recThemePlaceholder: string;
    recSubmit: string;
    recSuggestedIdeas: string;
    recSuggestedTemplate: string;
    recToneLength: string;
    recReasoning: string;
  };
  inspiration: {
    pageTitle: string;
    typeLabel: string;
    typeLink: string;
    typeScreenshot: string;
    typeQuote: string;
    contentPlaceholder: string;
    tagsPlaceholder: string;
    add: string;
    filterByTag: string;
    empty: string;
  };
  tasks: {
    title: string;
    newPlaceholder: string;
    priorityHigh: string;
    priorityNormal: string;
    priorityLow: string;
    add: string;
    empty: string;
  };
  diary: {
    title: string;
    noSpecificProject: string;
    goodPlaceholder: string;
    betterPlaceholder: string;
    add: string;
    empty: string;
  };
  settings: {
    title: string;
    profileTitle: string;
    username: string;
    email: string;
    displayTitle: string;
    languageTitle: string;
    dutch: string;
    english: string;
    aiTitle: string;
    aiProvider: string;
    aiKeySet: string;
    aiKeyNotSet: string;
    aiKeyPlaceholder: string;
    aiModelPlaceholder: string;
    aiCustomEndpointPlaceholder: string;
    aiSave: string;
    aiRemove: string;
    aiVerify: string;
    aiVerifying: string;
    youtubeTitle: string;
    youtubeConnected: string;
    youtubeNotConnected: string;
    youtubeConnect: string;
    youtubeDisconnect: string;
    youtubeConnecting: string;
    logout: string;
  };
  youtubeLink: {
    title: string;
    connectFirstPrefix: string;
    connectFirstSuffix: string;
    linkedTo: string;
    viewsLikes: string;
    unlink: string;
    chooseVideo: string;
    showVideos: string;
    loadingVideos: string;
  };
  thumbnail: {
    choose: string;
    uploading: string;
  };
  search: {
    placeholder: string;
    noResults: string;
    projects: string;
    ideas: string;
    tasks: string;
  };
}

export const nl: Translations = {
  common: {
    save: "Opslaan",
    cancel: "Annuleren",
    delete: "Verwijderen",
    remove: "Verwijderen",
    add: "Toevoegen",
    loading: "Laden...",
    busy: "Bezig...",
    close: "Sluiten",
    noDescription: "Geen beschrijving",
  },
  auth: {
    loginTitle: "🎥 VlogPlanner",
    registerTitle: "🎥 Welkom!",
    username: "Gebruikersnaam",
    email: "E-mailadres",
    password: "Wachtwoord",
    login: "Inloggen",
    loggingIn: "Bezig...",
    createAccount: "Account aanmaken",
    creatingAccount: "Bezig...",
    noAccount: "Nog geen account?",
    registerHere: "Registreer hier",
    haveAccount: "Heb je al een account?",
    loginHere: "Log hier in",
    loginFailed: "Inloggen is mislukt",
    registerFailed: "Registreren is mislukt",
  },
  sidebar: {
    dashboard: "Dashboard",
    projects: "Mijn Projecten",
    checklist: "Checklist",
    videoPlanner: "Video Planner",
    ideas: "Ideeën",
    templates: "Templates",
    trends: "Trends & Aanbevelingen",
    inspiration: "Inspiratie",
    tasks: "Taken",
    tips: "Tips",
    diary: "Dagboek",
    settings: "Instellingen",
    logout: "Uitloggen",
  },
  dashboard: {
    title: "🏠 Dashboard",
    projects: "Projecten",
    openTasks: "Open taken",
    ideas: "Ideeën",
    latestProject: "Laatste project",
    badges: "🏅 Badges",
    startToday: "Begin vandaag met iets leuks!",
    startFirstProject: "+ Start je eerste project",
  },
  projects: {
    title: "🎬 Mijn Projecten",
    newProject: "+ Nieuw project",
    cancel: "Annuleren",
    titlePlaceholder: "Titel van je video",
    descriptionPlaceholder: "Waar gaat je video over?",
    creating: "Bezig...",
    createProject: "Project aanmaken",
    empty: "Je hebt nog geen projecten. Begin vandaag met iets leuks!",
  },
  projectDetail: {
    exportPdf: "📄 Exporteer PDF",
    deleteProject: "🗑️ Verwijderen",
    deleteConfirm: "Weet je zeker dat je dit project wilt verwijderen?",
    tabOverview: "📋 Overzicht",
    tabChecklist: "✅ Checklist",
    tabStoryboard: "🎞️ Storyboard",
    tabTemplate: "🧭 Sjabloon",
    tabDiary: "📔 Dagboek",
    status: "Status",
    checklistProgress: "Checklist voortgang",
  },
  statusBadge: {
    idee: "💭 Idee",
    script: "📝 Script",
    opnemen: "🎥 Opnemen",
    bewerken: "✂️ Bewerken",
    klaar: "🎉 Klaar",
    gepubliceerd: "📢 Gepubliceerd",
  },
  checklist: {
    pageTitle: "✅ Checklist",
    emptyNoProjects: "Maak eerst een project aan om een checklist te zien.",
    chooseProject: "Kies een project:",
    sectionPrep: "🧰 Voorbereiding",
    sectionFilming: "🎬 Tijdens filmen",
    sectionAfter: "🪄 Na filmen",
    addPlaceholder: "Extra item toevoegen...",
    add: "+ Toevoegen",
  },
  storyboard: {
    intro: "🎬 Intro",
    scene1: "1️⃣ Scene 1",
    scene2: "2️⃣ Scene 2",
    scene3: "3️⃣ Scene 3",
    einde: "🏁 Einde",
    titlePlaceholder: "Titel van deze scene",
    notesPlaceholder: "Notities: wat gebeurt hier?",
  },
  videoPlanner: {
    title: "📝 Video Planner",
    intro: "Zo bouw je een leuke video op:",
    steps: [
      {
        title: "1. Intro (5-10 sec)",
        icon: "🎬",
        points: ["Wie ben je?", "Wat gaan we vandaag doen?", "Maak nieuwsgierig."],
      },
      { title: "2. Begin", icon: "🚀", points: ["Leg uit wat je gaat doen."] },
      {
        title: "3. Midden",
        icon: "🌟",
        points: ["Laat de leukste momenten zien.", "Gebruik verschillende camerastandpunten."],
      },
      {
        title: "4. Einde",
        icon: "🏁",
        points: ["Vertel wat je hebt geleerd.", "Vraag om een like of abonnement.", "Bedank de kijker."],
      },
    ],
  },
  tips: {
    title: "📖 Tips",
    categories: [
      {
        title: "Filmen",
        icon: "🎥",
        tips: ["Houd de camera stil.", "Film met voldoende licht.", "Gebruik natuurlijk licht.", "Maak meerdere opnames."],
      },
      { title: "Geluid", icon: "🎙️", tips: ["Film op een rustige plek.", "Praat duidelijk.", "Controleer achtergrondgeluid."] },
      { title: "Presenteren", icon: "😄", tips: ["Lach.", "Kijk in de camera.", "Praat rustig.", "Wees jezelf."] },
      {
        title: "Bewerken",
        icon: "✂️",
        tips: ["Houd video's kort.", "Gebruik niet te veel effecten.", "Voeg muziek toe.", "Gebruik duidelijke overgangen."],
      },
    ],
  },
  projectTemplate: {
    guideTitle: "🧭 Leidraad",
    themeLabel: "🎯 Thema",
    themePlaceholder: "Waar gaat deze video over?",
    sourcesLabel: "📚 Bronnen",
    sourcesPlaceholder: "Welke bronnen gebruik je? (websites, boeken, mensen...)",
    imagesLabel: "🖼️ Afbeeldingen-ideeën",
    imagesPlaceholder: "Welke plaatjes of shots wil je gebruiken?",
    urlsLabel: "🔗 URLs voor inspiratie",
    urlsPlaceholder: "Links naar video's of pagina's die je inspireren",
    buildupTitle: "🎞️ Opbouw van je vlog",
    introLabel: "🎬 Intro",
    introHint: "Wie ben je en wat ga je vandaag laten zien?",
    middleLabel: "🌟 Midden",
    middleHint: "Wat gebeurt er in het grootste deel van je video?",
    endLabel: "🏁 Einde",
    endHint: "Wat vertel je aan het einde? Bedank je de kijker?",
    sectionPlaceholder: "Schrijf hier wat er in dit deel gebeurt...",
    askAiTitle: "🤖 Vraag AI om tips",
    askAiPlaceholder: "Bijvoorbeeld: hoe maak ik een leuke intro voor deze video?",
    askAiButton: "✨ Vraag tip",
    askAiThinking: "Even denken...",
    askAiError: "Kon geen tip ophalen.",
  },
  ideas: {
    pageTitle: "💡 Ideeën",
    filterTheme: "Filter op thema",
    filterAge: "Filter op leeftijd",
    allThemes: "Alle thema's",
    allAges: "Alle leeftijden",
    columnBacklog: "💡 Backlog",
    columnBezig: "🚧 Bezig",
    columnAfgerond: "🎉 Afgerond",
    newIdea: "Nieuw idee...",
    dropHere: "Sleep hier een kaart",
    modalTitle: "Idee bewerken",
    titleLabel: "Titel",
    descriptionLabel: "Korte beschrijving",
    themeLabel: "Thema/tag",
    ageLabel: "Doelgroep-leeftijd",
    dateLabel: "Geschatte productiedatum",
    notesLabel: "Notities",
    templateLabel: "Template",
    noTemplate: "Geen template",
    aiSectionTitle: "🤖 Genereer met AI",
    aiDisabledMessage: "Voeg een AI-sleutel toe in Instellingen om dit te gebruiken.",
    generateScript: "Script",
    generateTitles: "Titel-suggesties",
    generateThumbnailText: "Thumbnail-tekst",
    generateDescription: "Beschrijving",
    generateHashtags: "Hashtags",
    regenerate: "↻ Opnieuw genereren",
    generating: "Bezig met genereren...",
  },
  templatesLibrary: {
    pageTitle: "📚 Templates",
    recommendedLength: "Aanbevolen lengte",
    thumbnailTips: "Thumbnail-tips",
    titleFormulas: "Titel-formules",
    checklistPrep: "Pre-productie",
    checklistFilming: "Opname",
    checklistEditing: "Montage",
    checklistPublishing: "Publicatie",
  },
  trends: {
    pageTitle: "🔮 Trends & Aanbevelingen",
    tabTrending: "Trending nu",
    tabRecommendation: "Aanbeveling",
    category: "Categorie",
    refresh: "↻ Ververs",
    notConfigured: "YouTube-trends zijn nog niet geconfigureerd. Vraag een volwassene om YOUTUBE_API_KEY in te stellen.",
    views: "keer bekeken",
    perDay: "/dag",
    trendingKeywords: "Trending zoekwoorden",
    recTargetAge: "Doelgroep-leeftijd",
    recTheme: "Thema",
    recThemePlaceholder: "Bijvoorbeeld: knutselen, gaming, sport...",
    recSubmit: "✨ Geef aanbeveling",
    recSuggestedIdeas: "Content-ideeën",
    recSuggestedTemplate: "Aanbevolen template",
    recToneLength: "Toon & lengte",
    recReasoning: "Onderbouwing",
  },
  inspiration: {
    pageTitle: "📌 Inspiratie",
    typeLabel: "Type",
    typeLink: "Link",
    typeScreenshot: "Screenshot-notitie",
    typeQuote: "Quote",
    contentPlaceholder: "Link, notitie of quote...",
    tagsPlaceholder: "Tags (gescheiden door komma's)",
    add: "+ Toevoegen",
    filterByTag: "Filter op tag",
    empty: "Nog geen inspiratie opgeslagen.",
  },
  tasks: {
    title: "📋 Taken",
    newPlaceholder: "Nieuwe taak...",
    priorityHigh: "🔴 Hoog",
    priorityNormal: "🟡 Normaal",
    priorityLow: "🟢 Laag",
    add: "+ Toevoegen",
    empty: "Nog geen taken. Goed bezig als je er een toevoegt!",
  },
  diary: {
    title: "📔 Dagboek",
    noSpecificProject: "Geen specifiek project",
    goodPlaceholder: "Wat ging er goed?",
    betterPlaceholder: "Wat kan er beter?",
    add: "+ Toevoegen aan dagboek",
    empty: "Nog geen dagboek-items. Schrijf op wat je hebt geleerd!",
  },
  settings: {
    title: "⚙️ Instellingen",
    profileTitle: "Profiel",
    username: "Gebruikersnaam",
    email: "E-mail",
    displayTitle: "Weergave",
    languageTitle: "🌐 Taal",
    dutch: "Nederlands",
    english: "English",
    aiTitle: "🤖 AI-assistent",
    aiProvider: "Provider",
    aiKeySet: "✅ Sleutel ingesteld",
    aiKeyNotSet: "Nog geen sleutel ingesteld",
    aiKeyPlaceholder: "API-sleutel",
    aiModelPlaceholder: "Model (optioneel)",
    aiCustomEndpointPlaceholder: "Custom endpoint URL",
    aiSave: "Opslaan",
    aiRemove: "Verwijderen",
    aiVerify: "Verifieer API key",
    aiVerifying: "Bezig met verifiëren...",
    youtubeTitle: "▶️ YouTube",
    youtubeConnected: "✅ Verbonden met kanaal:",
    youtubeNotConnected: "Niet verbonden — koppel je YouTube-kanaal om gepubliceerde projecten aan je echte video's te linken.",
    youtubeConnect: "Verbind met YouTube",
    youtubeDisconnect: "Loskoppelen",
    youtubeConnecting: "Bezig...",
    logout: "Uitloggen",
  },
  youtubeLink: {
    title: "▶️ YouTube",
    connectFirstPrefix: "Verbind eerst je YouTube-kanaal bij ",
    connectFirstSuffix: " om deze video te koppelen.",
    linkedTo: "Gekoppeld aan:",
    viewsLikes: "keer bekeken",
    unlink: "Loskoppelen",
    chooseVideo: "Kies de video die bij dit project hoort:",
    showVideos: "Toon mijn video's",
    loadingVideos: "Laden...",
  },
  thumbnail: {
    choose: "📷 Thumbnail kiezen",
    uploading: "Bezig met uploaden...",
  },
  search: {
    placeholder: "🔍 Zoek in projecten, ideeën, taken...",
    noResults: "Niks gevonden.",
    projects: "Projecten",
    ideas: "Ideeën",
    tasks: "Taken",
  },
};

export const en: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    remove: "Remove",
    add: "Add",
    loading: "Loading...",
    busy: "Working...",
    close: "Close",
    noDescription: "No description",
  },
  auth: {
    loginTitle: "🎥 VlogPlanner",
    registerTitle: "🎥 Welcome!",
    username: "Username",
    email: "Email address",
    password: "Password",
    login: "Log in",
    loggingIn: "Working...",
    createAccount: "Create account",
    creatingAccount: "Working...",
    noAccount: "No account yet?",
    registerHere: "Register here",
    haveAccount: "Already have an account?",
    loginHere: "Log in here",
    loginFailed: "Login failed",
    registerFailed: "Registration failed",
  },
  sidebar: {
    dashboard: "Dashboard",
    projects: "My Projects",
    checklist: "Checklist",
    videoPlanner: "Video Planner",
    ideas: "Ideas",
    templates: "Templates",
    trends: "Trends & Recommendations",
    inspiration: "Inspiration",
    tasks: "Tasks",
    tips: "Tips",
    diary: "Diary",
    settings: "Settings",
    logout: "Log out",
  },
  dashboard: {
    title: "🏠 Dashboard",
    projects: "Projects",
    openTasks: "Open tasks",
    ideas: "Ideas",
    latestProject: "Latest project",
    badges: "🏅 Badges",
    startToday: "Start something fun today!",
    startFirstProject: "+ Start your first project",
  },
  projects: {
    title: "🎬 My Projects",
    newProject: "+ New project",
    cancel: "Cancel",
    titlePlaceholder: "Title of your video",
    descriptionPlaceholder: "What is your video about?",
    creating: "Working...",
    createProject: "Create project",
    empty: "You don't have any projects yet. Start something fun today!",
  },
  projectDetail: {
    exportPdf: "📄 Export PDF",
    deleteProject: "🗑️ Delete",
    deleteConfirm: "Are you sure you want to delete this project?",
    tabOverview: "📋 Overview",
    tabChecklist: "✅ Checklist",
    tabStoryboard: "🎞️ Storyboard",
    tabTemplate: "🧭 Template",
    tabDiary: "📔 Diary",
    status: "Status",
    checklistProgress: "Checklist progress",
  },
  statusBadge: {
    idee: "💭 Idea",
    script: "📝 Script",
    opnemen: "🎥 Filming",
    bewerken: "✂️ Editing",
    klaar: "🎉 Done",
    gepubliceerd: "📢 Published",
  },
  checklist: {
    pageTitle: "✅ Checklist",
    emptyNoProjects: "Create a project first to see a checklist.",
    chooseProject: "Choose a project:",
    sectionPrep: "🧰 Preparation",
    sectionFilming: "🎬 While filming",
    sectionAfter: "🪄 After filming",
    addPlaceholder: "Add extra item...",
    add: "+ Add",
  },
  storyboard: {
    intro: "🎬 Intro",
    scene1: "1️⃣ Scene 1",
    scene2: "2️⃣ Scene 2",
    scene3: "3️⃣ Scene 3",
    einde: "🏁 Ending",
    titlePlaceholder: "Title of this scene",
    notesPlaceholder: "Notes: what happens here?",
  },
  videoPlanner: {
    title: "📝 Video Planner",
    intro: "Here's how to build a fun video:",
    steps: [
      {
        title: "1. Intro (5-10 sec)",
        icon: "🎬",
        points: ["Who are you?", "What are we doing today?", "Make it intriguing."],
      },
      { title: "2. Beginning", icon: "🚀", points: ["Explain what you're going to do."] },
      {
        title: "3. Middle",
        icon: "🌟",
        points: ["Show the best moments.", "Use different camera angles."],
      },
      {
        title: "4. Ending",
        icon: "🏁",
        points: ["Tell what you learned.", "Ask for a like or subscribe.", "Thank the viewer."],
      },
    ],
  },
  tips: {
    title: "📖 Tips",
    categories: [
      {
        title: "Filming",
        icon: "🎥",
        tips: ["Hold the camera steady.", "Film with enough light.", "Use natural light.", "Take multiple takes."],
      },
      { title: "Sound", icon: "🎙️", tips: ["Film in a quiet place.", "Speak clearly.", "Check background noise."] },
      { title: "Presenting", icon: "😄", tips: ["Smile.", "Look into the camera.", "Speak calmly.", "Be yourself."] },
      {
        title: "Editing",
        icon: "✂️",
        tips: ["Keep videos short.", "Don't use too many effects.", "Add music.", "Use clear transitions."],
      },
    ],
  },
  projectTemplate: {
    guideTitle: "🧭 Guide",
    themeLabel: "🎯 Theme",
    themePlaceholder: "What is this video about?",
    sourcesLabel: "📚 Sources",
    sourcesPlaceholder: "Which sources are you using? (websites, books, people...)",
    imagesLabel: "🖼️ Image ideas",
    imagesPlaceholder: "Which shots or pictures do you want to use?",
    urlsLabel: "🔗 Inspiration URLs",
    urlsPlaceholder: "Links to videos or pages that inspire you",
    buildupTitle: "🎞️ Structure of your vlog",
    introLabel: "🎬 Intro",
    introHint: "Who are you and what will you show today?",
    middleLabel: "🌟 Middle",
    middleHint: "What happens in the biggest part of your video?",
    endLabel: "🏁 Ending",
    endHint: "What do you say at the end? Do you thank the viewer?",
    sectionPlaceholder: "Write what happens in this part here...",
    askAiTitle: "🤖 Ask AI for tips",
    askAiPlaceholder: "For example: how do I make a fun intro for this video?",
    askAiButton: "✨ Ask for a tip",
    askAiThinking: "Thinking...",
    askAiError: "Could not get a tip.",
  },
  ideas: {
    pageTitle: "💡 Ideas",
    filterTheme: "Filter by theme",
    filterAge: "Filter by age",
    allThemes: "All themes",
    allAges: "All ages",
    columnBacklog: "💡 Backlog",
    columnBezig: "🚧 In progress",
    columnAfgerond: "🎉 Done",
    newIdea: "New idea...",
    dropHere: "Drop a card here",
    modalTitle: "Edit idea",
    titleLabel: "Title",
    descriptionLabel: "Short description",
    themeLabel: "Theme/tag",
    ageLabel: "Target age group",
    dateLabel: "Estimated production date",
    notesLabel: "Notes",
    templateLabel: "Template",
    noTemplate: "No template",
    aiSectionTitle: "🤖 Generate with AI",
    aiDisabledMessage: "Add an AI key in Settings to use this.",
    generateScript: "Script",
    generateTitles: "Title suggestions",
    generateThumbnailText: "Thumbnail text",
    generateDescription: "Description",
    generateHashtags: "Hashtags",
    regenerate: "↻ Regenerate",
    generating: "Generating...",
  },
  templatesLibrary: {
    pageTitle: "📚 Templates",
    recommendedLength: "Recommended length",
    thumbnailTips: "Thumbnail tips",
    titleFormulas: "Title formulas",
    checklistPrep: "Pre-production",
    checklistFilming: "Filming",
    checklistEditing: "Editing",
    checklistPublishing: "Publishing",
  },
  trends: {
    pageTitle: "🔮 Trends & Recommendations",
    tabTrending: "Trending now",
    tabRecommendation: "Recommendation",
    category: "Category",
    refresh: "↻ Refresh",
    notConfigured: "YouTube trends aren't configured yet. Ask an adult to set YOUTUBE_API_KEY.",
    views: "views",
    perDay: "/day",
    trendingKeywords: "Trending keywords",
    recTargetAge: "Target age group",
    recTheme: "Theme",
    recThemePlaceholder: "For example: crafting, gaming, sports...",
    recSubmit: "✨ Get recommendation",
    recSuggestedIdeas: "Content ideas",
    recSuggestedTemplate: "Suggested template",
    recToneLength: "Tone & length",
    recReasoning: "Reasoning",
  },
  inspiration: {
    pageTitle: "📌 Inspiration",
    typeLabel: "Type",
    typeLink: "Link",
    typeScreenshot: "Screenshot note",
    typeQuote: "Quote",
    contentPlaceholder: "Link, note, or quote...",
    tagsPlaceholder: "Tags (comma-separated)",
    add: "+ Add",
    filterByTag: "Filter by tag",
    empty: "No inspiration saved yet.",
  },
  tasks: {
    title: "📋 Tasks",
    newPlaceholder: "New task...",
    priorityHigh: "🔴 High",
    priorityNormal: "🟡 Normal",
    priorityLow: "🟢 Low",
    add: "+ Add",
    empty: "No tasks yet. Good job adding one!",
  },
  diary: {
    title: "📔 Diary",
    noSpecificProject: "No specific project",
    goodPlaceholder: "What went well?",
    betterPlaceholder: "What could be better?",
    add: "+ Add to diary",
    empty: "No diary entries yet. Write down what you learned!",
  },
  settings: {
    title: "⚙️ Settings",
    profileTitle: "Profile",
    username: "Username",
    email: "Email",
    displayTitle: "Appearance",
    languageTitle: "🌐 Language",
    dutch: "Nederlands",
    english: "English",
    aiTitle: "🤖 AI assistant",
    aiProvider: "Provider",
    aiKeySet: "✅ Key configured",
    aiKeyNotSet: "No key configured yet",
    aiKeyPlaceholder: "API key",
    aiModelPlaceholder: "Model (optional)",
    aiCustomEndpointPlaceholder: "Custom endpoint URL",
    aiSave: "Save",
    aiRemove: "Remove",
    aiVerify: "Verify API key",
    aiVerifying: "Verifying...",
    youtubeTitle: "▶️ YouTube",
    youtubeConnected: "✅ Connected to channel:",
    youtubeNotConnected: "Not connected — link your YouTube channel to connect published projects to your real videos.",
    youtubeConnect: "Connect with YouTube",
    youtubeDisconnect: "Disconnect",
    youtubeConnecting: "Working...",
    logout: "Log out",
  },
  youtubeLink: {
    title: "▶️ YouTube",
    connectFirstPrefix: "First connect your YouTube channel in ",
    connectFirstSuffix: " to link this video.",
    linkedTo: "Linked to:",
    viewsLikes: "views",
    unlink: "Unlink",
    chooseVideo: "Choose the video that belongs to this project:",
    showVideos: "Show my videos",
    loadingVideos: "Loading...",
  },
  thumbnail: {
    choose: "📷 Choose thumbnail",
    uploading: "Uploading...",
  },
  search: {
    placeholder: "🔍 Search projects, ideas, tasks...",
    noResults: "Nothing found.",
    projects: "Projects",
    ideas: "Ideas",
    tasks: "Tasks",
  },
};

export const TRANSLATIONS = { nl, en };
