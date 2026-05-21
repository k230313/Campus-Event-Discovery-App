# Week 7: Backend CRUD

This guide shows how to use the Week 7 CRUD routes in a simple step-by-step way.

## Week 7 Goal

The goal for Week 7 is to finish the basic event management backend.

That means the system should be able to:

- create a new event
- read all events
- read one event
- update one event
- delete one event

This is called `CRUD`:

- `Create`
- `Read`
- `Update`
- `Delete`

## Where the Code Is

The main Week 7 code is in:

- `server/routes/eventRoutes.js`

## CRUD Routes

These are the routes we now have:

- `GET /api/events`
- `GET /api/events/schema`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

## Before Testing

Make sure:

1. XAMPP MySQL is running
2. your backend is running with:

```bash
npm run dev
```

3. Postman is open

Base URL:

```text
http://localhost:5000/api/events
```

## Best Order to Test CRUD

Use this order:

1. `POST` a new event
2. `GET` all events
3. `GET` one event by ID
4. `PUT` update that event
5. `DELETE` that event
6. `GET` all events again

This makes it easier to understand what each route does.

## 1. Create an Event

Method:

```http
POST
```

URL:

```text
http://localhost:5000/api/events
```

Body:

- choose `raw`
- choose `JSON`

Example request body:

```json
{
  "title": "Adam the great",
  "description": "Yes, he is.",
  "date": "2026-05-10",
  "location": "KENT",
  "category": "Competition"
}
```

Example success response:

```json
{
  "id": 1,
  "title": "Adam the great",
  "description": "Yes, he is.",
  "date": "2026-05-10",
  "location": "KENT",
  "category": "Competition"
}
```

What this does:

- creates a new event in MySQL
- returns the saved event
- gives it an ID

Screenshot:

![POST Screenshot](./Week%207%20Crud/POST%20SS.png)

Important:

- remember the `id` value
- you will use it for `GET by id`, `PUT`, and `DELETE`

## 2. Get All Events

Method:

```http
GET
```

URL:

```text
http://localhost:5000/api/events
```

Example success response:

```json
[
  {
    "id": 1,
    "title": "Adam the great",
    "description": "Yes, he is.",
    "date": "2026-05-10",
    "location": "KENT",
    "category": "Competition"
  }
]
```

What this does:

- returns every event in the database

Screenshot:

![GET All Screenshot](./Week%207%20Crud/GET%20SS.png)

## 3. Get One Event by ID

Method:

```http
GET
```

URL example:

```text
http://localhost:5000/api/events/1
```

Example success response:

```json
{
  "id": 1,
  "title": "Adam the great",
  "description": "Yes, he is.",
  "date": "2026-05-10",
  "location": "KENT",
  "category": "Competition"
}
```

What this does:

- returns only one event
- uses the event ID from the URL

Screenshot:

![GET By ID Screenshot](./Week%207%20Crud/GET%20SS%20after%20POST%20.png)

If the ID does not exist, example response:

```json
{
  "error": "Event not found"
}
```

## 4. Update an Event

Method:

```http
PUT
```

URL example:

```text
http://localhost:5000/api/events/1
```

Body:

- choose `raw`
- choose `JSON`

Example request body:

```json
{
  "title": "Updated Hackathon",
  "description": "Updated event details",
  "date": "2026-05-12",
  "location": "Main Auditorium",
  "category": "Competition"
}
```

Example success response:

```json
{
  "id": 1,
  "title": "Updated Hackathon",
  "description": "Updated event details",
  "date": "2026-05-12",
  "location": "Main Auditorium",
  "category": "Competition"
}
```

What this does:

- finds the event with that ID
- replaces the saved values with the new ones

Screenshot:

![PUT Screenshot](./Week%207%20Crud/PUT%20SS.png)

After updating, you can test `GET` again to confirm the new values were saved.

Screenshot after `PUT`:

![GET After PUT Screenshot](./Week%207%20Crud/GET%20SS%20after%20PUT.png)

If the ID does not exist, example response:

```json
{
  "error": "Event not found"
}
```

## 5. Delete an Event

Method:

```http
DELETE
```

URL example:

```text
http://localhost:5000/api/events/1
```

Example success response:

```json
{
  "message": "Event deleted successfully"
}
```

What this does:

- removes the event from the database

Screenshot:

![DELETE Screenshot](./Week%207%20Crud/DEL%20SS.png)

If the ID does not exist, example response:

```json
{
  "error": "Event not found"
}
```

## 6. Check That the Delete Worked

After deleting, test:

```http
GET http://localhost:5000/api/events
```

The deleted event should no longer appear.

If you try to get the deleted event by ID again, you should see:

```json
{
  "error": "Event not found"
}
```

Screenshot after delete:

![GET After DELETE Screenshot](./Week%207%20Crud/GET%20SS%20after%20DEL%20showing%20event%20not%20found.png)

## Schema Route

This route is still available:

```http
GET /api/events/schema
```

Full URL:

```text
http://localhost:5000/api/events/schema
```

What it does:

- shows the event field structure
- helps us understand what an event should contain

Example response:

```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "date": "YYYY-MM-DD",
  "location": "string",
  "category": "string"
}
```

## Common Mistakes

### 1. Using the wrong URL

Correct:

```text
http://localhost:5000/api/events
```

Wrong:

- forgetting `/api`
- using `/schema` for `POST`

### 2. Forgetting JSON body in `POST` or `PUT`

Make sure Postman is set to:

- `Body`
- `raw`
- `JSON`

### 3. Using an ID that does not exist

If the ID is missing, the API will return:

```json
{
  "error": "Event not found"
}
```

### 4. Backend or MySQL is not running

If either one is off, the request will fail.

## What We Learned

This week helps us understand:

- how CRUD works in a real backend
- how to use an ID in the URL
- how `POST`, `GET`, `PUT`, and `DELETE` are different
- how data is stored and changed in MySQL

## Final Result for Week 7

By the end of Week 7, the backend supports full basic CRUD for events using MySQL.
