# Week 5: Database and API Design

## 1. Database Schema

### Table: `events`

| Field | Type | Rules |
| --- | --- | --- |
| id | integer | primary key |
| title | varchar | required |
| description | text | required |
| date | date | required |
| location | varchar | required |
| category | varchar | required |

## 2. REST APIs

### Get all events
- `GET /api/events`

### Get event schema
- `GET /api/events/schema`

### Create event
- `POST /api/events`

Example body:

```json
{
  "title": "Hackathon",
  "description": "24-hour coding event",
  "date": "2026-04-25",
  "location": "Engineering Building",
  "category": "Competition"
}
```

## 3. Data Validation

Rules:
- `title` is required
- `description` is required
- `date` must be in `YYYY-MM-DD`
- `location` is required
- `category` is required

Project structure:

```text
server/
  index.js
  routes/
    eventRoutes.js
  models/
    eventModel.js
  validation/
    eventValidation.js
```
