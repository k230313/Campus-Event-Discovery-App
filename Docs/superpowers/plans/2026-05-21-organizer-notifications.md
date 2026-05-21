# Organizer Notifications Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send best-effort organizer emails to the event owner when an event receives its first confirmed registration and when a confirmed registration fills the last available seat.

**Architecture:** Keep the feature entirely in the backend. Extend the existing Resend email service with two organizer email helpers, add small pure helper functions in the registration route for transition detection, and trigger the emails only from the confirmed-registration path in `POST /api/registrations`. Keep registration success authoritative and treat organizer email delivery as a logged side effect only.

**Tech Stack:** Node.js, Express 5, mysql2, Resend, node:test, existing `emailService.js` and `registrationRoutes.js`

---

## File Structure

- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\services\emailService.js`
  - Add two organizer notification email helpers alongside the existing booking and waitlist email helpers.
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\routes\registrationRoutes.js`
  - Add small pure helpers for organizer notification transitions and trigger the emails after successful confirmed registrations.
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\emailService.test.js`
  - Add direct unit tests for the new organizer email helpers.
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\registrationRoutes.test.js`
  - Add pure helper tests for first-registration and event-full transition detection.
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\ai-context\backend.md`
  - Record that organizer notifications are sent from the registration route.
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\ai-context\status.md`
  - Record the new organizer notification behavior in project memory.

### Task 1: Add organizer email helpers with direct tests

**Files:**
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\services\emailService.js`
- Test: `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\emailService.test.js`

- [ ] **Step 1: Write the failing email-service tests**

Add these tests to `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\emailService.test.js` after the existing booking email tests:

```js
const {
  sendBookingConfirmationEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
} = require("../services/emailService");

