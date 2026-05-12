-- =============================================================
--  campus_events.sql
--  Campus Event Discovery App (CEDA)
--  Database Schema — MySQL
--  Generated for Assessment Task 4 — Database Design (Section 4)
--  Version 2 — Updated schema with admin role, registrations table,
--              extended event fields, approval statuses, and
--              idempotent seed inserts
-- =============================================================

-- Create and select the database
CREATE DATABASE IF NOT EXISTS campus_events
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_events;

-- =============================================================
--  TABLE 1: categories
--  Must be created before events (events references it via FK)
-- =============================================================
CREATE TABLE IF NOT EXISTS categories (
  category_id   INT             NOT NULL AUTO_INCREMENT,
  name          VARCHAR(50)     NOT NULL,

  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (name)
);

-- Seed standard event categories
-- INSERT IGNORE is used so this is safe to run multiple times
INSERT IGNORE INTO categories (name) VALUES
  ('Academic'),
  ('Social'),
  ('Career'),
  ('Club'),
  ('Workshop'),
  ('Other');


-- =============================================================
--  TABLE 2: users
--  Stores Students, Organisers, and Admins
--  role field distinguishes all three user types
--
--  NOTE ON ROLE ENFORCEMENT:
--  MySQL cannot enforce cross-row constraints (e.g. "organiser_id
--  must reference a user with role = organiser"). This must be
--  enforced at the application layer in Node.js/Express before
--  any INSERT or UPDATE is executed.
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id         INT             NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(100)    NOT NULL,
  email           VARCHAR(150)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,          -- bcrypt hash, never plain text
  role            ENUM('student', 'organiser', 'admin')
                                  NOT NULL DEFAULT 'student',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_email (email)
);


-- =============================================================
--  TABLE 3: events
--  Created by Organisers; optionally approved by Admins
--  Extended with: banner_image_url, capacity,
--                 registration_required, approved_by
-- =============================================================
CREATE TABLE IF NOT EXISTS events (
  event_id              INT             NOT NULL AUTO_INCREMENT,
  organiser_id          INT             NOT NULL,    -- FK -> users(user_id); role enforced in app layer
  category_id           INT             NOT NULL,    -- FK -> categories(category_id)
  title                 VARCHAR(150)    NOT NULL,
  description           TEXT            NOT NULL,
  event_date            DATE            NOT NULL,
  start_time            TIME            NOT NULL,
  end_time              TIME            NOT NULL,
  location              VARCHAR(200)    NOT NULL,
  banner_image_url      VARCHAR(500)    NULL,        -- optional promotional image
  capacity              INT             NULL,        -- NULL = unlimited
  registration_required TINYINT(1)      NOT NULL DEFAULT 0,  -- 0 = no, 1 = yes
  status                ENUM('draft', 'pending', 'published', 'rejected', 'cancelled')
                                        NOT NULL DEFAULT 'draft',
  -- draft     = saved but not submitted
  -- pending   = submitted, awaiting admin approval
  -- published = approved and visible to students
  -- rejected  = admin rejected the submission
  -- cancelled = organiser cancelled a published event
  approved_by           INT             NULL,        -- FK -> users(user_id); NULL until admin acts
  notes                 TEXT            NULL,
  created_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (event_id),
  CONSTRAINT fk_events_organiser
    FOREIGN KEY (organiser_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_events_approved_by
    FOREIGN KEY (approved_by) REFERENCES users (user_id)
    ON DELETE SET NULL ON UPDATE CASCADE
);


-- =============================================================
--  TABLE 4: bookmarks
--  Junction table - links a Student to a saved Event
--  UNIQUE constraint prevents duplicate saves
-- =============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id   INT             NOT NULL AUTO_INCREMENT,
  student_id    INT             NOT NULL,            -- FK -> users(user_id); role enforced in app layer
  event_id      INT             NOT NULL,            -- FK -> events(event_id)
  saved_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (bookmark_id),
  UNIQUE KEY uq_bookmark (student_id, event_id),    -- one bookmark per student per event
  CONSTRAINT fk_bookmarks_student
    FOREIGN KEY (student_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookmarks_event
    FOREIGN KEY (event_id) REFERENCES events (event_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);


-- =============================================================
--  TABLE 5: registrations
--  Junction table - formal registration of a Student for an Event
--  Supports: My Registered Events, registration buttons,
--            attendee counts, and organiser analytics
-- =============================================================
CREATE TABLE IF NOT EXISTS registrations (
  registration_id   INT             NOT NULL AUTO_INCREMENT,
  student_id        INT             NOT NULL,        -- FK -> users(user_id); role enforced in app layer
  event_id          INT             NOT NULL,        -- FK -> events(event_id)
  status            ENUM('registered', 'cancelled')
                                    NOT NULL DEFAULT 'registered',
  registered_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (registration_id),
  UNIQUE KEY uq_registration (student_id, event_id), -- one registration per student per event
  CONSTRAINT fk_registrations_student
    FOREIGN KEY (student_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events (event_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);


-- =============================================================
--  SAMPLE DATA
--  Safe to run multiple times - INSERT IGNORE skips duplicates
-- =============================================================

-- Admin user
INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES
  ('Admin User', 'admin@university.edu.au',
   '$2b$10$examplehashfordemopurposesonly000000001', 'admin');

-- Sample organiser
INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES
  ('Jane Organiser', 'jane@university.edu.au',
   '$2b$10$examplehashfordemopurposesonly000000002', 'organiser');

-- Sample student
INSERT IGNORE INTO users (full_name, email, password_hash, role) VALUES
  ('John Student', 'john@university.edu.au',
   '$2b$10$examplehashfordemopurposesonly000000003', 'student');

-- Sample events (organiser_id = 2, approved_by = 1)
INSERT IGNORE INTO events
  (organiser_id, category_id, title, description,
   event_date, start_time, end_time, location,
   capacity, registration_required, status, approved_by)
VALUES
  (2, 3, 'Career Fair 2026',
   'Connect with top employers from the tech and finance sectors.',
   '2026-06-15', '09:00:00', '15:00:00', 'Main Hall, Building A',
   200, 1, 'published', 1),

  (2, 5, 'Python for Beginners Workshop',
   'Hands-on introduction to Python programming. No prior experience needed.',
   '2026-06-20', '13:00:00', '16:00:00', 'Lab 3, Building C',
   30, 1, 'published', 1),

  (2, 2, 'International Students Social Night',
   'Meet and mingle with fellow international students over food and games.',
   '2026-06-25', '18:00:00', '21:00:00', 'Student Lounge, Building B',
   NULL, 0, 'published', 1);

-- Sample bookmark: student (user_id=3) saves event 1
INSERT IGNORE INTO bookmarks (student_id, event_id) VALUES (3, 1);

-- Sample registration: student (user_id=3) registers for event 1
INSERT IGNORE INTO registrations (student_id, event_id, status) VALUES (3, 1, 'registered');
