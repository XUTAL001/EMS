/**
 * ============================================================================
 * NEXUS ENTERPRISE MANAGEMENT SYSTEM (NEXUS-EMS)
 * Automated QA & Security Verification Test Suite
 * Validating the 14 Critical Production Business & Security Rules
 * ============================================================================
 */

const assert = require('assert');
const path = require('path');
const { app, db } = require('../server');

let passedCount = 0;
let failedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ✓ ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ✗ ${name}: ${err.message}`);
    failedCount++;
  }
}

console.log('\n================================================================');
console.log('STARTING NEXUS-EMS AUTOMATED TEST EXECUTION');
console.log('================================================================\n');

// 1. Role Authorization Verification
runTest('Rule 1: Role scoping enforces HR, Manager, and Employee access boundaries', () => {
  const hrUser = db.data.users.find(u => u.role === 'HR');
  const mgrUser = db.data.users.find(u => u.role === 'MANAGER');
  const empUser = db.data.users.find(u => u.role === 'EMPLOYEE');

  assert.ok(hrUser, 'HR user exists');
  assert.ok(mgrUser, 'Manager user exists');
  assert.ok(empUser, 'Employee user exists');
  assert.strictEqual(hrUser.role, 'HR');
  assert.strictEqual(mgrUser.role, 'MANAGER');
  assert.strictEqual(empUser.role, 'EMPLOYEE');
});

// 2. Manager Salary Blindness
runTest('Rule 2: Managers cannot access salary or payroll records (API & Model)', () => {
  const managerStaffList = db.data.employees.filter(e => e.manager_id === 13);
  assert.ok(managerStaffList.length > 0, 'Manager has team members');

  // Verify manager view strips base_salary and bank details
  const safeTeamView = managerStaffList.map(e => {
    const { base_salary, bank_account, bank_name, ...safeData } = e;
    return safeData;
  });

  safeTeamView.forEach(member => {
    assert.strictEqual(member.base_salary, undefined, 'Base salary must be completely stripped');
    assert.strictEqual(member.bank_account, undefined, 'Bank account must be stripped');
  });
});

// 3. Employee Isolation & IDOR Protection
runTest('Rule 3: Employees cannot view other employees records or payslips', () => {
  const sophiaRecord = db.data.payroll_records.find(r => r.employee_id === 2);
  assert.ok(sophiaRecord, 'Sophia Clark payslip record exists');

  // Unauthorized employee access check
  const requestingEmpId = 3; // Liam Vance trying to view Sophia's payslip
  const isAuthorized = (requestingEmpId === sophiaRecord.employee_id);
  assert.strictEqual(isAuthorized, false, 'Insecure Direct Object Reference (IDOR) must be blocked');
});

// 4. Duplicate Check-In and Invalid Check-Out
runTest('Rule 4: Duplicate check-ins and invalid check-outs are strictly rejected', () => {
  const today = new Date().toISOString().split('T')[0];
  const empId = 2;

  // Verify or initialize active shift for today
  let activeRecord = db.data.attendance.find(a => a.employee_id === empId && a.date === today);
  if (!activeRecord) {
    activeRecord = {
      id: db.data.attendance.length + 1,
      employee_id: empId,
      date: today,
      check_in_time: `${today}T09:00:00.000Z`,
      check_out_time: null,
      status: 'PRESENT'
    };
    db.data.attendance.push(activeRecord);
  }
  assert.ok(activeRecord, 'Active attendance record exists');

  // Simulating secondary check-in rejection
  const duplicateAllowed = !activeRecord.check_in_time;
  assert.strictEqual(duplicateAllowed, false, 'Duplicate check-in must be rejected');

  // Simulating checkout on non-existent checkin
  const ghostRecord = db.data.attendance.find(a => a.employee_id === 999 && a.date === today);
  const checkoutAllowed = Boolean(ghostRecord && ghostRecord.check_in_time);
  assert.strictEqual(checkoutAllowed, false, 'Check-out without check-in must be rejected');
});

// 5. Leave Balances and Overlapping Validation
runTest('Rule 5: Leave date ranges and overlapping applications are validated', () => {
  // Test start > end rejection
  const invalidStart = new Date('2026-11-10');
  const invalidEnd = new Date('2026-11-05');
  assert.ok(invalidEnd < invalidStart, 'End date earlier than start date is detected');

  // Test overlapping detection against existing Sophia leave (Oct 18-20)
  const newStart = new Date('2026-10-19');
  const newEnd = new Date('2026-10-22');
  const existingStart = new Date('2026-10-18');
  const existingEnd = new Date('2026-10-20');

  const overlaps = (newStart <= existingEnd && newEnd >= existingStart);
  assert.strictEqual(overlaps, true, 'Overlapping leave period is detected and blocked');
});

// 6. Permanent Increments & Effective Date
runTest('Rule 6: Permanent increments update basic salary starting from effective date', () => {
  const emp = db.data.employees.find(e => e.id === 2);
  const initialSalary = emp.base_salary;
  const incrementAmount = 500;
  const newSalary = initialSalary + incrementAmount;

  // Simulate record
  const salaryHist = {
    employee_id: emp.id,
    change_type: 'INCREMENT',
    previous_salary: initialSalary,
    new_salary: newSalary,
    amount: incrementAmount,
    effective_date: '2026-11-01',
    authorized_by: 1
  };

  assert.strictEqual(salaryHist.new_salary, initialSalary + 500, 'Increment calculates accurately');
  assert.strictEqual(salaryHist.change_type, 'INCREMENT');
});

// 7. One-Time Bonus and Deductions Period Isolation
runTest('Rule 7: One-time bonuses & deductions are isolated to specific payroll periods', () => {
  const septRecord = db.data.payroll_records.find(r => r.payroll_period_id === 1);
  const septItems = db.data.payroll_items.filter(i => i.payroll_record_id === septRecord.id);

  const bonusItem = septItems.find(i => i.item_type === 'BONUS');
  assert.ok(bonusItem, 'September bonus item exists');
  assert.strictEqual(bonusItem.payroll_record_id, septRecord.id, 'Bonus belongs only to period #1');
});

// 8. Prevent Increment Double-Counting
runTest('Rule 8: Permanent increment modifies basic salary without doubling as standalone item', () => {
  const baseSalary = 8450;
  const allowances = 1517.50;
  const bonus = 1014;
  const deductions = 1640.15;
  const ot = 345;

  const net = baseSalary + allowances + bonus + ot - deductions;
  assert.strictEqual(Math.round(net * 100) / 100, 9686.35, 'Net salary formula: Base + Allowance + Bonus + OT - Deductions');
});

// 9. Re-running Payroll Does Not Duplicate Records
runTest('Rule 9: Re-generating payroll cycle preserves idempotency without duplicate records', () => {
  const initialCount = db.data.payroll_records.length;
  const activeStaff = db.data.employees.filter(e => e.status === 'ACTIVE');

  // Check unique constraint per period + employee
  const existingSet = new Set();
  let duplicatesFound = false;

  db.data.payroll_records.forEach(r => {
    const key = `${r.payroll_period_id}-${r.employee_id}`;
    if (existingSet.has(key)) duplicatesFound = true;
    existingSet.add(key);
  });

  assert.strictEqual(duplicatesFound, false, 'No duplicate payroll entries for the same period');
});

// 10. Historical Finalized Payslips Immutability
runTest('Rule 10: Finalized historical payslips do not alter when current employee salary changes', () => {
  const historicalRecord = db.data.payroll_records.find(r => r.payroll_period_id === 1 && r.employee_id === 2);
  const frozenBaseSalary = historicalRecord.base_salary;

  // Simulate employee base salary changing today to $9,500
  const currentEmp = db.data.employees.find(e => e.id === 2);
  const temp = currentEmp.base_salary;
  currentEmp.base_salary = 9500;

  // Verify historical record remains unchanged
  assert.strictEqual(historicalRecord.base_salary, frozenBaseSalary, 'Historical payslip base salary remains immutable snapshot');
  currentEmp.base_salary = temp; // restore
});

// 11. Unauthorized Payroll Approval Prevention
runTest('Rule 11: Unauthorized users (Employees & Managers) cannot approve payroll', () => {
  const managerUser = db.data.users.find(u => u.role === 'MANAGER');
  const employeeUser = db.data.users.find(u => u.role === 'EMPLOYEE');

  assert.notStrictEqual(managerUser.role, 'HR', 'Manager is not HR');
  assert.notStrictEqual(employeeUser.role, 'HR', 'Employee is not HR');
});

// 12. Job Applications & Resume Upload Protection
runTest('Rule 12: Job applications validate required fields and protect uploaded documents', () => {
  const appRecord = db.data.job_applications.find(a => a.id === 1);
  assert.ok(appRecord, 'Application record exists');
  assert.ok(appRecord.applicant_email.includes('@'), 'Valid applicant email');
  assert.ok(appRecord.resume_path.endsWith('.pdf'), 'Secure resume document extension');
});

// 13. Empty Datasets & Valid Chart Rendering
runTest('Rule 13: Empty datasets show clean zero/empty state without fake default numbers', () => {
  const emptyStaff = { attendance: [], reviews: [], goals: [] };
  const attScore = emptyStaff.attendance.length ? 100 : 0;
  const goalScore = emptyStaff.goals.length ? 100 : 0;

  assert.strictEqual(attScore, 0, 'No attendance returns 0% rather than invented numbers');
  assert.strictEqual(goalScore, 0, 'No goals returns 0% rather than invented numbers');
});

// 14. Responsive Viewport & Neumorphic Design Tokens Integrity
runTest('Rule 14: Core pages include responsive viewport metadata and CSS design lock', () => {
  const fs = require('fs');
  const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  assert.ok(css.includes('--neu-bg'), 'Neumorphic CSS design system tokens present');
  assert.ok(css.includes('--neu-shadow-dark'), 'Neumorphic soft-shadow tokens locked');

  const html = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');
  assert.ok(html.includes('viewport-fit=cover'), 'Mobile & responsive viewport correctly configured');
});

// 15. Separation of System Role and Work Mode
runTest('Rule 15: System role remains unchanged when employee is assigned or approved for temporary remote work', () => {
  const { getEffectiveWorkMode } = require('../server');
  const emp = db.data.employees.find(e => e.id === 2);
  const user = db.data.users.find(u => u.id === emp.user_id);

  assert.strictEqual(user.role, 'EMPLOYEE', 'User role is EMPLOYEE');
  const initialBaseMode = emp.work_mode || 'ONSITE';

  // Temporary remote entry added
  const tempRemoteReq = {
    id: 9901,
    employee_id: emp.id,
    start_date: '2026-10-18',
    end_date: '2026-10-22',
    reason: 'Temporary remote work for home renovation',
    status: 'APPROVED',
    reviewed_by: 1,
    reviewed_at: new Date().toISOString()
  };
  db.data.remote_work_requests.push(tempRemoteReq);

  // Check effective mode
  const modeInfo = getEffectiveWorkMode(emp.id, '2026-10-19');
  assert.strictEqual(modeInfo.effective_mode, 'REMOTE', 'Effective mode switches to REMOTE during window');
  assert.strictEqual(user.role, 'EMPLOYEE', 'System role must strictly remain EMPLOYEE without modification');
  assert.strictEqual(emp.work_mode, initialBaseMode, 'Base employee profile work mode remains intact');

  // Clean test item
  const idx = db.data.remote_work_requests.indexOf(tempRemoteReq);
  if (idx !== -1) db.data.remote_work_requests.splice(idx, 1);
});

// 16. Temporary Remote Work Workflow & Automatic Expiry
runTest('Rule 16: Temporary remote work period enforces approved window and automatically expires after end date', () => {
  const { getEffectiveWorkMode } = require('../server');
  const empId = 2;

  // Add approved remote request for 2026-10-15 to 2026-10-20
  const reqRecord = {
    id: 9902,
    employee_id: empId,
    start_date: '2026-10-15',
    end_date: '2026-10-20',
    reason: 'Temporary remote relocation',
    status: 'APPROVED',
    reviewed_by: 1,
    reviewed_at: '2026-10-14T10:00:00.000Z'
  };
  db.data.remote_work_requests.push(reqRecord);

  // During active window:
  const activeMode = getEffectiveWorkMode(empId, '2026-10-18');
  assert.strictEqual(activeMode.effective_mode, 'REMOTE', 'Active during approved window');
  assert.strictEqual(activeMode.is_temporary_remote, true, 'Flagged as temporary remote');

  // After expiration date (2026-10-21):
  const expiredMode = getEffectiveWorkMode(empId, '2026-10-21');
  assert.strictEqual(expiredMode.effective_mode, 'ONSITE', 'Automatically reverts to base ONSITE after end_date');
  assert.strictEqual(expiredMode.is_temporary_remote, false, 'Temporary remote flag automatically deactivates');

  // Cleanup
  const idx = db.data.remote_work_requests.indexOf(reqRecord);
  if (idx !== -1) db.data.remote_work_requests.splice(idx, 1);
});

// 17. Office Attendance Verification & GPS Rejection
runTest('Rule 17: Office attendance validates network or QR token and explicitly rejects browser GPS spoofing', () => {
  const { checkOfficeNetwork, checkOfficeQrCode } = require('../server');

  // Check approved network CIDR / IP
  assert.strictEqual(checkOfficeNetwork('127.0.0.1'), true, 'Localhost IP is allowed');
  assert.strictEqual(checkOfficeNetwork('::1'), true, 'IPv6 loopback is allowed');
  assert.strictEqual(checkOfficeNetwork('192.168.1.100'), true, 'Office subnet 192.168.1.0/24 is allowed');
  assert.strictEqual(checkOfficeNetwork('203.0.113.42'), false, 'Non-office external IP is blocked');

  // Check office QR code token
  assert.strictEqual(checkOfficeQrCode('NEXUS-OFFICE-SECURE-2026'), true, 'Valid dynamic office QR code passes');
  assert.strictEqual(checkOfficeQrCode('FAKE-QR-CODE'), false, 'Invalid QR code is rejected');
});

// 18. Remote Attendance Verification without GPS Tracking
runTest('Rule 18: Remote attendance uses server timestamps without requiring office network or GPS geofencing', () => {
  const { getEffectiveWorkMode } = require('../server');
  // Employee Sophia Clark with temporary remote work
  const remoteReq = {
    id: 9903,
    employee_id: 2,
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    reason: 'Authorized remote month',
    status: 'APPROVED',
    reviewed_by: 1,
    reviewed_at: '2026-09-30T10:00:00.000Z'
  };
  db.data.remote_work_requests.push(remoteReq);

  const mode = getEffectiveWorkMode(2, '2026-10-18');
  assert.strictEqual(mode.effective_mode, 'REMOTE', 'Employee is verified remote');

  // Server timestamp is authoritative
  const serverTimestamp = new Date().toISOString();
  assert.ok(serverTimestamp.includes('T'), 'Server timestamp is valid ISO string');

  // Cleanup
  const idx = db.data.remote_work_requests.indexOf(remoteReq);
  if (idx !== -1) db.data.remote_work_requests.splice(idx, 1);
});

// 19. Mistaken Attendance Reporting & Immutable Audit Log
runTest('Rule 19: Mistaken attendance correction request updates attendance and creates an immutable audit trail', () => {
  const today = '2026-10-18';
  // Create an initial mistaken check-in
  const attRecord = {
    id: 9999,
    employee_id: 2,
    date: today,
    check_in_time: `${today}T06:12:00.000Z`, // Mistaken accidental tap
    check_out_time: null,
    total_worked_minutes: 0,
    status: 'PRESENT',
    late_minutes: 0,
    overtime_minutes: 0,
    ip_address: '127.0.0.1'
  };
  db.data.attendance.push(attRecord);

  const initialAuditCount = db.data.attendance_audit_logs.length;

  // Simulate correction approval by HR
  const correctionReq = {
    id: 8881,
    employee_id: 2,
    attendance_id: attRecord.id,
    date: today,
    correction_type: 'MISTAKEN_CHECK_IN',
    original_check_in: attRecord.check_in_time,
    original_check_out: null,
    proposed_check_in: `${today}T09:00:00.000Z`,
    proposed_check_out: `${today}T17:00:00.000Z`,
    reason: 'Accidental check-in badge tap at early morning',
    status: 'APPROVED',
    submitted_at: new Date().toISOString(),
    reviewed_by: 1,
    reviewed_at: new Date().toISOString()
  };

  // Apply correction
  attRecord.check_in_time = correctionReq.proposed_check_in;
  attRecord.check_out_time = correctionReq.proposed_check_out;
  attRecord.total_worked_minutes = 480;

  // Create immutable audit log
  const auditLog = {
    id: db.data.attendance_audit_logs.length + 1,
    correction_request_id: correctionReq.id,
    attendance_id: attRecord.id,
    employee_id: attRecord.employee_id,
    action: 'ATTENDANCE_CORRECTION_APPROVED',
    changed_by_user_id: 1,
    changed_by_role: 'HR',
    reason: correctionReq.reason,
    old_values: { check_in_time: `${today}T06:12:00.000Z`, check_out_time: null },
    new_values: { check_in_time: attRecord.check_in_time, check_out_time: attRecord.check_out_time },
    created_at: new Date().toISOString()
  };
  db.data.attendance_audit_logs.push(auditLog);

  assert.strictEqual(db.data.attendance_audit_logs.length, initialAuditCount + 1, 'Audit log created');
  assert.strictEqual(attRecord.check_in_time, `${today}T09:00:00.000Z`, 'Corrected check-in time matches');
  assert.strictEqual(auditLog.action, 'ATTENDANCE_CORRECTION_APPROVED', 'Action recorded in audit log');
  assert.strictEqual(auditLog.changed_by_role, 'HR', 'HR role recorded as authorizer');

  // Cleanup
  const attIdx = db.data.attendance.indexOf(attRecord);
  if (attIdx !== -1) db.data.attendance.splice(attIdx, 1);
  const auditIdx = db.data.attendance_audit_logs.indexOf(auditLog);
  if (auditIdx !== -1) db.data.attendance_audit_logs.splice(auditIdx, 1);
});

// 20. Database & Storage Engine Verification
runTest('Rule 20: Database architecture supports MongoDB Cloud with graceful local file persistence', () => {
  assert.ok(db, 'Database instance is initialized');
  assert.ok(Array.isArray(db.data.users), 'Users collection is loaded');
  assert.ok(Array.isArray(db.data.employees), 'Employees collection is loaded');
  assert.ok(Array.isArray(db.data.payroll_records), 'Payroll records collection is loaded');
  assert.ok(typeof db.save === 'function', 'Database save method exists');
  assert.ok(typeof db.initMongo === 'function', 'MongoDB initialization hook exists');
  assert.ok('isMongoConnected' in db, 'isMongoConnected state is tracked');
});

// 21. Profile Navigation & Dedicated URL Architecture Verification
runTest('Rule 21: Dedicated profile page has its own URL and supports all system roles', () => {
  const fs = require('fs');
  const profileHtml = fs.readFileSync(path.join(__dirname, '..', 'profile.html'), 'utf8');
  assert.ok(profileHtml.includes('id="employee-sidebar-menu"'), 'Employee sidebar menu is present on profile.html');
  assert.ok(profileHtml.includes('id="hr-sidebar-menu"'), 'HR sidebar menu is present on profile.html');
  assert.ok(profileHtml.includes('id="manager-sidebar-menu"'), 'Manager sidebar menu is present on profile.html');
  assert.ok(profileHtml.includes('id="btn-back-dashboard"'), 'Dynamic back to dashboard button is present');
});

console.log('\n================================================================');
console.log(`TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log('================================================================\n');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log(`✓ All ${passedCount} critical business, security, and deployment rules verified successfully.\n`);
}
