# CEDA User Manual Screenshot Guide

This guide tells the team exactly which screenshots to capture for the CEDA user manual, what each screenshot should prove, and which account should be used.

The goal is to make the user manual look complete, consistent, and easy to follow for the marker.

## 1. General Screenshot Rules

Use these rules for the whole manual:

- Use the same browser window size for all screenshots
- Use clean demo data and avoid broken or empty screens where possible
- Make sure the browser tab, URL, and important buttons are visible when useful
- Avoid showing private email addresses or secrets unless they are demo/test accounts
- Take screenshots after the page has fully loaded
- If possible, use one consistent naming pattern for files

Recommended filename pattern:

- `01-home-page.png`
- `02-events-page.png`
- `03-login-page.png`

Recommended image style:

- full-page screenshots for major screens
- cropped screenshots for specific features like emails, status badges, or error messages

## 2. Minimum Screenshot Set

If time is limited, these are the minimum screenshots to capture:

1. Home page
2. Public events list
3. Event detail page
4. Login page
5. Register page
6. Forgot password page
7. Organizer dashboard
8. Create event page
9. Manage events page
10. Admin manage events page
11. Student booking confirmation page
12. Waitlist example
13. Attendee export / attendee list
14. Chatbot interaction

## 3. Public / Guest Screenshots

### Screenshot 1: Home Page

- Page: `/`
- Account: not logged in
- Capture:
  - navigation
  - hero section
  - visible CTA or event discovery message
- Purpose:
  - shows the system landing page and first impression

### Screenshot 2: Public Events Page

- Page: `/events`
- Account: not logged in
- Capture:
  - published events only
  - visible event cards/list
  - filters or browsing layout if visible
- Purpose:
  - shows how guests can browse events

### Screenshot 3: Public Event Detail Page

- Page: `/events/:eventId`
- Account: not logged in
- Capture:
  - event title
  - date/time
  - location
  - organizer name
  - description
  - RSVP area
- Purpose:
  - shows event information available to the public

### Screenshot 4: Public Chatbot Open

- Page: any public page
- Account: not logged in
- Capture:
  - chatbot panel open
  - welcome or first assistant message
- Purpose:
  - shows that the assistant is globally available

### Screenshot 5: Chatbot Query Result

- Page: any public page
- Account: not logged in
- Capture:
  - one user message
  - one bot reply
  - related event links if available
- Purpose:
  - shows AI-assisted event discovery

Optional:

- If the provider is unavailable, also capture `Limited mode`
- This is good evidence that the chatbot degrades gracefully instead of breaking

## 4. Authentication Screenshots

### Screenshot 6: Login Page

- Page: `/login`
- Account: not logged in
- Capture:
  - email and password fields
  - login button
  - forgot password link
- Purpose:
  - shows the standard login interface

### Screenshot 7: Register Page

- Page: `/register`
- Account: not logged in
- Capture:
  - full name
  - email
  - password
  - role selection
  - captcha area
- Purpose:
  - shows new account creation flow

### Screenshot 8: Verify Email Success or Verification Page

- Page: `/verify-email`
- Account: verification flow
- Capture:
  - success or verification status message
- Purpose:
  - shows that email verification exists

### Screenshot 9: Forgot Password Page

- Page: `/forgot-password`
- Account: not logged in
- Capture:
  - email input
  - send reset link button
- Purpose:
  - shows password recovery entry point

### Screenshot 10: Reset Password Page

- Page: `/reset-password`
- Account: reset token flow
- Capture:
  - new password fields
  - reset button
- Purpose:
  - shows that password reset is completed through the web app

### Screenshot 11: Logout Result

- Page: after logout
- Account: any logged-in role before logout
- Capture:
  - user is returned to login page
- Purpose:
  - proves logout redirects properly

## 5. Student Screenshots

### Screenshot 12: Student Logged-In View

