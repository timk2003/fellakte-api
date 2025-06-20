# fellakte-api

NodeJS Backend-API für OCR-gestützte Dokumentenanalyse (Impfpass, Rechnung etc.) mit Cloudflare R2, Supabase und Groq AI.

## Features
- Bild-Upload via Presigned URL (Cloudflare R2)
- OCR-Analyse (Tesseract/Google Vision)
- KI-gestützte Extraktion strukturierter Felder (Groq AI)
- Speicherung in Supabase (Datenbank & Auth)
- Saubere API-Struktur (routes/, services/, middleware/, utils/)
- Ascii-Banner & Startup-Animation
- Klare JSON-Responses

## Setup
1. Repository klonen
2. `.env.example` kopieren zu `.env` und Werte anpassen
3. Abhängigkeiten installieren:
   ```
   npm install
   ```
4. Server starten:
   ```
   npm start
   ```

## .env Beispiel
Siehe `.env.example` für alle nötigen Variablen.

## Endpunkte
- `POST /api/documents/presigned-url` – Presigned URL für Upload generieren
- `POST /api/documents/analyze` – OCR & KI-Analyse starten

## Authentifizierung
- **Jeder API-Request erfordert ein gültiges Supabase JWT!**
- Das Token muss im Header übergeben werden:
  ```
  Authorization: Bearer <dein-jwt-token>
  ```
- Die user_id wird automatisch aus dem Token gezogen und für alle Datenbankoperationen verwendet.

## Automatische Zuordnung zu Haustieren
- Die API sucht anhand des von der KI extrahierten Tiernamens (`tiername`) und der user_id automatisch das passende Haustier (`pet_id`) in der Datenbank.
- Wird kein passendes Haustier gefunden, bleibt pet_id leer (optional: automatisches Anlegen möglich).

## Hinweise
- Die eigentliche Logik für R2, OCR, Groq und Supabase ist als Platzhalter vorbereitet und muss mit echten API-Keys/Implementierungen ergänzt werden.
- Authentifizierung via Supabase JWT ist als Middleware vorgesehen. 