test("sendOrganizerFirstRegistrationEmail sends the organizer a first-booking summary", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_first_1" }, error: null };
      },
    },
  };

  try {
    const result = await sendOrganizerFirstRegistrationEmail({
      resend,
      to: "organizer@example.com",
      organizerName: "Organizer Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: "2026-06-15",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
      },
      idempotencyKey: "organizer-first/42/1",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your event has its first registration");
    assert.equal(sentPayloads[0].to[0], "organizer@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /15 June 2026/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});

test("sendOrganizerEventFullEmail sends the organizer a capacity-reached summary", async () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalEmailFrom = process.env.EMAIL_FROM;

  process.env.RESEND_API_KEY = "test-api-key";
  process.env.EMAIL_FROM = "noreply@example.com";

  const sentPayloads = [];
  const resend = {
    emails: {
      send: async (payload) => {
        sentPayloads.push(payload);
        return { data: { id: "email_full_1" }, error: null };
      },
    },
  };

  try {
    const result = await sendOrganizerEventFullEmail({
      resend,
      to: "organizer@example.com",
      organizerName: "Organizer Name",
      event: {
        id: 42,
        title: "Career Fair 2026",
        date: "2026-06-15",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "Main Hall, Building A",
        capacity: 150,
      },
      idempotencyKey: "organizer-full/42/150",
    });

    assert.equal(result.error, null);
    assert.equal(sentPayloads.length, 1);
    assert.equal(sentPayloads[0].subject, "Your event is now full");
    assert.equal(sentPayloads[0].to[0], "organizer@example.com");
    assert.match(sentPayloads[0].html, /Career Fair 2026/);
    assert.match(sentPayloads[0].html, /150/);
  } finally {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.EMAIL_FROM = originalEmailFrom;
  }
});
```

- [ ] **Step 2: Run the email-service tests to verify they fail**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/emailService.test.js
```

Expected: FAIL with `sendOrganizerFirstRegistrationEmail is not a function` and `sendOrganizerEventFullEmail is not a function`.

- [ ] **Step 3: Add the minimal organizer email helpers**

Update `C:\Users\Admin\Campus-Event-Discovery-App\server\services\emailService.js` by adding these functions near the existing booking and waitlist mail helpers:

```js
async function sendOrganizerFirstRegistrationEmail({
  resend,
  to,
  organizerName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your event has its first registration",
    html: `
      <p>Hello ${organizerName},</p>
      <p>Your event <strong>${event.title}</strong> has received its first confirmed registration.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p>You can monitor registrations from your CEDA dashboard.</p>
    `,
    idempotencyKey,
  });
}

async function sendOrganizerEventFullEmail({
  resend,
  to,
  organizerName,
  event,
  idempotencyKey,
}) {
  const client = createResendClient(resend);
  const eventDate = formatEventDate(event.date);
  const startTime = formatEventTime(event.startTime);
  const endTime = formatEventTime(event.endTime);

  return client.emails.send({
    from: getEmailFrom(),
    to: [to],
    subject: "Your event is now full",
    html: `
      <p>Hello ${organizerName},</p>
      <p>Your event <strong>${event.title}</strong> has now reached full capacity.</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <p><strong>Capacity:</strong> ${event.capacity}</p>
      <p>You can review current attendees from your CEDA dashboard.</p>
    `,
    idempotencyKey,
  });
}
```

And export them:

```js
module.exports = {
  formatEventDate,
  formatEventTime,
  sendBookingConfirmationEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
  sendPasswordResetEmail,
  sendWaitlistPromotionEmail,
  sendVerificationEmail,
};
```

- [ ] **Step 4: Run the email-service tests to verify they pass**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/emailService.test.js
```

Expected: PASS for the two new organizer email tests and the existing booking email tests.

- [ ] **Step 5: Commit the email helper work**

```bash
git add server/services/emailService.js server/tests/emailService.test.js
git commit -m "feat: add organizer registration notification emails"
```

### Task 2: Add pure registration notification helpers and tests

**Files:**
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\routes\registrationRoutes.js`
- Test: `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\registrationRoutes.test.js`

- [ ] **Step 1: Write the failing registration helper tests**

Add these imports and tests to `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\registrationRoutes.test.js`:

```js
const {
  canAccessEventAttendees,
  getRegistrationOutcome,
  shouldSendOrganizerEventFullNotification,
  shouldSendOrganizerFirstRegistrationNotification,
} = require("../routes/registrationRoutes");

test("first-registration notification triggers only on a zero-to-one confirmed transition", () => {
  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 1,
      currentRegisteredCount: 2,
    }),
    false
  );
});

test("event-full notification triggers only when a confirmed registration reaches capacity", () => {
  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 2,
      previousRegisteredCount: 1,
      currentRegisteredCount: 2,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 2,
      previousRegisteredCount: 2,
      currentRegisteredCount: 2,
    }),
    false
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: null,
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    false
  );
});
```

- [ ] **Step 2: Run the registration helper tests to verify they fail**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/registrationRoutes.test.js
```

Expected: FAIL with missing export/function errors for the organizer notification helper functions.

- [ ] **Step 3: Add the minimal pure helper functions**

Insert these helper functions near `getRegistrationOutcome` in `C:\Users\Admin\Campus-Event-Discovery-App\server\routes\registrationRoutes.js`:

```js
function shouldSendOrganizerFirstRegistrationNotification({
  previousRegisteredCount,
  currentRegisteredCount,
}) {
  return Number(previousRegisteredCount) === 0 && Number(currentRegisteredCount) === 1;
}

function shouldSendOrganizerEventFullNotification({
  capacity,
  previousRegisteredCount,
  currentRegisteredCount,
}) {
  const numericCapacity = capacity === null || capacity === undefined ? null : Number(capacity);

  if (numericCapacity === null || Number.isNaN(numericCapacity) || numericCapacity <= 0) {
    return false;
  }

  return (
    Number(previousRegisteredCount) < numericCapacity &&
    Number(currentRegisteredCount) === numericCapacity
  );
}
```

Export them at the bottom:

```js
module.exports = router;
module.exports.canAccessEventAttendees = canAccessEventAttendees;
module.exports.getRegistrationOutcome = getRegistrationOutcome;
module.exports.shouldSendOrganizerEventFullNotification = shouldSendOrganizerEventFullNotification;
module.exports.shouldSendOrganizerFirstRegistrationNotification =
  shouldSendOrganizerFirstRegistrationNotification;
```

- [ ] **Step 4: Run the registration helper tests to verify they pass**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/registrationRoutes.test.js
```

Expected: PASS for the new notification helper tests and the existing attendee/registration outcome tests.

- [ ] **Step 5: Commit the helper work**

```bash
git add server/routes/registrationRoutes.js server/tests/registrationRoutes.test.js
git commit -m "test: cover organizer notification transitions"
```

### Task 3: Integrate organizer notifications into the registration route

**Files:**
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\server\routes\registrationRoutes.js`
- Test: `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\registrationRoutes.test.js`

- [ ] **Step 1: Extend the import list and set up organizer event data**

Change the email-service import in `C:\Users\Admin\Campus-Event-Discovery-App\server\routes\registrationRoutes.js` to:

```js
const {
  sendBookingConfirmationEmail,
  sendOrganizerEventFullEmail,
  sendOrganizerFirstRegistrationEmail,
} = require("../services/emailService");
```

Update the event lookup query inside `router.post("/")` to include organizer information:

```js
const [eventRows] = await pool.query(
  `SELECT
     e.event_id,
     e.title,
     e.event_date,
     e.start_time,
     e.end_time,
     e.location,
     e.capacity,
     e.status,
     e.organiser_id,
     u.full_name AS organizer_name,
     u.email AS organizer_email
   FROM events e
   INNER JOIN users u ON u.user_id = e.organiser_id
   WHERE e.event_id = ?
   LIMIT 1`,
  [eventId]
);
```

- [ ] **Step 2: Insert the transition detection and organizer email calls**

Inside the `registrationStatus === "registered"` branch, after the attendee confirmation email block, add:

```js
      const currentRegisteredCount = registrationCount + 1;
      const eventPayload = {
        id: eventRows[0].event_id,
        title: eventRows[0].title,
        date: eventRows[0].event_date,
        startTime: eventRows[0].start_time,
        endTime: eventRows[0].end_time,
        location: eventRows[0].location,
        capacity: eventRows[0].capacity,
      };

      if (
        eventRows[0].organizer_email &&
        shouldSendOrganizerFirstRegistrationNotification({
          previousRegisteredCount: registrationCount,
          currentRegisteredCount,
        })
      ) {
        try {
          console.log(
            `POST /api/registrations organizer first-registration email attempt: organizer=${eventRows[0].organiser_id} event=${eventRows[0].event_id} to=${eventRows[0].organizer_email}`
          );

          const { error } = await sendOrganizerFirstRegistrationEmail({
            to: eventRows[0].organizer_email,
            organizerName: eventRows[0].organizer_name,
            event: eventPayload,
            idempotencyKey: `organizer-first/${eventRows[0].event_id}/${currentRegisteredCount}`,
          });

          if (error) {
            console.error("POST /api/registrations organizer first-registration email error:", error?.message || error);
          }
        } catch (emailError) {
          console.error("POST /api/registrations organizer first-registration email failed:", emailError);
        }
      }

      if (
        eventRows[0].organizer_email &&
        shouldSendOrganizerEventFullNotification({
          capacity: eventRows[0].capacity,
          previousRegisteredCount: registrationCount,
          currentRegisteredCount,
        })
      ) {
        try {
          console.log(
            `POST /api/registrations organizer event-full email attempt: organizer=${eventRows[0].organiser_id} event=${eventRows[0].event_id} to=${eventRows[0].organizer_email}`
          );

          const { error } = await sendOrganizerEventFullEmail({
            to: eventRows[0].organizer_email,
            organizerName: eventRows[0].organizer_name,
            event: eventPayload,
            idempotencyKey: `organizer-full/${eventRows[0].event_id}/${currentRegisteredCount}`,
          });

          if (error) {
            console.error("POST /api/registrations organizer event-full email error:", error?.message || error);
          }
        } catch (emailError) {
          console.error("POST /api/registrations organizer event-full email failed:", emailError);
        }
      }
```

This keeps the route behavior aligned with the approved spec:

- only confirmed registrations trigger organizer emails
- waitlist joins do not trigger organizer emails
- mail failures do not affect the response

- [ ] **Step 3: Add one regression-style test for full-capacity transition logic**

Add this focused helper-level regression to `C:\Users\Admin\Campus-Event-Discovery-App\server\tests\registrationRoutes.test.js`:

```js
test("a single confirmed registration can trigger both first-registration and event-full notifications", () => {
  assert.equal(
    shouldSendOrganizerFirstRegistrationNotification({
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );

  assert.equal(
    shouldSendOrganizerEventFullNotification({
      capacity: 1,
      previousRegisteredCount: 0,
      currentRegisteredCount: 1,
    }),
    true
  );
});
```

- [ ] **Step 4: Run the targeted and smoke tests**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/emailService.test.js
node tests/registrationRoutes.test.js
npm test
```

Expected:

- `node tests/emailService.test.js` passes
- `node tests/registrationRoutes.test.js` passes
- `npm test` passes the smoke check

- [ ] **Step 5: Commit the route integration**

```bash
git add server/routes/registrationRoutes.js server/tests/registrationRoutes.test.js
git commit -m "feat: notify organizers about registration milestones"
```

### Task 4: Update project memory and perform final verification

**Files:**
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\ai-context\backend.md`
- Modify: `C:\Users\Admin\Campus-Event-Discovery-App\ai-context\status.md`

- [ ] **Step 1: Update `ai-context/backend.md`**

Add a concise note under the update notes section:

```md
- `POST /api/registrations` now also sends best-effort organizer milestone emails to the event owner when a confirmed booking becomes the event's first registration or fills the last available seat; waitlist joins do not trigger organizer notifications.
```

- [ ] **Step 2: Update `ai-context/status.md`**

Add a concise note under the update notes section:

```md
- Organizers now receive best-effort Resend email notifications for the first confirmed registration on their event and when a confirmed registration fills the event to capacity; these notifications do not require schema changes and do not fire for waitlist joins.
```

- [ ] **Step 3: Run final verification**

Run:

```bash
cd C:\Users\Admin\Campus-Event-Discovery-App\server
node tests/emailService.test.js
node tests/registrationRoutes.test.js
npm test

cd C:\Users\Admin\Campus-Event-Discovery-App\client
npm.cmd run build
```

Expected:

- all server tests above pass
- frontend build still succeeds unchanged

- [ ] **Step 4: Commit the docs and verification pass**

```bash
git add ai-context/backend.md ai-context/status.md
git commit -m "docs: record organizer notification behavior"
```

## Self-Review

### Spec coverage

- First registration email: covered by Task 1 and Task 3
- Event full email: covered by Task 1 and Task 3
- Event owner only: covered by Task 3 query and send path
- No waitlist notifications: covered by Task 3 branch placement
- No schema change: no DB files appear in the plan
- Best-effort delivery only: covered by Task 3 try/catch structure

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain
- Every code-changing step includes concrete code blocks
- Every test step includes an exact command

### Type consistency

- Helper names are consistent across tests and route exports:
  - `sendOrganizerFirstRegistrationEmail`
  - `sendOrganizerEventFullEmail`
  - `shouldSendOrganizerFirstRegistrationNotification`
  - `shouldSendOrganizerEventFullNotification`

