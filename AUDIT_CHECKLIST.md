# NexusEMS • Comprehensive QA Audit & Bug Tracking Checklist

## 1. System Inventory & Page Matrix

| Page / Route | Primary Role | Purpose / Major Features | Status |
| :--- | :--- | :--- | :--- |
| `index.html` | All Roles | Authentication, role detection, OTP reset link, password toggle | Verified & Passed ✓ |
| `forgot-password.html` | All Roles | OTP digit inputs, countdown timer, code verification | Verified & Passed ✓ |
| `dashboard.html` | HR / Admin / Manager | Executive overview, KPI cards, staff directory, memos, quick nav | Verified & Passed ✓ |
| `employees.html` | HR / Admin | Dedicated staff directory, CRUD, add modal, department filters, export | Verified & Passed ✓ |
| `employee-dashboard.html` | Employee | Punch clock, 4 personal KPIs, sprint checklist, my leaves, payslips | Verified & Passed ✓ |
| `employee.html` | Employee | Standalone alias for employee dashboard | Verified & Passed ✓ |
| `attendance.html` | All Roles | Shift log, check-in/out records, punctuality ratings, monthly hours | Verified & Passed ✓ |
| `leave-approvals.html` | HR / Manager | Leave application review center, approval/rejection, quota status | Verified & Passed ✓ |
| `payroll.html` | HR (Manager Blocked) | Compensation engine, salary adjustments, verified printable payslip modal | Verified & Passed ✓ |
| `appraisals.html` | HR / Manager | Circular performance graph, goal scorecards, tier badges, appraisal adjustments | Verified & Passed ✓ |
| `careers.html` | Public | Open vacancies, candidate application form, CV/Resume upload | Verified & Passed ✓ |

---

## 2. Page-by-Page Audit Findings & Defect Log

### Defect 1: `<dialog.modal-dialog>` Browser Default Border & Padding Artifact
- **Affected Pages**: `dashboard.html`, `employees.html`, `payroll.html`, `appraisals.html`, `careers.html`, `employee-dashboard.html`.
- **Severity**: High (Visual & Layout Quality)
- **Root Cause**: Browsers apply native default user-agent styles (`border: solid; padding: 1em;`) to `<dialog>` elements, creating a harsh black border and offset container around Neumorphic modal cards.
- **Fix Applied**: Added targeted CSS reset for `dialog.modal-dialog` in `style.css` (`border: none; background: transparent; padding: 0; outline: none; margin: auto;`) with soft-blurred backdrop (`backdrop-filter: blur(4px)`).
- **Retest Status**: Verified & Passed ✓.

### Defect 2: Missing Backdrop Click Dismissal for Modals
- **Affected Pages**: All pages featuring modal dialogs (`modal-add-employee`, `modal-emp-profile`, `modal-payslip-view`, `modal-appraisal-adjust`, etc.).
- **Severity**: Medium (UX / Usability)
- **Root Cause**: Native HTML5 `<dialog>` does not auto-dismiss when clicking on the blurred backdrop outside the dialog card.
- **Fix Applied**: Added event delegation listener in `script.js` to detect `e.target === dlg` and gracefully close the dialog with sound feedback.
- **Retest Status**: Verified & Passed ✓.

### Defect 3: `employees.html` Top Metric Card `#kpi-total-staff-val` Stagnant on CRUD
- **Affected Pages**: `employees.html`.
- **Severity**: Medium (Data Consistency)
- **Root Cause**: `script.js` only targeted `#kpi-total-emp` (from `dashboard.html`) and did not update `#kpi-total-staff-val` (from `employees.html`) during additions or deletions.
- **Fix Applied**: Updated `renderEmployeeTable()` and `updateDashboardKpis()` in `script.js` to target and refresh `#kpi-total-staff-val` with `${employees.length} Employees`.
- **Retest Status**: Verified & Passed ✓.

### Defect 4: Leave Application Form Lacked Frontend Date-Range Validation
- **Affected Pages**: `leave-approvals.html`, `employee-dashboard.html`.
- **Severity**: High (Data Validation & Business Logic)
- **Root Cause**: Frontend leave form permitted submission when end date was earlier than start date, causing avoidable round-trips or illogical date records.
- **Fix Applied**: Added validation guard in `script.js` under `#form-emp-apply-leave` (`new Date(start) > new Date(end)`) displaying an instant informative toast and preventing invalid submissions.
- **Retest Status**: Verified & Passed ✓.

### Defect 5: Manager Role Data Isolation on Attendance & Appraisal Rosters
- **Affected Pages**: `attendance.html`, `appraisals.html`.
- **Severity**: Critical (Role-Based Authorization & Privacy)
- **Root Cause**: `renderHrAttendanceTable()` and `renderHrAppraisalTable()` listed company-wide staff records even when a departmental Manager was logged in.
- **Fix Applied**: In `script.js`, scoped `displayEmployees` and `displayAppraiseEmployees` to the Manager's department (`emp.dept === mgrDept`) when `authRole === 'MANAGER'`, enforcing team boundaries and Manager salary blindness.
- **Retest Status**: Verified & Passed ✓.

---

## 3. Automated Test Suite Results (`tests/runner.js`)

All 14 core business rules and security policies verified:
- [PASS] ✓ Rule 1: Role scoping enforces HR, Manager, and Employee access boundaries
- [PASS] ✓ Rule 2: Managers cannot access salary or payroll records (API & Model)
- [PASS] ✓ Rule 3: Employees cannot view other employees records or payslips
- [PASS] ✓ Rule 4: Duplicate check-ins and invalid check-outs are strictly rejected
- [PASS] ✓ Rule 5: Leave date ranges and overlapping applications are validated
- [PASS] ✓ Rule 6: Permanent increments update basic salary starting from effective date
- [PASS] ✓ Rule 7: One-time bonuses & deductions are isolated to specific payroll periods
- [PASS] ✓ Rule 8: Permanent increment modifies basic salary without doubling as standalone item
- [PASS] ✓ Rule 9: Re-generating payroll cycle preserves idempotency without duplicate records
- [PASS] ✓ Rule 10: Finalized historical payslips do not alter when current employee salary changes
- [PASS] ✓ Rule 11: Unauthorized users (Employees & Managers) cannot approve payroll
- [PASS] ✓ Rule 12: Job applications validate required fields and protect uploaded documents
- [PASS] ✓ Rule 13: Empty datasets show clean zero/empty state without fake default numbers
- [PASS] ✓ Rule 14: Core pages include responsive viewport metadata and CSS design lock

**Summary**: 14 PASSED, 0 FAILED.
