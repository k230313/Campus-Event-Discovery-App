# Campus Event Discovery App

A sample project repository for planning and documenting a solution that helps students discover campus events more easily.

## Project Overview

Students can miss important campus events because information is often scattered across different platforms. This project explores a platform concept that helps students find upcoming events, view key event details, and stay informed about activities happening on campus.

## Repository Structure

- `Docs/` - project documentation and planning files
- `client/` - frontend implementation
- `server/` - backend implementation

## Documentation

Core project documentation in order:

1. [Problem Statement](./Docs/Problem%20Statement.md)
2. [Market Research](./Docs/Market%20Research.md)
3. [Software Requirements Specification](./Docs/SRS%20Report.md)
4. [Week 5 Database and API Design](./Docs/Week5-Database-and-API-Design.md)
5. [Week 6 Backend Development](./Docs/Week6-Backend-Development.md)
6. [Week 7 Backend CRUD](./Docs/Week7-Backend-CRUD.md)
7. [Week 8 Frontend Version 1](./Docs/Week8-Frontend-Version-1.md)
8. [Week 9 Frontend Version 2 Integration](./Docs/Week9-Frontend-Backend-Integration.md)

Supporting documents:

- [Project Weekly Plan](./Docs/Project-Weekly-Plan.md)
- [GitHub Team Guide](./Docs/GitHub-Team-Guide.md)
- [Deployment Guide](./Docs/Deployment-Guide.md)
- [CI/CD Deployment Guide](./Docs/CI-CD-Deployment-Guide.md)

## Notes

This repository is being developed progressively based on weekly deliverables.

## Local Demo

On Windows, you can start the local demo with [run-local-demo.bat](./run-local-demo.bat).
It opens separate terminal windows for the backend and frontend. MySQL must already be running, and `server/.env` must already be configured.

## Changelog

### v3.3.0
- Added booking confirmation emails for successful event registrations using Resend
- Fixed CSRF handling for authenticated write actions so event bookings and other protected form submissions retry correctly after token refresh
- Redirected users to the login page immediately on logout
- Enforced admin approval workflow on public event visibility and organizer edits, including sending previously published organizer-edited events back to pending review

### v3.2.0
- Added Gemini-backed chatbot route at `/api/chat` and connected the existing global ChatBot UI to the backend
- Made the chatbot public with dedicated server-side rate limiting to reduce abuse and quota exhaustion risk
- Moved chatbot event context to the server so AI responses use trusted published event data from MySQL instead of client-supplied event lists

### v3.1.0
- Added major security upgrade: email-based password reset and registration email verification
- Integrated Resend for transactional account emails
- Added expiring, one-time hashed reset tokens for password recovery


### v3.0.0
- Added organiser name display on event cards and event detail page
- Enabled bookmarking for organiser role (bookmark button, My Bookmarks page, nav link)
- Implemented master password session-unlock for admin user deletion
- Fixed radio button visibility on registration form
- Fixed browser tab title

