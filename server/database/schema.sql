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
  status            ENUM('registered', 'cancelled') NOT NULL DEFAULT 'registered',
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

INSERT INTO users (user_id, full_name, email, password_hash, role, email_verified_at) VALUES
  (1, 'Admin User', 'admin@university.edu.au', 'scrypt$035d0fea94d644ee0a04c14a6f291a7d$5d2cca3d1d0c9ea81f70d609c1f6c8e207da29dfafa01d899ae3588d8dc70587b92025b0b9270f0beeac4d35aae306d6e5a434ec8e70bdfd82d4d6d3cd2cadc7', 'admin', CURRENT_TIMESTAMP),
  (2, 'Jane Organiser', 'jane@university.edu.au', 'scrypt$dbf10d08219f33d965481880859ab24c$cdf41550ec63f938f3d537ad8c5aab5962ab22fe7011740e6b5525da6fb746b5d934627b20f2972848a55461b476976986679d5c1f2d1aec65182a061face3f8', 'organiser', CURRENT_TIMESTAMP),
  (3, 'John Student', 'john@university.edu.au', 'scrypt$abd5a2278b56de5446759dca311b9d1e$dee914f09ecc0cb34a11176016abd115e53d68d12f6c152de1ecdd69122432ca158bba582a38186ac3196d97ffd929d9f7850d348ab63faebca146300903ae0f', 'student', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  role = VALUES(role),
  email_verified_at = COALESCE(users.email_verified_at, VALUES(email_verified_at));

INSERT IGNORE INTO events
  (event_id, organiser_id, category_id, title, description, event_date, start_time, end_time, location, capacity, registration_required, status, approved_by)
VALUES
  (1, 2, 3, 'Career Fair 2026', 'Connect with top employers from the tech and finance sectors.', '2026-06-15', '09:00:00', '15:00:00', 'Main Hall, Building A', 200, 1, 'published', 1),
  (2, 2, 5, 'Python for Beginners Workshop', 'Hands-on introduction to Python programming. No prior experience needed.', '2026-06-20', '13:00:00', '16:00:00', 'Lab 3, Building C', 30, 1, 'published', 1),
  (3, 2, 2, 'International Students Social Night', 'Meet and mingle with fellow international students over food and games.', '2026-06-25', '18:00:00', '21:00:00', 'Student Lounge, Building B', NULL, 0, 'published', 1);