- Page: `/events` or `/my-events`
- Account: student
- Capture:
  - logged-in navigation
  - student-specific options
- Purpose:
  - shows student role access

### Screenshot 13: Bookmark Action

- Page: event detail or events list
- Account: student
- Capture:
  - bookmarked state on one event
- Purpose:
  - shows that students can save events

### Screenshot 14: My Bookmarks Page

- Page: `/my-bookmarks`
- Account: student or organizer
- Capture:
  - at least one saved event
- Purpose:
  - shows bookmark management

### Screenshot 15: Booking Form / RSVP Action

- Page: `/events/:eventId`
- Account: student
- Capture:
  - RSVP section before submission
  - any seat/food/attendee options if available
- Purpose:
  - shows the registration interface

### Screenshot 16: Booking Confirmation Page

- Page: `/registration-confirmation`
- Account: student
- Capture:
  - event title
  - confirmation state
  - email status message
- Purpose:
  - shows successful registration and confirmation flow

### Screenshot 17: Student My Events Page

- Page: `/my-events`
- Account: student
- Capture:
  - confirmed event in the student list
- Purpose:
  - shows where a student manages registrations

## 6. Waitlist Screenshots

### Screenshot 18: Full Event State

- Page: event detail page for a full event
- Account: student
- Capture:
  - full capacity message
  - waitlist entry option
- Purpose:
  - shows event capacity handling

### Screenshot 19: Waitlist Join Result

- Page: registration confirmation or student event list
- Account: student
- Capture:
  - waitlisted status
- Purpose:
  - shows that full events can still accept users into a waitlist

### Screenshot 20: Promoted Registration

- Page: student event list or confirmation evidence after promotion
- Account: promoted student
- Capture:
  - status now showing confirmed/registered
- Purpose:
  - proves auto-promotion from waitlist works

Optional:

- include a screenshot of the promotion email if available

## 7. Organizer Screenshots

### Screenshot 21: Organizer Dashboard

- Page: `/dashboard`
- Account: organizer
- Capture:
  - organizer welcome area
  - key summary cards
- Purpose:
  - shows the organizer’s main control panel

### Screenshot 22: Organizer Analytics Section

- Page: `/dashboard`
- Account: organizer
- Capture:
  - confirmed registrations
  - waitlisted students
  - average fill rate
  - top-performing events
- Purpose:
  - shows organizer analytics

### Screenshot 23: Create Event Page

- Page: `/create-event`
- Account: organizer
- Capture:
  - event form fields
  - status selector
  - optional settings
- Purpose:
  - shows event creation workflow

### Screenshot 24: Manage Events Page

- Page: `/manage-events`
- Account: organizer
- Capture:
  - event list
  - statuses
  - action buttons
- Purpose:
  - shows organizer event management

### Screenshot 25: Admin Feedback on Organizer Event

- Page: `/manage-events` or `/edit-event/:eventId`
- Account: organizer
- Capture:
  - latest admin feedback panel
  - rejection reason or approval note
- Purpose:
  - shows moderation feedback visibility

### Screenshot 26: Edit Event Page

- Page: `/edit-event/:eventId`
- Account: organizer
- Capture:
  - edit form
  - pending-review warning if applicable
- Purpose:
  - shows event update workflow

### Screenshot 27: Attendee List Dialog

- Page: `/manage-events`
- Account: organizer
- Capture:
  - attendee dialog open
  - attendee names/emails/registered time
- Purpose:
  - shows that organizers can inspect event attendees

### Screenshot 28: CSV Export Evidence

- Page: `/manage-events`
- Account: organizer
- Capture:
  - export button
  - optional second screenshot of the CSV file opened
- Purpose:
  - proves attendee export functionality

### Screenshot 29: Organizer Notification Email

- Page: email inbox
- Account: organizer email
- Capture:
  - first-registration email or event-full email
- Purpose:
  - shows organizer notification functionality

## 8. Admin Screenshots

### Screenshot 30: Admin Dashboard

