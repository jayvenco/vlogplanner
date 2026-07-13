# 🎥 VlogPlanner

Een vrolijke, eenvoudige webapp die jonge content creators stap voor stap helpt bij het bedenken, voorbereiden, opnemen en publiceren van YouTube-video's en vlogs.

## Screenshots

> _Voeg hier screenshots toe zodra de app draait._

| Dashboard | Mijn Projecten | Checklist |
| --- | --- | --- |
| `screenshots/dashboard.png` | `screenshots/projecten.png` | `screenshots/checklist.png` |

| Ideeën (Kanban) | Storyboard | Video Planner |
| --- | --- | --- |
| `screenshots/ideeen.png` | `screenshots/storyboard.png` | `screenshots/video-planner.png` |

## Installatie (Docker)

Vereisten: [Docker](https://www.docker.com/) en Docker Compose.

```bash
git clone https://github.com/jayvenco/vlogplanner.git
cd vlogplanner
docker compose up --build
```

Open daarna **http://localhost:3000** in de browser. Klaar!

De database (SQLite) en geüploade thumbnails worden automatisch aangemaakt in `./data` en `./uploads` bij de eerste start — geen handmatige configuratie nodig.

### Configuratie (optioneel)

Kopieer `.env.example` naar `.env` om de JWT-secret, tokenvervaltijd of de host-poort aan te passen:

```bash
cp .env.example .env
```

Zonder `.env`-bestand werkt de app ook prima met veilige standaardwaarden voor lokaal gebruik.

## Ontwikkelmodus (zonder Docker)

**Backend** (vereist Python 3.12; werkt ook op 3.9+):

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (vereist Node 20+):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. Vite proxyt `/api` en `/uploads` automatisch naar de backend op poort 8000, dus er is geen CORS-configuratie nodig.

## Productie

`docker compose up --build -d` bouwt en start beide containers op de achtergrond:

- `frontend` — nginx serveert de gebouwde React-app op poort 3000 (te wijzigen via `FRONTEND_PORT`) en proxyt `/api` en `/uploads` naar de backend.
- `backend` — FastAPI op poort 8000 (alleen bereikbaar binnen het Docker-netwerk).

Data blijft bewaard in de bind-mounts `./data` (database), `./uploads` (thumbnails) en `./backups` (automatische back-ups), ook na `docker compose down`. Gebruik `docker compose down -v` alleen als je bewust alles wilt wissen (let op: dit verwijdert geen bind-mounts, enkel eventuele named volumes).

### Automatische back-ups

Elke 1e van de maand (03:00 uur) maakt de backend automatisch een zip van de database en alle geüploade thumbnails in `./backups/`. De laatste 12 back-ups worden bewaard; oudere back-ups worden automatisch verwijderd.

### YouTube koppelen (optioneel)

Om projecten te kunnen koppelen aan echte YouTube-video's (zie "YouTube" hieronder) heb je je eigen gratis Google OAuth-credentials nodig — de app kan deze niet voor je aanmaken. Eenmalig instellen:

1. Ga naar de [Google Cloud Console](https://console.cloud.google.com/) en maak een nieuw project (of gebruik een bestaand project).
2. Ga naar **APIs & Services → Library**, zoek **YouTube Data API v3** en klik op **Enable**.
3. Ga naar **APIs & Services → OAuth consent screen**, kies **External**, vul de verplichte velden in (appnaam, e-mail) en voeg jezelf toe als **Test user** (zolang de app niet gepubliceerd is bij Google, kunnen alleen test users inloggen).
4. Ga naar **APIs & Services → Credentials → Create Credentials → OAuth client ID**, kies type **Web application**.
5. Voeg bij **Authorized redirect URIs** exact toe:
   - Lokaal ontwikkelen: `http://localhost:5173/api/youtube/callback`
   - Productie (Docker): `http://<jouw-host>:3000/api/youtube/callback` (of je eigen domein/poort)
6. Kopieer de **Client ID** en **Client secret** naar je `.env`-bestand:

```bash
YOUTUBE_CLIENT_ID=jouw-client-id.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=jouw-client-secret
YOUTUBE_REDIRECT_URI=http://localhost:5173/api/youtube/callback
```

7. (Her)start de app. Bij **Instellingen** verschijnt nu een werkende "Verbind met YouTube"-knop. Zonder deze variabelen blijft de rest van de app gewoon werken — alleen die knop geeft dan een nette foutmelding.

## Functionaliteit

- 🏠 **Dashboard** — overzicht van projecten, taken, ideeën, laatste project, motiverende quote en behaalde badges
- 🎬 **Mijn Projecten** — video-projecten met titel, beschrijving, thumbnail en status (Idee → Script → Opnemen → Bewerken → Klaar → Gepubliceerd)
- ✅ **Checklist** — automatische checklist per project (voorbereiding / tijdens filmen / na filmen), met eigen items toevoegen
- 🎞️ **Storyboard** — eenvoudig scène-voor-scène storyboard per project (Intro, Scene 1-3, Einde)
- 🧭 **Sjabloon** — leidraad per project (thema, bronnen, afbeeldingen-ideeën, inspiratie-URLs, opbouw intro/midden/einde) plus een veld om GPT om tips te vragen (vereist een OpenAI API-sleutel bij Instellingen)
- 📝 **Video Planner** — uitleg over hoe je een leuke video opbouwt
- 📖 **Tips** — tips over filmen, geluid, presenteren en bewerken
- 💡 **Ideeën** — Kanban-bord (Ideeën / Mee bezig / Later / Klaar) met drag & drop
- 📋 **Taken** — todo-lijst met deadline en prioriteit
- 📔 **Dagboek** — bijhouden wat goed ging en wat beter kan, per project of algemeen
- 🏅 **Badges** — beloningen voor mijlpalen zoals "Eerste project!" en "Checklist kampioen!"
- 🎨 **5 thema's** — Licht, Donker, Rainbow, Cyberpunk, Earth colors — te kiezen bij Instellingen
- 🌗 Automatische voortgangsbalk per project, thumbnail-upload en autosave
- 🔍 **Zoeken** — doorzoek projecten, ideeën en taken
- 💾 **Automatische back-ups** — maandelijkse zip van database + uploads, laatste 12 bewaard
- ▶️ **YouTube** — koppel je echte kanaal (OAuth) en link een gepubliceerd project aan de bijbehorende video, met live weergaven/likes op de projectpagina

## Techniek

- **Backend:** FastAPI, SQLAlchemy (SQLite), JWT-authenticatie, reportlab (PDF-export), OpenAI API (GPT-tips), APScheduler (maandelijkse back-ups)
- **Frontend:** React + Vite + TypeScript, `@dnd-kit` voor drag & drop
- **Infrastructuur:** Docker Compose, nginx als reverse proxy voor de frontend-container

## Mapstructuur

```
vlogplanner/
├── backend/       # FastAPI app, modellen, routers
├── frontend/      # React + Vite + TypeScript app
├── docker-compose.yml
├── .env.example
└── README.md
```
