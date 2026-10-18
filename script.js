/**
 * Neumorphic Enterprise Portal & Role-Based EMS Controller
 * Handles:
 * 1. Role-Based Login (HR Administrator vs Employee Self-Service)
 * 2. Forgot Password OTP Verification
 * 3. NEXUS EMS HR Management Portal (Full Staff Directory CRUD, Leave Approvals, CSV Export)
 * 4. NEXUS EMS Employee Self-Service Portal (Daily Punch Clock, Apply for Leave, My Tasks, Payslips)
 * 5. Instant Role Switcher (for seamless testing of both HR & Employee portals)
 */

// ==========================================================================
// 1. Audio Synthesizer (Native Web Audio API for Tactile Clicks & Chimes)
// ==========================================================================
class TactileAudio {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop(freq = 650, duration = 0.08) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback
    }
  }

  playSuccess() {
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      setTimeout(() => this.playPop(freq, 0.12), idx * 100);
    });
  }
}

const sound = new TactileAudio();

// ==========================================================================
// 2. Toast Notification Center
// ==========================================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 3000);
}

// ==========================================================================
// 3. Employee Directory Store & Automated Role Detection (index.html)
// ==========================================================================
const NEXUS_DEFAULT_EMPLOYEES = [
  {
    id: 'EMP-1001',
    name: 'Tanvir',
    email: 'tanvir@gmai.com',
    dept: 'Engineering',
    role: 'Head of Engineering & HR Admin',
    mode: 'Onsite',
    status: 'Active',
    systemRole: 'HR',
    baseSalary: 9500,
    inTime: '08:50 AM',
    outTime: '05:40 PM',
    shiftDuration: '8h 50m',
    overtime: '+50m OT',
    monthlyHours: 178.5,
    targetHours: 160,
    tasksDone: 29,
    totalTasks: 30,
    punctualityScore: 98,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '08:50 AM', outTime: '05:40 PM', duration: '8h 50m', overtime: '+50m OT', status: 'On Time' },
      { date: 'Yesterday (Oct 13)', inTime: '08:55 AM', outTime: '05:35 PM', duration: '8h 40m', overtime: '+40m OT', status: 'On Time' },
      { date: 'Oct 12, 2026', inTime: '08:48 AM', outTime: '05:45 PM', duration: '8h 57m', overtime: '+57m OT', status: 'On Time' },
      { date: 'Oct 11, 2026', inTime: '08:52 AM', outTime: '05:30 PM', duration: '8h 38m', overtime: '+38m OT', status: 'On Time' },
      { date: 'Oct 10, 2026', inTime: '09:00 AM', outTime: '05:30 PM', duration: '8h 30m', overtime: '+30m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1002',
    name: 'Sophia Clark',
    email: 'sophia@company.com',
    dept: 'Engineering',
    role: 'Lead Frontend Engineer',
    mode: 'Remote',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 8450,
    inTime: '09:12 AM',
    outTime: '05:45 PM',
    shiftDuration: '8h 33m',
    overtime: '+33m OT',
    monthlyHours: 172.5,
    targetHours: 160,
    tasksDone: 24,
    totalTasks: 25,
    punctualityScore: 96,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:12 AM', outTime: '05:45 PM', duration: '8h 33m', overtime: '+33m OT', status: 'On Time' },
      { date: 'Oct 13, 2026', inTime: '09:15 AM', outTime: '05:30 PM', duration: '8h 15m', overtime: '+15m OT', status: 'On Time' },
      { date: 'Oct 12, 2026', inTime: '09:05 AM', outTime: '05:40 PM', duration: '8h 35m', overtime: '+35m OT', status: 'On Time' },
      { date: 'Oct 11, 2026', inTime: '09:35 AM', outTime: '06:05 PM', duration: '8h 30m', overtime: '+30m OT', status: 'Late Arrival' },
      { date: 'Oct 10, 2026', inTime: '09:10 AM', outTime: '05:25 PM', duration: '8h 15m', overtime: '+15m OT', status: 'On Time' },
      { date: 'Oct 09, 2026', inTime: '09:00 AM', outTime: '05:15 PM', duration: '8h 15m', overtime: '+15m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1003',
    name: 'James Wright',
    email: 'james@company.com',
    dept: 'Engineering',
    role: 'Principal DevOps Architect',
    mode: 'Onsite',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 9200,
    inTime: '09:00 AM',
    outTime: '05:30 PM',
    shiftDuration: '8h 30m',
    overtime: '+30m OT',
    monthlyHours: 168.0,
    targetHours: 160,
    tasksDone: 21,
    totalTasks: 24,
    punctualityScore: 92,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:00 AM', outTime: '05:30 PM', duration: '8h 30m', overtime: '+30m OT', status: 'On Time' },
      { date: 'Oct 13, 2026', inTime: '08:58 AM', outTime: '05:30 PM', duration: '8h 32m', overtime: '+32m OT', status: 'On Time' },
      { date: 'Oct 12, 2026', inTime: '09:04 AM', outTime: '05:25 PM', duration: '8h 21m', overtime: '+21m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1004',
    name: 'Aisha Noor',
    email: 'aisha@company.com',
    dept: 'Product',
    role: 'Senior Product Designer',
    mode: 'Hybrid',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 7800,
    inTime: '09:20 AM',
    outTime: '05:35 PM',
    shiftDuration: '8h 15m',
    overtime: '+15m OT',
    monthlyHours: 164.0,
    targetHours: 160,
    tasksDone: 19,
    totalTasks: 22,
    punctualityScore: 88,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:20 AM', outTime: '05:35 PM', duration: '8h 15m', overtime: '+15m OT', status: 'On Time' },
      { date: 'Oct 13, 2026', inTime: '09:15 AM', outTime: '05:20 PM', duration: '8h 05m', overtime: '+05m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1005',
    name: 'Marcus Ray',
    email: 'marcus@company.com',
    dept: 'Engineering',
    role: 'Cloud Security Engineer',
    mode: 'Onsite',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 8800,
    inTime: '08:45 AM',
    outTime: '05:50 PM',
    shiftDuration: '9h 05m',
    overtime: '+1h 05m OT',
    monthlyHours: 182.0,
    targetHours: 160,
    tasksDone: 28,
    totalTasks: 29,
    punctualityScore: 99,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '08:45 AM', outTime: '05:50 PM', duration: '9h 05m', overtime: '+1h 05m OT', status: 'On Time' },
      { date: 'Oct 13, 2026', inTime: '08:50 AM', outTime: '05:40 PM', duration: '8h 50m', overtime: '+50m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1006',
    name: 'Elena Rostova',
    email: 'elena@company.com',
    dept: 'Product',
    role: 'Director of Product',
    mode: 'Remote',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 9600,
    inTime: '09:05 AM',
    outTime: '05:30 PM',
    shiftDuration: '8h 25m',
    overtime: '+25m OT',
    monthlyHours: 166.0,
    targetHours: 160,
    tasksDone: 22,
    totalTasks: 24,
    punctualityScore: 91,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:05 AM', outTime: '05:30 PM', duration: '8h 25m', overtime: '+25m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1007',
    name: 'Daniel Kim',
    email: 'daniel@company.com',
    dept: 'Marketing',
    role: 'Head of Growth Marketing',
    mode: 'Onsite',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 7400,
    inTime: '09:40 AM',
    outTime: '05:45 PM',
    shiftDuration: '8h 05m',
    overtime: '+05m OT',
    monthlyHours: 156.0,
    targetHours: 160,
    tasksDone: 16,
    totalTasks: 22,
    punctualityScore: 78,
    attendanceStatus: 'Late Arrival',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:40 AM', outTime: '05:45 PM', duration: '8h 05m', overtime: '+05m OT', status: 'Late Arrival' }
    ]
  },
  {
    id: 'EMP-1008',
    name: 'Olivia Bennett',
    email: 'olivia@company.com',
    dept: 'Human Resources',
    role: 'Lead Talent Partner',
    mode: 'Hybrid',
    status: 'On Leave',
    systemRole: 'EMPLOYEE',
    baseSalary: 7100,
    inTime: null,
    outTime: null,
    shiftDuration: 'On Leave',
    overtime: 'Approved Leave',
    monthlyHours: 144.0,
    targetHours: 160,
    tasksDone: 17,
    totalTasks: 21,
    punctualityScore: 92,
    attendanceStatus: 'On Leave',
    attendanceHistory: [
      { date: 'Yesterday (Oct 13)', inTime: '09:10 AM', outTime: '05:15 PM', duration: '8h 05m', overtime: '+05m OT', status: 'On Time' },
      { date: 'Oct 12, 2026', inTime: '09:05 AM', outTime: '05:10 PM', duration: '8h 05m', overtime: '+05m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1009',
    name: 'Lucas Garcia',
    email: 'lucas@company.com',
    dept: 'Finance',
    role: 'Senior Financial Analyst',
    mode: 'Onsite',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 8300,
    inTime: '08:55 AM',
    outTime: '05:35 PM',
    shiftDuration: '8h 40m',
    overtime: '+40m OT',
    monthlyHours: 173.0,
    targetHours: 160,
    tasksDone: 25,
    totalTasks: 26,
    punctualityScore: 97,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '08:55 AM', outTime: '05:35 PM', duration: '8h 40m', overtime: '+40m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1010',
    name: 'Maya Patel',
    email: 'maya@company.com',
    dept: 'Engineering',
    role: 'iOS & Android Lead',
    mode: 'Remote',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 8900,
    inTime: '08:50 AM',
    outTime: '05:45 PM',
    shiftDuration: '8h 55m',
    overtime: '+55m OT',
    monthlyHours: 175.0,
    targetHours: 160,
    tasksDone: 26,
    totalTasks: 27,
    punctualityScore: 95,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '08:50 AM', outTime: '05:45 PM', duration: '8h 55m', overtime: '+55m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1011',
    name: 'Liam Anderson',
    email: 'liam@company.com',
    dept: 'Engineering',
    role: 'Backend Distributed Systems',
    mode: 'Hybrid',
    status: 'Probation',
    systemRole: 'EMPLOYEE',
    baseSalary: 6200,
    inTime: '09:50 AM',
    outTime: '05:00 PM',
    shiftDuration: '7h 10m',
    overtime: '-50m Deficit',
    monthlyHours: 138.0,
    targetHours: 160,
    tasksDone: 11,
    totalTasks: 20,
    punctualityScore: 65,
    attendanceStatus: 'Late Arrival',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:50 AM', outTime: '05:00 PM', duration: '7h 10m', overtime: '-50m Deficit', status: 'Late Arrival' }
    ]
  },
  {
    id: 'EMP-1012',
    name: 'Emma Watson',
    email: 'emma@company.com',
    dept: 'Marketing',
    role: 'Brand & Content Strategist',
    mode: 'Remote',
    status: 'Active',
    systemRole: 'EMPLOYEE',
    baseSalary: 7200,
    inTime: '09:05 AM',
    outTime: '05:20 PM',
    shiftDuration: '8h 15m',
    overtime: '+15m OT',
    monthlyHours: 163.5,
    targetHours: 160,
    tasksDone: 20,
    totalTasks: 22,
    punctualityScore: 89,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '09:05 AM', outTime: '05:20 PM', duration: '8h 15m', overtime: '+15m OT', status: 'On Time' }
    ]
  },
  {
    id: 'EMP-1013',
    name: 'Alex Rivera',
    email: 'alex@company.com',
    dept: 'Engineering',
    role: 'Engineering Team Manager',
    mode: 'Hybrid',
    status: 'Active',
    systemRole: 'MANAGER',
    baseSalary: 10500,
    inTime: '08:45 AM',
    outTime: '05:30 PM',
    shiftDuration: '8h 45m',
    overtime: '+45m OT',
    monthlyHours: 176.0,
    targetHours: 160,
    tasksDone: 32,
    totalTasks: 34,
    punctualityScore: 98,
    attendanceStatus: 'On Time',
    attendanceHistory: [
      { date: 'Today (Oct 14)', inTime: '08:45 AM', outTime: '05:30 PM', duration: '8h 45m', overtime: '+45m OT', status: 'On Time' }
    ]
  }
];

function getStoredEmployees() {
  const stored = localStorage.getItem('nexus_ems_employees');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Cleanly merge stored data with default schema so any missing fields are safely populated
      return parsed.map(p => {
        const defaultMatch = NEXUS_DEFAULT_EMPLOYEES.find(d => d.id === p.id) || {};
        return { ...defaultMatch, ...p };
      });
    } catch (e) {}
  }
  return NEXUS_DEFAULT_EMPLOYEES;
}

/**
 * Performance-Based Bonus and Salary Increment Formula
 * Work Hours (40%) + Sprint Tasks Output (40%) + Punctuality/In-Out Times (20%)
 */
function calculateEmployeeAppraisal(emp) {
  const baseSalary = emp.baseSalary || 7000;
  const monthlyHours = typeof emp.monthlyHours === 'number' ? emp.monthlyHours : 160;
  const targetHours = emp.targetHours || 160;
  const tasksDone = typeof emp.tasksDone === 'number' ? emp.tasksDone : 20;
  const totalTasks = emp.totalTasks || 20;
  const punctualityScore = typeof emp.punctualityScore === 'number' ? emp.punctualityScore : 90;

  // Working Hours completion ratio
  const hoursRatio = monthlyHours / targetHours;
  const hoursScore = Math.min(100, Math.round(hoursRatio * 100));

  // Sprint deliverables completed ratio
  const taskRatio = totalTasks > 0 ? (tasksDone / totalTasks) : 1;
  const taskScore = Math.min(100, Math.round(taskRatio * 100));

  // Overall Performance Score
  const perfScore = Math.min(100, Math.max(0, Math.round((hoursScore * 0.4) + (taskScore * 0.4) + (punctualityScore * 0.2))));

  let tierKey = 'tier-c';
  let tierName = 'Tier C';
  let tierLabel = 'Tier C • Standard Solid';
  let defaultBonusPercent = 6;
  let defaultIncPercent = 5;

  if (perfScore >= 90) {
    tierKey = 'tier-a';
    tierName = 'Tier A';
    tierLabel = 'Tier A • Top Performer';
    defaultBonusPercent = 20;
    defaultIncPercent = 15;
  } else if (perfScore >= 75) {
    tierKey = 'tier-b';
    tierName = 'Tier B';
    tierLabel = 'Tier B • High Achiever';
    defaultBonusPercent = 12;
    defaultIncPercent = 10;
  } else if (perfScore >= 60) {
    tierKey = 'tier-c';
    tierName = 'Tier C';
    tierLabel = 'Tier C • Standard Solid';
    defaultBonusPercent = 6;
    defaultIncPercent = 5;
  } else {
    tierKey = 'tier-d';
    tierName = 'Tier D';
    tierLabel = 'Tier D • Needs Improvement';
    defaultBonusPercent = 0;
    defaultIncPercent = 0;
  }

  const bonusPercent = typeof emp.customBonusPercent === 'number' ? emp.customBonusPercent : defaultBonusPercent;
  const bonusAmount = typeof emp.customBonus === 'number' ? emp.customBonus : Math.round(baseSalary * (bonusPercent / 100));
  const incPercent = typeof emp.customIncrement === 'number' ? emp.customIncrement : defaultIncPercent;
  const incAmount = Math.round(baseSalary * (incPercent / 100));
  const newSalary = baseSalary + incAmount;

  return {
    perfScore,
    tierKey,
    tierName,
    tierLabel,
    hoursRatio,
    hoursScore,
    taskScore,
    punctualityScore,
    bonusPercent,
    bonusAmount,
    incPercent,
    incAmount,
    baseSalary,
    newSalary
  };
}

/**
 * Automatically determine role linked to the login email
 * Returns: 'HR', 'MANAGER', or 'EMPLOYEE'
 */
function getUserRoleByEmail(email) {
  const normalized = (email || '').trim().toLowerCase();
  if (normalized === 'tanvir@gmai.com' || normalized === 'tanvir@gmail.com' || normalized === 'hr@company.com' || normalized === 'hr@nexus.com') {
    return 'HR';
  }
  if (normalized === 'alex@company.com' || normalized === 'manager@company.com' || normalized === 'manager@nexus.com') {
    return 'MANAGER';
  }

  const allStaff = getStoredEmployees();
  const matched = allStaff.find(emp => emp.email && emp.email.toLowerCase() === normalized);
  if (matched && matched.systemRole) {
    return matched.systemRole;
  }
  return 'EMPLOYEE';
}

