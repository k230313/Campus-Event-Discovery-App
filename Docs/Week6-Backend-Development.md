# Week 6: Backend Development

This document explains what we did for Week 6 in a simple step-by-step way.

## Week 6 Goal

The goal for this week was to move from hardcoded event data to a real database.

Before Week 6:

- our backend had routes
- our event data was stored in a temporary array
- data disappeared when the server restarted

After Week 6:

- the backend connects to MySQL
- event data is stored in a real database
- we can test `GET` and `POST` requests properly

## What We Added

These are the main files used for Week 6:

- `server/config/db.js`
- `server/database/schema.sql`
- `server/.env.example`
- `server/routes/eventRoutes.js`
- `server/package.json`

## Tools We Used

We used these tools:

- `XAMPP` for MySQL
- `Postman` for API testing
- `VS Code` for editing code
- `Node.js` and `Express` for the backend

## Step 1: Install XAMPP

We needed XAMPP because it gives us a simple way to run MySQL on our computer.

What to do:

1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Install it
3. Open `XAMPP Control Panel`
4. Start `Apache`
5. Start `MySQL`

Why this matters:

- `MySQL` is the database server
- our backend cannot save or read event data unless MySQL is running

## Step 2: Install Postman

We used Postman to test API requests.

What to do:

1. Download Postman from [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
2. Install it
3. Open Postman

Why this matters:

- browser is fine for simple `GET` requests
- Postman is better for `POST` requests because we can send JSON data

## Step 3: Install the Backend Package

We added the MySQL package to the backend.

Package used:

- `mysql2`

Why:

- this lets Node.js connect to MySQL

This is listed in:

- `server/package.json`

## Step 4: Create the Database Structure

We created a SQL file here:

- `server/database/schema.sql`

This file does 2 things:

1. creates the database:
   - `campus_event_db`
2. creates the table:
   - `events`

The table stores:

- `id`
- `title`
- `description`
- `date`
- `location`
- `category`

## Step 5: Create the `.env` File

We used environment variables so the database login details are not hardcoded in the main code.

Example file:

- `server/.env.example`

We then create:

- `server/.env`

Example:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=campus_event_db
```

Why this matters:

- the backend reads these values when it starts
- this tells the app how to connect to MySQL

## Step 6: Connect the Backend to MySQL

We created:

- `server/config/db.js`

This file:

- imports `mysql2`
- reads values from `.env`
- creates a connection pool
- exports that connection

Simple idea:

- instead of connecting to MySQL again and again in every file
- we make one reusable database connection file

## Step 7: Update the Event Routes

We updated:

- `server/routes/eventRoutes.js`

Before:

- it used a temporary JavaScript array

Now:

- `GET /api/events` reads events from MySQL
- `POST /api/events` inserts a new event into MySQL
- `GET /api/events/schema` still shows the event structure

## Step 8: Start the Backend

In the `server` folder, run:

```bash
npm install
npm run dev
```

If the server starts correctly, you should see:

```text
Server running on port 5000
```

## Step 9: Test the API

### Test 1: Get the schema

Open:

- `http://localhost:5000/api/events/schema`

This checks if the route is working.

Important:

- this does not confirm MySQL is working
- it only confirms the route and backend are running

### Test 2: Get all events

Open:

- `http://localhost:5000/api/events`

This checks if the backend can read from the database.

### Test 3: Post a new event

In Postman:

1. choose `POST`
2. use this URL:
   - `http://localhost:5000/api/events`
3. go to `Body`
4. choose `raw`
5. choose `JSON`
6. send this:

```json
{
  "title": "Hackathon",
  "description": "24-hour coding event",
  "date": "2026-05-10",
  "location": "Engineering Building",
  "category": "Competition"
}
```

If it works:

- the API returns the new event
- the event is saved in MySQL

## Screenshots

### GET API Working

![GET API Working](./Week%206%20database%20docs/SS%20of%20GET%20api%20working.png)

### POST API Working

![POST API Working](./Week%206%20database%20docs/SS%20of%20POST%20api%20working.png)

## What Went Wrong

While testing `POST /api/events`, we got this error:

- `Failed to create event`

After checking the backend terminal, the real error was:

- `Access denied for user 'root'@'localhost' (using password: NO)`

What this meant:

- the backend was trying to connect to MySQL without the correct password

## How It Was Fixed

We fixed it by updating:

- `server/.env`

We made sure:

- `DB_USER` was correct
- `DB_PASSWORD` had the actual MySQL password
- `DB_NAME` matched `campus_event_db`

Then we restarted the backend and tested again.

After that:

- `POST /api/events` worked
- `GET /api/events` showed the saved event

## What We Learned

This week helped us understand:

- how a backend connects to MySQL
- why `.env` files are useful
- the difference between a route working and a database working
- how to test APIs using `GET` and `POST`
- how to debug backend errors by reading the terminal

## Beginner Notes

Important things to remember:

- `/api/events` is a route, not a real folder
- `GET` is used to read data
- `POST` is used to send new data
- `localhost:5000` means the backend is running on your own computer
- if MySQL is not running, database routes will fail

## Final Result for Week 6

By the end of Week 6, we completed the basic backend database setup:

- MySQL is connected
- the `events` table exists
- the backend reads events from the database
- the backend can save new events into the database
- API testing works with Postman

This gives us a proper base for the next backend tasks.
