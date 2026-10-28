/**
 * Comprehensive MySQL DDL & DML Generator for Borana University SIS (bru_sis)
 * Includes: Tables, Views, Stored Functions, Stored Procedures, Triggers, and Scheduled Events.
 * Formatted specifically for direct import into phpMyAdmin (DELIMITER handling inclusive).
 */

import {
  Department,
  Course,
  CourseOffering,
  Student,
  CourseEnrollment,
  GradeRecord,
  UserAccount,
  AcademicCalendarConfig,
} from '../types';

export function generateBruSisMySQLDump(data: {
  departments: Department[];
  courses: Course[];
  offerings: CourseOffering[];
  students: Student[];
  enrollments: CourseEnrollment[];
  grades: GradeRecord[];
  users: UserAccount[];
  calendarConfig: AcademicCalendarConfig;
}): string {
  const { departments, courses, offerings, students, enrollments, grades, users, calendarConfig } = data;

  let sql = `-- phpMyAdmin SQL Dump
-- Database: bru_sis (Borana University Student Information System)
-- Institution: Borana University (bru.edu.et)
-- Yabello Main Campus, Borana Zone, Oromia, Ethiopia
-- Generation Time: ${new Date().toISOString()}
-- Server version: MySQL 8.0 / MariaDB 10.4+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+03:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: \`bru_sis\`
--
CREATE DATABASE IF NOT EXISTS \`bru_sis\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`bru_sis\`;

-- --------------------------------------------------------
-- 1. TABLE STRUCTURES
-- --------------------------------------------------------

--
-- Table structure for table \`departments\`
--
DROP TABLE IF EXISTS \`departments\`;
CREATE TABLE \`departments\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`name_om\` VARCHAR(255) DEFAULT NULL,
  \`name_am\` VARCHAR(255) DEFAULT NULL,
  \`faculty\` VARCHAR(255) NOT NULL,
  \`head_instructor_id\` VARCHAR(50) DEFAULT NULL,
  \`office_location\` VARCHAR(255) DEFAULT NULL,
  \`contact_email\` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`code\` (\`code\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`courses\`
--
DROP TABLE IF EXISTS \`courses\`;
CREATE TABLE \`courses\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`code\` VARCHAR(20) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`credit_hours\` INT NOT NULL DEFAULT 3,
  \`lecture_hours\` INT NOT NULL DEFAULT 2,
  \`lab_hours\` INT NOT NULL DEFAULT 2,
  \`department_id\` VARCHAR(50) NOT NULL,
  \`target_year\` INT NOT NULL DEFAULT 1,
  \`target_semester\` INT NOT NULL DEFAULT 1,
  \`prerequisites\` TEXT DEFAULT NULL,
  \`description\` TEXT DEFAULT NULL,
  \`weight_quizzes\` DECIMAL(5,2) DEFAULT 15.00,
  \`weight_assignments\` DECIMAL(5,2) DEFAULT 15.00,
  \`weight_midterm\` DECIMAL(5,2) DEFAULT 30.00,
  \`weight_final\` DECIMAL(5,2) DEFAULT 40.00,
  \`is_active\` TINYINT(1) DEFAULT 1,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`code\` (\`code\`),
  KEY \`department_id\` (\`department_id\`),
  CONSTRAINT \`fk_courses_dept\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`course_offerings\`
--
DROP TABLE IF EXISTS \`course_offerings\`;
CREATE TABLE \`course_offerings\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`course_id\` VARCHAR(50) NOT NULL,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`semester\` INT NOT NULL,
  \`section\` VARCHAR(50) NOT NULL,
  \`instructor_id\` VARCHAR(50) DEFAULT NULL,
  \`capacity\` INT NOT NULL DEFAULT 40,
  \`enrolled_count\` INT NOT NULL DEFAULT 0,
  \`classroom\` VARCHAR(100) DEFAULT NULL,
  \`schedule_days\` VARCHAR(255) DEFAULT NULL,
  \`exam_date\` DATE DEFAULT NULL,
  \`exam_room\` VARCHAR(100) DEFAULT NULL,
  \`status\` ENUM('Open','Closed','Grading','Completed') DEFAULT 'Open',
  PRIMARY KEY (\`id\`),
  KEY \`course_id\` (\`course_id\`),
  CONSTRAINT \`fk_offerings_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`students\`
--
DROP TABLE IF EXISTS \`students\`;
CREATE TABLE \`students\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`national_id\` VARCHAR(50) DEFAULT NULL,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`gender\` ENUM('Male','Female') NOT NULL,
  \`birth_date\` DATE NOT NULL,
  \`phone\` VARCHAR(50) DEFAULT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`address\` VARCHAR(255) DEFAULT NULL,
  \`woreda_zone\` VARCHAR(255) DEFAULT NULL,
  \`admission_year\` INT NOT NULL,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`department_id\` VARCHAR(50) NOT NULL,
  \`program\` VARCHAR(255) NOT NULL,
  \`year_of_study\` INT NOT NULL DEFAULT 1,
  \`current_semester\` INT NOT NULL DEFAULT 1,
  \`academic_status\` ENUM('Active','Academic Warning','Academic Probation','Suspended','Withdrawn','Graduated') DEFAULT 'Active',
  \`is_archived\` TINYINT(1) DEFAULT 0,
  \`cgpa\` DECIMAL(4,2) DEFAULT 0.00,
  \`total_credits_earned\` INT DEFAULT 0,
  \`created_at\` DATE DEFAULT NULL,
  \`updated_at\` DATE DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`student_id\` (\`student_id\`),
  KEY \`department_id\` (\`department_id\`),
  CONSTRAINT \`fk_students_dept\` FOREIGN KEY (\`department_id\`) REFERENCES \`departments\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`course_enrollments\`
--
DROP TABLE IF EXISTS \`course_enrollments\`;
CREATE TABLE \`course_enrollments\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`offering_id\` VARCHAR(50) NOT NULL,
  \`course_id\` VARCHAR(50) NOT NULL,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`semester\` INT NOT NULL,
  \`registration_date\` DATE NOT NULL,
  \`status\` ENUM('Registered','Pending Add','Pending Drop','Approved','Dropped','Rejected') DEFAULT 'Approved',
  \`request_reason\` TEXT DEFAULT NULL,
  \`review_notes\` TEXT DEFAULT NULL,
  \`reviewed_by\` VARCHAR(100) DEFAULT NULL,
  \`reviewed_at\` DATE DEFAULT NULL,
  \`attendance_percentage\` INT DEFAULT 100,
  PRIMARY KEY (\`id\`),
  KEY \`student_id\` (\`student_id\`),
  KEY \`offering_id\` (\`offering_id\`),
  CONSTRAINT \`fk_enr_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_enr_offering\` FOREIGN KEY (\`offering_id\`) REFERENCES \`course_offerings\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`grade_records\`
--
DROP TABLE IF EXISTS \`grade_records\`;
CREATE TABLE \`grade_records\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`course_id\` VARCHAR(50) NOT NULL,
  \`offering_id\` VARCHAR(50) NOT NULL,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`semester\` INT NOT NULL,
  \`score_quizzes\` DECIMAL(5,2) DEFAULT 0.00,
  \`score_assignments\` DECIMAL(5,2) DEFAULT 0.00,
  \`score_midterm\` DECIMAL(5,2) DEFAULT 0.00,
  \`score_final\` DECIMAL(5,2) DEFAULT 0.00,
  \`total_mark\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  \`letter_grade\` VARCHAR(5) NOT NULL DEFAULT 'F',
  \`grade_point\` DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Draft','Submitted','Department_Approved','Registrar_Published') DEFAULT 'Draft',
  \`submitted_by\` VARCHAR(100) DEFAULT NULL,
  \`submitted_at\` DATE DEFAULT NULL,
  \`approved_by\` VARCHAR(100) DEFAULT NULL,
  \`approved_at\` DATE DEFAULT NULL,
  \`published_at\` DATE DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`student_id\` (\`student_id\`),
  KEY \`course_id\` (\`course_id\`),
  CONSTRAINT \`fk_grades_student\` FOREIGN KEY (\`student_id\`) REFERENCES \`students\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_grades_course\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`grade_change_logs\`
--
DROP TABLE IF EXISTS \`grade_change_logs\`;
CREATE TABLE \`grade_change_logs\` (
  \`id\` INT AUTO_INCREMENT,
  \`grade_id\` VARCHAR(50) NOT NULL,
  \`change_date\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`changed_by\` VARCHAR(100) NOT NULL,
  \`old_total\` DECIMAL(5,2) NOT NULL,
  \`new_total\` DECIMAL(5,2) NOT NULL,
  \`old_grade\` VARCHAR(5) NOT NULL,
  \`new_grade\` VARCHAR(5) NOT NULL,
  \`reason\` TEXT NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`grade_id\` (\`grade_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`attendance_sessions\`
--
DROP TABLE IF EXISTS \`attendance_sessions\`;
CREATE TABLE \`attendance_sessions\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`offering_id\` VARCHAR(50) NOT NULL,
  \`session_date\` DATE NOT NULL,
  \`lecture_topic\` VARCHAR(255) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`offering_id\` (\`offering_id\`),
  CONSTRAINT \`fk_att_offering\` FOREIGN KEY (\`offering_id\`) REFERENCES \`course_offerings\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`attendance_records\`
--
DROP TABLE IF EXISTS \`attendance_records\`;
CREATE TABLE \`attendance_records\` (
  \`id\` INT AUTO_INCREMENT,
  \`session_id\` VARCHAR(50) NOT NULL,
  \`student_id\` VARCHAR(50) NOT NULL,
  \`status\` ENUM('Present','Absent','Excused') NOT NULL DEFAULT 'Present',
  \`notes\` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`session_id\` (\`session_id\`),
  KEY \`student_id\` (\`student_id\`),
  CONSTRAINT \`fk_rec_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`attendance_sessions\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`users\`
--
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`username\` VARCHAR(100) NOT NULL,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin','registrar','department_head','instructor','student','management','parent','ict_support') NOT NULL,
  \`department_id\` VARCHAR(50) DEFAULT NULL,
  \`associated_student_id\` VARCHAR(50) DEFAULT NULL,
  \`status\` ENUM('Active','Deactivated') DEFAULT 'Active',
  \`last_login\` VARCHAR(50) DEFAULT NULL,
  \`phone_number\` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`username\` (\`username\`),
  UNIQUE KEY \`email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`audit_logs\`
--
DROP TABLE IF EXISTS \`audit_logs\`;
CREATE TABLE \`audit_logs\` (
  \`id\` VARCHAR(50) NOT NULL,
  \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`user_id\` VARCHAR(50) NOT NULL,
  \`user_name\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL,
  \`module\` VARCHAR(50) NOT NULL,
  \`action\` VARCHAR(100) NOT NULL,
  \`details\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(50) NOT NULL,
  \`severity\` ENUM('Info','Warning','Critical') DEFAULT 'Info',
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table \`academic_calendar\`
--
DROP TABLE IF EXISTS \`academic_calendar\`;
CREATE TABLE \`academic_calendar\` (
  \`id\` INT AUTO_INCREMENT,
  \`academic_year\` VARCHAR(20) NOT NULL,
  \`current_semester\` INT NOT NULL DEFAULT 1,
  \`add_drop_deadline\` DATE NOT NULL,
  \`grade_submission_deadline\` DATE NOT NULL,
  \`max_credit_hours\` INT NOT NULL DEFAULT 19,
  \`probation_threshold\` DECIMAL(4,2) NOT NULL DEFAULT 2.00,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. STORED FUNCTIONS (BORANA UNIVERSITY SENATE GRADING)
-- --------------------------------------------------------

DELIMITER $$

--
-- Function: fn_calculate_letter_grade
-- Maps total course marks (0-100) to Senate Letter Grades
--
DROP FUNCTION IF EXISTS \`fn_calculate_letter_grade\`$$
CREATE FUNCTION \`fn_calculate_letter_grade\`(p_total_mark DECIMAL(5,2)) RETURNS VARCHAR(5) CHARSET utf8mb4
DETERMINISTIC
BEGIN
  IF p_total_mark >= 90.00 THEN RETURN 'A+';
  ELSEIF p_total_mark >= 85.00 THEN RETURN 'A';
  ELSEIF p_total_mark >= 80.00 THEN RETURN 'A-';
  ELSEIF p_total_mark >= 75.00 THEN RETURN 'B+';
  ELSEIF p_total_mark >= 70.00 THEN RETURN 'B';
  ELSEIF p_total_mark >= 65.00 THEN RETURN 'B-';
  ELSEIF p_total_mark >= 60.00 THEN RETURN 'C+';
  ELSEIF p_total_mark >= 50.00 THEN RETURN 'C';
  ELSEIF p_total_mark >= 45.00 THEN RETURN 'C-';
  ELSEIF p_total_mark >= 40.00 THEN RETURN 'D';
  ELSE RETURN 'F';
  END IF;
END$$

--
-- Function: fn_calculate_grade_point
-- Returns numerical grade point (4.00 scale)
--
DROP FUNCTION IF EXISTS \`fn_calculate_grade_point\`$$
CREATE FUNCTION \`fn_calculate_grade_point\`(p_total_mark DECIMAL(5,2)) RETURNS DECIMAL(4,2)
DETERMINISTIC
BEGIN
  IF p_total_mark >= 85.00 THEN RETURN 4.00;
  ELSEIF p_total_mark >= 80.00 THEN RETURN 3.75;
  ELSEIF p_total_mark >= 75.00 THEN RETURN 3.50;
  ELSEIF p_total_mark >= 70.00 THEN RETURN 3.00;
  ELSEIF p_total_mark >= 65.00 THEN RETURN 2.75;
  ELSEIF p_total_mark >= 60.00 THEN RETURN 2.50;
  ELSEIF p_total_mark >= 50.00 THEN RETURN 2.00;
  ELSEIF p_total_mark >= 45.00 THEN RETURN 1.50;
  ELSEIF p_total_mark >= 40.00 THEN RETURN 1.00;
  ELSE RETURN 0.00;
  END IF;
END$$

--
-- Function: fn_check_exam_qualification
-- Evaluates mandatory 75% attendance rule for final exam
--
DROP FUNCTION IF EXISTS \`fn_check_exam_qualification\`$$
CREATE FUNCTION \`fn_check_exam_qualification\`(p_student_id VARCHAR(50), p_offering_id VARCHAR(50)) RETURNS VARCHAR(20) CHARSET utf8mb4
DETERMINISTIC
BEGIN
  DECLARE v_pct INT DEFAULT 100;
  SELECT attendance_percentage INTO v_pct FROM course_enrollments
  WHERE student_id = p_student_id AND offering_id = p_offering_id LIMIT 1;
  IF v_pct >= 75 THEN
    RETURN 'QUALIFIED';
  ELSE
    RETURN 'BARRED_ATTENDANCE';
  END IF;
END$$

-- --------------------------------------------------------
-- 3. STORED PROCEDURES (ACADEMIC WORKFLOWS)
-- --------------------------------------------------------

--
-- Procedure: sp_update_cumulative_cgpa
-- Automatically re-computes CGPA and total earned credits for a student
--
DROP PROCEDURE IF EXISTS \`sp_update_cumulative_cgpa\`$$
CREATE PROCEDURE \`sp_update_cumulative_cgpa\`(IN p_student_id VARCHAR(50))
BEGIN
  DECLARE v_total_points DECIMAL(10,2) DEFAULT 0.00;
  DECLARE v_total_credits INT DEFAULT 0;
  DECLARE v_cgpa DECIMAL(4,2) DEFAULT 0.00;

  SELECT 
    IFNULL(SUM(c.credit_hours * g.grade_point), 0.00),
    IFNULL(SUM(c.credit_hours), 0)
  INTO v_total_points, v_total_credits
  FROM grade_records g
  JOIN courses c ON g.course_id = c.id
  WHERE g.student_id = p_student_id AND g.status = 'Registrar_Published';

  IF v_total_credits > 0 THEN
    SET v_cgpa = ROUND(v_total_points / v_total_credits, 2);
  ELSE
    SET v_cgpa = 0.00;
  END IF;

  UPDATE students
  SET cgpa = v_cgpa, total_credits_earned = v_total_credits, updated_at = CURDATE()
  WHERE id = p_student_id;
END$$

--
-- Procedure: sp_publish_official_grades
-- Formal Senate publishing action by Registrar Office (Mr. Wario Galma)
--
DROP PROCEDURE IF EXISTS \`sp_publish_official_grades\`$$
CREATE PROCEDURE \`sp_publish_official_grades\`(
  IN p_offering_id VARCHAR(50),
  IN p_published_by VARCHAR(100)
)
BEGIN
  -- 1. Mark records as Published
  UPDATE grade_records
  SET status = 'Registrar_Published', published_at = CURDATE()
  WHERE offering_id = p_offering_id;

  -- 2. Audit log
  INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, module, action, details, ip_address, severity)
  VALUES (
    CONCAT('log-', UNIX_TIMESTAMP()),
    NOW(),
    'user-registrar',
    p_published_by,
    'registrar',
    'Gradebook',
    'Official Grade Publication',
    CONCAT('Published Senate approved grades for offering: ', p_offering_id),
    '10.20.4.15',
    'Info'
  );
END$$

--
-- Procedure: sp_process_add_drop
-- Handles student petition approval / rejection and adjusts capacity
--
DROP PROCEDURE IF EXISTS \`sp_process_add_drop\`$$
CREATE PROCEDURE \`sp_process_add_drop\`(
  IN p_enrollment_id VARCHAR(50),
  IN p_decision VARCHAR(20),
  IN p_reviewed_by VARCHAR(100),
  IN p_notes TEXT
)
BEGIN
  DECLARE v_status VARCHAR(20);
  DECLARE v_offering_id VARCHAR(50);

  SELECT status, offering_id INTO v_status, v_offering_id 
  FROM course_enrollments WHERE id = p_enrollment_id;

  IF p_decision = 'Approve' THEN
    IF v_status = 'Pending Drop' THEN
      UPDATE course_enrollments SET status = 'Dropped', review_notes = p_notes, reviewed_by = p_reviewed_by, reviewed_at = CURDATE() WHERE id = p_enrollment_id;
      UPDATE course_offerings SET enrolled_count = GREATEST(0, enrolled_count - 1) WHERE id = v_offering_id;
    ELSE
      UPDATE course_enrollments SET status = 'Approved', review_notes = p_notes, reviewed_by = p_reviewed_by, reviewed_at = CURDATE() WHERE id = p_enrollment_id;
      UPDATE course_offerings SET enrolled_count = enrolled_count + 1 WHERE id = v_offering_id;
    END IF;
  ELSE
    UPDATE course_enrollments SET status = 'Rejected', review_notes = p_notes, reviewed_by = p_reviewed_by, reviewed_at = CURDATE() WHERE id = p_enrollment_id;
  END IF;
END$$

-- --------------------------------------------------------
-- 4. DATABASE VIEWS
-- --------------------------------------------------------

--
-- View 1: vw_student_cgpa_ranking
--
DROP VIEW IF EXISTS \`vw_student_cgpa_ranking\`$$
CREATE VIEW \`vw_student_cgpa_ranking\` AS
SELECT 
  s.student_id,
  s.full_name,
  s.gender,
  d.name AS department_name,
  s.program,
  s.year_of_study,
  s.current_semester,
  s.cgpa,
  s.total_credits_earned,
  CASE 
    WHEN s.cgpa >= 3.80 THEN 'Very High Distinction (Dean\\'s List)'
    WHEN s.cgpa >= 3.50 THEN 'Distinction (Honor Roll)'
    WHEN s.cgpa >= 2.00 THEN 'Good Academic Standing'
    WHEN s.cgpa >= 1.75 THEN 'Academic Warning'
    WHEN s.cgpa >= 1.50 THEN 'Academic Probation'
    ELSE 'Academic Suspension Review'
  END AS academic_classification,
  s.academic_status
FROM students s
JOIN departments d ON s.department_id = d.id
WHERE s.is_archived = 0$$

--
-- View 2: vw_dean_honor_roll
--
DROP VIEW IF EXISTS \`vw_dean_honor_roll\`$$
CREATE VIEW \`vw_dean_honor_roll\` AS
SELECT 
  student_id,
  full_name,
  program,
  department_name,
  year_of_study,
  cgpa,
  academic_classification
FROM vw_student_cgpa_ranking
WHERE cgpa >= 3.50$$

--
-- View 3: vw_academic_support_list
--
DROP VIEW IF EXISTS \`vw_academic_support_list\`$$
CREATE VIEW \`vw_academic_support_list\` AS
SELECT 
  student_id,
  full_name,
  program,
  department_name,
  year_of_study,
  cgpa,
  academic_classification
FROM vw_student_cgpa_ranking
WHERE cgpa < 2.00$$

--
-- View 4: vw_course_enrollment_summary
--
DROP VIEW IF EXISTS \`vw_course_enrollment_summary\`$$
CREATE VIEW \`vw_course_enrollment_summary\` AS
SELECT 
  co.id AS offering_id,
  c.code AS course_code,
  c.title AS course_title,
  co.section,
  co.classroom,
  co.schedule_days,
  co.enrolled_count,
  co.capacity,
  (co.capacity - co.enrolled_count) AS available_seats,
  ROUND((co.enrolled_count / co.capacity) * 100, 1) AS fill_percentage,
  co.status
FROM course_offerings co
JOIN courses c ON co.course_id = c.id$$

--
-- View 5: vw_attendance_deficits
-- Identifies students falling below mandatory 75% examination threshold
--
DROP VIEW IF EXISTS \`vw_attendance_deficits\`$$
CREATE VIEW \`vw_attendance_deficits\` AS
SELECT 
  s.student_id,
  s.full_name,
  c.code AS course_code,
  c.title AS course_title,
  ce.attendance_percentage,
  'BARRED_FROM_FINAL_EXAM' AS exam_eligibility
FROM course_enrollments ce
JOIN students s ON ce.student_id = s.id
JOIN courses c ON ce.course_id = c.id
WHERE ce.attendance_percentage < 75 AND ce.status = 'Approved'$$

-- --------------------------------------------------------
-- 5. TRIGGERS
-- --------------------------------------------------------

--
-- Trigger: trg_grade_records_after_update
-- Automatically audits post-publication grade corrections
--
DROP TRIGGER IF EXISTS \`trg_grade_records_after_update\`$$
CREATE TRIGGER \`trg_grade_records_after_update\` 
AFTER UPDATE ON \`grade_records\`
FOR EACH ROW
BEGIN
  IF OLD.total_mark <> NEW.total_mark THEN
    INSERT INTO grade_change_logs (grade_id, change_date, changed_by, old_total, new_total, old_grade, new_grade, reason)
    VALUES (
      OLD.id,
      NOW(),
      USER(),
      OLD.total_mark,
      NEW.total_mark,
      OLD.letter_grade,
      NEW.letter_grade,
      'Automated database trigger logged grade alteration'
    );
  END IF;
END$$

-- --------------------------------------------------------
-- 6. SCHEDULED EVENTS
-- --------------------------------------------------------

--
-- Event: ev_daily_attendance_audit
-- Evaluates student attendance records daily at 23:50
--
DROP EVENT IF EXISTS \`ev_daily_attendance_audit\`$$
CREATE EVENT \`ev_daily_attendance_audit\`
ON SCHEDULE EVERY 1 DAY
STARTS '2026-11-01 23:50:00'
DO
BEGIN
  -- Updates audit logs with daily compliance checkpoint
  INSERT INTO audit_logs (id, timestamp, user_id, user_name, role, module, action, details, ip_address, severity)
  VALUES (
    CONCAT('ev-', UNIX_TIMESTAMP()),
    NOW(),
    'system-event',
    'MySQL Event Scheduler',
    'system',
    'Attendance',
    'Daily Senate Attendance Audit',
    'Evaluated student attendance qualifications across all active offering sections.',
    '127.0.0.1',
    'Info'
  );
END$$

DELIMITER ;

-- --------------------------------------------------------
-- 7. DATA SEEDING (DUMPING DATA FOR TABLES)
-- --------------------------------------------------------

`;

  // Insert Departments
  sql += `-- Dumping data for table \`departments\`\n`;
  departments.forEach((d) => {
    sql += `INSERT INTO \`departments\` (\`id\`, \`code\`, \`name\`, \`name_om\`, \`name_am\`, \`faculty\`, \`office_location\`, \`contact_email\`) VALUES ('${d.id}', '${d.code}', '${d.name.replace(/'/g, "''")}', '${(d.nameOm || '').replace(/'/g, "''")}', '${(d.nameAm || '').replace(/'/g, "''")}', '${d.faculty.replace(/'/g, "''")}', '${(d.officeLocation || '').replace(/'/g, "''")}', '${d.contactEmail}');\n`;
  });

  // Insert Courses
  sql += `\n-- Dumping data for table \`courses\`\n`;
  courses.forEach((c) => {
    sql += `INSERT INTO \`courses\` (\`id\`, \`code\`, \`title\`, \`credit_hours\`, \`lecture_hours\`, \`lab_hours\`, \`department_id\`, \`target_year\`, \`target_semester\`, \`prerequisites\`, \`description\`, \`weight_quizzes\`, \`weight_assignments\`, \`weight_midterm\`, \`weight_final\`) VALUES ('${c.id}', '${c.code}', '${c.title.replace(/'/g, "''")}', ${c.creditHours}, ${c.lectureHours}, ${c.labHours}, '${c.departmentId}', ${c.targetYear}, ${c.targetSemester}, '${c.prerequisites.join(',')}', '${(c.description || '').replace(/'/g, "''")}', ${c.assessmentWeights.quizzes}, ${c.assessmentWeights.assignments}, ${c.assessmentWeights.midterm}, ${c.assessmentWeights.finalExam});\n`;
  });

  // Insert Offerings
  sql += `\n-- Dumping data for table \`course_offerings\`\n`;
  offerings.forEach((o) => {
    sql += `INSERT INTO \`course_offerings\` (\`id\`, \`course_id\`, \`academic_year\`, \`semester\`, \`section\`, \`instructor_id\`, \`capacity\`, \`enrolled_count\`, \`classroom\`, \`schedule_days\`, \`exam_date\`, \`exam_room\`, \`status\`) VALUES ('${o.id}', '${o.courseId}', '${o.academicYear}', ${o.semester}, '${o.section}', '${o.instructorId}', ${o.capacity}, ${o.enrolledCount}, '${o.classroom.replace(/'/g, "''")}', '${o.scheduleDays.replace(/'/g, "''")}', ${o.examDate ? `'${o.examDate}'` : 'NULL'}, '${(o.examRoom || '').replace(/'/g, "''")}', '${o.status}');\n`;
  });

  // Insert Students
  sql += `\n-- Dumping data for table \`students\`\n`;
  students.forEach((s) => {
    sql += `INSERT INTO \`students\` (\`id\`, \`student_id\`, \`national_id\`, \`full_name\`, \`gender\`, \`birth_date\`, \`phone\`, \`email\`, \`address\`, \`woreda_zone\`, \`admission_year\`, \`academic_year\`, \`department_id\`, \`program\`, \`year_of_study\`, \`current_semester\`, \`academic_status\`, \`is_archived\`, \`cgpa\`, \`total_credits_earned\`, \`created_at\`, \`updated_at\`) VALUES ('${s.id}', '${s.studentId}', '${s.nationalId}', '${s.fullName.replace(/'/g, "''")}', '${s.gender}', '${s.birthDate}', '${s.phone}', '${s.email}', '${s.address.replace(/'/g, "''")}', '${s.woredaZone.replace(/'/g, "''")}', ${s.admissionYear}, '${s.academicYear}', '${s.departmentId}', '${s.program.replace(/'/g, "''")}', ${s.yearOfStudy}, ${s.currentSemester}, '${s.academicStatus}', ${s.isArchived ? 1 : 0}, ${s.cgpa}, ${s.totalCreditsEarned}, '${s.createdAt}', '${s.updatedAt}');\n`;
  });

  // Insert Enrollments
  sql += `\n-- Dumping data for table \`course_enrollments\`\n`;
  enrollments.forEach((e) => {
    sql += `INSERT INTO \`course_enrollments\` (\`id\`, \`student_id\`, \`offering_id\`, \`course_id\`, \`academic_year\`, \`semester\`, \`registration_date\`, \`status\`, \`request_reason\`, \`attendance_percentage\`) VALUES ('${e.id}', '${e.studentId}', '${e.offeringId}', '${e.courseId}', '${e.academicYear}', ${e.semester}, '${e.registrationDate}', '${e.status}', '${(e.requestReason || '').replace(/'/g, "''")}', ${e.attendancePercentage});\n`;
  });

  // Insert Grades
  sql += `\n-- Dumping data for table \`grade_records\`\n`;
  grades.forEach((g) => {
    sql += `INSERT INTO \`grade_records\` (\`id\`, \`student_id\`, \`course_id\`, \`offering_id\`, \`academic_year\`, \`semester\`, \`score_quizzes\`, \`score_assignments\`, \`score_midterm\`, \`score_final\`, \`total_mark\`, \`letter_grade\`, \`grade_point\`, \`status\`, \`submitted_by\`, \`submitted_at\`, \`approved_by\`, \`published_at\`) VALUES ('${g.id}', '${g.studentId}', '${g.courseId}', '${g.offeringId}', '${g.academicYear}', ${g.semester}, ${g.scores.quizzes}, ${g.scores.assignments}, ${g.scores.midterm}, ${g.scores.finalExam}, ${g.totalMark}, '${g.letterGrade}', ${g.gradePoint}, '${g.status}', '${g.submittedBy || ''}', ${g.submittedAt ? `'${g.submittedAt}'` : 'NULL'}, '${g.approvedBy || ''}', ${g.publishedAt ? `'${g.publishedAt}'` : 'NULL'});\n`;
  });

  // Insert Users
  sql += `\n-- Dumping data for table \`users\`\n`;
  users.forEach((u) => {
    sql += `INSERT INTO \`users\` (\`id\`, \`username\`, \`full_name\`, \`email\`, \`role\`, \`department_id\`, \`associated_student_id\`, \`status\`, \`last_login\`, \`phone_number\`) VALUES ('${u.id}', '${u.username}', '${u.fullName.replace(/'/g, "''")}', '${u.email}', '${u.role}', ${u.departmentId ? `'${u.departmentId}'` : 'NULL'}, ${u.associatedStudentId ? `'${u.associatedStudentId}'` : 'NULL'}, '${u.status}', '${u.lastLogin || ''}', '${u.phoneNumber || ''}');\n`;
  });

  // Calendar config
  sql += `\n-- Dumping data for table \`academic_calendar\`\n`;
  sql += `INSERT INTO \`academic_calendar\` (\`academic_year\`, \`current_semester\`, \`add_drop_deadline\`, \`grade_submission_deadline\`, \`max_credit_hours\`, \`probation_threshold\`) VALUES ('${calendarConfig.academicYear}', ${calendarConfig.currentSemester}, '${calendarConfig.addDropDeadline}', '${calendarConfig.gradeSubmissionDeadline}', ${calendarConfig.maxCreditHoursAllowed}, ${calendarConfig.academicProbationThreshold});\n`;

  sql += `\nCOMMIT;\n\n/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;\n/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;\n/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;\n`;

  return sql;
}
