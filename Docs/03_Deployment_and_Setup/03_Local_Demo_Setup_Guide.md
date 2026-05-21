# CEDA Local Demo Setup Guide

This guide explains how to run the Campus Event Discovery App locally for a classroom demonstration or marker review.

## 1. Choose a Demo Strategy

There are two practical ways to demonstrate CEDA:

### Option A: Use the live deployed website

Use this option when:

- the public deployment is stable
- email features need live external services
- the team wants the lowest setup risk during the presentation

Prepare:

- working demo accounts
- stable test data already loaded in the live database
- confirmation that the live site, email, and chatbot are behaving as expected

### Option B: Run locally from the project files

Use this option when:

- the teacher wants the source code and a runnable local copy
- internet access may be unreliable
- the team wants a backup to the live site

## 2. Get the Project Files

You can provide the project in either of these ways:

- clone from GitHub:
  - `git clone <repo-url>`
- or download the repository as a ZIP from GitHub and extract it

After download or extraction, open the project root:

- `Campus-Event-Discovery-App`

## 3. Software to Install First

Required:

- `Node.js`
- `npm`
- `MySQL Server`

Optional but useful:

- `MySQL Workbench`
- `Git`

## 4. Configure the Database

- start MySQL locally
- create or recreate the `campus_events` database
- import:
  - [server/database/schema.sql](/C:/Users/Admin/Campus-Event-Discovery-App/server/database/schema.sql)

This creates the current tables needed by the app, including:

- users
- events
- registrations
- bookmarks
- email_verifications
- password_resets
- used_unlock_tokens

## 5. Configure Environment Variables

Create and configure `server/.env` for the local machine.

Common server variables used by this project:

- `PORT`
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `CLIENT_URL`
- `CLIENT_URL_ALT`
- `AUTH_SECRET`
- `MASTER_PASSWORD_HASH`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CONTACT_EMAIL_TO`
- `RESET_PASSWORD_URL_BASE`
- `VERIFY_EMAIL_URL_BASE`
- `TURNSTILE_SECRET_KEY`
- `GEMINI_API_KEY`
- `NODE_ENV`

Important:

- do not share real production secrets in submitted files
- use demo keys if needed
- if optional keys are missing, some features may not fully work:
  - email
  - captcha
  - chatbot

## 6. Install Project Dependencies

Backend:

```bash
cd server
npm install
```

Frontend:

```bash
cd client
npm install
```

## 7. Run the Project Locally

Manual terminals:

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Or on Windows use:

- [run-local-demo.bat](/C:/Users/Admin/Campus-Event-Discovery-App/run-local-demo.bat)

Expected local URLs:

- backend: `http://localhost:5000`
- frontend: `http://localhost:5173`

## 8. What Still Requires Internet

Running locally does not automatically mean running offline.

These still need internet plus valid keys:

- email delivery through Resend
- Turnstile captcha verification
- chatbot AI provider

If internet is unavailable:

- the core app can still run locally
- external-service features may fail or fall back
- chatbot now has a limited-mode fallback when the AI provider is unavailable

## 9. Recommended Demo Strategy

Best practical strategy:

- use the live site for the actual demonstration if it is stable
- keep the local setup ready as a backup
- submit sanitized project files separately for assessment

Why this is safest:

- fewer setup steps during the presentation
- live integrations such as email are easier to show
- local copy is still available if the marker wants source code or local execution

## 10. Submission Safety Notes

Before sharing files with the teacher:

- do not include real `.env` values
- do not include production database credentials
- do not include private SSH keys
- do not include live API secrets

Safe to share:

- source code
- documentation
- `schema.sql`
- setup instructions
- a sanitized `.env.example`
