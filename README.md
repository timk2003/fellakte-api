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

---

# API Dokumentation

## Authentifizierung
- **Jeder API-Request erfordert ein gültiges Supabase JWT!**
- Das Token muss im Header übergeben werden:
  ```
  Authorization: Bearer <dein-jwt-token>
  ```
- Die user_id wird automatisch aus dem Token gezogen und für alle Datenbankoperationen verwendet.

---

## Endpunkte

### 1. Presigned URL für Upload generieren
**POST** `/api/documents/presigned-url`

Erstellt eine temporäre Upload-URL für Cloudflare R2.

**Request Body:**
```json
{
  "filename": "mein_dokument.jpg",
  "mimetype": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://...r2.cloudflarestorage.com/..."
}
```

**Fehlerfall:**
```json
{
  "success": false,
  "message": "Fehlerbeschreibung"
}
```

---

### 2. Dokument analysieren & speichern
**POST** `/api/documents/analyze`

Analysiert ein Bild (OCR), extrahiert strukturierte Felder per KI und speichert das Ergebnis als Dokument.

**Request Body:**
```json
{
  "fileUrl": "https://...r2.cloudflarestorage.com/mein_dokument.jpg"
}
```

**Response (Beispiel):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "user_id": "...",
    "pet_id": 42,
    "title": "Impfpass",
    "description": "",
    "file_url": "https://...",
    "file_type": "image",
    "category": "vaccination",
    "name": "Bello",
    "created_at": "2024-06-01T12:00:00Z"
  }
}
```

**Fehlerfall:**
```json
{
  "success": false,
  "message": "Fehlerbeschreibung"
}
```

---

### 3. Alter eines Haustiers berechnen
**GET** `/api/pets/:id/age`

Berechnet das Alter des Haustiers in Jahren.

**Response (Beispiel):**
```json
{
  "success": true,
  "data": { "age": 4 }
}
```

### 4. Nächsten Geburtstag eines Haustiers berechnen
**GET** `/api/pets/:id/next-birthday`

Gibt das Datum des nächsten Geburtstags des Haustiers zurück.

**Response (Beispiel):**
```json
{
  "success": true,
  "data": { "next_birthday": "2024-09-01" }
}
```

---

## Response-Format
Alle Endpunkte geben folgendes JSON-Format zurück:
- `success`: (boolean) Erfolg der Anfrage
- `message`: (string, optional) Fehler- oder Statusnachricht
- `data`: (object, optional) Ergebnisdaten

---

## Automatische Zuordnung zu Haustieren
- Die API sucht anhand des von der KI extrahierten Tiernamens (`tiername`) und der user_id automatisch das passende Haustier (`pet_id`) in der Datenbank.
- Wird kein passendes Haustier gefunden, bleibt pet_id leer (optional: automatisches Anlegen möglich).

---

## Fehlerbehandlung
- Fehler werden immer als JSON mit `success: false` und einer `message` zurückgegeben.
- HTTP-Statuscodes werden passend gesetzt (z.B. 401 für Auth-Fehler, 500 für Serverfehler).

---

## Hinweise
- Die eigentliche Logik für R2, OCR, Groq und Supabase ist als Platzhalter vorbereitet und muss mit echten API-Keys/Implementierungen ergänzt werden.
- Authentifizierung via Supabase JWT ist als Middleware vorgesehen.
- Die API ist modular aufgebaut und kann leicht um weitere Endpunkte (z.B. für Medikamente, Erinnerungen, Haustierdaten) erweitert werden. 