- Page: `/admin-dashboard`
- Account: admin
- Capture:
  - dashboard overview
  - any summary widgets
- Purpose:
  - shows admin access and role separation

### Screenshot 31: Admin Manage Events Page

- Page: `/admin-manage-events`
- Account: admin
- Capture:
  - list of submitted events
  - visible statuses
- Purpose:
  - shows moderation control panel

### Screenshot 32: Approve Event Example

- Page: `/admin-manage-events`
- Account: admin
- Capture:
  - event with approval action / approved result
- Purpose:
  - shows publication workflow

### Screenshot 33: Reject Event Example

- Page: `/admin-manage-events`
- Account: admin
- Capture:
  - rejection reason entered or rejected state shown
- Purpose:
  - shows moderation with feedback

### Screenshot 34: Manage Users Page

- Page: `/manage-users`
- Account: admin
- Capture:
  - user list and management controls
- Purpose:
  - shows admin user management

### Screenshot 35: Categories Page

- Page: `/categories`
- Account: admin
- Capture:
  - category list and controls
- Purpose:
  - shows category management

Optional:

- reports page if it is fully working and useful visually

## 9. Email Evidence Screenshots

If email is working in the demo environment, capture these:

### Screenshot 36: Verification Email

- Capture:
  - subject
  - email body
- Purpose:
  - proves account verification email exists

### Screenshot 37: Password Reset Email

- Capture:
  - subject
  - email body
- Purpose:
  - proves password reset email exists

### Screenshot 38: Booking Confirmation Email

- Capture:
  - subject
  - event details
- Purpose:
  - proves attendee confirmation email exists

### Screenshot 39: Waitlist Promotion Email

- Capture:
  - promotion confirmation message
- Purpose:
  - proves waitlist promotion notifications exist

## 10. Security / Reliability Evidence Screenshots

These are optional for the user manual, but useful if the report/manual wants system-quality evidence:

### Screenshot 40: Unauthorized Access Result

- Try to open a restricted page with the wrong role or without login
- Capture:
  - redirect or access-denied behavior
- Purpose:
  - shows role protection

### Screenshot 41: Pending Event Hidden from Public

- Capture two screenshots:
  - public events page without the pending event
  - organizer/admin page where the same pending event is visible
- Purpose:
  - proves server-enforced approval rules

### Screenshot 42: Chatbot Limited Mode

- Capture only if provider is unavailable
- Purpose:
  - proves the chatbot now fails gracefully

## 11. Best Screenshot Capture Order

To save time, capture screenshots in this order:

1. public pages
2. auth pages
3. student pages
4. organizer pages
5. admin pages
6. email evidence
7. waitlist/promotion evidence
8. special security/reliability evidence

This reduces repeated login/logout and account switching.

## 12. Suggested Team Assignment

You can split the screenshots like this:

- `Navroop`
  - public pages
  - login/register/forgot/reset pages
  - student booking flow
- `Adamson`
  - organizer dashboard
  - create/edit/manage events
  - attendee export
  - chatbot
- `Mahak`
  - admin dashboard
  - manage users
  - moderation workflow
- `David`
  - email inbox screenshots
  - DB/setup/deployment screenshots if needed for appendix

Adjust based on who has access to each environment/account.

## 13. Final Checklist Before Inserting Screenshots into the User Manual

- confirm screenshots are named clearly
- confirm image quality is readable
- confirm no private secrets are visible
- confirm every major user role is covered
- confirm every major workflow is covered
- confirm at least one screenshot shows:
  - booking confirmation
  - waitlist
  - attendee export
  - admin approval/rejection
  - organizer analytics
  - chatbot

If you want a cleaner manual, use captions like:

- `Figure 1. Public home page`
- `Figure 2. Event browsing interface`
- `Figure 3. User registration page`
- `Figure 4. Organizer dashboard`
- `Figure 5. Admin event approval interface`