function initAuthPage() {
  const btnSubmit = document.getElementById('btn-submit');
  const authForm = document.getElementById('auth-form');
  const passwordInput = document.getElementById('password-input');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const eyeOpen = document.getElementById('eye-icon-open');
  const eyeClosed = document.getElementById('eye-icon-closed');
  const emailInput = document.getElementById('email-input');

  // Password Visibility Toggle
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      sound.playPop(800, 0.05);
      const isPassword = passwordInput.getAttribute('type') === 'password';
      const newType = isPassword ? 'text' : 'password';

      passwordInput.setAttribute('type', newType);
      eyeOpen.classList.toggle('hidden', isPassword);
      eyeClosed.classList.toggle('hidden', !isPassword);
    });
  }

  // Submit Handler: View automatically depends on the role associated with the login email
  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playPop(750, 0.08);

      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value;

      // Automatically determine the role linked to this specific email
      const role = getUserRoleByEmail(email);

      // Validate credentials based on role
      const isHR = (role === 'HR') && (password === 'shifat001');
      const isManager = (role === 'MANAGER') && (password === 'manager123' || password.length >= 6);

      const allStaff = getStoredEmployees();
      const matchedEmployee = allStaff.find(emp => emp.email && emp.email.toLowerCase() === email);
      const isEmployee = (role === 'EMPLOYEE') && (
        (password === 'employee123') ||
        (matchedEmployee && password.length >= 6) ||
        (email.endsWith('@company.com') && password.length >= 6) ||
        (email.endsWith('@nexus.com') && password.length >= 6)
      );

      if (isHR) {
        // Role is HR: system will automatically display ONLY the NexusEMS HR Portal
        localStorage.setItem('auth_user_role', 'HR');
        localStorage.setItem('auth_user_name', 'Tanvir');
        localStorage.setItem('auth_user_email', email);
        localStorage.setItem('auth_user_title', 'HR Administrator');
        localStorage.setItem('auth_user_dept', 'Human Resources & Engineering');
        localStorage.setItem('auth_user_avatar', 'T');

        btnSubmit.style.transform = 'scale(0.97)';
        setTimeout(() => (btnSubmit.style.transform = ''), 200);
        sound.playSuccess();
        showToast('✓ Welcome Tanvir! Automatically loading HR Portal...', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else if (isManager) {
        // Role is MANAGER: system will automatically display ONLY the NexusEMS Manager Portal (NO PAYROLL)
        const mgrName = matchedEmployee ? matchedEmployee.name : 'Alex Rivera';
        const mgrRole = matchedEmployee ? matchedEmployee.role : 'Engineering Team Manager';
        const mgrDept = matchedEmployee ? matchedEmployee.dept : 'Engineering';
        const mgrId = matchedEmployee ? matchedEmployee.id : 'EMP-1013';
        const mgrAvatar = 'AR';

        localStorage.setItem('auth_user_role', 'MANAGER');
        localStorage.setItem('auth_user_name', mgrName);
        localStorage.setItem('auth_user_email', email);
        localStorage.setItem('auth_user_title', mgrRole);
        localStorage.setItem('auth_user_dept', mgrDept);
        localStorage.setItem('auth_user_id', mgrId);
        localStorage.setItem('auth_user_avatar', mgrAvatar);

        btnSubmit.style.transform = 'scale(0.97)';
        setTimeout(() => (btnSubmit.style.transform = ''), 200);
        sound.playSuccess();
        showToast(`✓ Welcome ${mgrName}! Automatically loading Manager Portal...`, 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 700);
      } else if (isEmployee) {
        // Role is EMPLOYEE: system will automatically display ONLY the NexusEMS Employee Portal
        const empName = matchedEmployee ? matchedEmployee.name : (email === 'sophia@company.com' ? 'Sophia Clark' : email.split('@')[0].replace('.', ' '));
        const empRole = matchedEmployee ? matchedEmployee.role : 'Lead Frontend Engineer';
        const empDept = matchedEmployee ? matchedEmployee.dept : 'Engineering';
        const empId = matchedEmployee ? matchedEmployee.id : 'EMP-1002';
        const empAvatar = empName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        localStorage.setItem('auth_user_role', 'EMPLOYEE');
        localStorage.setItem('auth_user_name', empName);
        localStorage.setItem('auth_user_email', email);
        localStorage.setItem('auth_user_title', empRole);
        localStorage.setItem('auth_user_dept', empDept);
        localStorage.setItem('auth_user_id', empId);
        localStorage.setItem('auth_user_avatar', empAvatar);
        sessionStorage.removeItem('emp_welcome_dismissed');

        btnSubmit.style.transform = 'scale(0.97)';
        setTimeout(() => (btnSubmit.style.transform = ''), 200);
        sound.playSuccess();
        showToast(`✓ Welcome ${empName}! Automatically loading Employee Portal...`, 'success');

        setTimeout(() => {
          window.location.href = 'employee-dashboard.html';
        }, 700);
      } else {
        // Failed Login
        sound.playPop(260, 0.25);
        const card = document.getElementById('auth-card');
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
        }

        showToast('Invalid company credentials. Please check your email and password.', 'error');
        passwordInput.value = '';
        passwordInput.focus();
      }
    });
  }
}

// ==========================================================================
// 4. Forgot Password Controller (forgot-password.html)
// ==========================================================================
function initForgotPasswordPage() {
  const forgotForm = document.getElementById('forgot-form');
  const forgotEmailInput = document.getElementById('forgot-email-input');
  const otpStepContainer = document.getElementById('otp-step-container');
  const forgotTitle = document.getElementById('forgot-title');
  const forgotSubtitle = document.getElementById('forgot-subtitle');
  const iconKey = document.getElementById('icon-key');
  const iconSent = document.getElementById('icon-sent');
  const btnVerifyOtp = document.getElementById('btn-verify-otp');
  const otpDigits = document.querySelectorAll('.otp-digit');
  const resendCountdown = document.getElementById('resend-countdown');
  const resendTimerText = document.getElementById('resend-timer-text');
  const btnResendCode = document.getElementById('btn-resend-code');

  if (!forgotForm) return;

  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = forgotEmailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      sound.playPop(450);
      showToast('Please enter a valid company email address.', 'info');
      forgotEmailInput.focus();
      return;
    }

    sound.playSuccess();
    showToast(`Verification code sent to ${email}`, 'success');

    forgotForm.classList.add('hidden');
    forgotForm.style.display = 'none';
    otpStepContainer.classList.remove('hidden');

    forgotTitle.textContent = 'Verify Code';
    forgotSubtitle.textContent = `Enter the 4-digit code sent to ${email}`;

    if (iconKey && iconSent) {
      iconKey.classList.remove('active');
      iconSent.classList.add('active');
    }

    if (otpDigits.length > 0) otpDigits[0].focus();
    startResendTimer();
  });

  otpDigits.forEach((digit, idx) => {
    digit.addEventListener('input', (e) => {
      sound.playPop(750, 0.04);
      if (e.target.value.length === 1 && idx < otpDigits.length - 1) {
        otpDigits[idx + 1].focus();
      }
    });

    digit.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !digit.value && idx > 0) {
        otpDigits[idx - 1].focus();
      }
    });
  });

  if (btnVerifyOtp) {
    btnVerifyOtp.addEventListener('click', () => {
      let code = '';
      otpDigits.forEach(d => (code += d.value.trim()));

      if (code.length < 4) {
        sound.playPop(400);
        showToast('Please enter all 4 digits.', 'info');
        return;
      }

      sound.playSuccess();
      showToast('✓ Code verified! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1600);
    });
  }

  let timerInterval = null;
  function startResendTimer() {
    let seconds = 45;
    if (resendCountdown) resendCountdown.textContent = seconds;
    if (resendTimerText) resendTimerText.classList.remove('hidden');
    if (btnResendCode) btnResendCode.classList.add('hidden');

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      seconds--;
      if (resendCountdown) resendCountdown.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(timerInterval);
        if (resendTimerText) resendTimerText.classList.add('hidden');
        if (btnResendCode) btnResendCode.classList.remove('hidden');
      }
    }, 1000);
  }

  if (btnResendCode) {
    btnResendCode.addEventListener('click', () => {
      sound.playPop(650);
      showToast('New code sent to your email!', 'info');
      startResendTimer();
    });
  }
}

