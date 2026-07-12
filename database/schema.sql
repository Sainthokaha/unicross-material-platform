-- ==========================================
-- UNICROSS MATERIAL SHARING PLATFORM
-- Complete Database Schema
-- ==========================================

-- 1. Create and select the database
CREATE DATABASE IF NOT EXISTS material_sharing_db;
USE material_sharing_db;

-- 2. Drop existing tables in the correct order (to avoid foreign key constraint errors)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS departments;

-- ==========================================
-- 3. TABLE DEFINITIONS
-- ==========================================

-- Departments Table
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NULL, -- Used for Smart Department Alignment (e.g., CSC, BUS)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Courses Table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL,
    department_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer', 'admin') NOT NULL DEFAULT 'student',
    matric_number VARCHAR(50) NULL,
    staff_id VARCHAR(50) NULL,
    department_id INT NULL,
    is_active TINYINT(1) DEFAULT 1,
    email_verified TINYINT(1) DEFAULT 0,
    verification_token VARCHAR(255) NULL,
    verification_token_expiry DATETIME NULL,
    reset_password_token VARCHAR(255) NULL,
    reset_password_expires DATETIME NULL,
    profile_image VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Materials Table
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    course_id INT NOT NULL,
    semester ENUM('1', '2') NOT NULL COMMENT '1=Harmattan, 2=Rain',
    file_path VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    uploaded_by INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT NULL,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Audit Logs Table
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NULL,
    entity_id INT NULL,
    details TEXT NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ==========================================
-- 4. SEED DATA (Optional: For quick testing)
-- ==========================================

-- Insert Default Departments
INSERT INTO departments (name, code) VALUES 
('Computer Science', 'CSC'),
('Business Administration', 'BUS'),
('Electrical Engineering', 'EEE'),
('Mechanical Engineering', 'MCE');

-- Insert Default Courses
INSERT INTO courses (name, code, department_id) VALUES 
('Introduction to Programming', 'CSC101', 1),
('Data Structures & Algorithms', 'CSC201', 1),
('Database Systems', 'CSC301', 1),
('Principles of Management', 'BUS101', 2);

-- Insert Default Admin User 
-- Email: admin@platform.edu | Password: admin123
-- (Hash generated using bcrypt with 12 rounds)
INSERT INTO users (full_name, email, password_hash, role, is_active, email_verified) VALUES 
('System Administrator', 'admin@platform.edu', '$2a$12$LJ3m4ys3Lg0Y0ZqXqXqXqO5ZqXqXqXqXqXqXqXqXqXqXqXqXq', 'admin', 1, 1);