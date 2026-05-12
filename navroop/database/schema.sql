-- =============================================
-- Campus Event Discovery App (CEDA) Database Schema
-- Kent Institute - Capstone Project 2026
-- =============================================

-- Drop existing tables if they exist (for clean installation)
DROP TABLE IF EXISTS event_volunteers CASCADE;
DROP TABLE IF EXISTS event_rsvps CASCADE;
DROP TABLE IF EXISTS event_bookmarks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS event_categories CASCADE;

-- =============================================
-- Table: users
-- Description: Stores user accounts (students and organizers)
-- =============================================
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'organizer')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    profile_picture VARCHAR(255),
    phone_number VARCHAR(20),
    student_id VARCHAR(50),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- =============================================
-- Table: event_categories
-- Description: Defines available event categories
-- =============================================
CREATE TABLE event_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    category_description TEXT,
    category_color VARCHAR(7), -- Hex color code
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO event_categories (category_name, category_description, category_color) VALUES
('Academic', 'Educational workshops, seminars, and lectures', '#3B82F6'),
('Social', 'Social gatherings, parties, and networking events', '#EC4899'),
('Career', 'Career development, job fairs, and professional networking', '#10B981'),
('Club', 'Student club activities and meetings', '#8B5CF6'),
('Workshop', 'Skill-building workshops and training sessions', '#F59E0B'),
('Other', 'Miscellaneous campus events', '#6B7280');

-- =============================================
-- Table: events
-- Description: Main events table with all event details
-- =============================================
CREATE TABLE events (
    event_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    organizer_id VARCHAR(50) NOT NULL,
    organizer_name VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'cancelled')),
    view_count INT DEFAULT 0,
    rsvp_count INT DEFAULT 0,
    volunteers_needed INT DEFAULT 0,
    volunteers_registered INT DEFAULT 0,
    seating_capacity INT,
    seats_booked INT DEFAULT 0,
    food_provided BOOLEAN DEFAULT FALSE,
    food_options JSON, -- Stores array of food options
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category) REFERENCES event_categories(category_name) ON UPDATE CASCADE,
    INDEX idx_event_date (event_date),
    INDEX idx_category (category),
    INDEX idx_organizer (organizer_id),
    INDEX idx_status (status)
);

-- =============================================
-- Table: event_bookmarks
-- Description: Stores user bookmarks/saved events
-- =============================================
CREATE TABLE event_bookmarks (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (user_id, event_id),
    INDEX idx_user_bookmarks (user_id),
    INDEX idx_event_bookmarks (event_id)
);

