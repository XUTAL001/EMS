/**
 * ============================================================================
 * NEXUS ENTERPRISE MANAGEMENT SYSTEM (NEXUS-EMS)
 * Full-Stack Core Application Server & Relational Engine
 * Architecture: Modular Monolith | Secure Server-Side Authorization
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Secure upload directory for CVs and private documents
const UPLOADS_DIR = path.join(__dirname, 'storage', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: PDF, Word, Images.'));
    }
  }
});

// ============================================================================
// RELATIONAL IN-MEMORY/PERSISTENT DATABASE ENGINE
// ============================================================================
const DB_FILE = path.join(__dirname, 'database', 'nexus_ems_data.json');

class RelationalDatabase {
  constructor() {
    this.data = {
      users: [],
      departments: [],
      employees: [],
      employee_salary_history: [],
      attendance: [],
      leave_types: [],
      leave_requests: [],
      payroll_periods: [],
      payroll_records: [],
      payroll_items: [],
      performance_goals: [],
      performance_reviews: [],
      job_openings: [],
      job_applications: [],
      notifications: [],
      audit_logs: [],
      company_settings: []
    };
    this.load();
  }

  load() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        return;
      } catch (e) {
        console.error('Error loading DB, seeding fresh:', e);
      }
    }
    this.seedDefaultData();
    this.save();
  }

  save() {
    const dbDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
  }

  seedDefaultData() {
    // 1. Company Settings
    this.data.company_settings = [
      { id: 1, key: 'company_name', value: 'Nexus Technologies Corp' },
      { id: 2, key: 'work_start_time', value: '09:00:00' },
      { id: 3, key: 'work_end_time', value: '17:00:00' },
      { id: 4, key: 'grace_period_minutes', value: '15' },
      { id: 5, key: 'target_shift_hours', value: '8.00' },
      { id: 6, key: 'weight_attendance', value: '25' },
      { id: 7, key: 'weight_goals', value: '50' },
      { id: 8, key: 'weight_manager_review', value: '25' }
    ];

    // 2. Leave Types
    this.data.leave_types = [
      { id: 1, name: 'Annual Vacation', code: 'ANNUAL', quota: 14, is_paid: true },
      { id: 2, name: 'Casual Leave', code: 'CASUAL', quota: 10, is_paid: true },
      { id: 3, name: 'Medical Sick Leave', code: 'SICK', quota: 10, is_paid: true },
      { id: 4, name: 'Parental Leave', code: 'PARENTAL', quota: 90, is_paid: true }
    ];

    // 3. Departments
    this.data.departments = [
      { id: 1, name: 'Engineering', code: 'ENG', manager_id: 13 },
      { id: 2, name: 'Product & Design', code: 'PROD', manager_id: 5 },
      { id: 3, name: 'Marketing', code: 'MKTG', manager_id: 6 },
      { id: 4, name: 'Human Resources', code: 'HR', manager_id: 1 },
      { id: 5, name: 'Finance & Operations', code: 'FIN', manager_id: 8 }
    ];

    // 4. Initial Users & Employees
    const salt = bcrypt.genSaltSync(10);
    const hrPass = bcrypt.hashSync('shifat001', salt);
    const mgrPass = bcrypt.hashSync('manager123', salt);
    const empPass = bcrypt.hashSync('employee123', salt);

    this.data.users = [
      { id: 1, name: 'Tanvir', email: 'tanviralamshifat2005@gmail.com', password: hrPass, role: 'HR', status: 'ACTIVE' },
      { id: 2, name: 'Sophia Clark', email: 'sophia@company.com', password: empPass, role: 'EMPLOYEE', status: 'ACTIVE' },
      { id: 13, name: 'Alex Rivera', email: 'alex@company.com', password: mgrPass, role: 'MANAGER', status: 'ACTIVE' }
    ];

    this.data.employees = [
      {
        id: 1,
        user_id: 1,
        emp_code: 'EMP-1001',
        first_name: 'Tanvir',
        last_name: 'Ahmed',
        email: 'tanviralamshifat2005@gmail.com',
        phone: '+1 (555) 019-2831',
        department_id: 4,
        designation: 'Head of Engineering & HR Admin',
        manager_id: null,
        joining_date: '2023-01-15',
        employment_type: 'FULL_TIME',
        status: 'ACTIVE',
        base_salary: 9500.00,
        work_mode: 'ONSITE',
        emergency_contact: 'Family • +1 (555) 999-0001',
        bank_account: '•••• 1001'
      },
      {
        id: 2,
        user_id: 2,
        emp_code: 'EMP-1002',
        first_name: 'Sophia',
        last_name: 'Clark',
        email: 'sophia@company.com',
        phone: '+1 (555) 234-8901',
        department_id: 1,
        designation: 'Lead Frontend Engineer',
        manager_id: 13,
        joining_date: '2023-03-01',
        employment_type: 'FULL_TIME',
        status: 'ACTIVE',
        base_salary: 8450.00,
        work_mode: 'ONSITE',
        emergency_contact: 'David Clark (Spouse) • +1 (555) 987-6543',
        bank_account: '•••• 4892'
      },
      {
        id: 13,
        user_id: 13,
        emp_code: 'EMP-1013',
        first_name: 'Alex',
        last_name: 'Rivera',
        email: 'alex@company.com',
        phone: '+1 (555) 456-7890',
        department_id: 1,
        designation: 'Engineering Team Manager',
        manager_id: 1,
        joining_date: '2022-11-01',
        employment_type: 'FULL_TIME',
        status: 'ACTIVE',
        base_salary: 9200.00,
        work_mode: 'ONSITE',
        emergency_contact: 'Elena Rivera • +1 (555) 123-4567',
        bank_account: '•••• 7812'
      }
    ];

    // Seed 10 other standard staff members to reach ~13 active startup headcount
    const otherStaff = [
      { id: 3, code: 'EMP-1003', first: 'Liam', last: 'Vance', dept: 1, role: 'Senior Cloud Architect', sal: 8200, mode: 'HYBRID' },
      { id: 4, code: 'EMP-1004', first: 'Aria', last: 'Montgomery', dept: 1, role: 'Backend Go Specialist', sal: 7800, mode: 'ONSITE' },
      { id: 5, code: 'EMP-1005', first: 'Ethan', last: 'Hunt', dept: 2, role: 'Principal UX/UI Designer', sal: 7600, mode: 'REMOTE' },
      { id: 6, code: 'EMP-1006', first: 'Olivia', last: 'Wilde', dept: 3, role: 'Growth Marketing Lead', sal: 7100, mode: 'ONSITE' },
      { id: 7, code: 'EMP-1007', first: 'Noah', last: 'Centineo', dept: 1, role: 'DevOps & CI/CD Engineer', sal: 7500, mode: 'ONSITE' },
      { id: 8, code: 'EMP-1008', first: 'Emma', last: 'Watson', dept: 5, role: 'Financial Controller', sal: 7900, mode: 'ONSITE' },
      { id: 9, code: 'EMP-1009', first: 'Lucas', last: 'Scott', dept: 2, role: 'Product Operations Analyst', sal: 6400, mode: 'REMOTE' },
      { id: 10, code: 'EMP-1010', first: 'Zendaya', last: 'Coleman', dept: 3, role: 'Brand Communications Specialist', sal: 6200, mode: 'HYBRID' },
      { id: 11, code: 'EMP-1011', first: 'Mateo', last: 'Silva', dept: 4, role: 'People Operations Coordinator', sal: 5900, mode: 'ONSITE' },
      { id: 12, code: 'EMP-1012', first: 'Chloe', last: 'Bennett', dept: 1, role: 'QA Automation Engineer', sal: 6800, mode: 'REMOTE' }
    ];

    otherStaff.forEach(s => {
      const email = `${s.first.toLowerCase()}@company.com`;
      const uId = s.id;
      this.data.users.push({
        id: uId,
        name: `${s.first} ${s.last}`,
        email,
        password: empPass,
        role: 'EMPLOYEE',
        status: 'ACTIVE'
      });
      this.data.employees.push({
        id: s.id,
        user_id: uId,
        emp_code: s.code,
        first_name: s.first,
        last_name: s.last,
        email,
        phone: '+1 (555) 700-' + s.id + '00',
        department_id: s.dept,
        designation: s.role,
        manager_id: s.dept === 1 ? 13 : 1,
        joining_date: '2023-05-15',
        employment_type: 'FULL_TIME',
        status: 'ACTIVE',
        base_salary: s.sal,
        work_mode: s.mode,
        emergency_contact: 'Contact • +1 (555) 000-0000',
        bank_account: '•••• ' + (2000 + s.id)
      });
    });

    // 5. Initial Salary History
    this.data.employees.forEach(emp => {
      this.data.employee_salary_history.push({
        id: this.data.employee_salary_history.length + 1,
        employee_id: emp.id,
        change_type: 'INITIAL',
        previous_salary: 0,
        new_salary: emp.base_salary,
        amount: emp.base_salary,
        percentage: null,
        effective_date: emp.joining_date,
        reason: 'Initial employment compensation setup',
        authorized_by: 1,
        created_at: new Date().toISOString()
      });
    });

    // 6. Today's Attendance Seeds
    const today = new Date().toISOString().split('T')[0];
    this.data.attendance = [
      {
        id: 1,
        employee_id: 2, // Sophia Clark
        date: today,
        check_in_time: `${today}T09:12:00.000Z`,
        check_out_time: `${today}T17:45:00.000Z`,
        total_worked_minutes: 513,
        status: 'PRESENT',
        late_minutes: 0,
        overtime_minutes: 33,
        ip_address: '127.0.0.1'
      },
      {
        id: 2,
        employee_id: 13, // Alex Rivera
        date: today,
        check_in_time: `${today}T08:55:00.000Z`,
        check_out_time: null,
        total_worked_minutes: 480,
        status: 'PRESENT',
        late_minutes: 0,
        overtime_minutes: 0,
        ip_address: '127.0.0.1'
      }
    ];

    // 7. Initial Leave Requests
    this.data.leave_requests = [
      {
        id: 1,
        employee_id: 2,
        leave_type_id: 3, // Sick
        start_date: '2026-10-18',
        end_date: '2026-10-20',
        total_days: 3,
        reason: 'Medical Leave (Dental Procedure)',
        status: 'PENDING',
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        employee_id: 2,
        leave_type_id: 1, // Annual
        start_date: '2026-08-12',
        end_date: '2026-08-16',
        total_days: 5,
        reason: 'Summer Vacation Break',
        status: 'APPROVED',
        reviewed_by: 1,
        reviewed_at: '2026-08-01T10:00:00.000Z',
        created_at: '2026-07-28T14:00:00.000Z'
      }
    ];

    // 8. Initial Payroll Period & Record
    this.data.payroll_periods = [
      {
        id: 1,
        name: 'September 2026 Regular Cycle',
        month: 9,
        year: 2026,
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        status: 'PAID',
        approved_by: 1,
        approved_at: '2026-10-01T09:00:00.000Z',
        paid_at: '2026-10-01T11:00:00.000Z'
      }
    ];

    this.data.payroll_records = [
      {
        id: 1,
        payroll_period_id: 1,
        employee_id: 2, // Sophia Clark
        base_salary: 8450.00,
        total_allowances: 1517.50, // HRA + Med
        total_bonuses: 1014.00,
        total_deductions: 1640.15,
        overtime_pay: 345.00,
        net_salary: 9686.35,
        payment_status: 'PAID',
        transaction_ref: 'ACH-202609-4892',
        paid_at: '2026-10-01T11:00:00.000Z'
      }
    ];

    this.data.payroll_items = [
      { id: 1, payroll_record_id: 1, item_type: 'ALLOWANCE', name: 'House Rent Allowance (HRA)', amount: 1267.50 },
      { id: 2, payroll_record_id: 1, item_type: 'ALLOWANCE', name: 'Medical Allowance', amount: 250.00 },
      { id: 3, payroll_record_id: 1, item_type: 'BONUS', name: 'Q3 Sprint Performance Bonus', amount: 1014.00 },
      { id: 4, payroll_record_id: 1, item_type: 'OVERTIME', name: 'Approved Shift Overtime', amount: 345.00 },
      { id: 5, payroll_record_id: 1, item_type: 'DEDUCTION', name: 'Income Tax Withholding (10%)', amount: 1132.65 },
      { id: 6, payroll_record_id: 1, item_type: 'DEDUCTION', name: 'Provident Fund (PF 5%)', amount: 422.50 },
      { id: 7, payroll_record_id: 1, item_type: 'DEDUCTION', name: 'Health Insurance', amount: 85.00 }
    ];

    // 9. Initial Performance Review & Goals
    this.data.performance_reviews = [
      {
        id: 1,
        employee_id: 2,
        reviewer_id: 13, // Alex Rivera
        review_period: '2026-Q3',
        attendance_score: 98.00,
        goal_score: 96.00,
        manager_score: 100.00,
        overall_score: 98.00,
        tier: 'TIER_A_ELITE',
        bonus_eligible: true,
        recommended_increment_pct: 15.00,
        recommended_bonus_amount: 1690.00,
        feedback: 'Exceptional architectural delivery of frontend modular systems.'
      }
    ];

    this.data.performance_goals = [
      {
        id: 1,
        employee_id: 2,
        assigned_by: 13,
        title: 'Architect Neumorphic soft-UI component library',
        description: 'Complete WCAG accessible soft-UI components',
        weight_percentage: 50.00,
        target_date: '2026-10-30',
        status: 'COMPLETED',
        completion_percentage: 100.00,
        score: 100.00
      },
      {
        id: 2,
        employee_id: 2,
        assigned_by: 13,
        title: 'Optimize Core Web Vitals to sub-100ms LCP',
        description: 'Eliminate render-blocking stylesheets & refactor layouts',
        weight_percentage: 50.00,
        target_date: '2026-11-15',
        status: 'IN_PROGRESS',
        completion_percentage: 90.00,
        score: 95.00
      }
    ];

    // 10. Job Openings & Applications
    this.data.job_openings = [
      {
        id: 1,
        title: 'Senior Full-Stack Engineer (PHP / Laravel / Vue)',
        department_id: 1,
        employment_type: 'FULL_TIME',
        vacancies: 2,
        salary_min: 7500.00,
        salary_max: 9500.00,
        description: 'Design and scale cloud enterprise SaaS architectures with high throughput.',
        requirements: '5+ years backend systems experience, clean architecture, relational SQL performance.',
        deadline: '2026-11-30',
        status: 'PUBLISHED',
        created_by: 1
      },
      {
        id: 2,
        title: 'Lead Product Designer (Design Systems & UX)',
        department_id: 2,
        employment_type: 'FULL_TIME',
        vacancies: 1,
        salary_min: 6500.00,
        salary_max: 8200.00,
        description: 'Craft beautiful minimalist interfaces inspired by state-of-the-art modern SaaS.',
        requirements: 'Proven design system portfolio, Figma expertise, user research mastery.',
        deadline: '2026-12-15',
        status: 'PUBLISHED',
        created_by: 1
      }
    ];

    this.data.job_applications = [
      {
        id: 1,
        job_opening_id: 1,
        applicant_name: 'Daniel Morgan',
        applicant_email: 'daniel.morgan@example.com',
        applicant_phone: '+1 (555) 345-6789',
        resume_path: 'resumes/daniel_morgan_cv.pdf',
        cover_note: 'Passionate full-stack developer with 6 years experience building modular enterprise platforms.',
        status: 'INTERVIEW',
        interview_date: '2026-10-22T14:00:00.000Z',
        interview_notes: 'Passed technical coding round with high marks.'
      }
    ];
  }
}

const db = new RelationalDatabase();

// ============================================================================
// SERVER-SIDE AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================
function authenticateToken(req, res, next) {
  const token = req.cookies.nexus_auth_token || req.headers['authorization']?.replace('Bearer ', '');
  if (!token) {
    // If browser viewing HTML page, allow static access; for API, require auth
    if (req.path.startsWith('/api/') && !req.path.startsWith('/api/public') && !req.path.startsWith('/api/auth')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Session missing or expired.' });
    }
    return next();
  }

  try {
    const session = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const user = db.data.users.find(u => u.id === session.id && u.status === 'ACTIVE');
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account inactive or not found.' });
    }
    req.user = user;
    req.employee = db.data.employees.find(e => e.user_id === user.id);
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid authentication token.' });
  }
}

app.use(authenticateToken);

// Role Authorization Gate
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      // Audit log unauthorized access attempts
      db.data.audit_logs.push({
        id: db.data.audit_logs.length + 1,
        user_id: req.user.id,
        action: 'UNAUTHORIZED_ACCESS_BLOCKED',
        entity_type: 'ENDPOINT',
        entity_id: null,
        new_values: { path: req.originalUrl, required_roles: roles, user_role: req.user.role },
        ip_address: req.ip,
        created_at: new Date().toISOString()
      });
      db.save();
      return res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
}

// Strict Manager Salary Blindness Gate
function forbidManagerPayroll(req, res, next) {
  if (req.user && req.user.role === 'MANAGER') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Managers have no authorization to access salary, payroll, bonus, or payslip records.'
    });
  }
  next();
}

// ============================================================================
// API ROUTES
// ============================================================================

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const reqEmail = email.trim().toLowerCase();
  const user = db.data.users.find(u => 
    u.email.toLowerCase() === reqEmail ||
    (reqEmail === 'tanvir@nexus.com' && u.email === 'tanviralamshifat2005@gmail.com')
  );
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ success: false, error: 'Invalid company credentials.' });
  }

  const emp = db.data.employees.find(e => e.user_id === user.id);
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    employee_id: emp ? emp.id : null,
    emp_code: emp ? emp.emp_code : null,
    designation: emp ? emp.designation : 'Administrator'
  };

  const token = Buffer.from(JSON.stringify(sessionData)).toString('base64');
  res.cookie('nexus_auth_token', token, { httpOnly: true, maxAge: 24 * 3600 * 1000 });

  res.json({
    success: true,
    message: `Authenticated as ${user.name} (${user.role})`,
    user: sessionData,
    token
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('nexus_auth_token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Not logged in.' });
  res.json({ success: true, user: req.user, employee: req.employee });
});

// --- Employee Management Endpoints ---
app.get('/api/employees', (req, res) => {
  let list = db.data.employees;

  // Role Scoping
  if (req.user.role === 'MANAGER') {
    // Manager only sees their assigned team members
    list = list.filter(e => e.manager_id === req.employee.id);
    // Strip all sensitive financial/salary data for Manager
    list = list.map(e => {
      const { base_salary, bank_account, bank_name, ...safeData } = e;
      return safeData;
    });
  } else if (req.user.role === 'EMPLOYEE') {
    // Employee only sees their own profile
    list = list.filter(e => e.id === req.employee.id);
  }

  res.json({ success: true, data: list });
});

app.post('/api/employees', requireRole('HR'), (req, res) => {
  const { first_name, last_name, email, phone, department_id, designation, base_salary, work_mode, joining_date } = req.body;
  if (!first_name || !last_name || !email || !department_id) {
    return res.status(400).json({ success: false, error: 'Required fields missing.' });
  }

  // Prevent duplicate email
  if (db.data.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Email address already registered in system.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const defaultPass = bcrypt.hashSync('employee123', salt);
  const newUserId = db.data.users.length + 1;
  const newEmpId = db.data.employees.length + 1;
  const empCode = 'EMP-' + (1000 + newEmpId);

  const newUser = {
    id: newUserId,
    name: `${first_name} ${last_name}`,
    email,
    password: defaultPass,
    role: 'EMPLOYEE',
    status: 'ACTIVE'
  };

  const newEmp = {
    id: newEmpId,
    user_id: newUserId,
    emp_code: empCode,
    first_name,
    last_name,
    email,
    phone: phone || '',
    department_id: parseInt(department_id),
    designation: designation || 'Staff Specialist',
    manager_id: 13,
    joining_date: joining_date || new Date().toISOString().split('T')[0],
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    base_salary: parseFloat(base_salary) || 5000.00,
    work_mode: work_mode || 'ONSITE',
    emergency_contact: '',
    bank_account: '•••• ' + (3000 + newEmpId)
  };

  db.data.users.push(newUser);
  db.data.employees.push(newEmp);

  // Initial salary history entry
  db.data.employee_salary_history.push({
    id: db.data.employee_salary_history.length + 1,
    employee_id: newEmpId,
    change_type: 'INITIAL',
    previous_salary: 0,
    new_salary: newEmp.base_salary,
    amount: newEmp.base_salary,
    percentage: null,
    effective_date: newEmp.joining_date,
    reason: 'Initial employment contract setup',
    authorized_by: req.user.id,
    created_at: new Date().toISOString()
  });

  db.save();
  res.status(201).json({ success: true, message: 'Employee successfully created.', data: newEmp });
});

// --- Attendance Engine ---
app.post('/api/attendance/check-in', (req, res) => {
  if (!req.employee) return res.status(400).json({ success: false, error: 'Employee profile not associated.' });

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const serverTimeIso = now.toISOString();

  // Rule 4: Reject duplicate check-ins
  const existing = db.data.attendance.find(a => a.employee_id === req.employee.id && a.date === today);
  if (existing && existing.check_in_time) {
    return res.status(400).json({ success: false, error: 'Duplicate check-in rejected: Active shift already started today.' });
  }

  // Grace period check (9:00 AM + 15 mins)
  const isLate = (now.getHours() > 9) || (now.getHours() === 9 && now.getMinutes() > 15);
  const lateMins = isLate ? ((now.getHours() - 9) * 60 + now.getMinutes() - 15) : 0;

  const newLog = {
    id: db.data.attendance.length + 1,
    employee_id: req.employee.id,
    date: today,
    check_in_time: serverTimeIso,
    check_out_time: null,
    total_worked_minutes: 0,
    status: isLate ? 'LATE' : 'PRESENT',
    late_minutes: Math.max(0, lateMins),
    overtime_minutes: 0,
    ip_address: req.ip
  };

  if (existing) {
    Object.assign(existing, newLog);
  } else {
    db.data.attendance.push(newLog);
  }

  db.save();
  res.json({ success: true, message: `Checked in successfully at ${now.toLocaleTimeString()}`, data: newLog });
});

app.post('/api/attendance/check-out', (req, res) => {
  if (!req.employee) return res.status(400).json({ success: false, error: 'Employee profile not associated.' });

  const today = new Date().toISOString().split('T')[0];
  const record = db.data.attendance.find(a => a.employee_id === req.employee.id && a.date === today);

  // Rule 4: Reject invalid check-outs
  if (!record || !record.check_in_time) {
    return res.status(400).json({ success: false, error: 'Invalid check-out rejected: No active check-in record found for today.' });
  }

  if (record.check_out_time) {
    return res.status(400).json({ success: false, error: 'Invalid check-out rejected: Shift already closed today.' });
  }

  const now = new Date();
  record.check_out_time = now.toISOString();
  const diffMs = now - new Date(record.check_in_time);
  record.total_worked_minutes = Math.max(1, Math.round(diffMs / 60000));
  record.overtime_minutes = Math.max(0, record.total_worked_minutes - 480); // Over 8h
  db.save();

  res.json({
    success: true,
    message: `Checked out successfully. Shift total: ${Math.floor(record.total_worked_minutes / 60)}h ${record.total_worked_minutes % 60}m`,
    data: record
  });
});

// --- Leave Management Engine ---
app.post('/api/leaves/apply', (req, res) => {
  if (!req.employee) return res.status(400).json({ success: false, error: 'Employee record required.' });
  const { leave_type_id, start_date, end_date, reason } = req.body;

  if (!leave_type_id || !start_date || !end_date || !reason) {
    return res.status(400).json({ success: false, error: 'Please provide leave type, start date, end date, and reason.' });
  }

  // Rule 5: Date range validation
  const start = new Date(start_date);
  const end = new Date(end_date);
  if (end < start) {
    return res.status(400).json({ success: false, error: 'Invalid date range: End date cannot be before start date.' });
  }

  // Rule 5: Check overlapping leave requests
  const hasOverlap = db.data.leave_requests.some(lr => {
    if (lr.employee_id !== req.employee.id || lr.status === 'REJECTED' || lr.status === 'CANCELLED') return false;
    const rStart = new Date(lr.start_date);
    const rEnd = new Date(lr.end_date);
    return (start <= rEnd && end >= rStart);
  });

  if (hasOverlap) {
    return res.status(400).json({ success: false, error: 'Validation Error: Overlapping leave request exists for the selected dates.' });
  }

  const days = Math.round((end - start) / (1000 * 3600 * 24)) + 1;
  const newLeave = {
    id: db.data.leave_requests.length + 1,
    employee_id: req.employee.id,
    leave_type_id: parseInt(leave_type_id),
    start_date,
    end_date,
    total_days: days,
    reason,
    status: 'PENDING',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    created_at: new Date().toISOString()
  };

  db.data.leave_requests.push(newLeave);
  db.save();

  res.status(201).json({ success: true, message: 'Leave application submitted for approval.', data: newLeave });
});

app.post('/api/leaves/:id/review', requireRole('HR', 'MANAGER'), (req, res) => {
  const leaveId = parseInt(req.params.id);
  const { action, rejection_reason } = req.body; // 'APPROVE' or 'REJECT'
  const leave = db.data.leave_requests.find(l => l.id === leaveId);

  if (!leave) return res.status(404).json({ success: false, error: 'Leave request not found.' });

  // Manager Scope Check
  if (req.user.role === 'MANAGER') {
    const applicant = db.data.employees.find(e => e.id === leave.employee_id);
    if (!applicant || applicant.manager_id !== req.employee.id) {
      return res.status(403).json({ success: false, error: 'Forbidden: You can only review leave requests for your direct team.' });
    }
  }

  if (action === 'APPROVE') {
    leave.status = 'APPROVED';
    leave.reviewed_by = req.user.id;
    leave.reviewed_at = new Date().toISOString();
  } else {
    leave.status = 'REJECTED';
    leave.reviewed_by = req.user.id;
    leave.reviewed_at = new Date().toISOString();
    leave.rejection_reason = rejection_reason || 'Department operational requirements.';
  }

  db.save();
  res.json({ success: true, message: `Leave application ${leave.status.toLowerCase()} successfully.`, data: leave });
});

// --- Salary History & Payroll Engine (Protected by forbidManagerPayroll) ---
app.use('/api/payroll', forbidManagerPayroll);
app.use('/api/salary', forbidManagerPayroll);

// Rule 6: Permanent Salary Increments & Reductions
app.post('/api/salary/adjust', requireRole('HR'), (req, res) => {
  const { employee_id, change_type, amount, percentage, effective_date, reason } = req.body;
  const emp = db.data.employees.find(e => e.id === parseInt(employee_id));

  if (!emp) return res.status(404).json({ success: false, error: 'Employee record not found.' });
  if (!['INCREMENT', 'REDUCTION'].includes(change_type)) {
    return res.status(400).json({ success: false, error: 'Invalid change type. Must be INCREMENT or REDUCTION.' });
  }

  const prev = emp.base_salary;
  let delta = parseFloat(amount);
  if (percentage) {
    delta = Math.round((prev * (parseFloat(percentage) / 100)) * 100) / 100;
  }

  const newSal = change_type === 'INCREMENT' ? (prev + delta) : Math.max(0, prev - delta);
  emp.base_salary = newSal;

  const historyEntry = {
    id: db.data.employee_salary_history.length + 1,
    employee_id: emp.id,
    change_type,
    previous_salary: prev,
    new_salary: newSal,
    amount: delta,
    percentage: percentage ? parseFloat(percentage) : Math.round((delta / prev) * 100),
    effective_date: effective_date || new Date().toISOString().split('T')[0],
    reason: reason || 'Annual performance compensation appraisal',
    authorized_by: req.user.id,
    created_at: new Date().toISOString()
  };

  db.data.employee_salary_history.push(historyEntry);
  db.save();

  res.json({
    success: true,
    message: `Permanent salary ${change_type.toLowerCase()} of $${delta} applied successfully. New Base: $${newSal}`,
    data: historyEntry
  });
});

// Rule 7 & 9: Generate Monthly Payroll Cycle (Prevents duplicate runs)
app.post('/api/payroll/generate', requireRole('HR'), (req, res) => {
  const { month, year, name } = req.body;
  const pMonth = parseInt(month) || new Date().getMonth() + 1;
  const pYear = parseInt(year) || new Date().getFullYear();

  // Rule 9: Check existing period
  let period = db.data.payroll_periods.find(p => p.month === pMonth && p.year === pYear);
  if (!period) {
    period = {
      id: db.data.payroll_periods.length + 1,
      name: name || `Payroll Cycle ${pMonth}/${pYear}`,
      month: pMonth,
      year: pYear,
      start_date: `${pYear}-${String(pMonth).padStart(2, '0')}-01`,
      end_date: `${pYear}-${String(pMonth).padStart(2, '0')}-28`,
      status: 'DRAFT',
      approved_by: null,
      approved_at: null,
      paid_at: null,
      created_at: new Date().toISOString()
    };
    db.data.payroll_periods.push(period);
  }

  // Generate / refresh snapshot without duplicating records
  const activeStaff = db.data.employees.filter(e => e.status === 'ACTIVE');
  activeStaff.forEach(emp => {
    let pr = db.data.payroll_records.find(r => r.payroll_period_id === period.id && r.employee_id === emp.id);
    if (!pr) {
      pr = {
        id: db.data.payroll_records.length + 1,
        payroll_period_id: period.id,
        employee_id: emp.id,
        base_salary: emp.base_salary,
        total_allowances: Math.round(emp.base_salary * 0.18 * 100) / 100, // Standard HRA & Med
        total_bonuses: 0.00,
        total_deductions: Math.round(emp.base_salary * 0.15 * 100) / 100, // Standard Tax & PF
        overtime_pay: 0.00,
        net_salary: 0.00,
        payment_status: 'UNPAID',
        transaction_ref: null,
        paid_at: null
      };
      // Net = Base + Allowance + Bonus + OT - Deductions
      pr.net_salary = Math.round((pr.base_salary + pr.total_allowances + pr.total_bonuses + pr.overtime_pay - pr.total_deductions) * 100) / 100;
      db.data.payroll_records.push(pr);
    }
  });

  db.save();
  res.json({ success: true, message: `Payroll generated for period ${pMonth}/${pYear}. Total records: ${activeStaff.length}`, period });
});

// Rule 11: Finalize & Approve Payroll (HR only)
app.post('/api/payroll/periods/:id/approve', requireRole('HR'), (req, res) => {
  const periodId = parseInt(req.params.id);
  const period = db.data.payroll_periods.find(p => p.id === periodId);
  if (!period) return res.status(404).json({ success: false, error: 'Payroll period not found.' });

  period.status = 'APPROVED';
  period.approved_by = req.user.id;
  period.approved_at = new Date().toISOString();

  // Mark all records approved
  db.data.payroll_records.filter(r => r.payroll_period_id === period.id).forEach(r => {
    r.payment_status = 'PROCESSING';
  });

  db.save();
  res.json({ success: true, message: `Payroll period #${period.id} officially approved.`, period });
});

// View Authorized Payslips
app.get('/api/payroll/payslips/:id', (req, res) => {
  const recordId = parseInt(req.params.id);
  const record = db.data.payroll_records.find(r => r.id === recordId);
  if (!record) return res.status(404).json({ success: false, error: 'Payslip record not found.' });

  // Rule 3: Employee cannot see another employee's payslip
  if (req.user.role === 'EMPLOYEE' && record.employee_id !== req.employee.id) {
    return res.status(403).json({ success: false, error: 'Forbidden: You are not authorized to view another employee\'s payslip.' });
  }

  const emp = db.data.employees.find(e => e.id === record.employee_id);
  const period = db.data.payroll_periods.find(p => p.id === record.payroll_period_id);
  const items = db.data.payroll_items.filter(i => i.payroll_record_id === record.id);

  res.json({
    success: true,
    data: {
      record,
      employee: emp,
      period,
      items
    }
  });
});

// --- Public Careers Portal & Recruitment Pipeline ---
app.get('/api/public/careers', (req, res) => {
  const openings = db.data.job_openings.filter(j => j.status === 'PUBLISHED').map(j => {
    const dept = db.data.departments.find(d => d.id === j.department_id);
    return { ...j, department_name: dept ? dept.name : 'General' };
  });
  res.json({ success: true, data: openings });
});

app.post('/api/public/apply', upload.single('resume'), (req, res) => {
  const { job_opening_id, applicant_name, applicant_email, applicant_phone, cover_note } = req.body;
  if (!job_opening_id || !applicant_name || !applicant_email || !applicant_phone) {
    return res.status(400).json({ success: false, error: 'Please fill in all required application fields.' });
  }

  const job = db.data.job_openings.find(j => j.id === parseInt(job_opening_id) && j.status === 'PUBLISHED');
  if (!job) return res.status(404).json({ success: false, error: 'Job opening not found or no longer accepting applicants.' });

  const resumePath = req.file ? req.file.path : 'resumes/standard_resume.pdf';

  const newApp = {
    id: db.data.job_applications.length + 1,
    job_opening_id: job.id,
    applicant_name,
    applicant_email,
    applicant_phone,
    resume_path: resumePath,
    cover_note: cover_note || '',
    status: 'APPLIED',
    interview_date: null,
    interview_notes: null,
    converted_to_employee_id: null,
    created_at: new Date().toISOString()
  };

  db.data.job_applications.push(newApp);
  db.save();

  res.status(201).json({ success: true, message: 'Application submitted successfully! Our talent team will review your CV.', data: newApp });
});

// Candidate Conversion Workflow
app.post('/api/recruitment/candidates/:id/convert', requireRole('HR'), (req, res) => {
  const candId = parseInt(req.params.id);
  const cand = db.data.job_applications.find(a => a.id === candId);
  if (!cand) return res.status(404).json({ success: false, error: 'Candidate application not found.' });

  const { department_id, designation, base_salary, joining_date } = req.body;
  const nameParts = cand.applicant_name.split(' ');
  const firstName = nameParts[0] || 'New';
  const lastName = nameParts.slice(1).join(' ') || 'Personnel';

  const newUserId = db.data.users.length + 1;
  const newEmpId = db.data.employees.length + 1;
  const empCode = 'EMP-' + (1000 + newEmpId);
  const salt = bcrypt.genSaltSync(10);

  const newUser = {
    id: newUserId,
    name: cand.applicant_name,
    email: cand.applicant_email,
    password: bcrypt.hashSync('welcome2026', salt),
    role: 'EMPLOYEE',
    status: 'ACTIVE'
  };

  const newEmp = {
    id: newEmpId,
    user_id: newUserId,
    emp_code: empCode,
    first_name: firstName,
    last_name: lastName,
    email: cand.applicant_email,
    phone: cand.applicant_phone,
    department_id: parseInt(department_id) || 1,
    designation: designation || 'Associate Engineer',
    manager_id: 13,
    joining_date: joining_date || new Date().toISOString().split('T')[0],
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    base_salary: parseFloat(base_salary) || 6000.00,
    work_mode: 'ONSITE',
    emergency_contact: '',
    bank_account: '•••• ' + (4000 + newEmpId)
  };

  db.data.users.push(newUser);
  db.data.employees.push(newEmp);
  cand.status = 'SELECTED';
  cand.converted_to_employee_id = newEmpId;
  db.save();

  res.json({ success: true, message: `Candidate ${cand.applicant_name} converted to Employee ${empCode}!`, employee: newEmp });
});

// ============================================================================
// STATIC ASSET SERVING WITH ABSOLUTE THEME LOCK
// ============================================================================
app.use(express.static(__dirname));

// Direct Fallback Route for Client Navigation
app.get('*', (req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Export app for automated testing runner
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[NexusEMS] Enterprise Full-Stack Monolith running on http://localhost:${PORT}`);
  });
}

module.exports = { app, db };
