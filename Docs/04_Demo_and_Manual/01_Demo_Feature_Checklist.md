# CEDA Demo Feature Checklist

This guide lists the current implemented features in the Campus Event Discovery App (CEDA) so the team can rehearse and present the system consistently during the live demo.

## 1. Public / Guest Features

- Browse published events only
- View individual event details
- Use the AI chatbot from the public site
- Open About Us, Contact Us, Privacy Policy, and Terms & Conditions pages

### What to show

- Public users cannot see draft, pending, rejected, or cancelled events
- Event detail pages show date, time, location, organizer, description, and booking context
- Chatbot can suggest relevant events and now falls back gracefully in limited mode if the AI provider is unavailable

## 2. Authentication & Account Features

- User registration for students and organizers
- Cloudflare Turnstile captcha on registration
- Email verification before login
- Login for student, organizer, and admin roles
- Logout with redirect back to login
- Forgot password flow
- Reset password flow
- Session restore for logged-in users

### What to show

- New users must verify email before they can log in
- Password reset email can be requested
- Logout clears the session and returns the user to the login screen

## 3. Student Features

- Browse events after login
- Bookmark events
- Remove bookmarks
- Register for published events
- Receive booking confirmation email after successful confirmed registration
- See whether booking email succeeded on the confirmation screen
- View registered and waitlisted events in student views
- Cancel registrations

### What to show

- Student can bookmark and unbookmark events
- Student can book a normal event
- Student sees a booking confirmation page
- Student can view their registrations in My Events / dashboard

## 4. Waitlist Features

- Full events support waitlist entry
- Student can join waitlist when event capacity is reached
- Waitlisted status appears in student views
- When a confirmed attendee cancels, the oldest waitlisted student is auto-promoted
- When event capacity increases, eligible waitlisted students can be auto-promoted
- Waitlist promotion email is attempted for promoted students

### What to show

- One event that is already full
- Student joins waitlist
- A seat becomes available
- Waitlisted student is promoted to confirmed registration

## 5. Organizer Features

- Organizer dashboard
- Create event
- Save event as draft
- Submit event for approval
- Edit own event
- Delete own event
- Manage own events
- View organizer analytics in dashboard
- View attendee list for own events
- Export attendee list as CSV
- Receive organizer notification email on first confirmed registration
- Receive organizer notification email when event becomes full

### What to show

- Organizer creates a new event
- Organizer sees event status in dashboard/manage events
- Organizer sees attendee list and CSV export
- Organizer sees analytics:
  - confirmed registrations
  - total waitlisted students
  - average fill rate
  - top-performing events

## 6. Admin Features

- Admin dashboard
- Manage users
- Manage categories
- Manage events
- Approve event submissions
- Reject event submissions
- Add rejection reason
- Add optional approval note
- Review latest moderation feedback

### What to show

- Admin can see pending events
- Admin approves one event and it becomes public
- Admin rejects another event with a reason
- Organizer can later see the latest admin feedback on their own event

## 7. Event Moderation & Publishing Rules

- Public users only see `published` events
- Newly created organizer events are not public until approved
- Organizers can still see their own draft, pending, rejected, and cancelled events
- Admins can see all events
- If an organizer edits a previously published event, it automatically returns to `pending`
- Admin moderation metadata includes review notes and reviewed timestamp

### What to show

- Pending event does not appear on public Events page
- Same event appears to organizer/admin in their management view
- Published event becomes pending again after organizer edits it

## 8. Email Features

- Verification email
- Password reset email
- Student booking confirmation email
- Waitlist promotion email
- Organizer first-registration notification email
- Organizer event-full notification email

### What to show

- At least one real inbox flow if internet and keys are available
- If live email is risky, explain which email flows are implemented and verified

## 9. Chatbot Features

- Public chatbot UI available site-wide
- Backend AI event assistant through `/api/chat`
- Uses live published upcoming events from database
- Returns related event links
- Graceful fallback mode when Gemini is unavailable, rate-limited, or misconfigured

### What to show

- Ask for a type of event
- Open one of the suggested event links
- If the provider is unavailable, show that the chatbot still gives a limited-mode response instead of breaking

## 10. Security & Reliability Features

- Password hashing with `scrypt`
- Signed auth token in HTTP-only cookie
- CSRF protection for write requests
- Role-based route protection
- Rate limiting on auth, registration, admin, and chat endpoints
- Parameterized SQL queries through `mysql2`
- Admin unlock flow for sensitive actions
- Graceful backend shutdown handling

### What to mention if asked

- Passwords are not stored in plain text
- Public event visibility is enforced on the backend, not only hidden in the UI
- Chat and auth flows have rate limiting

## 11. Best Demo Order

Recommended live walkthrough:

1. Show public homepage and published events list
2. Show chatbot asking for an event
3. Log in as organizer and create an event
4. Log in as admin and approve the event
5. Return to public/student view and show the newly published event
6. Log in as student and register for the event
7. Show booking confirmation and mention confirmation email
8. Show organizer dashboard analytics and attendee list/export
9. Show a full event and join the waitlist
10. Cancel a confirmed registration and show waitlist promotion

## 12. Final Demo Prep Checklist

- Prepare one admin account
- Prepare one organizer account
- Prepare one student account
- Prepare one published event
- Prepare one pending event
- Prepare one rejected event
- Prepare one full event
- Prepare one waitlisted student
- Prepare one event with attendees for CSV export
- Confirm email environment variables are working
- Confirm chatbot works, or be ready to explain limited mode
- Rehearse the exact navigation path before presenting

## 13. Demo Accounts & Data Setup

Prepare these before the live presentation so the team does not need to improvise:

### Accounts

- `Admin account`
  - used to approve/reject events and manage moderation
- `Organizer account`
  - used to create events, monitor analytics, view attendees, and export CSV
- `Student account`
  - used to register, bookmark, join waitlists, and test promotion

### Recommended event data

- `One published event`
  - for standard public browsing and booking
- `One pending event`
  - for admin approval workflow
- `One rejected event`
  - for showing moderation notes/rejection reason
- `One full event`
  - for waitlist entry
- `One event with confirmed attendees`
  - for attendee export and organizer analytics
- `One event with at least one waitlisted student`
  - for waitlist promotion demonstration

### Recommended live evidence

- one successful booking confirmation email
- one organizer first-registration email
- one organizer event-full email
- one waitlist promotion example
- one attendee CSV export file ready to open

## 14. Demo Setup Guide

For deployment, local run, and submission preparation, use the separate setup guide:

- [CEDA Local Demo Setup Guide](../03_Deployment_and_Setup/03_Local_Demo_Setup_Guide.md)
