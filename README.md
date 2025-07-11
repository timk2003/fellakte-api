# fellakte-api

NodeJS Backend-API für Tierdokumente, Haustiere, Medikamente und Erinnerungen mit OCR, Cloudflare R2, Firebase/Firestore und Groq AI.

---

## Features
- Bild-Upload via Presigned URL (Cloudflare R2)
- OCR-Analyse (Tesseract/Google Vision)
- KI-gestützte Extraktion strukturierter Felder (Groq AI)
- Speicherung in Firestore (Datenbank & Auth via Firebase)
- Haustierverwaltung, Medikation, Erinnerungen
- Saubere API-Struktur (routes/, services/, middleware/, utils/)
- Ascii-Banner & Startup-Animation
- Klare JSON-Responses & Validierung mit zod

---

## Setup
1. Repository klonen
2. `.env.example` kopieren zu `.env` und Werte anpassen (siehe unten)
3. Abhängigkeiten installieren:
   ```
   npm install
   ```
4. Server starten:
   ```
   npm start
   ```

---

## .env Beispiel
Siehe `.env.example` für alle nötigen Variablen (Firebase, R2, Groq, Test-User etc.).

---

## Authentifizierung
- **Jeder API-Request erfordert ein gültiges Firebase JWT!**
- Das Token muss im Header übergeben werden:
  ```
  Authorization: Bearer <dein-firebase-id-token>
  ```
- Die user_id wird automatisch aus dem Token gezogen und für alle Datenbankoperationen verwendet.

---

# API Dokumentation

## Haustiere (`/api/pets`)

### Haustier anlegen
**POST** `/api/pets`

**Body:**
```json
{
  "name": "Bello",
  "species": "dog",
  "breed": "Labrador",
  "birth_date": "2020-01-01",
  "gender": "male",
  "color": "schwarz",
  "weight": 25,
  "microchip": "1234567890",
  "notes": "Testhund",
  "last_vaccination": "2024-01-01",
  "avatar_url": null
}
```
**Validierung:**
- name: string, Pflicht
- species: "dog" | "cat", Pflicht
- gender: "male" | "female" | "unknown", optional
- ... (siehe validation/pet.js)

### Eigene Haustiere abfragen
**GET** `/api/pets`

### Haustier löschen
**DELETE** `/api/pets/:id`

### Alter berechnen
**GET** `/api/pets/:id/age`
**Response:** `{ "success": true, "data": { "age": 4 } }`

### Nächsten Geburtstag berechnen
**GET** `/api/pets/:id/next-birthday`
**Response:** `{ "success": true, "data": { "next_birthday": "2024-09-01" } }`

---

## Medikamente (`/api/medications`)

### Medikation anlegen
**POST** `/api/medications`

**Body:**
```json
{
  "pet_id": "...",
  "name": "Antibiotikum",
  "dosage": "1 Tablette",
  "frequency": "daily",
  "start_date": "2024-06-20",
  "end_date": "2024-06-27",
  "notes": "Mit Futter geben",
  "reminder": true,
  "reminder_times": ["morning"],
  "status": "active",
  "therapy_type": "medication"
}
```
**Validierung:**
- pet_id: uuid, Pflicht
- name: string, Pflicht
- ... (siehe validation/medication.js)

### Alle eigenen Medikamente abfragen
**GET** `/api/medications`

### Medikation aktualisieren
**PUT** `/api/medications/:id`

### Medikation löschen
**DELETE** `/api/medications/:id`

---

## Erinnerungen (`/api/reminders`)

### Erinnerung anlegen
**POST** `/api/reminders`

**Body:**
```json
{
  "pet_id": "...",
  "title": "Medikamentengabe",
  "description": "Antibiotikum geben",
  "reminder_date": "2024-06-21",
  "reminder_time": "08:00",
  "reminder_type": "medication",
  "reminder_frequency": "daily",
  "reminder_times": ["morning"],
  "status": "pending",
  "email_notification": true,
  "sms_notification": false,
  "medication_id": "..."
}
```
**Validierung:**
- pet_id: uuid, Pflicht
- title: string, Pflicht
- ... (siehe validation/reminder.js)

### Alle eigenen Erinnerungen abfragen
**GET** `/api/reminders`

### Erinnerung aktualisieren
**PUT** `/api/reminders/:id`

### Erinnerung löschen
**DELETE** `/api/reminders/:id`

---

## Dokumente & OCR (`/api/documents`)

### Presigned URL für Upload generieren
**POST** `/api/documents/presigned-url`

**Body:**
```json
{
  "filename": "mein_dokument.jpg",
  "mimetype": "image/jpeg"
}
```
**Response:** `{ "success": true, "url": "https://...r2.cloudflarestorage.com/..." }`

### Dokument analysieren & speichern
**POST** `/api/documents/analyze`

**Body:**
```json
{
  // ...
}
```

---

## Fehlerbehandlung & Response-Format
- Fehler werden immer als JSON mit `success: false` und einer `message` (und ggf. `errors`) zurückgegeben.
- HTTP-Statuscodes werden passend gesetzt (z.B. 401 für Auth-Fehler, 422 für Validierungsfehler, 400/500 für Serverfehler).
- Alle Responses enthalten mindestens:
  - `success`: (boolean)
  - `message`: (string, optional)
  - `data`: (object, optional)
  - `errors`: (array, optional, bei Validierungsfehlern)

---

## Hinweise
- Die API ist modular aufgebaut und kann leicht erweitert werden.
- Validierung erfolgt mit zod, Fehler werden klar zurückgegeben.
- Automatische Zuordnung zu Haustieren bei Dokumenten-Analyse.
- Cleanup von Testdaten ist im Testscript integriert.
- Siehe Quellcode für weitere Details zu Feldern und Validierung. 