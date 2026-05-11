-- =============================================================
--  campus_events.sql
--  Campus Event Discovery App (CEDA)
--  Database Schema — MySQL
--  Generated for Assessment Task 4 — Database Design (Section 4)
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

-- Seed the six standard event types
INSERT INTO categories (name) VALUES
  ('Academic'),
  ('Social'),
  ('Career'),
  ('Club'),
  ('Workshop'),
  ('Other');


-- =============================================================
--  TABLE 2: users
--  Stores both Students and Organisers — role field distinguishes them
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id         INT             NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(100)    NOT NULL,
  email           VARCHAR(150)    NOT NULL,
  password_hash   VARCHAR(255)    NOT NULL,          -- bcrypt hash, never plain text
  role            ENUM('student', 'organiser')
                                  NOT NULL DEFAULT 'student',
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_email (email)
);


-- =============================================================
--  TABLE 3: events
--  Created by Organisers; referenced by bookmarks
-- =============================================================
CREATE TABLE IF NOT EXISTS events (
  event_id        INT             NOT NULL AUTO_INCREMENT,
  organiser_id    INT             NOT NULL,          -- FK → users(user_id)
  category_id     INT             NOT NULL,          -- FK → categories(category_id)
  title           VARCHAR(150)    NOT NULL,
  description     TEXT            NOT NULL,
  event_date      DATE            NOT NULL,
  start_time      TIME            NOT NULL,
  end_time        TIME            NOT NULL,
  location        VARCHAR(200)    NOT NULL,
  status          ENUM('draft', 'published', 'cancelled')
                                  NOT NULL DEFAULT 'published',
  notes           TEXT            NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (event_id),
  CONSTRAINT fk_events_organiser
    FOREIGN KEY (organiser_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_events_category
    FOREIGN KEY (category_id) REFERENCES categories (category_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
);


-- =============================================================
--  TABLE 4: bookmarks
--  Junction table — links a Student to a saved Event
--  UNIQUE constraint prevents duplicate saves
-- =============================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id   INT             NOT NULL AUTO_INCREMENT,
  student_id    INT             NOT NULL,            -- FK → users(user_id)
  event_id      INT             NOT NULL,            -- FK → events(event_id)
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
--  SAMPLE DATA  (optional — useful for testing the app)
-- =============================================================

-- Sample organiser
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Jane Organiser', 'jane@university.edu.au',
   '$2b$10$examplehashfordemopurposesonly123456789', 'organiser');

-- Sample student
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('John Student', 'john@university.edu.au',
   '$2b$10$examplehashfordemopurposesonly123456789', 'student');

-- Sample events (organiser_id = 1, various categories)
INSERT INTO events (organiser_id, category_id, title, description, event_date, start_time, end_time, location, status) VALUES
  (1, 3, 'Career Fair 2026',
   'Connect with top employers from the tech and finance sectors.',
   '2026-06-15', '09:00:00', '15:00:00', 'Main Hall, Building A', 'published'),

  (1, 5, 'Python for Beginners Workshop',
   'Hands-on introduction to Python programming. No prior experience needed.',
   '2026-06-20', '13:00:00', '16:00:00', 'Lab 3, Building C', 'published'),

  (1, 2, 'International Students Social Night',
   'Meet and mingle with fellow international students over food and games.',
   '2026-06-25', '18:00:00', '21:00:00', 'Student Lounge, Building B', 'published');

-- Sample bookmark (student_id = 2 saves event_id = 1)
INSERT INTO bookmarks (student_id, event_id) VALUES (2, 1);
