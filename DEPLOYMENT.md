# NexusEMS • Production Deployment & Architecture Manual

## 1. System Architecture Overview

NexusEMS is a high-performance, modular monolithic Employee Management System engineered for startups and enterprises with 100 or fewer personnel. It enforces strict server-side Role-Based Access Control (RBAC), immutable payroll histories, authoritative attendance logging, and a soft-UI Neumorphic design system.

### Primary Roles & Access Matrix

| Role | Dashboard | Staff Directory | Attendance | Leaves | Salary & Payroll | Performance | Recruitment | Company Settings |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **HR / Super Admin** | Full Company Analytics | Full CRUD | Global History & Policy | Review All | Full Compensation Engine | System Weighted Scoring | Careers & Pipeline | Full Admin Audit |
| **Manager** | Team Summary Only | Direct Reports (No Salary) | Team Attendance | Review Team Requests | **STRICTLY FORBIDDEN (HTTP 403)** | Team Reviews | View Candidate Needs | Restricted |
| **Employee** | Self-Service Overview | Own Profile Only | Personal Punch Clock | Apply & Quota Tracking | Own Authorized Payslips | Own Scorecards & Goals | Public Careers | Read-Only Policy |

---

## 2. Relational Database Design (MySQL 8.0+)

The relational schema is defined in [`database/schema.sql`](file:///d:/Somthing/database/schema.sql) and incorporates 17 normalized entities:

1. `users`: Credentials, password hashes (`bcrypt`), high-level roles (`HR`, `MANAGER`, `EMPLOYEE`), and session tokens.
2. `departments`: Functional units (`Engineering`, `Product`, `Marketing`, `HR`, `Finance`) with manager foreign keys.
3. `employees`: Master employee records linked to `user_id`, `department_id`, and `manager_id`.
4. `employee_salary_history`: Tamper-evident ledger of permanent increments and reductions with effective dates and authorizers.
5. `attendance`: Server-authoritative daily check-in and check-out logs with late calculation and overtime tracking.
6. `leave_types`: Configurable categories (`Annual`, `Casual`, `Medical`, `Parental`, `Unpaid`) with annual quotas.
7. `leave_requests`: Employee leave requests with date range overlap validation and approval workflows.
8. `payroll_periods`: Monthly cycles (`Draft` → `Reviewed` → `Approved` → `Paid`).
9. `payroll_records`: Immutable per-employee financial snapshots (`base_salary`, `total_allowances`, `total_bonuses`, `total_deductions`, `overtime_pay`, `net_salary`).
10. `payroll_items`: Itemized allowances, one-time bonuses (Eid, Performance), and specific deductions.
11. `performance_goals`: Weighted deliverables with target completion dates and status.
12. `performance_reviews`: Multi-dimensional reviews (Attendance 25%, Goals 50%, Manager Score 25%) with tier ratings.
13. `job_openings`: Career vacancies published to public talent portal.
14. `job_applications`: Candidate pipeline (`Applied` → `Shortlisted` → `Interview` → `Selected`/`Rejected`) with CV upload.
15. `notifications`: In-app event alerts for leave approvals, payroll disbursements, and reviews.
16. `audit_logs`: Tamper-evident administrative audit trail with IP address and JSON delta.
17. `company_settings`: Configurable enterprise policies (grace period, shift hours, appraisal weights).

---

## 3. Environment Inspection & Local Execution

### Environment Status
- **Node.js**: `v24.21.0` (Active on workstation)
- **npm**: `v11.19.0` (Active on workstation)
- **PHP / MySQL**: Not present in host PATH; fully supported via provided [`database/schema.sql`](file:///d:/Somthing/database/schema.sql) and [`docker-compose.yml`](file:///d:/Somthing/docker-compose.yml).

### Starting the Live Server
```bash
# Install dependencies
npm install

# Run automated verification tests
npm test

# Start the full-stack server on port 8080
npm start
```

### Accessing the Live System
- **HR Portal & Super Admin**: [http://localhost:8080/dashboard.html](http://localhost:8080/dashboard.html)
- **Employee Self-Service**: [http://localhost:8080/employee-dashboard.html](http://localhost:8080/employee-dashboard.html)
- **Staff Directory (Dedicated Page)**: [http://localhost:8080/employees.html](http://localhost:8080/employees.html)
- **Attendance & Shift Logs**: [http://localhost:8080/attendance.html](http://localhost:8080/attendance.html)
- **Leave Approvals Center**: [http://localhost:8080/leave-approvals.html](http://localhost:8080/leave-approvals.html)
- **Payroll & Salary Generator**: [http://localhost:8080/payroll.html](http://localhost:8080/payroll.html)
- **Performance & Circular Appraisals**: [http://localhost:8080/appraisals.html](http://localhost:8080/appraisals.html)
- **Public Careers Portal**: [http://localhost:8080/careers.html](http://localhost:8080/careers.html)

### Default Authentication Credentials

| Role | Account Name | Email Address | Password |
| :--- | :--- | :--- | :--- |
| **HR / Super Admin** | Tanvir | `tanviralamshifat2005@gmail.com` | `shifat001` |
| **Team Manager** | Alex Rivera | `alex@company.com` | `manager123` |
| **Employee** | Sophia Clark | `sophia@company.com` | `employee123` |

---

## 4. Production MySQL Setup Instructions

To deploy to a dedicated Linux / Ubuntu production server running MySQL:

```bash
# 1. Connect to MySQL server
mysql -u root -p

# 2. Create the production database and dedicated user
CREATE DATABASE nexus_ems CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'ems_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON nexus_ems.* TO 'ems_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# 3. Import the complete relational schema
mysql -u ems_user -p nexus_ems < database/schema.sql
```

---

## 5. Turnkey Docker Deployment

A production-ready [`docker-compose.yml`](file:///d:/Somthing/docker-compose.yml) is included:

```bash
# Launch both MySQL 8.0 and NexusEMS with automated database initialization
docker-compose up -d

# Verify container health
docker-compose ps
```

---

## 6. QA & Security Verification Results

All 14 critical business and security rules were executed and verified via `npm test`:

```
================================================================
STARTING NEXUS-EMS AUTOMATED TEST EXECUTION
================================================================

[PASS] ✓ Rule 1: Role scoping enforces HR, Manager, and Employee access boundaries
[PASS] ✓ Rule 2: Managers cannot access salary or payroll records (API & Model)
[PASS] ✓ Rule 3: Employees cannot view other employees records or payslips
[PASS] ✓ Rule 4: Duplicate check-ins and invalid check-outs are strictly rejected
[PASS] ✓ Rule 5: Leave date ranges and overlapping applications are validated
[PASS] ✓ Rule 6: Permanent increments update basic salary starting from effective date
[PASS] ✓ Rule 7: One-time bonuses & deductions are isolated to specific payroll periods
[PASS] ✓ Rule 8: Permanent increment modifies basic salary without doubling as standalone item
[PASS] ✓ Rule 9: Re-generating payroll cycle preserves idempotency without duplicate records
[PASS] ✓ Rule 10: Finalized historical payslips do not alter when current employee salary changes
[PASS] ✓ Rule 11: Unauthorized users (Employees & Managers) cannot approve payroll
[PASS] ✓ Rule 12: Job applications validate required fields and protect uploaded documents
[PASS] ✓ Rule 13: Empty datasets show clean zero/empty state without fake default numbers
[PASS] ✓ Rule 14: Core pages include responsive viewport metadata and CSS design lock

================================================================
TEST EXECUTION SUMMARY: 14 PASSED, 0 FAILED
================================================================
✓ All 14 critical business and security rules verified successfully.
```

---

## 7. Production Domain Integration: `ems.tanviralamshifat.me`

### Existing Domain Inspection Findings
- **Apex Domain (`tanviralamshifat.me`)**: Resolves to `216.198.79.1` (Vercel) with HTTP 308 redirecting to `www.tanviralamshifat.me`.
- **Primary Website (`www.tanviralamshifat.me`)**: Active live project (*WUB BloodCare — Students Helping Students*), hosted on **Vercel** with HTTPS.
- **DNS Authority**: **Namecheap BasicDNS** (`dns1.registrar-servers.com`, `dns2.registrar-servers.com`).
- **Mail Setup**: Namecheap Email Forwarding (`eforward*.registrar-servers.com`).
- **Subdomain (`ems.tanviralamshifat.me`)**: Currently unassigned in DNS.

### Strict Non-Disruption Guarantee
> [!IMPORTANT]
> To preserve the main domain and existing *WUB BloodCare* website on Vercel without disruption:
> - **DO NOT** modify or delete the `@` A record (`216.198.79.1`).
> - **DO NOT** modify or delete the `www` CNAME record (`cname.vercel-dns.com`).
> - **DO NOT** change the Namecheap Nameservers.
> - **ONLY** add a new dedicated record for host `ems`.

### Step-by-Step DNS Configuration in Namecheap
1. Log in to your [Namecheap Dashboard](https://ap.www.namecheap.com/).
2. Go to **Domain List** $\rightarrow$ Click **Manage** next to `tanviralamshifat.me`.
3. Select the **Advanced DNS** tab.
4. Under **Host Records**, click **Add New Record**:
   - **Type**: `CNAME Record` (or `A Record` if using a static VPS IP)
   - **Host**: `ems`
   - **Value**: Target hosting address (e.g. `your-service.onrender.com` or your VPS IPv4 address)
   - **TTL**: `Automatic` (or `30 min`)
5. Click the green checkmark (Save Changes).
6. Once saved, SSL certificates will automatically provision for `https://ems.tanviralamshifat.me`.

