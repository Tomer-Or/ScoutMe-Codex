# ScoutMe

ScoutMe is a football talent discovery platform built as an MVP portfolio project.

The product is designed around two main users:

- `Players` who create profiles, upload highlights, and share updates about their performances
- `Scouts / Clubs` who search for talent, review profiles, and post recruiting or trial-day announcements

The goal of the project is to feel like an early-stage sports-tech startup product rather than a static demo. It combines player discovery, profile-building, highlights, and a shared feed where clubs and players can post meaningful updates.

## Product Purpose

ScoutMe helps emerging football players become visible and gives scouts a faster way to find relevant talent.

Players can use the platform to:

- create a detailed football profile
- present stats, club history, and achievements
- upload highlight videos
- publish match summaries or performance updates

Scouts and clubs can use the platform to:

- search and filter players by profile traits
- review footage and player information quickly
- endorse and comment on players
- publish recruiting notes or trial-day announcements in the feed

## Core Flow

The main product flow is built around discovery and visibility:

1. A player registers and creates a football profile.
2. The player adds stats, club history, achievements, and highlight videos.
3. The player can also post updates such as a game summary or recent performance note.
4. Scouts and clubs open the home feed first, where they can see club announcements, player posts, and highlights.
5. Scouts move from the feed into player discovery through search, filtering, and full profile pages.
6. Scouts can endorse players, leave comments, and track the talent that stands out.

## Main Features

- Authentication with player and scout roles
- Player profile creation and editing
- Club history, stats, and achievements
- Highlight video posting
- Feed with real player posts, club posts, and highlights
- Player search and filtering
- Comments and endorsements
- Placeholder sections for messaging, AI recommendations, and verification

## Tech Stack

- Backend: FastAPI, SQLModel, PostgreSQL, JWT authentication
- Frontend: Next.js, TypeScript, TailwindCSS
- Infrastructure: Docker Compose

## Project Structure

```text
scoutme/
  backend/
  frontend/
  docker-compose.yml
```

## Run With Docker

```bash
cd scoutme
docker compose up --build
```

Frontend:

- `http://localhost:3000`

Backend API docs:

- `http://localhost:8000/docs`

## Local Development

### Backend

```bash
cd scoutme/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd scoutme/frontend
copy .env.local.example .env.local
npm install
npm run dev
```

## Current MVP Direction

This version focuses on:

- player visibility
- scout discovery
- meaningful profile presentation
- a shared football-focused feed

It is structured so it can later expand into:

- direct messaging
- profile verification
- AI recommendations
- saved shortlists
- richer club workflows
