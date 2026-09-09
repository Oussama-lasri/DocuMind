# DocuMind — Frontend

A Next.js (App Router) + TypeScript frontend for the DocuMind FastAPI backend: authentication, document management, and a chat interface with source citations.

## Design

The UI uses a small custom design system rather than default component-library styling — see `app/globals.css` for the full token set:

- **Paper / ink neutrals** with a single amber "highlighter" accent (`--mark`) standing in for a pen mark on a page.
- **Source Serif 4** for headings, **IBM Plex Sans** for UI text, **IBM Plex Mono** reserved for real data (file sizes, match scores, agent names) — not decoration.
- Flat surfaces with hairline borders instead of card shadows; citations render as small numbered marks that link an answer to a footnote-style "Sources" rail, echoing how a real document cites its sources.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at your backend
npm run dev
```

The app runs at `http://localhost:3000`.

## Required backend change: CORS

The backend doesn't currently allow cross-origin requests, which the browser needs since the frontend runs on a different port/origin. Apply `backend-main.py.patch` (included alongside this README) to `backend/app/main.py`, or add manually:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(AuthMiddleware)

# Must be added *after* AuthMiddleware so it wraps it (outermost middleware
# runs first), which lets it answer CORS preflight requests and attach CORS
# headers to error responses.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## How auth works

- `POST /api/v1/auth/login` expects `application/x-www-form-urlencoded` (`username`, `password`) — that's `OAuth2PasswordRequestForm` on the backend. `lib/api.ts#login` sends it that way even though the field is semantically an email.
- `POST /api/v1/auth/register` expects JSON matching `UserCreate` (`full_name`, `email`, `password`).
- Both return a `Token` (`access_token`, `token_type`). There's no `GET /api/v1/auth/me` yet, so the signed-in user's id/email are read straight off the JWT's `sub`/`user_id` claims client-side (`lib/auth-storage.ts#decodeToken`). If you add a `/me` endpoint later, swap that out for a real fetch.
- The token is kept in `localStorage` for API calls and mirrored into a plain (non-httpOnly) cookie so `middleware.ts` can gate `/chat` and `/documents` at the edge. The real authorization check still happens against the backend on every request — the cookie is only a UX redirect, not a security boundary.

## Talking to the stubbed endpoints

`POST /api/v1/chat/chat` and `GET /api/v1/documents/list` currently return hardcoded data on the backend (see the placeholder responses in `document.py` / `chat.py`). The frontend is built against the real Pydantic schemas (`ChatResponse`, `DocumentList`, etc.), so once you wire those endpoints to real logic, the UI needs no changes — you'll start seeing real filenames, statuses, and grounded answers with real sources instead of the placeholder ones.

## Project structure

```
app/
  page.tsx                  marketing landing page
  login/, register/         auth pages (split-screen layout)
  (app)/layout.tsx          authenticated shell: sidebar + auth guard
  (app)/chat/page.tsx       chat UI: sessions, message thread, sources rail
  (app)/documents/page.tsx  upload, list, search, delete
components/
  ui/                       hand-built shadcn-style primitives on our tokens
  layout/                   sidebar, auth split-screen shell
  documents/                upload dropzone, status badge
  chat/                     message bubble, sources panel, session list, input
lib/
  api.ts                    typed fetch client for the FastAPI backend
  auth-context.tsx          React auth provider (login/register/logout)
  auth-storage.ts           token persistence + JWT decoding
  chat-storage.ts           client-side chat session persistence (localStorage)
  types.ts                  TypeScript mirrors of the backend Pydantic schemas
middleware.ts                redirects unauthenticated users away from the app
```

## Notes / next steps

- Chat sessions are stored client-side only (`localStorage`, per user id) since the backend doesn't persist conversation history yet. Once it does, swap `lib/chat-storage.ts` for real API calls.
- `GET /api/v1/documents/search` currently returns whatever shape `get_documents_from_retriever` produces, not a typed schema — it isn't wired into the UI yet. Once that endpoint returns a stable shape, it'd slot naturally into the chat flow.
- Everything is client-rendered (`"use client"`), which is the simplest fit for a JWT-in-localStorage backend with no server-side session. If you move to httpOnly cookies issued by the backend, more of this could move server-side.
