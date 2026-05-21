-- =============================================================
--  campus_events.sql
--  Campus Event Discovery App (CEDA)
--  Database Schema - MySQL
--  Version 2
-- =============================================================

CREATE DATABASE IF NOT EXISTS campus_events
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_events;

CREATE TABLE IF NOT EXISTS categories (
  category_id   INT          NOT NULL AUTO_INCREMENT,
  name          VARCHAR(50)  NOT NULL,

  PRIMARY KEY (category_id),
  UNIQUE KEY uq_category_name (name)
);

INSERT IGNORE INTO categories (name) VALUES
  ('Academic'),
  ('Social'),
  ('Career'),
  ('Club'),
  ('Workshop'),
  ('Other');

CREATE TABLE IF NOT EXISTS users (
  user_id         INT                                 NOT NULL AUTO_INCREMENT,
  full_name       VARCHAR(100)                        NOT NULL,
  email           VARCHAR(150)                        NOT NULL,
  password_hash   VARCHAR(255)                        NOT NULL,
  role            ENUM('student', 'organiser', 'admin') NOT NULL DEFAULT 'student',
  email_verified_at DATETIME                          NULL,
  created_at      DATETIME                            NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (user_id),
  UNIQUE KEY uq_user_email (email)
);

CREATE TABLE IF NOT EXISTS events (
  event_id              INT                                          NOT NULL AUTO_INCREMENT,
  organiser_id          INT                                          NOT NULL,
  category_id           INT                                          NOT NULL,
  title                 VARCHAR(150)                                 NOT NULL,
  description           TEXT                                         NOT NULL,
  event_date            DATE                                         NOT NULL,
  start_time            TIME                                         NOT NULL,
  end_time              TIME                                         NOT NULL,
  location              VARCHAR(200)                                 NOT NULL,
  banner_image_url      VARCHAR(500)                                 NULL,
  capacity              INT                                          NULL,
  registration_required TINYINT(1)                                   NOT NULL DEFAULT 0,
  status                ENUM('draft', 'pending', 'published', 'rejected', 'cancelled') NOT NULL DEFAULT 'draft',
  approved_by           INT                                          NULL,
  review_notes          TEXT                                         NULL,
  reviewed_at           DATETIME                                     NULL,
  notes                 TEXT                                         NULL,
  created_at            DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS bookmarks (
  bookmark_id   INT       NOT NULL AUTO_INCREMENT,
  student_id    INT       NOT NULL,
  event_id      INT       NOT NULL,
  saved_at      DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (bookmark_id),
  UNIQUE KEY uq_bookmark (student_id, event_id),
  CONSTRAINT fk_bookmarks_student
    FOREIGN KEY (student_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bookmarks_event
    FOREIGN KEY (event_id) REFERENCES events (event_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS registrations (
  registration_id   INT                            NOT NULL AUTO_INCREMENT,
  student_id        INT                            NOT NULL,
  event_id          INT                            NOT NULL,
  status            ENUM('registered', 'waitlisted', 'cancelled') NOT NULL DEFAULT 'registered',
  registered_at     DATETIME                       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME                       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (registration_id),
  UNIQUE KEY uq_registration (student_id, event_id),
  CONSTRAINT fk_registrations_student
    FOREIGN KEY (student_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_registrations_event
    FOREIGN KEY (event_id) REFERENCES events (event_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  reset_id       INT           NOT NULL AUTO_INCREMENT,
  user_id        INT           NOT NULL,
  token_hash     VARCHAR(255)  NOT NULL,
  expires_at     DATETIME      NOT NULL,
  used_at        DATETIME      NULL,
  created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (reset_id),
  KEY idx_password_resets_user_id (user_id),
  KEY idx_password_resets_expires_at (expires_at),
  CONSTRAINT fk_password_resets_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verifications (
  verification_id INT           NOT NULL AUTO_INCREMENT,
  user_id         INT           NOT NULL,
  token_hash      VARCHAR(255)  NOT NULL,
  expires_at      DATETIME      NOT NULL,
  used_at         DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (verification_id),
  KEY idx_email_verifications_user_id (user_id),
  KEY idx_email_verifications_expires_at (expires_at),
  CONSTRAINT fk_email_verifications_user
    FOREIGN KEY (user_id) REFERENCES users (user_id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS used_unlock_tokens (
  token      VARCHAR(255) NOT NULL,
  used_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (token),
  KEY idx_used_unlock_tokens_used_at (used_at)
);

INSERT IGNORE INTO events
  (event_id, organiser_id, category_id, title, description, event_date, start_time, end_time, location, capacity, registration_required, status, approved_by)
VALUES
  (1, 2, 3, 'Career Fair 2026', 'Connect with top employers from the tech and finance sectors.', '2026-06-15', '09:00:00', '15:00:00', 'Main Hall, Building A', 200, 1, 'published', 1),
  (2, 2, 5, 'Python for Beginners Workshop', 'Hands-on introduction to Python programming. No prior experience needed.', '2026-06-20', '13:00:00', '16:00:00', 'Lab 3, Building C', 30, 1, 'published', 1),
  (3, 2, 2, 'International Students Social Night', 'Meet and mingle with fellow international students over food and games.', '2026-06-25', '18:00:00', '21:00:00', 'Student Lounge, Building B', NULL, 0, 'published', 1);
