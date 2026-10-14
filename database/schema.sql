-- ============================================================================
-- NEXUS ENTERPRISE MANAGEMENT SYSTEM (NEXUS-EMS)
-- Comprehensive Relational Database Architecture (MySQL 8.0+ / MariaDB 10.5+)
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS job_openings;
DROP TABLE IF EXISTS performance_reviews;
DROP TABLE IF EXISTS performance_goals;
DROP TABLE IF EXISTS payroll_items;
DROP TABLE IF EXISTS payroll_records;
DROP TABLE IF EXISTS payroll_periods;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS leave_types;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS employee_salary_history;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS company_settings;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. Users Table (Authentication & High-level Role Scoping)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('HR', 'MANAGER', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    remember_token VARCHAR(100) NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email_role (email, role),
    INDEX idx_user_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. Departments Table
-- ----------------------------------------------------------------------------
CREATE TABLE departments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT NULL,
    manager_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. Employees Table (Personnel Master Record)
-- ----------------------------------------------------------------------------
CREATE TABLE employees (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL UNIQUE,
    emp_code VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(75) NOT NULL,
    last_name VARCHAR(75) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    phone VARCHAR(30) NULL,
    avatar_url VARCHAR(255) NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    designation VARCHAR(100) NOT NULL,
    manager_id BIGINT UNSIGNED NULL,
    joining_date DATE NOT NULL,
    employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN') NOT NULL DEFAULT 'FULL_TIME',
    status ENUM('ACTIVE', 'ON_PROBATION', 'INACTIVE', 'RESIGNED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    work_mode ENUM('ONSITE', 'REMOTE', 'HYBRID') NOT NULL DEFAULT 'ONSITE',
    emergency_contact VARCHAR(255) NULL,
    bank_account VARCHAR(100) NULL,
    bank_name VARCHAR(100) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_emp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_emp_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_manager (manager_id),
    INDEX idx_emp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add circular foreign key for Department Manager
ALTER TABLE departments
ADD CONSTRAINT fk_dept_mgr FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 4. Employee Salary History Table (Permanent Increments & Reductions)
-- ----------------------------------------------------------------------------
CREATE TABLE employee_salary_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    change_type ENUM('INITIAL', 'INCREMENT', 'REDUCTION') NOT NULL,
    previous_salary DECIMAL(12, 2) NOT NULL,
    new_salary DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    percentage DECIMAL(5, 2) NULL,
    effective_date DATE NOT NULL,
    reason TEXT NOT NULL,
    authorized_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sal_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_sal_authorizer FOREIGN KEY (authorized_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_sal_hist_emp_date (employee_id, effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. Attendance Table (Server-Authoritative Clock Logs)
-- ----------------------------------------------------------------------------
CREATE TABLE attendance (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP NULL,
    check_out_time TIMESTAMP NULL,
    total_worked_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('PRESENT', 'LATE', 'ABSENT', 'ON_LEAVE', 'INCOMPLETE') NOT NULL DEFAULT 'INCOMPLETE',
    late_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    overtime_minutes INT UNSIGNED NOT NULL DEFAULT 0,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_attendance_date (employee_id, date),
    CONSTRAINT fk_att_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_att_date_status (date, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. Leave Types Table
-- ----------------------------------------------------------------------------
CREATE TABLE leave_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    annual_quota INT UNSIGNED NOT NULL DEFAULT 14,
    is_paid BOOLEAN NOT NULL DEFAULT TRUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 7. Leave Requests Table
-- ----------------------------------------------------------------------------
CREATE TABLE leave_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    leave_type_id BIGINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT UNSIGNED NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    attachment_path VARCHAR(255) NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    rejection_reason TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_leave_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leave_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leave_emp_status (employee_id, status),
    INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 8. Payroll Periods Table (Cycle Control & Finalization)
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_periods (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    month TINYINT UNSIGNED NOT NULL,
    year SMALLINT UNSIGNED NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('DRAFT', 'REVIEWED', 'APPROVED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_period_month_year (month, year),
    CONSTRAINT fk_period_approver FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 9. Payroll Records Table (Immutable Financial Snapshot Per Employee)
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payroll_period_id BIGINT UNSIGNED NOT NULL,
    employee_id BIGINT UNSIGNED NOT NULL,
    base_salary DECIMAL(12, 2) NOT NULL,
    total_allowances DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_bonuses DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    overtime_pay DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL,
    payment_status ENUM('UNPAID', 'PROCESSING', 'PAID') NOT NULL DEFAULT 'UNPAID',
    transaction_ref VARCHAR(100) NULL,
    paid_at TIMESTAMP NULL,
    payslip_pdf_path VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_period_employee (payroll_period_id, employee_id),
    CONSTRAINT fk_pr_period FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pr_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT,
    INDEX idx_pr_emp_status (employee_id, payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 10. Payroll Items Table (Itemized Allowances, Bonuses, One-time Deductions)
-- ----------------------------------------------------------------------------
CREATE TABLE payroll_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payroll_record_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('BONUS', 'DEDUCTION', 'ALLOWANCE', 'OVERTIME') NOT NULL,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pi_record FOREIGN KEY (payroll_record_id) REFERENCES payroll_records(id) ON DELETE CASCADE,
    INDEX idx_pi_type (item_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 11. Performance Goals Table
-- ----------------------------------------------------------------------------
CREATE TABLE performance_goals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    weight_percentage DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    target_date DATE NOT NULL,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'EVALUATED') NOT NULL DEFAULT 'IN_PROGRESS',
    completion_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_goal_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_assigner FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 12. Performance Reviews Table
-- ----------------------------------------------------------------------------
CREATE TABLE performance_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    attendance_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    goal_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    manager_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    overall_score DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    tier ENUM('TIER_A_ELITE', 'TIER_B_STRONG', 'TIER_C_SATISFACTORY', 'TIER_D_NEEDS_IMPROVEMENT') NOT NULL DEFAULT 'TIER_A_ELITE',
    bonus_eligible BOOLEAN NOT NULL DEFAULT TRUE,
    recommended_increment_pct DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    recommended_bonus_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    feedback TEXT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 13. Job Openings Table
-- ----------------------------------------------------------------------------
CREATE TABLE job_openings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    department_id BIGINT UNSIGNED NOT NULL,
    employment_type ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN') NOT NULL DEFAULT 'FULL_TIME',
    vacancies INT UNSIGNED NOT NULL DEFAULT 1,
    salary_min DECIMAL(12, 2) NULL,
    salary_max DECIMAL(12, 2) NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'PUBLISHED',
    created_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_job_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_job_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_job_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 14. Job Applications Table (Public Applicants Pipeline)
-- ----------------------------------------------------------------------------
CREATE TABLE job_applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    job_opening_id BIGINT UNSIGNED NOT NULL,
    applicant_name VARCHAR(150) NOT NULL,
    applicant_email VARCHAR(191) NOT NULL,
    applicant_phone VARCHAR(50) NOT NULL,
    resume_path VARCHAR(255) NOT NULL,
    cover_note TEXT NULL,
    status ENUM('APPLIED', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED') NOT NULL DEFAULT 'APPLIED',
    interview_date TIMESTAMP NULL,
    interview_notes TEXT NULL,
    converted_to_employee_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_job FOREIGN KEY (job_opening_id) REFERENCES job_openings(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_emp FOREIGN KEY (converted_to_employee_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_app_job_status (job_opening_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 15. Notifications Table
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('PAYROLL', 'LEAVE', 'ATTENDANCE', 'PERFORMANCE', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    payload_json JSON NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 16. Audit Logs Table (Tamper-evident Administrative Audit Trail)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 17. Company Settings Table (Enterprise Policy Engine)
-- ----------------------------------------------------------------------------
CREATE TABLE company_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255) NULL,
    updated_by BIGINT UNSIGNED NULL,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_settings_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Default Enterprise Policy Seeds
-- ============================================================================
INSERT INTO company_settings (setting_key, setting_value, description) VALUES
('company_name', 'Nexus Technologies Corp', 'Official legal name of the organization'),
('work_start_time', '09:00:00', 'Standard morning shift start time'),
('work_end_time', '17:00:00', 'Standard evening shift end time'),
('grace_period_minutes', '15', 'Allowed grace period in minutes before marked as late arrival'),
('target_shift_hours', '8.00', 'Standard workday required shift hours'),
('weight_attendance', '25', 'Percentage weight for attendance in appraisal evaluation'),
('weight_goals', '50', 'Percentage weight for goal completion in appraisal evaluation'),
('weight_manager_review', '25', 'Percentage weight for manager review in appraisal evaluation'),
('weekend_days', '["Friday", "Saturday"]', 'Official company weekend days');

INSERT INTO leave_types (name, code, annual_quota, is_paid, description) VALUES
('Annual Vacation', 'ANNUAL', 14, TRUE, 'Paid yearly vacation entitlement'),
('Casual Leave', 'CASUAL', 10, TRUE, 'Short notice personal matters leave'),
('Medical Sick Leave', 'SICK', 10, TRUE, 'Health-related absences with medical cert'),
('Maternity / Paternity', 'PARENTAL', 90, TRUE, 'Parental family support leave'),
('Unpaid Leave', 'UNPAID', 30, FALSE, 'Leave without pay upon approval');