-- =============================================
-- Table: event_rsvps
-- Description: Stores event RSVPs (attendees and volunteers)
-- =============================================
CREATE TABLE event_rsvps (
    rsvp_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    attendee_type VARCHAR(20) NOT NULL CHECK (attendee_type IN ('attendee', 'volunteer')),
    selected_food_option VARCHAR(100),
    seat_number INT,
    rsvp_status VARCHAR(20) DEFAULT 'confirmed' CHECK (rsvp_status IN ('confirmed', 'cancelled', 'waitlist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    UNIQUE KEY unique_rsvp (user_id, event_id),
    INDEX idx_user_rsvps (user_id),
    INDEX idx_event_rsvps (event_id),
    INDEX idx_attendee_type (attendee_type)
);

-- =============================================
-- Table: event_volunteers
-- Description: Additional details for volunteers
-- =============================================
CREATE TABLE event_volunteers (
    volunteer_id INT AUTO_INCREMENT PRIMARY KEY,
    rsvp_id INT NOT NULL,
    shift_start_time TIME,
    shift_end_time TIME,
    volunteer_role VARCHAR(100),
    tasks_assigned TEXT,
    hours_completed DECIMAL(4,2) DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rsvp_id) REFERENCES event_rsvps(rsvp_id) ON DELETE CASCADE,
    INDEX idx_rsvp (rsvp_id)
);

-- =============================================
-- Triggers for automatic timestamp updates
-- =============================================
DELIMITER //

CREATE TRIGGER update_user_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_event_timestamp
BEFORE UPDATE ON events
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

CREATE TRIGGER update_rsvp_timestamp
BEFORE UPDATE ON event_rsvps
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//

DELIMITER ;

-- =============================================
-- Triggers for maintaining counts
-- =============================================
DELIMITER //

-- Increment RSVP count when new RSVP is added
CREATE TRIGGER increment_rsvp_count
AFTER INSERT ON event_rsvps
FOR EACH ROW
BEGIN
    UPDATE events
    SET rsvp_count = rsvp_count + 1
    WHERE event_id = NEW.event_id;

    -- Increment volunteer count if RSVP is for volunteering
    IF NEW.attendee_type = 'volunteer' THEN
        UPDATE events
        SET volunteers_registered = volunteers_registered + 1
        WHERE event_id = NEW.event_id;
    END IF;

    -- Increment seats booked if seat number is assigned
    IF NEW.seat_number IS NOT NULL THEN
        UPDATE events
        SET seats_booked = seats_booked + 1
        WHERE event_id = NEW.event_id;
    END IF;
END//

-- Decrement RSVP count when RSVP is deleted
CREATE TRIGGER decrement_rsvp_count
AFTER DELETE ON event_rsvps
FOR EACH ROW
BEGIN
    UPDATE events
    SET rsvp_count = rsvp_count - 1
    WHERE event_id = OLD.event_id;

    -- Decrement volunteer count if RSVP was for volunteering
    IF OLD.attendee_type = 'volunteer' THEN
        UPDATE events
        SET volunteers_registered = volunteers_registered - 1
        WHERE event_id = OLD.event_id;
    END IF;

    -- Decrement seats booked if seat was assigned
    IF OLD.seat_number IS NOT NULL THEN
        UPDATE events
        SET seats_booked = seats_booked - 1
        WHERE event_id = OLD.event_id;
    END IF;
END//

DELIMITER ;

-- =============================================
-- Sample Data for Testing
-- =============================================

-- Insert sample users
INSERT INTO users (user_id, name, email, password_hash, role, student_id) VALUES
('user_1', 'Navroop Kaur', 'navroop.kaur@student.kent.edu.au', '$2a$10$hash1', 'student', 'STU001'),
('user_2', 'John Smith', 'john.smith@student.kent.edu.au', '$2a$10$hash2', 'student', 'STU002'),
('org_1', 'Student Services', 'services@kent.edu.au', '$2a$10$hash3', 'organizer', NULL),
('org_2', 'Career Development Office', 'career@kent.edu.au', '$2a$10$hash4', 'organizer', NULL),
('org_3', 'IT Society', 'itsociety@kent.edu.au', '$2a$10$hash5', 'organizer', NULL);

-- Insert sample events
INSERT INTO events (event_id, title, description, event_date, start_time, end_time, location, category, organizer_id, organizer_name, image_url, status, view_count, rsvp_count, volunteers_needed, volunteers_registered, food_provided, food_options) VALUES
('evt_1', 'Industry Networking Night — IT & Business', 'Join us for an evening of networking with industry professionals from Sydney\'s tech and business sectors. Representatives from leading firms will be in attendance. Light refreshments provided.', '2026-05-23', '18:00:00', '21:00:00', 'Level 11, 10 Barrack St, Sydney NSW 2000', 'Career', 'org_1', 'Student Services', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop', 'published', 210, 48, 5, 3, TRUE, '["Light refreshments", "Vegetarian options", "Gluten-free available"]'),
('evt_2', 'Accounting Career Fair', 'Meet with top accounting firms and learn about graduate programs, internships, and entry-level positions. Firms attending include PwC, Deloitte, KPMG, and EY.', '2026-05-26', '10:00:00', '15:00:00', 'Level 10, Queen St, Sydney', 'Career', 'org_2', 'Career Development Office', 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop', 'published', 88, 31, NULL, NULL, FALSE, NULL),
('evt_3', 'Welcome BBQ — Trimester 2', 'Welcome back! Join fellow students for a casual BBQ on the campus terrace. Great food, music, and a chance to meet new friends.', '2026-05-28', '12:00:00', '15:00:00', 'Sydney Campus Terrace', 'Social', 'org_1', 'Student Services', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop', 'published', 174, 93, 10, 8, TRUE, '["BBQ meat", "Vegetarian burgers", "Vegan options", "Salads", "Drinks"]');

-- =============================================
-- Views for Common Queries
-- =============================================

-- View: Upcoming Events
CREATE VIEW upcoming_events AS
SELECT * FROM events
WHERE event_date >= CURDATE()
  AND status = 'published'
ORDER BY event_date ASC, start_time ASC;

-- View: Popular Events (by RSVP count)
CREATE VIEW popular_events AS
SELECT * FROM events
WHERE status = 'published'
ORDER BY rsvp_count DESC
LIMIT 10;

-- View: Events Needing Volunteers
CREATE VIEW events_needing_volunteers AS
SELECT * FROM events
WHERE status = 'published'
  AND volunteers_needed > volunteers_registered
ORDER BY event_date ASC;

-- =============================================
-- Stored Procedures
-- =============================================

DELIMITER //

-- Procedure: Get User's Upcoming Events
CREATE PROCEDURE GetUserUpcomingEvents(IN userId VARCHAR(50))
BEGIN
    SELECT e.*
    FROM events e
    INNER JOIN event_rsvps r ON e.event_id = r.event_id
    WHERE r.user_id = userId
      AND e.event_date >= CURDATE()
      AND e.status = 'published'
    ORDER BY e.event_date ASC, e.start_time ASC;
END//

-- Procedure: Get Event Statistics
CREATE PROCEDURE GetEventStatistics(IN eventId VARCHAR(50))
BEGIN
    SELECT
        event_id,
        title,
        view_count,
        rsvp_count,
        volunteers_needed,
        volunteers_registered,
        seating_capacity,
        seats_booked,
        (SELECT COUNT(*) FROM event_bookmarks WHERE event_id = eventId) as bookmark_count
    FROM events
    WHERE event_id = eventId;
END//

DELIMITER ;

-- =============================================
-- Indexes for Performance Optimization
-- =============================================

CREATE INDEX idx_events_search ON events(title, description(100));
CREATE INDEX idx_events_upcoming ON events(event_date, status) WHERE status = 'published';
CREATE INDEX idx_rsvps_user_event ON event_rsvps(user_id, event_id);

-- =============================================
-- Comments and Documentation
-- =============================================

COMMENT ON TABLE users IS 'Stores all user accounts including students and event organizers';
COMMENT ON TABLE events IS 'Main events table containing all event information and metadata';
COMMENT ON TABLE event_rsvps IS 'Tracks user registrations for events (both attendees and volunteers)';
COMMENT ON TABLE event_bookmarks IS 'Stores user bookmarks/saved events for later viewing';
COMMENT ON TABLE event_volunteers IS 'Additional volunteer-specific information for event helpers';
COMMENT ON TABLE event_categories IS 'Defines available event categories with descriptions and colors';

-- =============================================
-- End of Schema
-- =============================================