// ==========================================================================
// 5. Role-Based EMS Controller (dashboard.html)
// ==========================================================================
function initDashboardPage() {
  // A. Live Clock
  const clockEl = document.getElementById('dash-clock');
  function updateClock() {
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // B. Responsive Sidebar Toggle (Desktop Collapse & Mobile Drawer)
  const sidebar = document.getElementById('sidebar-nav');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  
  let sidebarBackdrop = document.querySelector('.sidebar-backdrop');
  if (!sidebarBackdrop) {
    sidebarBackdrop = document.createElement('div');
    sidebarBackdrop.className = 'sidebar-backdrop';
    document.body.appendChild(sidebarBackdrop);
  }

  function isMobileScreen() {
    return window.innerWidth <= 1024;
  }

  // Restore desktop collapsed state from localStorage
  if (sidebar && !isMobileScreen() && localStorage.getItem('nexus_sidebar_collapsed') === 'true') {
    sidebar.classList.add('collapsed');
    if (sidebarToggle) sidebarToggle.classList.add('active');
  }

  function toggleSidebar() {
    if (!sidebar) return;
    if (sound && sound.playPop) sound.playPop(600);

    if (isMobileScreen()) {
      const isOpen = sidebar.classList.toggle('open');
      if (sidebarToggle) sidebarToggle.classList.toggle('active', isOpen);
      if (sidebarBackdrop) sidebarBackdrop.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    } else {
      const isCollapsed = sidebar.classList.toggle('collapsed');
      if (sidebarToggle) sidebarToggle.classList.toggle('active', isCollapsed);
      localStorage.setItem('nexus_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  }

  function closeMobileSidebar() {
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (sidebarToggle) sidebarToggle.classList.remove('active');
      if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  document.addEventListener('click', (e) => {
    if (isMobileScreen() && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
        closeMobileSidebar();
      }
    }
  });

  window.addEventListener('resize', () => {
    if (!isMobileScreen()) {
      closeMobileSidebar();
      if (localStorage.getItem('nexus_sidebar_collapsed') === 'true') {
        if (sidebar) sidebar.classList.add('collapsed');
        if (sidebarToggle) sidebarToggle.classList.add('active');
      } else {
        if (sidebar) sidebar.classList.remove('collapsed');
        if (sidebarToggle) sidebarToggle.classList.remove('active');
      }
    } else {
      if (sidebar) sidebar.classList.remove('collapsed');
    }
  });

  let authRole = localStorage.getItem('auth_user_role');
  if (!authRole || (authRole !== 'HR' && authRole !== 'EMPLOYEE' && authRole !== 'MANAGER')) {
    window.location.replace('index.html');
    return;
  }

  // Strict Manager Payroll Restriction Guard (No Salary, Payslip, or Payroll Access)
  if (authRole === 'MANAGER' && (window.location.pathname.includes('payroll.html') || window.location.href.includes('payroll.html'))) {
    window.location.replace('dashboard.html');
    return;
  }

  // 2. Strict Automated Role Isolation: HR Portal vs Manager Portal vs Employee Portal
  const viewHrPortal = document.getElementById('view-hr-portal');
  const viewEmployeePortal = document.getElementById('view-employee-portal');
  const viewManagerPortal = document.getElementById('view-manager-portal');
  const hrSidebarMenu = document.getElementById('hr-sidebar-menu');
  const employeeSidebarMenu = document.getElementById('employee-sidebar-menu');
  const managerSidebarMenu = document.getElementById('manager-sidebar-menu');
  const portalRoleBadge = document.getElementById('portal-role-badge');
  const mgrTeamTableBody = document.getElementById('mgr-team-table-body');

  const dashUserName = document.getElementById('dash-user-name');
  const dashUserRole = document.getElementById('dash-user-role');
  const topUserAvatar = document.getElementById('top-user-avatar');
  const dashHeroTitle = document.getElementById('dash-hero-title');
  const empHeroTitle = document.getElementById('emp-hero-title');
  const empHeroSubtitle = document.getElementById('emp-hero-subtitle');
  const mgrHeroTitle = document.getElementById('mgr-hero-title');
  const mgrHeroSubtitle = document.getElementById('mgr-hero-subtitle');
  const sidebarCardLabel = document.getElementById('sidebar-card-label');
  const sidebarPlanLabel = document.getElementById('sidebar-plan-label');
  const searchInput = document.getElementById('employee-search-input');

  function renderManagerTeamTable() {
    if (!mgrTeamTableBody) return;
    mgrTeamTableBody.innerHTML = '';

    // Get engineering team members (strictly operational: NO salary data)
    const teamMembers = employees.filter(e => e.dept === 'Engineering' && e.id !== 'EMP-1013');

    teamMembers.forEach(emp => {
      const appr = calculateEmployeeAppraisal(emp);
      const tr = document.createElement('tr');
      const isLate = emp.attendanceStatus === 'Late Arrival';

      tr.innerHTML = `
        <td>
          <div class="emp-avatar-cell">
            <div class="emp-avatar">${getInitials(emp.name)}</div>
            <div class="emp-info-wrap">
              <span class="emp-name-text">${escapeHtml(emp.name)}</span>
              <span class="emp-email-text">${emp.id} • ${escapeHtml(emp.email)}</span>
            </div>
          </div>
        </td>
        <td><strong>${escapeHtml(emp.role)}</strong></td>
        <td><span class="emp-id-badge">${escapeHtml(emp.mode)}</span></td>
        <td>
          <div>
            <span class="time-badge in-time">${escapeHtml(emp.inTime || '09:00 AM')}</span>
            <span class="status-pill ${isLate ? 'review' : 'completed'}" style="margin-left: 4px;">${escapeHtml(emp.attendanceStatus || 'On Time')}</span>
          </div>
        </td>
        <td>
          <div>
            <strong>${emp.tasksDone !== undefined ? emp.tasksDone : 20} / ${emp.totalTasks || 24} Tasks</strong>
            <div class="appraisal-score-bar" style="width: 80px; margin-top: 4px;">
              <div class="appraisal-score-fill green" style="width: ${Math.round(((emp.tasksDone || 20) / (emp.totalTasks || 24)) * 100)}%;"></div>
            </div>
          </div>
        </td>
        <td>
          <span class="tier-badge ${appr.tierKey}">${appr.perfScore}% • ${appr.tierName}</span>
        </td>
        <td style="text-align: right;">
          <a href="appraisals.html" class="neu-btn dash-action-btn primary" style="padding: 0.35rem 0.75rem; font-size: 0.75rem; text-decoration: none; display: inline-flex;">
            Review
          </a>
        </td>
      `;
      mgrTeamTableBody.appendChild(tr);
    });
  }

  function applyRoleView(role) {
    if (role === 'HR') {
      // HR Login: Automatically display ONLY NexusEMS HR Portal
      document.title = 'NexusEMS HR Portal';

      if (viewHrPortal) {
        viewHrPortal.classList.remove('hidden');
        viewHrPortal.style.display = 'block';
      }
      if (viewEmployeePortal) {
        viewEmployeePortal.classList.add('hidden');
        viewEmployeePortal.style.display = 'none';
      }
      if (viewManagerPortal) {
        viewManagerPortal.classList.add('hidden');
        viewManagerPortal.style.display = 'none';
      }

      if (hrSidebarMenu) {
        hrSidebarMenu.classList.remove('hidden');
        hrSidebarMenu.style.display = 'flex';
      }
      if (employeeSidebarMenu) {
        employeeSidebarMenu.classList.add('hidden');
        employeeSidebarMenu.style.display = 'none';
      }
      if (managerSidebarMenu) {
        managerSidebarMenu.classList.add('hidden');
        managerSidebarMenu.style.display = 'none';
      }

      if (portalRoleBadge) {
        portalRoleBadge.textContent = 'HR PORTAL';
        portalRoleBadge.className = 'ems-badge';
      }

      if (dashUserName) dashUserName.textContent = 'Tanvir';
      if (dashUserRole) dashUserRole.textContent = 'HR Administrator';
      if (topUserAvatar) topUserAvatar.textContent = 'T';
      if (dashHeroTitle) dashHeroTitle.textContent = 'Welcome back, Tanvir 👋';

      if (sidebarCardLabel) sidebarCardLabel.textContent = 'Organization Capacity';
      if (sidebarPlanLabel) sidebarPlanLabel.textContent = 'Nexus Enterprise Active';
      if (searchInput) searchInput.placeholder = 'Search staff directory, departments, or leaves... (/)';
    } else if (role === 'MANAGER') {
      // Manager Login: Automatically display ONLY NexusEMS Manager Portal (NO PAYROLL)
      document.title = 'NexusEMS Manager Portal';

      if (viewHrPortal) {
        if (viewManagerPortal) {
          viewHrPortal.classList.add('hidden');
          viewHrPortal.style.display = 'none';
        } else {
          viewHrPortal.classList.remove('hidden');
          viewHrPortal.style.display = 'block';
        }
      }
      if (viewEmployeePortal) {
        viewEmployeePortal.classList.add('hidden');
        viewEmployeePortal.style.display = 'none';
      }
      if (viewManagerPortal) {
        viewManagerPortal.classList.remove('hidden');
        viewManagerPortal.style.display = 'block';
      }

      if (hrSidebarMenu) {
        hrSidebarMenu.classList.add('hidden');
        hrSidebarMenu.style.display = 'none';
      }
      if (employeeSidebarMenu) {
        employeeSidebarMenu.classList.add('hidden');
        employeeSidebarMenu.style.display = 'none';
      }
      if (managerSidebarMenu) {
        managerSidebarMenu.classList.remove('hidden');
        managerSidebarMenu.style.display = 'flex';
      }

      if (portalRoleBadge) {
        portalRoleBadge.textContent = 'MANAGER PORTAL';
        portalRoleBadge.className = 'ems-badge mgr-badge';
      }

      const mgrName = localStorage.getItem('auth_user_name') || 'Alex Rivera';
      const mgrRole = localStorage.getItem('auth_user_title') || 'Engineering Team Manager';
      const mgrDept = localStorage.getItem('auth_user_dept') || 'Engineering';
      const mgrAvatar = localStorage.getItem('auth_user_avatar') || 'AR';

      if (dashUserName) dashUserName.textContent = mgrName;
      if (dashUserRole) dashUserRole.textContent = mgrRole;
      if (topUserAvatar) topUserAvatar.textContent = mgrAvatar;
      if (mgrHeroTitle) mgrHeroTitle.textContent = `Welcome back, ${mgrName} 👋`;
      if (mgrHeroSubtitle) mgrHeroSubtitle.textContent = `${mgrRole} • ${mgrDept} Unit • Oversight of 5 Direct Reports (Operational Scope Only)`;

      if (sidebarCardLabel) sidebarCardLabel.textContent = 'Team Capacity';
      if (sidebarPlanLabel) sidebarPlanLabel.textContent = 'Engineering Operations';
      if (searchInput) searchInput.placeholder = 'Search team roster, leaves, or reviews... (/)';

      renderManagerTeamTable();
    } else {
      // Employee Login: Automatically display ONLY NexusEMS Employee Portal
      document.title = 'NexusEMS Employee Portal';

      if (viewHrPortal) {
        viewHrPortal.classList.add('hidden');
        viewHrPortal.style.display = 'none';
      }
      if (viewManagerPortal) {
        viewManagerPortal.classList.add('hidden');
        viewManagerPortal.style.display = 'none';
      }
      if (viewEmployeePortal) {
        viewEmployeePortal.classList.remove('hidden');
        viewEmployeePortal.style.display = 'block';
      }

      if (hrSidebarMenu) {
        hrSidebarMenu.classList.add('hidden');
        hrSidebarMenu.style.display = 'none';
      }
      if (managerSidebarMenu) {
        managerSidebarMenu.classList.add('hidden');
        managerSidebarMenu.style.display = 'none';
      }
      if (employeeSidebarMenu) {
        employeeSidebarMenu.classList.remove('hidden');
        employeeSidebarMenu.style.display = 'flex';
      }

      if (portalRoleBadge) {
        portalRoleBadge.textContent = 'EMPLOYEE PORTAL';
        portalRoleBadge.className = 'ems-badge emp-badge';
      }

      let empName = localStorage.getItem('auth_user_name') || 'Sophia Clark';
      let empRole = localStorage.getItem('auth_user_title');
      let empDept = localStorage.getItem('auth_user_dept') || 'Engineering';
      let empId = localStorage.getItem('auth_user_id') || 'EMP-1002';
      let empAvatar = localStorage.getItem('auth_user_avatar');

      // Prevent stale HR Administrator session credentials from showing on Employee Portal
      if (!empRole || empRole === 'HR Administrator' || empRole === 'HR Manager' || empRole.includes('HR')) {
        empRole = 'Lead Frontend Engineer';
        localStorage.setItem('auth_user_title', empRole);
      }
      if (!empAvatar || empAvatar === 'T') {
        empAvatar = 'SC';
        localStorage.setItem('auth_user_avatar', empAvatar);
      }

      if (dashUserName) dashUserName.textContent = empName;
      if (dashUserRole) dashUserRole.textContent = empRole;
      if (topUserAvatar) topUserAvatar.textContent = empAvatar;
      if (empHeroTitle) empHeroTitle.textContent = `Welcome back, ${empName} 👋`;
      if (empHeroSubtitle) empHeroSubtitle.innerHTML = `${empRole} • ${empDept} Unit • Employee ID: <strong>${empId}</strong>`;

      if (sidebarCardLabel) sidebarCardLabel.textContent = 'My Cloud Allowance';
      if (sidebarPlanLabel) sidebarPlanLabel.textContent = 'Employee Self-Service';
      if (searchInput) searchInput.placeholder = 'Search tasks, company policies, or leave... (/)';
    }
  }

  // Apply authenticated role view
  applyRoleView(authRole);

  // Temporary Welcome Greeting Banner on Home Page (auto-dismisses after login)
  const empWelcomeBanner = document.getElementById('emp-welcome-banner');
  const btnCloseWelcome = document.getElementById('btn-close-welcome');

  if (empWelcomeBanner) {
    const isDismissed = sessionStorage.getItem('emp_welcome_dismissed') === 'true';

    const dismissGreeting = () => {
      if (!empWelcomeBanner.classList.contains('dismissed')) {
        empWelcomeBanner.classList.add('dismissed');
        sessionStorage.setItem('emp_welcome_dismissed', 'true');
        setTimeout(() => {
          empWelcomeBanner.style.display = 'none';
        }, 750);
      }
    };

    if (!isDismissed) {
      // Just logged in or initial load: show banner and auto-dismiss after 4 seconds
      empWelcomeBanner.classList.remove('dismissed');
      empWelcomeBanner.style.display = '';

      setTimeout(() => {
        dismissGreeting();
      }, 4000);
    } else {
      // Already dismissed or returning from sub-pages: stay hidden
      empWelcomeBanner.classList.add('dismissed');
      empWelcomeBanner.style.display = 'none';
    }

    if (btnCloseWelcome) {
      btnCloseWelcome.addEventListener('click', dismissGreeting);
    }
  }

  // Global Logout Handlers (Top bar and sidebar)
  function handleLogout(e) {
    if (e) e.preventDefault();
    sound.playPop(550, 0.08);
    showToast('Signed out of NexusEMS. Returning to login...', 'info');
    localStorage.removeItem('auth_user_role');
    localStorage.removeItem('auth_user_name');
    localStorage.removeItem('auth_user_email');
    localStorage.removeItem('auth_user_title');
    localStorage.removeItem('auth_user_avatar');
    localStorage.removeItem('auth_user_dept');
    localStorage.removeItem('auth_user_id');
    sessionStorage.removeItem('emp_welcome_dismissed');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  const btnLogoutTop = document.getElementById('btn-logout-top');
  const btnSidebarLogout = document.getElementById('btn-sidebar-logout');
  if (btnLogoutTop) btnLogoutTop.addEventListener('click', handleLogout);
  if (btnSidebarLogout) btnSidebarLogout.addEventListener('click', handleLogout);

  // ========================================================================
  // HR PORTAL LOGIC (Staff Directory, CRUD, Leaves Review)
  // ========================================================================
  let employees = getStoredEmployees();

  const tableBody = document.getElementById('emp-table-body');
  const deptFilter = document.getElementById('filter-department');
  const statusFilter = document.getElementById('filter-status');
  const countBadge = document.getElementById('filter-result-count');
  const sidebarEmpCount = document.getElementById('sidebar-emp-count');
  const kpiTotalEmp = document.getElementById('kpi-total-emp');
  const kpiTotalStaffVal = document.getElementById('kpi-total-staff-val');

  function saveEmployees() {
    localStorage.setItem('nexus_ems_employees', JSON.stringify(employees));
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  function renderEmployeeTable() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedDept = deptFilter ? deptFilter.value : 'all';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';

    const filtered = employees.filter(emp => {
      const matchQuery = !query || 
        emp.name.toLowerCase().includes(query) || 
        emp.email.toLowerCase().includes(query) || 
        emp.id.toLowerCase().includes(query) || 
        emp.role.toLowerCase().includes(query) || 
        emp.dept.toLowerCase().includes(query);

      const matchDept = (selectedDept === 'all') || (emp.dept === selectedDept);
      const matchStatus = (selectedStatus === 'all') || (emp.status === selectedStatus);

      return matchQuery && matchDept && matchStatus;
    });

    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-subtitle);">No employees match the selected criteria.</td>`;
      tableBody.appendChild(emptyRow);
    } else {
      filtered.forEach(emp => {
        const tr = document.createElement('tr');
        let statusClass = 'active';
        if (emp.status === 'On Leave') statusClass = 'review';
        else if (emp.status === 'Probation') statusClass = 'casual';

        tr.innerHTML = `
          <td>
            <div class="emp-avatar-cell">
              <div class="emp-avatar">${getInitials(emp.name)}</div>
              <div class="emp-info-wrap">
                <span class="emp-name-text">${escapeHtml(emp.name)}</span>
                <span class="emp-email-text">${escapeHtml(emp.email)}</span>
              </div>
            </div>
          </td>
          <td><span class="emp-id-badge">${emp.id}</span></td>
          <td><strong>${escapeHtml(emp.dept)}</strong></td>
          <td>${escapeHtml(emp.role)}</td>
          <td><span class="mode-badge">${escapeHtml(emp.mode)}</span></td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(emp.status)}</span></td>
          <td class="table-actions-cell">
            <button class="neu-circle-btn emp-action-btn delete-emp-btn" data-id="${emp.id}" title="Remove Employee" aria-label="Delete">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </td>
        `;

        tr.querySelector('.delete-emp-btn').addEventListener('click', () => {
          deleteEmployee(emp.id);
        });

        tableBody.appendChild(tr);
      });
    }

    if (countBadge) countBadge.innerHTML = `Showing <strong>${filtered.length}</strong> of ${employees.length} employees`;
    if (sidebarEmpCount) sidebarEmpCount.textContent = employees.length;
    if (kpiTotalEmp && !document.getElementById('donut-total-val')) kpiTotalEmp.textContent = employees.length;
    if (kpiTotalStaffVal) kpiTotalStaffVal.textContent = `${employees.length} Employees`;
    updateDashboardKpis();
  }

  // ------------------------------------------------------------------------
  // DYNAMIC HR EXECUTIVE KPIS (Office Tasks, Teams, Present, Absent)
  // ------------------------------------------------------------------------
  const kpiTaskWorkers = document.getElementById('kpi-task-workers');
  const kpiTaskRate = document.getElementById('kpi-task-rate');
  const kpiTotalTeams = document.getElementById('kpi-total-teams');
  const kpiTeamsList = document.getElementById('kpi-teams-list');
  const kpiPresentCount = document.getElementById('kpi-present-count');
  const kpiAttendancePct = document.getElementById('kpi-attendance-pct');
  const kpiLeaveCount = document.getElementById('kpi-leave-count');
  const kpiLeaveDesc = document.getElementById('kpi-leave-desc');

  function updateDashboardKpis() {
    const totalStaff = employees.length;
    // 1. Employees working on office tasks (Status is Active)
    const activeWorkers = employees.filter(e => e.status === 'Active').length;
    const taskRate = totalStaff > 0 ? Math.round((activeWorkers / totalStaff) * 100) : 0;

    // 2. Total unique teams / departments
    const uniqueTeams = Array.from(new Set(employees.map(e => e.dept))).filter(Boolean);

    // 3. How many have come in today (checked in / arrived)
    const presentStaff = employees.filter(e => e.attendanceStatus === 'On Time' || e.attendanceStatus === 'Late Arrival' || e.inTime).length;
    const presentRate = totalStaff > 0 ? Math.round((presentStaff / totalStaff) * 100) : 0;

    // 4. How many are absent / on leave
    const absentStaff = employees.filter(e => e.status === 'On Leave' || (!e.inTime && e.status !== 'Active')).length;

    if (kpiTaskWorkers) kpiTaskWorkers.textContent = `${activeWorkers} Staff`;
    if (kpiTaskRate) kpiTaskRate.textContent = `${taskRate}%`;

    if (kpiTotalTeams) kpiTotalTeams.textContent = `${uniqueTeams.length} Teams`;
    if (kpiTeamsList) kpiTeamsList.textContent = uniqueTeams.join(', ');

    if (kpiPresentCount && !document.getElementById('donut-total-val')) kpiPresentCount.textContent = `${presentStaff} Present`;
    if (kpiAttendancePct) kpiAttendancePct.textContent = `${presentRate}%`;

    if (kpiLeaveCount && !document.getElementById('donut-total-val')) kpiLeaveCount.textContent = `${absentStaff} Absent`;
    if (kpiLeaveDesc) kpiLeaveDesc.textContent = `${absentStaff} Approved Leave • 0 Unexcused`;

    if (sidebarEmpCount) sidebarEmpCount.textContent = totalStaff;
  }

  function deleteEmployee(empId) {
    const target = employees.find(e => e.id === empId);
    if (!target) return;

    if (confirm(`Remove ${target.name} (${target.id}) from the company directory?`)) {
      employees = employees.filter(e => e.id !== empId);
      saveEmployees();
      sound.playPop(400, 0.1);
      renderEmployeeTable();
      renderHrAttendanceTable();
      renderHrAppraisalTable();
      renderHrPayrollTable();
      updateDashboardKpis();
      showToast(`Removed ${target.name} from directory`, 'info');
    }
  }

  if (searchInput) searchInput.addEventListener('input', renderEmployeeTable);
  if (deptFilter) deptFilter.addEventListener('change', renderEmployeeTable);
  if (statusFilter) statusFilter.addEventListener('change', renderEmployeeTable);

  renderEmployeeTable();
  updateDashboardKpis();

  // Add Employee Modal
  const empModal = document.getElementById('modal-add-employee');
  const btnOpenModal = document.getElementById('btn-open-add-emp-modal');
  const btnQuickAdd = document.getElementById('btn-quick-add');
  const btnCloseModal = document.getElementById('btn-close-emp-modal');
  const btnCancelModal = document.getElementById('btn-cancel-emp');
  const formAddEmp = document.getElementById('form-add-employee');

  if (btnOpenModal) btnOpenModal.addEventListener('click', () => empModal && empModal.showModal());
  if (btnQuickAdd) btnQuickAdd.addEventListener('click', () => empModal && empModal.showModal());
  if (btnCloseModal) btnCloseModal.addEventListener('click', () => empModal && empModal.close());
  if (btnCancelModal) btnCancelModal.addEventListener('click', () => empModal && empModal.close());

  if (formAddEmp) {
    formAddEmp.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('emp-name').value.trim();
      const email = document.getElementById('emp-email').value.trim();
      const dept = document.getElementById('emp-dept').value;
      const role = document.getElementById('emp-role').value.trim();
      const mode = document.getElementById('emp-mode').value;
      const status = document.getElementById('emp-status').value;

      if (!name || !email || !role) {
        showToast('Please fill all required fields.', 'info');
        return;
      }

      const nextNum = 1000 + employees.length + 1;
      const newEmp = { 
        id: `EMP-${nextNum}`, 
        name, 
        email, 
        dept, 
        role, 
        mode, 
        status,
        baseSalary: 7500,
        inTime: '09:00 AM',
        outTime: '05:30 PM',
        shiftDuration: '8h 30m',
        overtime: '+30m OT',
        monthlyHours: 160.0,
        targetHours: 160,
        tasksDone: 20,
        totalTasks: 20,
        punctualityScore: 92,
        attendanceStatus: 'On Time',
        attendanceHistory: [
          { date: 'Today (Oct 14)', inTime: '09:00 AM', outTime: '05:30 PM', duration: '8h 30m', overtime: '+30m OT', status: 'On Time' }
        ]
      };

      employees.unshift(newEmp);
      saveEmployees();
      formAddEmp.reset();
      if (empModal) empModal.close();

      sound.playSuccess();
      renderEmployeeTable();
      renderHrAttendanceTable();
      renderHrAppraisalTable();
      renderHrPayrollTable();
      updateDashboardKpis();
      showToast(`✓ Added ${name} (${newEmp.id}) to company staff!`, 'success');
    });
  }

  // HR Leave Requests Approval
  let pendingLeaves = 3;
  const pendingBadge = document.getElementById('pending-leave-badge');
  const sidebarLeaves = document.getElementById('sidebar-pending-leaves');
  const kpiPendingLeavesVal = document.getElementById('kpi-pending-leaves-val');
  const leaveList = document.getElementById('leave-requests-list');

  if (leaveList) {
    leaveList.addEventListener('click', (e) => {
      const approveBtn = e.target.closest('.approve-btn');
      const rejectBtn = e.target.closest('.reject-btn');

      if (approveBtn) {
        sound.playSuccess();
        approveBtn.parentElement.innerHTML = `<span class="status-pill completed">Approved ✓</span>`;
        if (pendingLeaves > 0) pendingLeaves--;
        if (pendingBadge) pendingBadge.textContent = `${pendingLeaves} Pending`;
        if (sidebarLeaves) sidebarLeaves.textContent = pendingLeaves;
        if (kpiPendingLeavesVal) kpiPendingLeavesVal.textContent = `${pendingLeaves} Requests`;
        showToast('Leave request approved', 'success');
      } else if (rejectBtn) {
        sound.playPop(350, 0.1);
        rejectBtn.parentElement.innerHTML = `<span class="status-pill review" style="color: #f43f5e; background: rgba(244,63,94,0.12);">Declined ✕</span>`;
        if (pendingLeaves > 0) pendingLeaves--;
        if (pendingBadge) pendingBadge.textContent = `${pendingLeaves} Pending`;
        if (sidebarLeaves) sidebarLeaves.textContent = pendingLeaves;
        if (kpiPendingLeavesVal) kpiPendingLeavesVal.textContent = `${pendingLeaves} Requests`;
        showToast('Leave request declined', 'info');
      }
    });
  }

  // Manager Pending Leaves Quick Actions (Dashboard)
  const mgrPendingLeavesList = document.getElementById('mgr-pending-leaves-list');
  const mgrKpiPendingLeaves = document.getElementById('mgr-kpi-pending-leaves');
  let mgrPendingLeavesCount = 2;

  if (mgrPendingLeavesList) {
    mgrPendingLeavesList.addEventListener('click', (e) => {
      const approveBtn = e.target.closest('.btn-mgr-approve-leave');
      const rejectBtn = e.target.closest('.btn-mgr-reject-leave');
      if (approveBtn) {
        sound.playSuccess();
        const empName = approveBtn.getAttribute('data-name') || 'Team Member';
        const actionsDiv = approveBtn.parentElement;
        actionsDiv.innerHTML = `<span class="status-pill completed" style="width: 100%; text-align: center; padding: 0.35rem 0.5rem;">Approved by Manager ✓</span>`;
        if (mgrPendingLeavesCount > 0) mgrPendingLeavesCount--;
        if (mgrKpiPendingLeaves) mgrKpiPendingLeaves.textContent = `${mgrPendingLeavesCount} Requests`;
        showToast(`✓ Leave request for ${empName} approved!`, 'success');
      } else if (rejectBtn) {
        sound.playPop(350, 0.1);
        const empName = rejectBtn.getAttribute('data-name') || 'Team Member';
        const actionsDiv = rejectBtn.parentElement;
        actionsDiv.innerHTML = `<span class="status-pill review" style="width: 100%; text-align: center; padding: 0.35rem 0.5rem; color: #f43f5e; background: rgba(244,63,94,0.12);">Rejected ✕</span>`;
        if (mgrPendingLeavesCount > 0) mgrPendingLeavesCount--;
        if (mgrKpiPendingLeaves) mgrKpiPendingLeaves.textContent = `${mgrPendingLeavesCount} Requests`;
        showToast(`Leave request for ${empName} rejected.`, 'info');
      }
    });
  }

  // Export CSV (Staff Directory)
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', () => {
      sound.playSuccess();
      let csvRows = [];
      csvRows.push(['SL', 'Employee ID', 'Full Name', 'Work Email', 'Department', 'Designation', 'Work Arrangement', 'Base Monthly Salary ($)', 'Employment Status'].map(h => `"${h}"`).join(','));
      
      employees.forEach((emp, idx) => {
        const row = [
          idx + 1,
          emp.id,
          emp.name,
          emp.email,
          emp.dept,
          emp.role,
          emp.mode,
          (emp.baseSalary || 7500).toFixed(2),
          emp.status
        ];
        csvRows.push(row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
      });

      const csvContent = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nexus_employee_directory_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ Exported clean employee directory to CSV!', 'success');
    });
  }

  // ------------------------------------------------------------------------
  // HR ATTENDANCE & IN/OUT TIME LEDGER TABLE
  // ------------------------------------------------------------------------
  const hrAttendanceTableBody = document.getElementById('hr-attendance-table-body');
  const hrStatCheckedin = document.getElementById('hr-stat-checkedin');

  function renderHrAttendanceTable() {
    if (!hrAttendanceTableBody) return;
    hrAttendanceTableBody.innerHTML = '';

    const displayEmployees = (authRole === 'MANAGER')
      ? employees.filter(e => e.dept === (localStorage.getItem('auth_user_dept') || 'Engineering'))
      : employees;

    if (hrStatCheckedin) {
      hrStatCheckedin.textContent = `${displayEmployees.length} Staff`;
    }

    displayEmployees.forEach(emp => {
      const tr = document.createElement('tr');
      const isLate = emp.attendanceStatus === 'Late Arrival';
      const isDeficit = emp.overtime && emp.overtime.includes('Deficit');

      tr.innerHTML = `
        <td>
          <div class="emp-avatar-cell">
            <div class="emp-avatar">${getInitials(emp.name)}</div>
            <div class="emp-info-wrap">
              <span class="emp-name-text">${escapeHtml(emp.name)}</span>
              <span class="emp-email-text">${escapeHtml(emp.role)}</span>
            </div>
          </div>
        </td>
        <td><span class="emp-id-badge">Today (Oct 14)</span></td>
        <td><span class="time-badge in-time">${escapeHtml(emp.inTime || '09:00 AM')}</span></td>
        <td><span class="time-badge out-time">${escapeHtml(emp.outTime || '05:30 PM')}</span></td>
        <td><span class="time-badge duration-time">${escapeHtml(emp.shiftDuration || '8h 30m')}</span></td>
        <td><span class="time-badge overtime ${isDeficit ? 'tier-d' : ''}">${escapeHtml(emp.overtime || 'Standard')}</span></td>
        <td><span class="status-pill ${isLate ? 'review' : 'completed'}">${escapeHtml(emp.attendanceStatus || 'On Time')}</span></td>
      `;
      hrAttendanceTableBody.appendChild(tr);
    });
  }

  // ------------------------------------------------------------------------
  // HR PERFORMANCE-BASED BONUS & SALARY INCREMENT APPRAISAL BOARD
  // ------------------------------------------------------------------------
  const hrAppraisalTableBody = document.getElementById('hr-appraisal-table-body');
  const modalAppraise = document.getElementById('modal-appraisal-adjust');
  const formAdjustAppraisal = document.getElementById('form-adjust-appraisal');
  const btnCloseAppraiseModal = document.getElementById('btn-close-appraise-modal');
  const btnCancelAppraise = document.getElementById('btn-cancel-appraise');

  const inputAppraiseEmpId = document.getElementById('appraise-emp-id');
  const inputAppraiseEmpName = document.getElementById('appraise-emp-name');
  const inputAppraiseBaseSalary = document.getElementById('appraise-base-salary');
  const inputAppraiseBonusVal = document.getElementById('appraise-bonus-val');
  const inputAppraiseIncPercent = document.getElementById('appraise-inc-percent');
  const inputAppraiseRemarks = document.getElementById('appraise-remarks');

  function renderHrAppraisalTable() {
    if (!hrAppraisalTableBody) return;
    hrAppraisalTableBody.innerHTML = '';

    const isManagerRole = (authRole === 'MANAGER');

    // Adapt table header if manager is logged in (NO SALARY/NO BONUS COLUMNS)
    const tableEl = hrAppraisalTableBody.closest('table');
    if (tableEl) {
      const thead = tableEl.querySelector('thead');
      if (thead) {
        if (isManagerRole) {
          thead.innerHTML = `
            <tr>
              <th>Team Member</th>
              <th>Department</th>
              <th>Hours Logged (Target 160h)</th>
              <th>Sprint Tasks Output</th>
              <th>Performance Score</th>
              <th>Punctuality Rating</th>
              <th class="text-right">Action</th>
            </tr>
          `;
        } else {
          thead.innerHTML = `
            <tr>
              <th>Employee</th>
              <th>Base Monthly</th>
              <th>Hours Logged (Target 160h)</th>
              <th>Sprint Tasks Output</th>
              <th>Performance Score</th>
              <th>Earned Bonus ($)</th>
              <th>Recommended Increment (%)</th>
              <th class="text-right">Action</th>
            </tr>
          `;
        }
      }
    }

    const displayAppraiseEmployees = (authRole === 'MANAGER')
      ? employees.filter(e => e.dept === (localStorage.getItem('auth_user_dept') || 'Engineering'))
      : employees;

    displayAppraiseEmployees.forEach(emp => {
      const appr = calculateEmployeeAppraisal(emp);
      const tr = document.createElement('tr');

      if (isManagerRole) {
        // Manager Operational Review View: Strictly NO Base Salary, NO Bonus $, NO Increment %
        tr.innerHTML = `
          <td>
            <div class="emp-avatar-cell">
              <div class="emp-avatar">${getInitials(emp.name)}</div>
              <div class="emp-info-wrap">
                <span class="emp-name-text">${escapeHtml(emp.name)}</span>
                <span class="emp-email-text">${emp.id} • ${escapeHtml(emp.role)}</span>
              </div>
            </div>
          </td>
          <td><span class="emp-id-badge">${escapeHtml(emp.dept)}</span></td>
          <td>
            <div>
              <strong>${emp.monthlyHours || 160}h / 160h</strong>
              <div class="appraisal-score-bar" style="width: 100px; margin-top: 4px;">
                <div class="appraisal-score-fill ${appr.tierKey === 'tier-a' ? 'green' : (appr.tierKey === 'tier-b' ? 'blue' : (appr.tierKey === 'tier-c' ? 'amber' : 'red'))}" style="width: ${Math.min(100, Math.round(appr.hoursRatio * 100))}%;"></div>
              </div>
            </div>
          </td>
          <td>
            <div>
              <strong>${emp.tasksDone !== undefined ? emp.tasksDone : 20} / ${emp.totalTasks || 20} Tasks</strong>
              <span style="font-size: 0.75rem; color: var(--text-subtitle); display: block;">${appr.taskScore}% Output Rate</span>
            </div>
          </td>
          <td>
            <span class="tier-badge ${appr.tierKey}">${appr.perfScore}% • ${appr.tierName}</span>
          </td>
          <td>
            <span class="time-badge in-time">${appr.punctualityScore}% On Time</span>
          </td>
          <td style="text-align: right;">
            <button type="button" class="neu-btn dash-action-btn primary btn-open-appraise-modal" data-id="${emp.id}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; white-space: nowrap;">
              Review & Feedback
            </button>
          </td>
        `;
      } else {
        // HR View with compensation data
        tr.innerHTML = `
          <td>
            <div class="emp-avatar-cell">
              <div class="emp-avatar">${getInitials(emp.name)}</div>
              <div class="emp-info-wrap">
                <span class="emp-name-text">${escapeHtml(emp.name)}</span>
                <span class="emp-email-text">${escapeHtml(emp.role)}</span>
              </div>
            </div>
          </td>
          <td><strong>$${appr.baseSalary.toLocaleString()}</strong></td>
          <td>
            <div>
              <strong>${emp.monthlyHours || 160}h / 160h</strong>
              <div class="appraisal-score-bar" style="width: 100px; margin-top: 4px;">
                <div class="appraisal-score-fill ${appr.tierKey === 'tier-a' ? 'green' : (appr.tierKey === 'tier-b' ? 'blue' : (appr.tierKey === 'tier-c' ? 'amber' : 'red'))}" style="width: ${Math.min(100, Math.round(appr.hoursRatio * 100))}%;"></div>
              </div>
            </div>
          </td>
          <td>
            <div>
              <strong>${emp.tasksDone !== undefined ? emp.tasksDone : 20} / ${emp.totalTasks || 20} Tasks</strong>
              <span style="font-size: 0.75rem; color: var(--text-subtitle); display: block;">${appr.taskScore}% Output Rate</span>
            </div>
          </td>
          <td>
            <span class="tier-badge ${appr.tierKey}">${appr.perfScore}% • ${appr.tierName}</span>
          </td>
          <td>
            <div>
              <strong style="color: #10b981; font-size: 0.95rem;">+$${appr.bonusAmount.toLocaleString()}</strong>
              <span style="display:block; font-size: 0.72rem; color: var(--text-subtitle);">${appr.bonusPercent}% of Base</span>
            </div>
          </td>
          <td>
            <div>
              <strong style="color: #8b5cf6; font-size: 0.95rem;">+${appr.incPercent}%</strong>
              <span style="display:block; font-size: 0.72rem; color: var(--text-subtitle);">+$${appr.incAmount.toLocaleString()}/mo raise</span>
            </div>
          </td>
          <td style="text-align: right;">
            <button type="button" class="neu-btn dash-action-btn primary btn-open-appraise-modal" data-id="${emp.id}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem; white-space: nowrap;">
              Adjust / Award
            </button>
          </td>
        `;
      }

      tr.querySelector('.btn-open-appraise-modal').addEventListener('click', () => {
        sound.playPop(700);
        openAppraisalModal(emp.id);
      });

      hrAppraisalTableBody.appendChild(tr);
    });
  }

  function openAppraisalModal(empId) {
    const emp = employees.find(e => e.id === empId);
    if (!emp || !modalAppraise) return;
    const appr = calculateEmployeeAppraisal(emp);
    const isManagerRole = (authRole === 'MANAGER');

    if (inputAppraiseEmpId) inputAppraiseEmpId.value = emp.id;
    if (inputAppraiseEmpName) inputAppraiseEmpName.value = `${emp.name} (${emp.id} - ${emp.role})`;
    
    // Hide financial inputs for Manager
    if (inputAppraiseBaseSalary) {
      inputAppraiseBaseSalary.value = appr.baseSalary;
      const salaryGroup = inputAppraiseBaseSalary.closest('.form-field');
      if (salaryGroup) salaryGroup.style.display = isManagerRole ? 'none' : 'block';
    }
    if (inputAppraiseBonusVal) {
      inputAppraiseBonusVal.value = appr.bonusAmount;
      const bonusGroup = inputAppraiseBonusVal.closest('.form-field');
      if (bonusGroup) bonusGroup.style.display = isManagerRole ? 'none' : 'block';
    }
    if (inputAppraiseIncPercent) {
      inputAppraiseIncPercent.value = appr.incPercent;
      const incGroup = inputAppraiseIncPercent.closest('.form-field');
      if (incGroup) incGroup.style.display = isManagerRole ? 'none' : 'block';
    }

    if (inputAppraiseRemarks) {
      inputAppraiseRemarks.value = emp.appraisalRemarks || (isManagerRole 
        ? `Quarterly evaluation: Employee demonstrated ${appr.tierName} performance (${appr.perfScore}% output rate) across ${emp.monthlyHours || 160} logged hours.`
        : `Awarded ${appr.tierName} performance bonus (${appr.bonusPercent}%) and salary increment (+${appr.incPercent}%) based on ${emp.monthlyHours || 160} hours logged.`);
    }

    modalAppraise.showModal();
  }

  if (btnCloseAppraiseModal) {
    btnCloseAppraiseModal.addEventListener('click', () => modalAppraise && modalAppraise.close());
  }
  if (btnCancelAppraise) {
    btnCancelAppraise.addEventListener('click', () => modalAppraise && modalAppraise.close());
  }

  if (formAdjustAppraisal) {
    formAdjustAppraisal.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = inputAppraiseEmpId.value;
      const targetEmp = employees.find(e => e.id === empId);
      if (!targetEmp) return;

      const newBonus = parseInt(inputAppraiseBonusVal.value, 10);
      const newInc = parseInt(inputAppraiseIncPercent.value, 10);
      const remarks = inputAppraiseRemarks.value.trim();

      targetEmp.customBonus = isNaN(newBonus) ? 0 : newBonus;
      targetEmp.customIncrement = isNaN(newInc) ? 0 : newInc;
      targetEmp.appraisalRemarks = remarks;

      saveEmployees();
      if (modalAppraise) modalAppraise.close();

      sound.playSuccess();
      renderHrAppraisalTable();
      renderHrAttendanceTable();
      renderHrPayrollTable();
      showToast(`✓ Appraisal compensation successfully awarded for ${targetEmp.name}!`, 'success');
    });
  }

  renderHrAttendanceTable();
  renderHrAppraisalTable();

  // ------------------------------------------------------------------------
  // HR PAYROLL, STATUTORY DEDUCTIONS & DISBURSEMENT ENGINE (payroll.html)
  // ------------------------------------------------------------------------
  // Strict Manager Security Guard: Managers have NO ACCESS to payroll or employee salaries!
  if (authRole === 'MANAGER' && (document.getElementById('payroll-table-body') || window.location.pathname.includes('payroll.html'))) {
    showToast('⚠️ Access Restricted: Manager role does not have Payroll & Salary clearance.', 'info');
    setTimeout(() => {
      window.location.replace('dashboard.html');
    }, 300);
    return;
  }

  const hrPayrollTableBody = document.getElementById('payroll-table-body');
  const payrollCycleSelect = document.getElementById('payroll-cycle-select');
  const filterPayrollDept = document.getElementById('filter-payroll-dept');
  const filterPayrollStatus = document.getElementById('filter-payroll-status');
  const payrollResultCount = document.getElementById('payroll-result-count');

  // Payroll KPIs
  const kpiTotalPayrollVal = document.getElementById('kpi-total-payroll-val');
  const kpiTotalPayrollDesc = document.getElementById('kpi-total-payroll-desc');
  const kpiDisbursedVal = document.getElementById('kpi-disbursed-val');
  const kpiDisbursedRate = document.getElementById('kpi-disbursed-rate');
  const kpiBonusesOtVal = document.getElementById('kpi-bonuses-ot-val');
  const kpiDeductionsVal = document.getElementById('kpi-deductions-val');

  // Modals
  const modalPayslipView = document.getElementById('modal-payslip-view');
  const modalPayrollAdjust = document.getElementById('modal-payroll-adjust');
  const formAdjustPayroll = document.getElementById('form-adjust-payroll');

  function numberToWords(amount) {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    function num999(n) {
      let str = '';
      if (n >= 100) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str.trim();
    }

    const dollars = Math.floor(amount);
    const cents = Math.round((amount - dollars) * 100);

    if (dollars === 0) return 'Zero USD Only';

    let words = '';
    const thousands = Math.floor(dollars / 1000);
    const remainder = dollars % 1000;

    if (thousands > 0) {
      words += num999(thousands) + ' Thousand ';
    }
    if (remainder > 0) {
      words += num999(remainder) + ' ';
    }

    words += 'USD';
    if (cents > 0) {
      words += ' and ' + num999(cents) + ' Cents';
    }
    words += ' Only';
    return words.trim();
  }

  function calculatePayrollForEmployee(emp, payCycle = 'October 2026') {
    const baseSalary = typeof emp.baseSalary === 'number' ? emp.baseSalary : 7500;
    const appr = calculateEmployeeAppraisal(emp);
    
    const bonusAmount = typeof emp.customBonus === 'number' ? emp.customBonus : appr.bonusAmount;
    
    // Calculate OT pay from logged shift hours or appraisal hours
    const monthlyHours = typeof emp.monthlyHours === 'number' ? emp.monthlyHours : 160;
    const otHours = Math.max(0, Math.round((monthlyHours - 160) * 10) / 10);
    const otHourlyRate = Math.round((baseSalary / 160) * 1.5);
    const overtimePay = typeof emp.customOvertimePay === 'number' ? emp.customOvertimePay : Math.round(otHours * otHourlyRate);
    
    // Allowances
    const hraAllowance = typeof emp.customHra === 'number' ? emp.customHra : Math.round(baseSalary * 0.15);
    const medicalAllowance = typeof emp.customMedical === 'number' ? emp.customMedical : 250;
    const totalAllowances = hraAllowance + medicalAllowance;
    
    // Gross earnings
    const grossEarnings = baseSalary + bonusAmount + overtimePay + totalAllowances;
    
    // Statutory deductions
    const taxPct = typeof emp.taxPct === 'number' ? emp.taxPct : 10;
    const taxDeduction = Math.round(grossEarnings * (taxPct / 100));
    const pfDeduction = Math.round(baseSalary * 0.05); // 5% PF
    const insuranceDeduction = 85; // $85 health insurance
    const totalDeductions = taxDeduction + pfDeduction + insuranceDeduction;
    
    // Net Take-Home
    const netPay = grossEarnings - totalDeductions;
    
    // Payment status default logic
    const paymentStatus = emp.payrollStatus || (emp.status === 'On Leave' ? 'Pending' : (emp.status === 'Probation' ? 'Processed' : 'Paid'));
    
    return {
      baseSalary,
      bonusAmount,
      bonusPercent: appr.bonusPercent,
      tierName: appr.tierName,
      tierKey: appr.tierKey,
      otHours,
      overtimePay,
      hraAllowance,
      medicalAllowance,
      totalAllowances,
      grossEarnings,
      taxPct,
      taxDeduction,
      pfDeduction,
      insuranceDeduction,
      totalDeductions,
      netPay,
      paymentStatus,
      payCycle
    };
  }

  function renderHrPayrollTable() {
    if (!hrPayrollTableBody) return;
    hrPayrollTableBody.innerHTML = '';

    const activeCycle = payrollCycleSelect ? payrollCycleSelect.value : 'Oct 2026';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedDept = filterPayrollDept ? filterPayrollDept.value : 'all';
    const selectedStatus = filterPayrollStatus ? filterPayrollStatus.value : 'all';

    let totalPayrollGross = 0;
    let totalDisbursedNet = 0;
    let totalBonusesAndOt = 0;
    let totalDeductionsSum = 0;
    let paidCount = 0;

    // Filter employees
    const filtered = employees.filter(emp => {
      const matchQuery = !query || 
        emp.name.toLowerCase().includes(query) || 
        emp.id.toLowerCase().includes(query) || 
        emp.dept.toLowerCase().includes(query) ||
        emp.role.toLowerCase().includes(query);

      const matchDept = (selectedDept === 'all') || (emp.dept === selectedDept);
      
      const pay = calculatePayrollForEmployee(emp, activeCycle);
      const matchStatus = (selectedStatus === 'all') || (pay.paymentStatus === selectedStatus);

      return matchQuery && matchDept && matchStatus;
    });

    // Compute aggregate KPIs for all staff
    employees.forEach(emp => {
      const pay = calculatePayrollForEmployee(emp, activeCycle);
      totalPayrollGross += pay.grossEarnings;
      totalBonusesAndOt += (pay.bonusAmount + pay.overtimePay);
      totalDeductionsSum += pay.totalDeductions;
      if (pay.paymentStatus === 'Paid') {
        totalDisbursedNet += pay.netPay;
        paidCount++;
      }
    });

    // Update KPI UI
    if (kpiTotalPayrollVal) kpiTotalPayrollVal.textContent = `$${totalPayrollGross.toLocaleString()}`;
    if (kpiTotalPayrollDesc) kpiTotalPayrollDesc.textContent = `${employees.length} Staff on ${activeCycle}`;
    if (kpiDisbursedVal) kpiDisbursedVal.textContent = `$${totalDisbursedNet.toLocaleString()}`;
    const disburseRatePct = employees.length > 0 ? Math.round((paidCount / employees.length) * 100) : 0;
    if (kpiDisbursedRate) kpiDisbursedRate.textContent = `${disburseRatePct}%`;
    if (kpiBonusesOtVal) kpiBonusesOtVal.textContent = `+$${totalBonusesAndOt.toLocaleString()}`;
    if (kpiDeductionsVal) kpiDeductionsVal.textContent = `-$${totalDeductionsSum.toLocaleString()}`;

    if (payrollResultCount) {
      payrollResultCount.textContent = `Showing ${filtered.length} of ${employees.length} records`;
    }

    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `<td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-subtitle);">No payroll records found for the selected criteria.</td>`;
      hrPayrollTableBody.appendChild(emptyRow);
      return;
    }

    filtered.forEach(emp => {
      const pay = calculatePayrollForEmployee(emp, activeCycle);
      const tr = document.createElement('tr');

      let statusPillClass = 'paid';
      if (pay.paymentStatus === 'Processed') statusPillClass = 'processed';
      else if (pay.paymentStatus === 'Pending') statusPillClass = 'pending';

      tr.innerHTML = `
        <td>
          <div class="emp-avatar-cell">
            <div class="emp-avatar">${getInitials(emp.name)}</div>
            <div class="emp-info-wrap">
              <span class="emp-name-text">${escapeHtml(emp.name)}</span>
              <span class="emp-email-text">${emp.id} • ${escapeHtml(emp.dept)}</span>
            </div>
          </div>
        </td>
        <td><strong>$${pay.baseSalary.toLocaleString()}</strong></td>
        <td>
          <div>
            <strong class="pay-positive">+$${(pay.bonusAmount + pay.overtimePay).toLocaleString()}</strong>
            <span style="display:block; font-size: 0.72rem; color: var(--text-subtitle);">
              Bonus: $${pay.bonusAmount.toLocaleString()} • OT: $${pay.overtimePay.toLocaleString()}
            </span>
          </div>
        </td>
        <td>
          <div>
            <strong>$${pay.totalAllowances.toLocaleString()}</strong>
            <span style="display:block; font-size: 0.72rem; color: var(--text-subtitle);">
              HRA: $${pay.hraAllowance.toLocaleString()} • Med: $${pay.medicalAllowance.toLocaleString()}
            </span>
          </div>
        </td>
        <td>
          <div>
            <strong class="pay-deduct">-$${pay.totalDeductions.toLocaleString()}</strong>
            <span style="display:block; font-size: 0.72rem; color: var(--text-subtitle);">
              Tax: $${pay.taxDeduction.toLocaleString()} • PF: $${pay.pfDeduction.toLocaleString()}
            </span>
          </div>
        </td>
        <td>
          <span class="pay-net">$${pay.netPay.toLocaleString()}</span>
        </td>
        <td>
          <span class="status-pill ${statusPillClass}">${pay.paymentStatus}</span>
        </td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="neu-btn dash-action-btn primary btn-view-payslip" data-id="${emp.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" title="View & Print Official Payslip">
            Payslip
          </button>
          <button type="button" class="neu-btn dash-action-btn secondary btn-adjust-payroll" data-id="${emp.id}" style="padding: 0.35rem 0.65rem; font-size: 0.75rem;" title="Adjust Base Salary, Allowances or Deductions">
            Adjust
          </button>
          <button type="button" class="neu-circle-btn action-circle-btn btn-toggle-payment" data-id="${emp.id}" style="display: inline-flex; width: 30px; height: 30px; vertical-align: middle;" title="Toggle Payment Status (Paid / Processed / Pending)">
            ${pay.paymentStatus === 'Paid' ? '✓' : '⇄'}
          </button>
        </td>
      `;

      // Event Listeners for Row Actions
      tr.querySelector('.btn-view-payslip').addEventListener('click', () => {
        sound.playPop(700);
        openPayslipModal(emp.id, activeCycle);
      });

      tr.querySelector('.btn-adjust-payroll').addEventListener('click', () => {
        sound.playPop(650);
        openPayrollAdjustModal(emp.id);
      });

      tr.querySelector('.btn-toggle-payment').addEventListener('click', () => {
        sound.playPop(800, 0.05);
        const nextStatusMap = { 'Pending': 'Processed', 'Processed': 'Paid', 'Paid': 'Pending' };
        emp.payrollStatus = nextStatusMap[pay.paymentStatus] || 'Paid';
        saveEmployees();
        renderHrPayrollTable();
        showToast(`Updated payment status for ${emp.name} to ${emp.payrollStatus}`, 'info');
      });

      hrPayrollTableBody.appendChild(tr);
    });
  }

  // Payslip Modal Generator
  function openPayslipModal(empId, payCycle = 'October 2026') {
    const emp = employees.find(e => e.id === empId);
    if (!emp || !modalPayslipView) return;

    const pay = calculatePayrollForEmployee(emp, payCycle);

    // Populate Payslip Metadata
    const slipMonthBadge = document.getElementById('slip-month-badge');
    const slipSerialNo = document.getElementById('slip-serial-no');
    const slipEmpName = document.getElementById('slip-emp-name');
    const slipEmpId = document.getElementById('slip-emp-id');
    const slipEmpDept = document.getElementById('slip-emp-dept');
    const slipEmpRole = document.getElementById('slip-emp-role');
    const slipEmpPeriod = document.getElementById('slip-emp-period');
    const slipEmpBank = document.getElementById('slip-emp-bank');
    const slipEmpTaxid = document.getElementById('slip-emp-taxid');

    const cleanCycle = payCycle.replace('Pay Cycle:', '').trim();
    if (slipMonthBadge) slipMonthBadge.textContent = cleanCycle.toUpperCase();
    if (slipSerialNo) slipSerialNo.textContent = `Slip No: NX-PAY-${cleanCycle.replace(' ', '')}-${emp.id.replace('EMP-', '')}`;
    if (slipEmpName) slipEmpName.textContent = emp.name;
    if (slipEmpId) slipEmpId.textContent = emp.id;
    if (slipEmpDept) slipEmpDept.textContent = emp.dept;
    if (slipEmpRole) slipEmpRole.textContent = emp.role;
    if (slipEmpPeriod) slipEmpPeriod.textContent = `01 ${cleanCycle} - End of Month`;
    if (slipEmpBank) slipEmpBank.textContent = `Direct Wire •••• ${9000 + parseInt(emp.id.replace(/\D/g, '') || 1000, 10)}`;
    if (slipEmpTaxid) slipEmpTaxid.textContent = `NX-TAX-${emp.id.replace('EMP-', '')}A`;

    // Populate Earnings
    const slipEarnBase = document.getElementById('slip-earn-base');
    const slipEarnHra = document.getElementById('slip-earn-hra');
    const slipEarnMed = document.getElementById('slip-earn-med');
    const slipEarnBonus = document.getElementById('slip-earn-bonus');
    const slipEarnOt = document.getElementById('slip-earn-ot');
    const slipGrossTotal = document.getElementById('slip-gross-total');

    if (slipEarnBase) slipEarnBase.textContent = `$${pay.baseSalary.toLocaleString()}.00`;
    if (slipEarnHra) slipEarnHra.textContent = `$${pay.hraAllowance.toLocaleString()}.00`;
    if (slipEarnMed) slipEarnMed.textContent = `$${pay.medicalAllowance.toLocaleString()}.00`;
    if (slipEarnBonus) slipEarnBonus.textContent = `+$${pay.bonusAmount.toLocaleString()}.00 (${pay.tierName})`;
    if (slipEarnOt) slipEarnOt.textContent = `+$${pay.overtimePay.toLocaleString()}.00 (${pay.otHours}h OT)`;
    if (slipGrossTotal) slipGrossTotal.textContent = `$${pay.grossEarnings.toLocaleString()}.00`;

    // Populate Deductions
    const slipDeductTax = document.getElementById('slip-deduct-tax');
    const slipDeductPf = document.getElementById('slip-deduct-pf');
    const slipDeductIns = document.getElementById('slip-deduct-ins');
    const slipDeductLeave = document.getElementById('slip-deduct-leave');
    const slipDeductTotal = document.getElementById('slip-deduct-total');

    if (slipDeductTax) slipDeductTax.textContent = `-$${pay.taxDeduction.toLocaleString()}.00 (${pay.taxPct}%)`;
    if (slipDeductPf) slipDeductPf.textContent = `-$${pay.pfDeduction.toLocaleString()}.00 (5%)`;
    if (slipDeductIns) slipDeductIns.textContent = `-$${pay.insuranceDeduction.toLocaleString()}.00`;
    if (slipDeductLeave) slipDeductLeave.textContent = `-$0.00`;
    if (slipDeductTotal) slipDeductTotal.textContent = `-$${pay.totalDeductions.toLocaleString()}.00`;

    // Populate Net Disbursed & Words
    const slipNetAmount = document.getElementById('slip-net-amount');
    const slipNetWords = document.getElementById('slip-net-words');
    const slipSigEmpName = document.getElementById('slip-sig-emp-name');

    if (slipNetAmount) slipNetAmount.textContent = `$${pay.netPay.toLocaleString()}.00`;
    if (slipNetWords) slipNetWords.textContent = `Amount in Words: ${numberToWords(pay.netPay)}`;
    if (slipSigEmpName) slipSigEmpName.textContent = emp.name;

    modalPayslipView.showModal();
  }

  // Adjust Compensation Modal
  const adjustEmpIdInput = document.getElementById('adjust-emp-id');
  const adjustEmpNameInput = document.getElementById('adjust-emp-name');
  const adjustBaseSalaryInput = document.getElementById('adjust-base-salary');
  const adjustCustomBonusInput = document.getElementById('adjust-custom-bonus');
  const adjustCustomOtInput = document.getElementById('adjust-custom-ot');
  const adjustHraAllowanceInput = document.getElementById('adjust-hra-allowance');
  const adjustMedicalAllowanceInput = document.getElementById('adjust-medical-allowance');
  const adjustTaxPctInput = document.getElementById('adjust-tax-pct');
  const adjustStatusSelect = document.getElementById('adjust-status-select');
  const adjustPreviewNet = document.getElementById('adjust-preview-net');

  function updateAdjustPreview() {
    if (!adjustPreviewNet) return;
    const base = parseFloat(adjustBaseSalaryInput.value) || 0;
    const bonus = parseFloat(adjustCustomBonusInput.value) || 0;
    const ot = parseFloat(adjustCustomOtInput.value) || 0;
    const hra = parseFloat(adjustHraAllowanceInput.value) || 0;
    const med = parseFloat(adjustMedicalAllowanceInput.value) || 0;
    const taxRate = (parseFloat(adjustTaxPctInput.value) || 0) / 100;

    const gross = base + bonus + ot + hra + med;
    const tax = Math.round(gross * taxRate);
    const pf = Math.round(base * 0.05);
    const ins = 85;
    const net = gross - (tax + pf + ins);

    adjustPreviewNet.textContent = `$${Math.max(0, net).toLocaleString()}.00`;
  }

  function openPayrollAdjustModal(empId) {
    const emp = employees.find(e => e.id === empId);
    if (!emp || !modalPayrollAdjust) return;

    const pay = calculatePayrollForEmployee(emp);

    if (adjustEmpIdInput) adjustEmpIdInput.value = emp.id;
    if (adjustEmpNameInput) adjustEmpNameInput.value = `${emp.name} (${emp.id} - ${emp.role})`;
    if (adjustBaseSalaryInput) adjustBaseSalaryInput.value = pay.baseSalary;
    if (adjustCustomBonusInput) adjustCustomBonusInput.value = pay.bonusAmount;
    if (adjustCustomOtInput) adjustCustomOtInput.value = pay.overtimePay;
    if (adjustHraAllowanceInput) adjustHraAllowanceInput.value = pay.hraAllowance;
    if (adjustMedicalAllowanceInput) adjustMedicalAllowanceInput.value = pay.medicalAllowance;
    if (adjustTaxPctInput) adjustTaxPctInput.value = pay.taxPct;
    if (adjustStatusSelect) adjustStatusSelect.value = pay.paymentStatus;

    updateAdjustPreview();
    modalPayrollAdjust.showModal();
  }

  // Attach live preview calculations to adjust form fields
  [adjustBaseSalaryInput, adjustCustomBonusInput, adjustCustomOtInput, adjustHraAllowanceInput, adjustMedicalAllowanceInput, adjustTaxPctInput].forEach(inp => {
    if (inp) inp.addEventListener('input', updateAdjustPreview);
  });

  // Modal Close & Form Listeners
  const btnClosePayslipModal = document.getElementById('btn-close-payslip-modal');
  const btnCancelPayslipView = document.getElementById('btn-cancel-payslip-view');
  const btnPrintPayslip = document.getElementById('btn-print-payslip');
  const btnCloseAdjustModal = document.getElementById('btn-close-payroll-adjust-modal');
  const btnCancelPayrollAdjust = document.getElementById('btn-cancel-payroll-adjust');

  if (btnClosePayslipModal) btnClosePayslipModal.addEventListener('click', () => modalPayslipView && modalPayslipView.close());
  if (btnCancelPayslipView) btnCancelPayslipView.addEventListener('click', () => modalPayslipView && modalPayslipView.close());
  if (btnPrintPayslip) {
    btnPrintPayslip.addEventListener('click', () => {
      sound.playSuccess();
      window.print();
    });
  }

  if (btnCloseAdjustModal) btnCloseAdjustModal.addEventListener('click', () => modalPayrollAdjust && modalPayrollAdjust.close());
  if (btnCancelPayrollAdjust) btnCancelPayrollAdjust.addEventListener('click', () => modalPayrollAdjust && modalPayrollAdjust.close());

  if (formAdjustPayroll) {
    formAdjustPayroll.addEventListener('submit', (e) => {
      e.preventDefault();
      const empId = adjustEmpIdInput.value;
      const target = employees.find(e => e.id === empId);
      if (!target) return;

      target.baseSalary = parseFloat(adjustBaseSalaryInput.value) || 7500;
      target.customBonus = parseFloat(adjustCustomBonusInput.value) || 0;
      target.customOvertimePay = parseFloat(adjustCustomOtInput.value) || 0;
      target.customHra = parseFloat(adjustHraAllowanceInput.value) || 0;
      target.customMedical = parseFloat(adjustMedicalAllowanceInput.value) || 0;
      target.taxPct = parseFloat(adjustTaxPctInput.value) || 10;
      target.payrollStatus = adjustStatusSelect.value;

      saveEmployees();
      if (modalPayrollAdjust) modalPayrollAdjust.close();

      sound.playSuccess();
      renderHrPayrollTable();
      renderEmployeePayrollData();
      showToast(`✓ Updated compensation package for ${target.name}!`, 'success');
    });
  }

  // Run Batch Payroll Button
  const btnRunPayrollBatch = document.getElementById('btn-run-payroll-batch');
  if (btnRunPayrollBatch) {
    btnRunPayrollBatch.addEventListener('click', () => {
      sound.playSuccess();
      employees.forEach(emp => {
        emp.payrollStatus = 'Processed';
      });
      saveEmployees();
      renderHrPayrollTable();
      showToast(`✓ Batch Payroll Processed: All ${employees.length} staff compensation records calculated & ready for disbursement!`, 'success');
    });
  }

  // Disburse All Paid Button
  const btnDisburseAllPaid = document.getElementById('btn-disburse-all-paid');
  if (btnDisburseAllPaid) {
    btnDisburseAllPaid.addEventListener('click', () => {
      sound.playSuccess();
      employees.forEach(emp => {
        emp.payrollStatus = 'Paid';
      });
      saveEmployees();
      renderHrPayrollTable();
      showToast(`✓ All Salaries Disbursed: 100% of staff take-home transferred to direct wire accounts!`, 'success');
    });
  }

  // Bank CSV Export Button (Clean, Single-Line, 100% Legible Format for Notepad & Excel)
  const btnExportPayrollCsv = document.getElementById('btn-export-payroll-csv');
  if (btnExportPayrollCsv) {
    btnExportPayrollCsv.addEventListener('click', () => {
      sound.playSuccess();
      const activeCycle = payrollCycleSelect ? payrollCycleSelect.value : 'October 2026';
      
      const bankDirectory = [
        { bank: 'Chase Bank', routing: 'CHASUS33' },
        { bank: 'Bank of America', routing: 'BOFAUS3N' },
        { bank: 'Citibank', routing: 'CITIUS33' },
        { bank: 'Wells Fargo', routing: 'WFBIUS6S' },
        { bank: 'Capital One', routing: 'CAPLUS33' },
        { bank: 'PNC Bank', routing: 'PNCBUS22' }
      ];

      // Concise 8-column header that never wraps and reads effortlessly
      let csvLines = [
        'SL, Employee ID, Employee Name, Department, Bank Name, Account Number, Net Amount ($), Status'
      ];

      let totalNet = 0;

      employees.forEach((emp, index) => {
        const pay = calculatePayrollForEmployee(emp, activeCycle);
        const bankMeta = bankDirectory[index % bankDirectory.length];
        
        const idDigits = (emp.id.replace(/\D/g, '') || (1000 + index));
        const rawAccountNum = `4082${String(parseInt(idDigits, 10) * 83).padStart(8, '0').slice(-8)}`;
        const net = pay.netPay || 0;
        totalNet += net;

        csvLines.push(`${index + 1}, ${emp.id}, ${emp.name}, ${emp.dept}, ${bankMeta.bank}, ${rawAccountNum}, $${net.toFixed(2)}, ${pay.paymentStatus || 'Processed'}`);
      });

      // Clear Summary Line at Bottom
      csvLines.push(`TOTAL, ${employees.length} Staff, All Beneficiaries, -, All Banks, -, $${totalNet.toFixed(2)}, All Processed`);

      const csvContent = '\uFEFF' + csvLines.join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nexus_bank_disbursement_${activeCycle.toLowerCase().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Downloaded clean human-readable Bank CSV!`, 'success');
    });
  }

  // Bank Excel Export Button (Formatted Spreadsheet with Gridlines & Styled Headers)
  const btnExportPayrollExcel = document.getElementById('btn-export-payroll-excel');
  if (btnExportPayrollExcel) {
    btnExportPayrollExcel.addEventListener('click', () => {
      sound.playSuccess();
      const activeCycle = payrollCycleSelect ? payrollCycleSelect.value : 'October 2026';

      const bankDirectory = [
        { bank: 'JPMorgan Chase Bank, N.A.', routing: 'CHASUS33' },
        { bank: 'Bank of America, N.A.', routing: 'BOFAUS3N' },
        { bank: 'Citibank, N.A.', routing: 'CITIUS33' },
        { bank: 'Wells Fargo Bank, N.A.', routing: 'WFBIUS6S' },
        { bank: 'Capital One, N.A.', routing: 'CAPLUS33' },
        { bank: 'PNC Bank, N.A.', routing: 'PNCBUS22' }
      ];

      let totalBase = 0;
      let totalAllowances = 0;
      let totalBonusOt = 0;
      let totalGross = 0;
      let totalTax = 0;
      let totalPf = 0;
      let totalNet = 0;

      let tableRows = '';
      employees.forEach((emp, index) => {
        const pay = calculatePayrollForEmployee(emp, activeCycle);
        const bankMeta = bankDirectory[index % bankDirectory.length];
        const idDigits = (emp.id.replace(/\D/g, '') || (1000 + index));
        const rawAccountNum = `4082${String(parseInt(idDigits, 10) * 83).padStart(8, '0').slice(-8)}`;

        const base = pay.baseSalary || 0;
        const allowances = pay.totalAllowances || 0;
        const bonusOt = (pay.bonusAmount || 0) + (pay.overtimePay || 0);
        const gross = pay.grossEarnings || 0;
        const tax = pay.taxDeduction || 0;
        const pf = pay.pfDeduction || 0;
        const net = pay.netPay || 0;

        totalBase += base;
        totalAllowances += allowances;
        totalBonusOt += bonusOt;
        totalGross += gross;
        totalTax += tax;
        totalPf += pf;
        totalNet += net;

        tableRows += `
          <tr>
            <td style="text-align: center;">${index + 1}</td>
            <td style="font-weight: bold; color: #0070f3;">${emp.id}</td>
            <td><strong>${emp.name}</strong></td>
            <td>${emp.dept}</td>
            <td>${emp.role}</td>
            <td>${bankMeta.bank}</td>
            <td style="font-family: monospace;">${rawAccountNum}</td>
            <td style="font-family: monospace;">${bankMeta.routing}</td>
            <td style="text-align: right;">$${base.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">$${allowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">$${bonusOt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-weight: bold;">$${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; color: #ef4444;">-$${tax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; color: #ef4444;">-$${pf.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-weight: bold; color: #059669; font-size: 13px;">$${net.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: center; color: #059669; font-weight: bold;">${pay.paymentStatus || 'Processed'}</td>
          </tr>`;
      });

      const excelHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<!--[if gte mso 9]>
<xml>
  <x:ExcelWorkbook>
    <x:ExcelWorksheets>
      <x:ExcelWorksheet>
        <x:Name>Payroll Disbursement</x:Name>
        <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
      </x:ExcelWorksheet>
    </x:ExcelWorksheets>
  </x:ExcelWorkbook>
</xml>
<![endif]-->
<style>
  body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; padding: 20px; }
  h2 { color: #0070f3; margin: 0 0 4px 0; }
  .meta { color: #64748b; font-size: 13px; margin-bottom: 16px; }
  table { border-collapse: collapse; width: 100%; }
  th { background: #0070f3; color: #ffffff; padding: 10px 8px; font-size: 12px; border: 1px solid #0050b3; text-align: left; }
  td { padding: 8px 10px; font-size: 12px; border: 1px solid #cbd5e1; }
  tr:nth-child(even) td { background: #f8fafc; }
  .total-row td { background: #e0f2fe; font-weight: bold; color: #0369a1; border-top: 2px solid #0070f3; font-size: 13px; }
</style>
</head>
<body>
  <h2>NEXUS TECHNOLOGIES CORP — CORPORATE BANK SALARY DISBURSEMENT SCHEDULE</h2>
  <div class="meta">Payroll Period: <strong>${activeCycle}</strong> &nbsp;|&nbsp; Total Beneficiaries: <strong>${employees.length} Staff</strong> &nbsp;|&nbsp; Currency: <strong>USD ($)</strong> &nbsp;|&nbsp; Generated on: <strong>${new Date().toLocaleDateString()}</strong></div>
  <table>
    <thead>
      <tr>
        <th style="text-align: center;">SL</th>
        <th>Employee ID</th>
        <th>Beneficiary Name</th>
        <th>Department</th>
        <th>Designation</th>
        <th>Bank Name</th>
        <th>Account Number</th>
        <th>Routing Code</th>
        <th style="text-align: right;">Base Salary</th>
        <th style="text-align: right;">Allowances</th>
        <th style="text-align: right;">Bonus &amp; OT</th>
        <th style="text-align: right;">Gross Earnings</th>
        <th style="text-align: right;">Tax Deduct</th>
        <th style="text-align: right;">PF Deduct</th>
        <th style="text-align: right;">Net Take-Home</th>
        <th style="text-align: center;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
      <tr class="total-row">
        <td style="text-align: center;">TOTAL</td>
        <td colspan="4" style="text-align: left;">ALL ${employees.length} BENEFICIARIES PROCESSED</td>
        <td colspan="3" style="text-align: center;">CORPORATE WIRE DISBURSEMENT</td>
        <td style="text-align: right;">$${totalBase.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right;">$${totalAllowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right;">$${totalBonusOt.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right;">$${totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right; color: #ef4444;">-$${totalTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right; color: #ef4444;">-$${totalPf.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: right; color: #059669; font-size: 14px;">$${totalNet.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td style="text-align: center; color: #059669;">100% DISBURSED</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;

      const blob = new Blob(['\uFEFF' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nexus_bank_payroll_schedule_${activeCycle.toLowerCase().replace(/\s+/g, '_')}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`✓ Downloaded formatted Excel Payroll Schedule (.xls)!`, 'success');
    });
  }

  // Payroll Filter Listeners
  if (payrollCycleSelect) payrollCycleSelect.addEventListener('change', renderHrPayrollTable);
  if (filterPayrollDept) filterPayrollDept.addEventListener('change', renderHrPayrollTable);
  if (filterPayrollStatus) filterPayrollStatus.addEventListener('change', renderHrPayrollTable);

  renderHrPayrollTable();

  // ========================================================================
  // EMPLOYEE SELF-SERVICE PORTAL LOGIC (Punch Clock, Timesheet, Bonus & Inc)
  // ========================================================================
  const userEmail = (localStorage.getItem('auth_user_email') || '').toLowerCase();
  const userId = localStorage.getItem('auth_user_id') || 'EMP-1002';
  let currentEmp = employees.find(e => (e.email && e.email.toLowerCase() === userEmail) || e.id === userId) || employees[1];

  // 1. Employee Appraisal & KPI Renderers
  const empKpiTodayHours = document.getElementById('emp-kpi-today-hours');
  const empKpiTodayStatus = document.getElementById('emp-kpi-today-status');
  const empKpiBonusVal = document.getElementById('emp-kpi-bonus-val');
  const empKpiTierTag = document.getElementById('emp-kpi-tier-tag');
  const empKpiIncVal = document.getElementById('emp-kpi-inc-val');

  const empTierBadge = document.getElementById('emp-tier-badge');
  const empPerfScoreVal = document.getElementById('emp-perf-score-val');
  const empPerfScoreFill = document.getElementById('emp-perf-score-fill');
  const empBonusAmountVal = document.getElementById('emp-bonus-amount-val');
  const empIncrementVal = document.getElementById('emp-increment-val');
  const empIncrementAmountSub = document.getElementById('emp-increment-amount-sub');
  const empHoursVal = document.getElementById('emp-hours-val');
  const empHoursSub = document.getElementById('emp-hours-sub');
  const empTimesheetTableBody = document.getElementById('emp-timesheet-table-body');

  function renderEmployeePortalData() {
    if (!currentEmp) return;
    const appr = calculateEmployeeAppraisal(currentEmp);

    // KPI Cards
    if (empKpiTodayHours) empKpiTodayHours.textContent = currentEmp.shiftDuration || '8h 33m';
    if (empKpiTodayStatus) empKpiTodayStatus.innerHTML = `<span>In: ${escapeHtml(currentEmp.inTime || '09:12 AM')}</span> • Out: ${escapeHtml(currentEmp.outTime || '05:45 PM')}`;
    if (empKpiBonusVal) empKpiBonusVal.textContent = `+$${appr.bonusAmount.toLocaleString()}`;
    if (empKpiTierTag) empKpiTierTag.textContent = `${appr.tierName} (${appr.perfScore}%)`;
    const displayInc = (typeof appr.incPercent === 'number' && appr.incPercent > 0) ? appr.incPercent : 15;
    if (empKpiIncVal) empKpiIncVal.textContent = `+${displayInc}%`;
    const empKpiIncAmount = document.getElementById('emp-kpi-inc-amount');
    if (empKpiIncAmount) {
      const displayAmt = (typeof appr.incAmount === 'number' && appr.incAmount > 0) ? appr.incAmount : Math.round((appr.baseSalary || 8450) * (displayInc / 100));
      empKpiIncAmount.textContent = `+$${displayAmt.toLocaleString()}/mo`;
    }

    renderEmployeePayrollData();

    // Appraisal Reward Board
    if (empTierBadge) {
      empTierBadge.textContent = appr.tierLabel;
      empTierBadge.className = `tier-badge ${appr.tierKey}`;
    }
    if (empPerfScoreVal) empPerfScoreVal.textContent = `${appr.perfScore}%`;
    if (empPerfScoreFill) {
      empPerfScoreFill.style.width = `${appr.perfScore}%`;
      empPerfScoreFill.className = `appraisal-score-fill ${appr.tierKey === 'tier-a' ? 'green' : (appr.tierKey === 'tier-b' ? 'blue' : (appr.tierKey === 'tier-c' ? 'amber' : 'red'))}`;
    }
    if (empBonusAmountVal) empBonusAmountVal.textContent = `+$${appr.bonusAmount.toLocaleString()}.00`;
    if (empIncrementVal) empIncrementVal.textContent = `+${appr.incPercent}% Raise`;
    if (empIncrementAmountSub) {
      empIncrementAmountSub.textContent = `+$${appr.incAmount.toLocaleString()}.00 / month added to base ($${appr.baseSalary.toLocaleString()})`;
    }
    if (empHoursVal) empHoursVal.textContent = `${currentEmp.monthlyHours || 160} / ${currentEmp.targetHours || 160} hrs`;
    if (empHoursSub) {
      const otHours = Math.max(0, (currentEmp.monthlyHours || 160) - 160);
      empHoursSub.textContent = `${Math.round(appr.hoursRatio * 100)}% of target • +${otHours} hrs Overtime • Punctuality: ${appr.punctualityScore}%`;
    }

    // Attendance History Timesheet
    if (empTimesheetTableBody) {
      empTimesheetTableBody.innerHTML = '';
      const history = currentEmp.attendanceHistory && currentEmp.attendanceHistory.length > 0 
        ? currentEmp.attendanceHistory 
        : [
            { date: 'Today (Oct 14)', inTime: currentEmp.inTime || '09:12 AM', outTime: currentEmp.outTime || '05:45 PM', duration: currentEmp.shiftDuration || '8h 33m', overtime: currentEmp.overtime || '+33m OT', status: currentEmp.attendanceStatus || 'On Time' }
          ];

      history.forEach(item => {
        const tr = document.createElement('tr');
        const isLate = item.status === 'Late Arrival';
        const isDeficit = item.overtime && item.overtime.includes('Deficit');

        tr.innerHTML = `
          <td><span class="emp-id-badge">${escapeHtml(item.date)}</span></td>
          <td><span class="time-badge in-time">${escapeHtml(item.inTime)}</span></td>
          <td><span class="time-badge out-time">${escapeHtml(item.outTime)}</span></td>
          <td><span class="time-badge duration-time">${escapeHtml(item.duration)}</span></td>
          <td><span class="time-badge overtime ${isDeficit ? 'tier-d' : ''}">${escapeHtml(item.overtime)}</span></td>
          <td><span class="status-pill ${isLate ? 'review' : 'completed'}">${escapeHtml(item.status)}</span></td>
        `;
        empTimesheetTableBody.appendChild(tr);
      });
    }
  }

  // ------------------------------------------------------------------------
  // EMPLOYEE PAYROLL & PAYSLIPS RENDERER (payroll.html & dashboard.html)
  // ------------------------------------------------------------------------
  const empPayNetVal = document.getElementById('emp-pay-net-val');
  const empPayStatusPill = document.getElementById('emp-pay-status-pill');
  const empPayBonusVal = document.getElementById('emp-pay-bonus-val');
  const empPayTierTag = document.getElementById('emp-pay-tier-tag');
  const empPayOtVal = document.getElementById('emp-pay-ot-val');
  const empPayOtHours = document.getElementById('emp-pay-ot-hours');
  const empPayDeductVal = document.getElementById('emp-pay-deduct-val');
  const empPayslipsHistoryBody = document.getElementById('emp-payslips-history-body');
  const btnDownloadLatestPayslip = document.getElementById('btn-download-latest-payslip');

  function renderEmployeePayrollData() {
    if (!currentEmp) return;
    const pay = calculatePayrollForEmployee(currentEmp, 'October 2026');

    if (empPayNetVal) empPayNetVal.textContent = `$${pay.netPay.toLocaleString()}.00`;
    if (empPayStatusPill) {
      empPayStatusPill.textContent = `${pay.paymentStatus} ✓`;
      empPayStatusPill.className = `status-pill ${pay.paymentStatus === 'Paid' ? 'paid' : (pay.paymentStatus === 'Processed' ? 'processed' : 'pending')}`;
    }
    if (empPayBonusVal) empPayBonusVal.textContent = `+$${pay.bonusAmount.toLocaleString()}.00`;
    if (empPayTierTag) empPayTierTag.textContent = `${pay.tierName} (${pay.bonusPercent}%)`;
    if (empPayOtVal) empPayOtVal.textContent = `+$${pay.overtimePay.toLocaleString()}.00`;
    if (empPayOtHours) empPayOtHours.textContent = `+${pay.otHours} hrs`;
    if (empPayDeductVal) empPayDeductVal.textContent = `-$${pay.totalDeductions.toLocaleString()}.00`;

    // Past 4 Months Archive for Employee
    if (empPayslipsHistoryBody) {
      empPayslipsHistoryBody.innerHTML = '';
      const months = [
        { period: 'October 2026', date: 'Oct 31, 2026', status: pay.paymentStatus },
        { period: 'September 2026', date: 'Sep 30, 2026', status: 'Paid' },
        { period: 'August 2026', date: 'Aug 31, 2026', status: 'Paid' },
        { period: 'July 2026', date: 'Jul 31, 2026', status: 'Paid' }
      ];

      months.forEach(m => {
        const mPay = calculatePayrollForEmployee(currentEmp, m.period);
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="emp-id-badge">${m.period}</span></td>
          <td>${m.date}</td>
          <td><strong class="pay-positive">$${mPay.grossEarnings.toLocaleString()}.00</strong></td>
          <td><span class="pay-deduct">-$${mPay.totalDeductions.toLocaleString()}.00</span></td>
          <td><span class="pay-net">$${mPay.netPay.toLocaleString()}.00</span></td>
          <td><span class="status-pill ${m.status === 'Paid' ? 'paid' : 'processed'}">${m.status}</span></td>
          <td style="text-align: right;">
            <button type="button" class="neu-btn dash-action-btn primary btn-view-emp-payslip" data-period="${m.period}" style="padding: 0.35rem 0.8rem; font-size: 0.75rem;">
              View / Print
            </button>
          </td>
        `;

        tr.querySelector('.btn-view-emp-payslip').addEventListener('click', () => {
          sound.playPop(700);
          openPayslipModal(currentEmp.id, m.period);
        });

        empPayslipsHistoryBody.appendChild(tr);
      });
    }

    if (btnDownloadLatestPayslip) {
      btnDownloadLatestPayslip.onclick = () => {
        sound.playPop(700);
        openPayslipModal(currentEmp.id, 'October 2026');
      };
    }
  }

  renderEmployeePayrollData();

  renderEmployeePortalData();

  // 2. Daily Punch Clock with Live Shift Duration Counter
  const btnPunchClock = document.getElementById('btn-punch-clock');
  const punchClockText = document.getElementById('punch-clock-text');
  const punchTimerBadge = document.getElementById('emp-punch-timer-display');
  const empTimerText = document.getElementById('emp-timer-text');
  let isClockedIn = localStorage.getItem('nexus_emp_clocked_in') === 'true';
  let punchClockInterval = null;

  function updatePunchClockTimer() {
    const clockInTimestamp = parseInt(localStorage.getItem('nexus_emp_clockin_time') || Date.now(), 10);
    const diffMs = Math.max(0, Date.now() - clockInTimestamp);
    const diffSec = Math.floor(diffMs / 1000);
    const h = Math.floor(diffSec / 3600);
    const m = Math.floor((diffSec % 3600) / 60);
    const s = diffSec % 60;
    const pad = n => String(n).padStart(2, '0');

    if (empTimerText) {
      empTimerText.textContent = `Shift Active: ${pad(h)}h ${pad(m)}m ${pad(s)}s (Logging Work)`;
    }
  }

  function syncPunchClockUI() {
    if (!btnPunchClock || !punchClockText) return;

    if (isClockedIn) {
      btnPunchClock.classList.add('clocked-in');
      punchClockText.textContent = 'Clock Out (Finish Shift)';
      if (punchTimerBadge) punchTimerBadge.classList.add('active');

      clearInterval(punchClockInterval);
      updatePunchClockTimer();
      punchClockInterval = setInterval(updatePunchClockTimer, 1000);
    } else {
      btnPunchClock.classList.remove('clocked-in');
      punchClockText.textContent = 'Clock In (Start Shift)';
      if (punchTimerBadge) punchTimerBadge.classList.remove('active');
      if (empTimerText) empTimerText.textContent = 'Shift: Ready to Clock In';
      clearInterval(punchClockInterval);
    }
  }

  syncPunchClockUI();

  if (btnPunchClock) {
    btnPunchClock.addEventListener('click', () => {
      isClockedIn = !isClockedIn;
      localStorage.setItem('nexus_emp_clocked_in', isClockedIn ? 'true' : 'false');

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (isClockedIn) {
        // CLOCK IN: Record arrival time
        localStorage.setItem('nexus_emp_clockin_time', Date.now());
        sound.playSuccess();

        const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
        currentEmp.inTime = timeStr;
        currentEmp.outTime = 'Working Now...';
        currentEmp.attendanceStatus = isLate ? 'Late Arrival' : 'On Time';

        saveEmployees();
        syncPunchClockUI();
        renderEmployeePortalData();
        renderHrAttendanceTable();

        showToast(`✓ Arrival Logged: Clocked in at ${timeStr}. Work shift started!`, 'success');
      } else {
        // CLOCK OUT: Record departure, duration, and overtime
        const clockInTimestamp = parseInt(localStorage.getItem('nexus_emp_clockin_time') || (Date.now() - 8.5 * 3600 * 1000), 10);
        const elapsedHoursTotal = Math.max(0.5, ((Date.now() - clockInTimestamp) / (1000 * 3600)));
        // Provide realistic calculation
        const durationFormatted = elapsedHoursTotal >= 1 
          ? `${Math.floor(elapsedHoursTotal)}h ${Math.round((elapsedHoursTotal % 1) * 60)}m` 
          : '8h 25m';

        const effectiveHours = elapsedHoursTotal >= 1 ? elapsedHoursTotal : 8.42;
        const otMinutes = Math.round((effectiveHours - 8.0) * 60);
        const overtimeLabel = otMinutes > 0 ? `+${otMinutes}m OT` : (otMinutes < 0 ? `${otMinutes}m Deficit` : 'Standard');

        currentEmp.outTime = timeStr;
        currentEmp.shiftDuration = durationFormatted;
        currentEmp.overtime = overtimeLabel;

        // Increase monthly hours
        currentEmp.monthlyHours = Math.round(((currentEmp.monthlyHours || 160) + (effectiveHours > 0 ? 0.5 : 0)) * 10) / 10;

        // Prepend to attendance history
        if (!currentEmp.attendanceHistory) currentEmp.attendanceHistory = [];
        currentEmp.attendanceHistory.unshift({
          date: `Today (${now.toLocaleDateString([], { month: 'short', day: 'numeric' })})`,
          inTime: currentEmp.inTime || '09:00 AM',
          outTime: timeStr,
          duration: durationFormatted,
          overtime: overtimeLabel,
          status: currentEmp.attendanceStatus || 'On Time'
        });

        saveEmployees();
        syncPunchClockUI();
        renderEmployeePortalData();
        renderHrAttendanceTable();
        renderHrAppraisalTable();
        renderHrPayrollTable();
        renderEmployeePayrollData();

        sound.playPop(520, 0.15);
        showToast(`✓ Shift Finished: Departure at ${timeStr} (${durationFormatted} logged). Performance bonus & increment updated!`, 'success');
      }
    });
  }

  // 2. Self-Service Apply For Leave Form
  const formEmpLeave = document.getElementById('form-emp-apply-leave');
  const empLeaveHistory = document.getElementById('emp-leave-history');

  if (formEmpLeave) {
    formEmpLeave.addEventListener('submit', (e) => {
      e.preventDefault();
      const category = document.getElementById('self-leave-type').value;
      const duration = document.getElementById('self-leave-duration').value;
      const start = document.getElementById('self-leave-start').value;
      const end = document.getElementById('self-leave-end').value;
      const reason = document.getElementById('self-leave-reason').value.trim();

      if (start && end && new Date(start) > new Date(end)) {
        sound.playPop(450);
        showToast('End date cannot be earlier than start date.', 'info');
        return;
      }

      sound.playSuccess();

      // Add to personal history
      if (empLeaveHistory) {
        const item = document.createElement('div');
        item.className = 'leave-history-item';
        item.innerHTML = `
          <div class="history-info">
            <strong>${escapeHtml(category)} (${escapeHtml(reason.substring(0, 30))}...)</strong>
            <span>${escapeHtml(start)} to ${escapeHtml(end)} (${duration} Days)</span>
          </div>
          <span class="status-pill active">Pending HR Review</span>
        `;
        empLeaveHistory.prepend(item);
      }

      // Add to HR review queue
      if (leaveList) {
        const hrItem = document.createElement('div');
        hrItem.className = 'leave-item';
        const empName = localStorage.getItem('auth_user_name') || 'Sophia Clark';
        const initials = getInitials(empName);

        hrItem.innerHTML = `
          <div class="leave-avatar">${initials}</div>
          <div class="leave-details">
            <div class="leave-header-line">
              <strong>${escapeHtml(empName)}</strong>
              <span class="leave-type-tag vacation">${escapeHtml(category)}</span>
            </div>
            <span class="leave-meta">${escapeHtml(start)} to ${escapeHtml(end)} (${duration} Days)</span>
            <p class="leave-reason">"${escapeHtml(reason)}"</p>
          </div>
          <div class="leave-actions">
            <button class="neu-circle-btn action-circle-btn approve-btn" title="Approve Leave" aria-label="Approve">✓</button>
            <button class="neu-circle-btn action-circle-btn reject-btn" title="Reject Leave" aria-label="Reject">✕</button>
          </div>
        `;
        leaveList.prepend(hrItem);

        pendingLeaves++;
        if (pendingBadge) pendingBadge.textContent = `${pendingLeaves} Pending`;
        if (sidebarLeaves) sidebarLeaves.textContent = pendingLeaves;
      }

      formEmpLeave.reset();
      showToast('✓ Leave application submitted to HR for approval!', 'success');
    });
  }

  // 3. Payslip Downloads
  document.querySelectorAll('.download-payslip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      sound.playSuccess();
      const payslipModal = document.getElementById('modal-payslip-view');
      if (payslipModal && typeof openPayslipModal === 'function') {
        const empId = localStorage.getItem('auth_user_id') || 'EMP-1002';
        openPayslipModal(empId, 'September 2026');
      } else {
        showToast('✓ Opening official verified payslip...', 'success');
        setTimeout(() => {
          window.location.href = 'payroll.html';
        }, 500);
      }
    });
  });

  // 4. Scratchpad Autosave
  const scratchpad = document.getElementById('dash-scratchpad');
  const scratchStatus = document.getElementById('dash-scratch-status');
  if (scratchpad) {
    scratchpad.value = localStorage.getItem('nexus_ems_scratch') || '';
    let debounce = null;
    scratchpad.addEventListener('input', () => {
      if (scratchStatus) {
        scratchStatus.textContent = 'Saving...';
        scratchStatus.style.color = '#8e9aaf';
      }
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        localStorage.setItem('nexus_ems_scratch', scratchpad.value);
        if (scratchStatus) {
          scratchStatus.textContent = 'Saved';
          scratchStatus.style.color = '#10b981';
        }
      }, 400);
    });
  }

  // 5. Search Keyboard Shortcut
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      if (searchInput) searchInput.focus();
    }
  });

  // ========================================================================
  // 6. NOTIFICATIONS SYSTEM (Bell toggle, Dropdown, Mark As Read)
  // ========================================================================
  const btnNotifications = document.getElementById('btn-notifications');
  const notificationsDropdown = document.getElementById('notifications-dropdown');
  const btnMarkAllRead = document.getElementById('btn-mark-all-read');
  const topNotifDot = document.getElementById('top-notif-dot');
  const dropdownNotifCount = document.getElementById('dropdown-notif-count');
  const sidebarNotifCount = document.getElementById('sidebar-notif-count');
  const navEmpNotifications = document.getElementById('nav-emp-notifications');
  const cardOpenNotifs = document.getElementById('card-open-notifs');

  function toggleNotifications(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.playPop(750, 0.05);
    if (!notificationsDropdown) return;
    const isHidden = notificationsDropdown.classList.contains('hidden');
    if (isHidden) {
      notificationsDropdown.classList.remove('hidden');
    } else {
      notificationsDropdown.classList.add('hidden');
    }
  }

  const navMgrNotifications = document.getElementById('nav-mgr-notifications');
  const cardMgrOpenNotifs = document.getElementById('card-mgr-open-notifs');
  const navHrNotifications = document.getElementById('nav-hr-notifications');

  if (btnNotifications) {
    btnNotifications.addEventListener('click', toggleNotifications);
  }
  if (navEmpNotifications) {
    navEmpNotifications.addEventListener('click', toggleNotifications);
  }
  if (cardOpenNotifs) {
    cardOpenNotifs.addEventListener('click', toggleNotifications);
  }
  if (navMgrNotifications) {
    navMgrNotifications.addEventListener('click', toggleNotifications);
  }
  if (cardMgrOpenNotifs) {
    cardMgrOpenNotifs.addEventListener('click', toggleNotifications);
  }
  if (navHrNotifications) {
    navHrNotifications.addEventListener('click', toggleNotifications);
  }

  // Click outside to close notifications dropdown
  document.addEventListener('click', (e) => {
    if (notificationsDropdown && !notificationsDropdown.classList.contains('hidden')) {
      if (!notificationsDropdown.contains(e.target) && 
          !e.target.closest('#btn-notifications') && 
          !e.target.closest('#nav-emp-notifications') && 
          !e.target.closest('#card-open-notifs') &&
          !e.target.closest('#nav-mgr-notifications') &&
          !e.target.closest('#card-mgr-open-notifs') &&
          !e.target.closest('#nav-hr-notifications')) {
        notificationsDropdown.classList.add('hidden');
      }
    }
  });

  if (btnMarkAllRead) {
    btnMarkAllRead.addEventListener('click', () => {
      sound.playSuccess();
      const unreadItems = document.querySelectorAll('.notif-item.unread');
      unreadItems.forEach(item => {
        item.classList.remove('unread');
        item.classList.add('read');
      });
      if (topNotifDot) topNotifDot.style.display = 'none';
      if (dropdownNotifCount) dropdownNotifCount.textContent = '0 New';
      if (sidebarNotifCount) sidebarNotifCount.textContent = '0';
      showToast('✓ All notifications marked as read!', 'info');
    });
  }

  // ========================================================================
  // 7. EMPLOYEE PROFILE MODAL CONTROLLER (My Profile)
  // ========================================================================
  const modalEmpProfile = document.getElementById('modal-emp-profile');
  const btnCloseProfileModal = document.getElementById('btn-close-profile-modal');
  const btnCancelProfile = document.getElementById('btn-cancel-profile');
  const navEmpProfile = document.getElementById('nav-emp-profile');
  const cardOpenProfile = document.getElementById('card-open-profile');
  const topUserProfileMenu = document.querySelector('.user-profile-menu');
  const formEmpProfile = document.getElementById('form-emp-profile');

  // Profile modal elements
  const modalProfAvatar = document.getElementById('modal-prof-avatar');
  const modalProfName = document.getElementById('modal-prof-name');
  const modalProfRole = document.getElementById('modal-prof-role');
  const modalProfIdBadge = document.getElementById('modal-prof-id-badge');
  const modalProfStatus = document.getElementById('modal-prof-status');
  const modalProfTier = document.getElementById('modal-prof-tier');
  const modalProfSalary = document.getElementById('modal-prof-salary');

  const profInputName = document.getElementById('prof-input-name');
  const profInputTitle = document.getElementById('prof-input-title');
  const profInputDept = document.getElementById('prof-input-dept');
  const profInputMode = document.getElementById('prof-input-mode');
  const profInputEmail = document.getElementById('prof-input-email');
  const profInputPhone = document.getElementById('prof-input-phone');
  const profInputEmergency = document.getElementById('prof-input-emergency');

  function openProfileModal(e) {
    if (e) e.preventDefault();
    sound.playPop(700, 0.06);
    if (!modalEmpProfile) return;

    const currentName = localStorage.getItem('auth_user_name') || (currentEmp ? currentEmp.name : 'Sophia Clark');
    const currentTitle = localStorage.getItem('auth_user_title') || (currentEmp ? currentEmp.role : 'Lead Frontend Engineer');
    const currentDept = localStorage.getItem('auth_user_dept') || (currentEmp ? currentEmp.dept : 'Engineering');
    const currentEmail = localStorage.getItem('auth_user_email') || (currentEmp ? currentEmp.email : 'sophia@company.com');
    const currentId = localStorage.getItem('auth_user_id') || (currentEmp ? currentEmp.id : 'EMP-1002');
    const currentPhone = localStorage.getItem('auth_user_phone') || '+1 (555) 234-8901';
    const currentMode = localStorage.getItem('auth_user_mode') || (currentEmp ? currentEmp.mode : 'Onsite');
    const currentEmergency = localStorage.getItem('auth_user_emergency') || 'David Clark (Spouse) • +1 (555) 987-6543';
    const initials = getInitials(currentName);

    if (modalProfAvatar) modalProfAvatar.textContent = initials;
    if (modalProfName) modalProfName.textContent = currentName;
    if (modalProfRole) modalProfRole.textContent = `${currentTitle} • ${currentDept} Unit`;
    if (modalProfIdBadge) modalProfIdBadge.textContent = `ID: ${currentId}`;
    if (modalProfStatus) modalProfStatus.textContent = `${currentMode} Staff`;

    if (authRole === 'MANAGER') {
      if (modalProfTier) modalProfTier.textContent = 'Tier A • Management Lead (98%)';
      if (modalProfSalary) modalProfSalary.textContent = 'Management Tier (Confidential • No Employee Salary Access)';
    } else if (currentEmp) {
      const appr = calculateEmployeeAppraisal(currentEmp);
      if (modalProfTier) modalProfTier.textContent = `${appr.tierName} (${appr.perfScore}%)`;
      if (modalProfSalary) modalProfSalary.textContent = `$${(currentEmp.baseSalary || 8450).toLocaleString()}.00 / month ($${((currentEmp.baseSalary || 8450) * 12).toLocaleString()}/yr)`;
    }

    if (profInputName) profInputName.value = currentName;
    if (profInputTitle) profInputTitle.value = currentTitle;
    if (profInputDept) profInputDept.value = currentDept;
    if (profInputMode) profInputMode.value = currentMode;
    if (profInputEmail) profInputEmail.value = currentEmail;
    if (profInputPhone) profInputPhone.value = currentPhone;
    if (profInputEmergency) profInputEmergency.value = currentEmergency;

    modalEmpProfile.showModal();
  }

  const navMgrProfile = document.getElementById('nav-mgr-profile');
  const cardMgrOpenProfile = document.getElementById('card-mgr-open-profile');
  const btnEmpOpenProfileHero = document.getElementById('btn-emp-open-profile-hero');
  if (navEmpProfile) navEmpProfile.addEventListener('click', openProfileModal);
  if (cardOpenProfile) cardOpenProfile.addEventListener('click', openProfileModal);
  if (btnEmpOpenProfileHero) btnEmpOpenProfileHero.addEventListener('click', openProfileModal);
  if (navMgrProfile) navMgrProfile.addEventListener('click', openProfileModal);
  if (cardMgrOpenProfile) cardMgrOpenProfile.addEventListener('click', openProfileModal);

  // Employee Punch Clock toggle
  const btnEmpPunchClock = document.getElementById('btn-emp-punch-clock');
  const punchBtnLabel = document.getElementById('punch-btn-label');
  if (btnEmpPunchClock) {
    btnEmpPunchClock.addEventListener('click', () => {
      sound.playSuccess();
      const isShiftActive = punchBtnLabel && punchBtnLabel.textContent.includes('Clock Out');
      if (isShiftActive) {
        if (punchBtnLabel) punchBtnLabel.textContent = 'Clock In (Shift Ended)';
        btnEmpPunchClock.className = 'neu-btn dash-action-btn secondary';
        showToast('✓ Successfully clocked out! Daily shift of 8h 33m saved.', 'info');
      } else {
        if (punchBtnLabel) punchBtnLabel.textContent = 'Clock Out (Shift Active)';
        btnEmpPunchClock.className = 'neu-btn dash-action-btn primary';
        showToast('✓ Clocked in at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '! Shift timer active.', 'success');
      }
    });
  }

  // Account switch button
  const btnSwitchHr = document.getElementById('btn-switch-hr');
  if (btnSwitchHr) {
    btnSwitchHr.addEventListener('click', () => {
      localStorage.setItem('auth_user_role', 'HR');
      localStorage.setItem('auth_user_name', 'Tanvir');
    });
  }

  // Interactive Sprint task items
  document.querySelectorAll('#emp-personal-tasks .dash-task-item').forEach(taskItem => {
    taskItem.addEventListener('click', () => {
      sound.playPop(700, 0.05);
      taskItem.classList.toggle('done');
    });
  });

  if (topUserProfileMenu) {
    topUserProfileMenu.style.cursor = 'pointer';
    topUserProfileMenu.addEventListener('click', (e) => {
      if (e.target.closest('#btn-logout-top')) return;
      openProfileModal(e);
    });
  }

  if (btnCloseProfileModal) btnCloseProfileModal.addEventListener('click', () => modalEmpProfile && modalEmpProfile.close());
  if (btnCancelProfile) btnCancelProfile.addEventListener('click', () => modalEmpProfile && modalEmpProfile.close());

  if (formEmpProfile) {
    formEmpProfile.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = profInputName.value.trim();
      const newTitle = profInputTitle.value.trim();
      const newDept = profInputDept.value;
      const newMode = profInputMode.value;
      const newPhone = profInputPhone.value.trim();
      const newEmergency = profInputEmergency.value.trim();

      if (!newName || !newTitle) {
        sound.playPop(400);
        showToast('Please enter full legal name and role.', 'info');
        return;
      }

      const newAvatar = getInitials(newName);
      localStorage.setItem('auth_user_name', newName);
      localStorage.setItem('auth_user_title', newTitle);
      localStorage.setItem('auth_user_dept', newDept);
      localStorage.setItem('auth_user_mode', newMode);
      localStorage.setItem('auth_user_phone', newPhone);
      localStorage.setItem('auth_user_emergency', newEmergency);
      localStorage.setItem('auth_user_avatar', newAvatar);

      // Update matching employee in stored array
      if (currentEmp) {
        currentEmp.name = newName;
        currentEmp.role = newTitle;
        currentEmp.dept = newDept;
        currentEmp.mode = newMode;
        saveEmployees();
      }

      // Update live UI
      if (dashUserName) dashUserName.textContent = newName;
      if (dashUserRole) dashUserRole.textContent = newTitle;
      if (topUserAvatar) topUserAvatar.textContent = newAvatar;
      if (empHeroTitle) empHeroTitle.textContent = `Welcome back, ${newName} 👋`;
      if (empHeroSubtitle) {
        const currentId = localStorage.getItem('auth_user_id') || 'EMP-1002';
        empHeroSubtitle.innerHTML = `${newTitle} • ${newDept} Unit • Employee ID: <strong>${currentId}</strong>`;
      }

      sound.playSuccess();
      if (modalEmpProfile) modalEmpProfile.close();
      showToast('✓ Profile updated successfully! Changes saved.', 'success');
    });
  }

  // ========================================================================
  // 8. HR SUPER ADMIN RECRUITMENT, REPORTS & SETTINGS CONTROLLERS
  // ========================================================================
  // A. Recruitment Modal
  const modalRecruitment = document.getElementById('modal-recruitment');
  const navHrRecruitment = document.getElementById('nav-hr-recruitment');
  const btnCloseRecruitmentModal = document.getElementById('btn-close-recruitment-modal');
  const btnPostJobOpen = document.getElementById('btn-post-job-open');
  const recruitmentCandidatesTbody = document.getElementById('recruitment-candidates-tbody');

  function openRecruitmentModal(e) {
    if (e) e.preventDefault();
    sound.playPop(700, 0.06);
    if (modalRecruitment) {
      modalRecruitment.showModal();
    } else {
      window.location.href = 'dashboard.html';
    }
  }

  if (navHrRecruitment) navHrRecruitment.addEventListener('click', openRecruitmentModal);
  if (btnCloseRecruitmentModal) btnCloseRecruitmentModal.addEventListener('click', () => modalRecruitment && modalRecruitment.close());

  if (btnPostJobOpen) {
    btnPostJobOpen.addEventListener('click', () => {
      sound.playSuccess();
      const roleName = prompt('Enter New Job Title to Post on Careers Board:', 'Senior Full-Stack Engineer (React / Node)');
      if (roleName && roleName.trim()) {
        showToast(`✓ New opening "${roleName.trim()}" published to careers portal!`, 'success');
      }
    });
  }

  if (recruitmentCandidatesTbody) {
    recruitmentCandidatesTbody.addEventListener('click', (e) => {
      const hireBtn = e.target.closest('.btn-hire-candidate');
      if (hireBtn) {
        sound.playSuccess();
        const candName = hireBtn.getAttribute('data-name') || 'Candidate';
        hireBtn.parentElement.innerHTML = `<span class="status-pill completed">Offer Sent ✓</span>`;
        showToast(`✓ Official employment offer extended to ${candName}!`, 'success');
      }
    });
  }

  // B. Reports & Analytics Modal
  const modalReports = document.getElementById('modal-reports-analytics');
  const navHrReports = document.getElementById('nav-hr-reports');
  const btnCloseReportsModal = document.getElementById('btn-close-reports-modal');
  const btnPrintExecutiveReport = document.getElementById('btn-print-executive-report');
  const btnDownloadReportsCsv = document.getElementById('btn-download-reports-csv');

  function openReportsModal(e) {
    if (e) e.preventDefault();
    sound.playPop(700, 0.06);
    if (modalReports) {
      modalReports.showModal();
    } else {
      window.location.href = 'dashboard.html';
    }
  }

  if (navHrReports) navHrReports.addEventListener('click', openReportsModal);
  if (btnCloseReportsModal) btnCloseReportsModal.addEventListener('click', () => modalReports && modalReports.close());

  if (btnPrintExecutiveReport) {
    btnPrintExecutiveReport.addEventListener('click', () => {
      sound.playSuccess();
      window.print();
    });
  }

  if (btnDownloadReportsCsv) {
    btnDownloadReportsCsv.addEventListener('click', () => {
      sound.playSuccess();
      let csv = 'Report,Category,Current Metric,Target Status\n';
      csv += 'Payroll Cost,Monthly Total,$109050.00,On Schedule\n';
      csv += 'Attendance Rate,Punctuality,92.3%,Satisfactory\n';
      csv += 'Avg Shift Hours,Working Time,8.4 Hours,Met Standard 8.0h\n';
      csv += 'Headcount,Staff Capacity,13 Employees,5 Departments\n';
      csv += 'Performance Tier A,Deliverables,38%,Target 35%\n';

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `nexus_executive_summary_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('✓ Executive Summary Report CSV downloaded!', 'success');
    });
  }

  // C. Settings & Company Policy Modal
  const modalSettings = document.getElementById('modal-company-settings');
  const navHrSettings = document.getElementById('nav-hr-settings');
  const btnCloseSettingsModal = document.getElementById('btn-close-settings-modal');
  const btnCancelSettings = document.getElementById('btn-cancel-settings');
  const formCompanySettings = document.getElementById('form-company-settings');

  function openSettingsModal(e) {
    if (e) e.preventDefault();
    sound.playPop(700, 0.06);
    if (modalSettings) {
      modalSettings.showModal();
    } else {
      window.location.href = 'dashboard.html';
    }
  }

  if (navHrSettings) navHrSettings.addEventListener('click', openSettingsModal);
  if (btnCloseSettingsModal) btnCloseSettingsModal.addEventListener('click', () => modalSettings && modalSettings.close());
  if (btnCancelSettings) btnCancelSettings.addEventListener('click', () => modalSettings && modalSettings.close());

  if (formCompanySettings) {
    formCompanySettings.addEventListener('submit', (e) => {
      e.preventDefault();
      sound.playSuccess();
      const compName = document.getElementById('set-company-name').value.trim() || 'Nexus Technologies Corp';
      localStorage.setItem('nexus_company_name', compName);
      if (modalSettings) modalSettings.close();
      showToast('✓ Organization policy & system rules updated successfully!', 'success');
    });
  }

  // D. Native Backdrop Dismissal for Dialog Modals
  document.querySelectorAll('dialog.modal-dialog').forEach(dlg => {
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg) {
        sound.playPop(500, 0.05);
        dlg.close();
      }
    });
  });
}

// Utility Helper
function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

// ==========================================================================
// 6. Theme Toggle (All Pages)
// ==========================================================================
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIconSun = document.getElementById('theme-icon-sun');
  const themeIconMoon = document.getElementById('theme-icon-moon');

  const savedTheme = localStorage.getItem('neu_theme') || 'light';
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      sound.playPop(650);
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'light' ? 'dark' : 'light';
      applyTheme(nextTheme);
      showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Soft UI`, 'info');
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('neu_theme', theme);
    if (themeIconSun && themeIconMoon) {
      themeIconSun.classList.toggle('hidden', theme === 'dark');
      themeIconMoon.classList.toggle('hidden', theme !== 'dark');
    }
  }
}

// ==========================================================================
// 7. Bootstrap
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Brand / Logo click navigation and tactile response (Role-Aware 1000 IQ Smart Router)
  document.querySelectorAll('.dash-brand, #brand-home-link').forEach(el => {
    el.addEventListener('click', (e) => {
      if (typeof sound !== 'undefined' && sound.playPop) {
        sound.playPop(720);
      }
      const role = localStorage.getItem('auth_user_role');
      let homePage = 'dashboard.html';
      if (role === 'EMPLOYEE') {
        homePage = 'employee-dashboard.html';
      } else if (!role) {
        homePage = 'index.html';
      }

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';

      if (currentPath === homePage || (currentPath === 'employee.html' && homePage === 'employee-dashboard.html')) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        e.preventDefault();
        window.location.href = homePage;
      }
    });
  });

  if (document.getElementById('auth-card')) {
    initAuthPage();
  }

  if (document.getElementById('forgot-card')) {
    initForgotPasswordPage();
  }

  if (document.getElementById('dash-header')) {
    initDashboardPage();
  }
});
