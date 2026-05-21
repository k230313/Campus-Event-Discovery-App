# Organizer Notification Design

## Summary

Add two organizer-facing email notifications for confirmed registrations:

- First registration for an event
- Event reaches full capacity

This first version is intentionally minimal:

- notify only the event owner
- notify only for confirmed registrations, not waitlist joins
- do not add any new database columns or tables
- do not block registration success if organizer email delivery fails

## Goals

- Give organizers timely, useful operational feedback
- Reuse the existing Resend-based email infrastructure
- Keep the implementation server-authoritative and low-risk
- Avoid inbox spam from per-registration notifications
- Avoid schema changes for this version

## Non-Goals

- Daily or hourly organizer digest emails
- Notifications to admins or multiple organizers
- Notifications for waitlist joins
- Persistent lifetime deduplication across deploys/restarts
- In-app notification UI

## User Experience

When a student successfully becomes a confirmed attendee:

- If they are the first confirmed attendee for that event, the event owner receives a "first registration" email.
- If that registration causes the event to reach capacity, the event owner receives an "event full" email.

If the student is added to the waitlist instead of being confirmed:

- no organizer notification is sent

If email sending fails:

- the student registration still succeeds
- the backend logs the failure for diagnostics

## Recommended Approach

Implement notification checks directly in the confirmed-registration path in `server/routes/registrationRoutes.js`.

Rationale:

- The backend already owns the authoritative registration decision.
- The registration route already computes capacity-related outcomes.
- The codebase already uses best-effort Resend email sends for attendee confirmation and waitlist promotion.
- This avoids frontend coupling and avoids scheduled-job complexity.

## Backend Design

### Trigger point

Only `POST /api/registrations` should trigger organizer notifications in this version.

The notification logic should run only after:

- the registration row is successfully written
- the resulting registration status is `registered`

It should not run for:

- duplicate/no-op responses
- waitlist responses
- cancellations
- waitlist promotions

### Notification conditions

For a successful confirmed registration:

1. Compute the confirmed attendee count before the new registration.
2. Compute the confirmed attendee count after the new registration.
3. Send `first registration` when the count transitions from `0` to `1`.
4. Send `event full` when:
   - the event has a non-null positive capacity
   - the confirmed attendee count after the registration is equal to capacity
   - the confirmed attendee count before the registration was below capacity

This transition-based check avoids repeat sends from the same request path without requiring persisted notification state.

### Email delivery strategy

Add two new helpers to `server/services/emailService.js`:

- `sendOrganizerFirstRegistrationEmail(...)`
- `sendOrganizerEventFullEmail(...)`

Both should:

- use the existing Resend client setup
- use the same sender resolution logic already used by other emails
- accept normalized event and organizer details
- return structured success/failure results consistent with current mail helpers

Both sends should be best-effort:

- catch and log failures
- never roll back the registration transaction/result

### Logging

Add explicit log lines in the registration route for organizer notification attempts and failures, similar to the current attendee confirmation email logging.

Suggested patterns:

- `POST /api/registrations organizer first-registration email attempt: ...`
- `POST /api/registrations organizer first-registration email failed: ...`
- `POST /api/registrations organizer event-full email attempt: ...`
- `POST /api/registrations organizer event-full email failed: ...`

This keeps production diagnosis straightforward without changing the API response shape.

## Data Requirements

No database schema changes are required.

The route already has enough information, or can cheaply query it, to determine:

- event owner email/name
- event title/date/location
- capacity
- confirmed registration counts before and after insertion

## API Surface

No new public API endpoints are required.

No response contract changes are required for this version because organizer notifications are operational side effects, not user-facing booking state.

## Error Handling

- Registration success must remain the highest priority.
- Organizer notification email failure must never cause registration failure.
- Missing organizer email or malformed event data should be logged and skipped, not surfaced to the student.

## Testing Strategy

Add backend tests around the registration flow to verify:

1. A confirmed registration from zero attendees triggers the first-registration organizer email.
2. A confirmed registration that fills the last remaining seat triggers the event-full organizer email.
3. A registration that is waitlisted triggers neither organizer email.
4. A registration for an already partially filled but not-yet-full event triggers neither organizer email unless it reaches capacity.
5. Organizer email send failure does not fail the registration request.
6. When a single registration both becomes the first attendee and fills capacity, both notifications are allowed to send.

Frontend changes are not required for this feature.

## Risks and Trade-offs

### No persistent deduplication

Because this version avoids schema changes, it does not persist whether an organizer has ever already received an event-full notification.

Implication:

- the route prevents duplicate sends for a single transition
- but if future flows or restarts introduce repeated full transitions, the system does not retain a lifetime "already notified" flag

This is acceptable for the first version because:

- first-registration is naturally one-time from the count transition
- event-full is only sent on the transition to full in this request path
- adding persistent deduplication later is a clean follow-up if needed

### Single-owner scope

This version assumes the event owner is the only notification recipient. That keeps the behavior simple and matches current event ownership semantics.

## Rollout Notes

- No environment variable changes required
- No database migration required
- Safe to deploy with the existing Resend configuration already used by the app

## Follow-up Options

Possible future enhancements, intentionally excluded from this version:

- daily digest emails
- organizer notification preferences
- persistent event-full deduplication
- organizer notifications for waitlist growth
- in-app notification center
