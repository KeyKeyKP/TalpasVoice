# Talpas — Glasovni Diktafon za Vnos Dela

Spletna aplikacija za glasovni vnos opravljenega dela. Zaposleni opišejo delo v govoru, aplikacija pretvori zvok v besedilo, ekstrahira strukturirane podatke in jih izvozi v Excel format kompatibilen s sistemom Talpas-invoices.

## Zahteve

- Node.js 18+
- OpenAI API ključ (za Whisper transkripcijo)
- Anthropic API ključ (za Claude ekstrakcijo podatkov)

## Hitri začetek

```bash
# 1. Kloniraj repozitorij
git clone <repo-url>
cd voice-timesheet

# 2. Nastavi environment spremenljivke
cp .env.example .env
# Uredi .env in dodaj API ključe

# 3. Namesti odvisnosti
cd backend && npm install
cd ../frontend && npm install

# 4. Zaženi development strežnik
# Terminal 1 — Backend:
cd backend && npm run dev

# Terminal 2 — Frontend:
cd frontend && npm run dev

# 5. Odpri http://localhost:5173
```

## Docker

```bash
cp .env.example .env
# Uredi .env

docker-compose up --build
```

## Zgradba projekta

```
voice-timesheet/
├── backend/          Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/   transcribe, extract, export
│   │   ├── services/ whisper, claude, excel
│   │   └── config/   employees
│   └── ...
├── frontend/         React + Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   └── hooks/
│   └── ...
└── .env.example
```

## API

| Metoda | Pot | Opis |
|--------|-----|------|
| POST | /api/transcribe | Whisper transkripcija audio datoteke |
| POST | /api/extract | Claude ekstrakcija strukturiranih podatkov |
| POST | /api/export | Generiranje Excel .xlsx datoteke |
| GET  | /api/employees | Seznam zaposlenih |
| GET  | /api/clients | Seznam znanih strank |

## Excel format

Sheet: `delo` — stolpci: STRANKA, Delo, Datum, Kontakt, Število ur, Opis, Opravil
