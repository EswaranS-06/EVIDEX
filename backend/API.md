# API Documentation

## API LIST

|Methode|API URL|Redirect|
|---------|-----------------------------------|-----------|
|`POST`|`/api/owasp/categories/`|[More Info](#-create-category)|
|`GET`|`/api/owasp/categories/`|[More Info](#-list-categories)|
|`PATCH`|`/api/owasp/categories/{category_id}/`|[Soon...]()|
|`DELETE`|`api/owasp/categories/{category_id}/`|[Soon...]()|
|`POST`|`/api/owasp/vulnerabilities/`|[More Info](#-create-vulnerability)|
|`GET`|`/api/owasp/vulnerabilities/`|[More Info](#-list-vulnerabilities)|
|`GET`|`/api/owasp/vulnerabilities/?category_id=1`|[Soon...]()|
|`POST`|`/api/owasp/variants/`|[More Info](#-create-variant)|
|`GET`|`/api/owasp/variants/?vulnerability_id=3`|[Soon...]()|
|`POST`|`/api/vulnerability-definitions/`|[More Info](#-create-vulnerability-definition)|
|`GET`|`/api/vulnerability-definitions/`|[More Info](#-list-definitions)|
|`GET`|`/api/vulnerability-definitions/?source=OWASP`|[Soon...]()|
|`GET`|`/api/vulnerability-definitions/?source=CVE`|[Soon...]()|
|`POST`|`/api/reports/`|[More Info](#-create-report)|
|`GET`|`/api/reports/`|[Soon...]()|
|`GET`|`/api/reports/{report_id}/`|[Soon...]()|
|`PATCH`|`/api/reports/{report_id}/`|[Soon...]()|
|`DELETE`|`/api/reports/{report_id}/`|[Soon...]()|
|`POST`|`/api/reports/{report_id}/findings/`|[More Info](#-add-finding-to-report)|
|`GET`|`/api/reports/{report_id}/findings/`|[More Info](#-list-findings-in-report)|
|`PATCH`|`/api/report-findings/{finding_id}/`|[More Info](#-edit-finding-override)|
|`DELETE`|`/api/report-findings/{finding_id}/`|[Soon...]()|
|`POST`|`/api/report-findings/{finding_id}/evidence/`|[More Info](#-add-evidence)|
|`GET`|`/api/report-findings/{finding_id}/evidence/`|[More Info](#-list-evidence)|
|`PATCH`|`/api/evidence/{evidence_id}/`|[More Info](#-update--delete-evidence)|
|`DELETE`|`/api/evidence/{evidence_id}/`|[Soon...]()|
|`GET`|`/api/reports/{report_id}/preview/`|[More Info](#-preview-api--single-source-of-truth)|
|`POST`|`/api/reports/{report_id}/export/pdf/`|[More Info](#1️⃣-export-as-pdf)|
|`POST`|`/api/reports/{report_id}/export/docx/`|[More Info](#2️⃣-export-as-word-docx)|
|`POST`|`/api/auth/login/`|[More Info](#1️⃣-login)|
|`POST`|`/api/auth/refresh/`|[More Info](#2️⃣-refresh-token)|
|`POST`|`/api/auth/logout/`|[More Info](#3️⃣-logout-optional)|

### 🔷 MODULE 1: OWASP / KNOWLEDGE BASE APIs

These APIs define WHAT vulnerabilities exist in the world
They are NOT tied to any report

#### 1️⃣ OWASP CATEGORY APIs

#### 📌 WHAT THIS REPRESENTS

High-level classification (Injection, Auth, Misconfig)

Used for:

- Grouping vulnerabilities
- Filtering in UI
- Maintaining OWASP structure

#### ➤ CREATE CATEGORY

`POST /api/owasp/categories/`

#### JSON (Request)

```json
{
  "code": "A03:2021",
  "name": "Injection",
  "description": "Injection flaws occur when untrusted data is sent to an interpreter."
}
```

#### FIELD BREAKDOWN

- `code` → OWASP Top 10 code (optional, nullable)
- `name` → Human-readable category
- `description` → Short explanation

#### WHY THIS API EXISTS

- You must add/edit/remove OWASP categories
- OWASP versions change
- You cannot hardcode this

#### ➤ LIST CATEGORIES

`GET /api/owasp/categories/`

#### JSON (Response)

```json
[
  {
    "id": 1,
    "code": "A03:2021",
    "name": "Injection",
    "description": "Injection flaws occur when untrusted data is sent to an interpreter."
  }
]
```

#### ➤ UPDATE / DELETE CATEGORY

```swift
PATCH  /api/owasp/categories/{category_id}/
DELETE /api/owasp/categories/{category_id}/
```

#### 2️⃣ OWASP VULNERABILITY APIs

#### 📌 WHAT THIS REPRESENTS

Actual vulnerability types like:

- SQL Injection
- IDOR
- Command Injection

#### ➤ CREATE VULNERABILITY

`POST /api/owasp/vulnerabilities/`

#### JSON

```json
{
  "category_id": 1,
  "name": "SQL Injection",
  "description": "Improper handling of SQL queries.",
  "default_severity": "High",
  "impact": "Database compromise",
  "remediation": "Use parameterized queries",
  "references": [
    "https://owasp.org/www-community/attacks/SQL_Injection"
  ]
}
```

#### FIELD BREAKDOWN

- category_id → FK to OWASP category
- default_severity → used as default in reports
- impact/remediation → copied into reports

#### WHY THIS API EXISTS

- This is your core vulnerability library
- This avoids copy-paste in reports
- This is reused across all reports

#### ➤ LIST VULNERABILITIES

```swift
GET /api/owasp/vulnerabilities/
GET /api/owasp/vulnerabilities/?category_id=1
```

#### ➤ UPDATE / DELETE

```swift
PATCH  /api/owasp/vulnerabilities/{id}/
DELETE /api/owasp/vulnerabilities/{id}/
```

#### 3️⃣ OWASP VARIANT APIs (SUB-TYPES)

#### 📌 WHAT THIS REPRESENTS

Sub-types like:

- Blind SQL Injection
- Time-based SQL Injection

#### ➤ CREATE VARIANT

`POST /api/owasp/variants/`

#### JSON

```json

{
  "vulnerability_id": 3,
  "name": "Blind SQL Injection",
  "description": "SQL Injection without visible errors"
}
```

#### WHY THIS API EXISTS

- Avoids deep OWASP trees
- Allows optional precision
- Keeps schema simple

#### ➤ LIST VARIANTS

`GET /api/owasp/variants/?vulnerability_id=3`

#### 🔷 MODULE 2: UNIFIED VULNERABILITY DEFINITIONS

##### ⚠️ THIS IS THE MOST IMPORTANT MODULE

This is the **ONLY thing reports will reference**.

It unifies:

- OWASP
- CVE (manual)
- Custom findings

#### 4️⃣ VULNERABILITY DEFINITION APIs

#### 📌 WHAT THIS REPRESENTS

A **selectable vulnerability template**

#### ➤ CREATE VULNERABILITY DEFINITION

`POST /api/vulnerability-definitions/`

#### OWASP-ONLY

```json
{
  "source": "OWASP",
  "owasp_vulnerability_id": 3,
  "owasp_variant_id": 5,
  "title": "Blind SQL Injection",
  "description": "Blind SQL Injection occurs when no errors are returned.",
  "default_severity": "High",
  "impact": "Database data leakage",
  "remediation": "Use prepared statements",
  "cve_id": null
}

OWASP + CVE

{
  "source": "CVE",
  "cve_id": "CVE-2024-12345",
  "owasp_vulnerability_id": 3,
  "title": "SQL Injection in XYZ",
  "default_severity": "Critical",
  "description": "SQLi in XYZ <= 2.3",
  "impact": "Remote code execution",
  "remediation": "Upgrade software"
}

CUSTOM

{
  "source": "CUSTOM",
  "title": "Business Logic Abuse",
  "description": "Password reset abuse",
  "default_severity": "Medium",
  "impact": "Account takeover",
  "remediation": "Add rate limiting"
}
```

#### WHY THIS API EXISTS

- Reports must reference ONE table
- Avoids OWASP/CVE confusion
- Supports manual CVE entry
- Scales to any vuln source

#### ➤ LIST DEFINITIONS

```swift
GET /api/vulnerability-definitions/
GET /api/vulnerability-definitions/?source=OWASP
GET /api/vulnerability-definitions/?source=CVE
```

#### 🔷 MODULE 3: REPORT APIs

#### 5️⃣ REPORT APIs (ENGAGEMENT)

#### 📌 WHAT THIS REPRESENTS

One pentest engagement.

#### ➤ CREATE REPORT

`POST /api/reports/`

```json
{
  "client_name": "Acme Corp",
  "target": "https://app.acme.com",
  "scope": "Web Application",
  "status": "Draft",
  "start_date": "2025-01-01",
  "end_date": "2025-01-05"
}
```

#### ➤ LIST / GET REPORTS

```swift
GET /api/reports/
GET /api/reports/{report_id}/
```

#### ➤ UPDATE / DELETE

```swift
PATCH  /api/reports/{report_id}/
DELETE /api/reports/{report_id}/
```

#### 🔷 MODULE 4: REPORT FINDINGS APIs (CRITICAL)

#### 6️⃣ REPORT FINDINGS

#### 📌 WHAT THIS REPRESENTS

**ONE vulnerability inside ONE report**

This is NOT OWASP
This is NOT CVE
This is an instance

----

#### ➤ ADD FINDING TO REPORT

`POST /api/reports/{report_id}/findings/`

```json
{
  "vulnerability_definition_id": 12,
  "affected_url": "/api/login"
}
```

#### WHAT HAPPENS INTERNALLY

- Copies title, severity, description
- Creates report_finding_id
  
----

#### ➤ LIST FINDINGS IN REPORT

`GET /api/reports/{report_id}/findings/`

```json
[
  {
    "id": 56,
    "title": "SQL Injection",
    "severity": "High",
    "affected_url": "/api/login",
    "status": "Open"
  }
]
```

#### ➤ EDIT FINDING (OVERRIDE)

`PATCH /api/report-findings/{finding_id}/`

```json
{
  "severity": "Critical",
  "impact": "Full database compromise",
  "status": "Open"
}
```

#### ➤ DELETE FINDING

`DELETE /api/report-findings/{finding_id}/`

#### 🔷 MODULE 5: EVIDENCE APIs

#### 7️⃣ EVIDENCE (STEPS + SCREENSHOTS)

#### 📌 WHAT THIS REPRESENTS

- ONE reproduction step
- ONE screenshot
- Belongs to ONE finding

#### ➤ ADD EVIDENCE

`POST /api/report-findings/{finding_id}/evidence/`

```json
{
  "step_no": 1,
  "instruction": "Intercept request and inject payload",
  "screenshot": "<file>"
}
```

#### ➤ LIST EVIDENCE

`GET /api/report-findings/{finding_id}/evidence/`

```json
[
  {
    "id": 9,
    "step_no": 1,
    "instruction": "Intercept request",
    "screenshot_url": "/media/evidence/9.png"
  }
]
```

#### ➤ UPDATE / DELETE EVIDENCE

````swift
PATCH  /api/evidence/{evidence_id}/
DELETE /api/evidence/{evidence_id}/
````

#### 🔷 PART 1: REPORT PREVIEW API (MOST IMPORTANT)

#### 🧠 FIRST: WHAT “PREVIEW” REALLY MEANS

You already understood this correctly, but let’s formalize it.
- Preview is NOT a PDF
- Preview is a structured representation of the final report
- PDF / DOCX are just rendered outputs of the same structure.
- the preview API returns:

  - Headings
  - Sections
  - Findings
  - Evidence
  - Order
  - Formatting hierarchy (logical, not CSS)

Frontend will:

- Render it as HTML
- Make it look like the final report

#### ✅ PREVIEW API – SINGLE SOURCE OF TRUTH

#### ➤ Endpoint

`GET /api/reports/{report_id}/preview/`

#### ➤ WHY THIS API EXISTS

- Validate report before export
- Ensure no missing data
- Reuse same data for PDF & DOCX
- Avoid duplicate logic

This API is read-only.

#### 🧱 PREVIEW RESPONSE STRUCTURE (VERY IMPORTANT)

**This JSON is export-ready.**

#### ➤ Example Response

````json
{
  "report": {
    "id": 21,
    "client_name": "Acme Corp",
    "target": "https://app.acme.com",
    "scope": "Web Application",
    "start_date": "2025-01-01",
    "end_date": "2025-01-05",
    "status": "Draft"
  },

  "summary": {
    "total_findings": 3,
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 0
  },

  "findings": [
    {
      "order": 1,
      "title": "SQL Injection",
      "severity": "Critical",
      "affected_url": "/api/login",
      "description": "SQL Injection occurs due to improper input validation.",
      "impact": "Full database compromise",
      "remediation": "Use prepared statements",

      "evidence": [
        {
          "step_no": 1,
          "instruction": "Intercept login request",
          "screenshot_url": "/media/evidence/1.png"
        },
        {
          "step_no": 2,
          "instruction": "Inject payload and observe delay",
          "screenshot_url": "/media/evidence/2.png"
        }
      ]
    },

    {
      "order": 2,
      "title": "IDOR",
      "severity": "High",
      "affected_url": "/api/users/123",
      "description": "IDOR allows unauthorized access to objects.",
      "impact": "Sensitive data disclosure",
      "remediation": "Implement authorization checks",

      "evidence": [
        {
          "step_no": 1,
          "instruction": "Modify user ID in request",
          "screenshot_url": "/media/evidence/3.png"
        }
      ]
    }
  ]
}
````

#### 🔍 WHY THIS STRUCTURE IS PERFECT

- Frontend preview → render this JSON
- PDF generator → read same JSON
- DOCX generator → read same JSON
- No duplication
- No re-querying DB

This is exactly how professional tools work.

#### 🔷 PART 2: EXPORT APIs (PDF & WORD)

#### 🧠 IMPORTANT RULE

> Export APIs DO NOT fetch data themselves
> They consume the same preview builder internally

So:

````mathematica
Preview Builder → JSON
PDF Export → JSON → PDF
DOCX Export → JSON → DOCX
````

#### 1️⃣ EXPORT AS PDF

#### ➤ Endpoint

``POST /api/reports/{report_id}/export/pdf/``

#### ➤ WHAT IT DOES

- Calls preview logic internally
- Renders HTML template
- Converts HTML → PDF
- Returns file

##### ➤ Response

````http
Content-Type: application/pdf
Content-Disposition: attachment; filename="Acme_Report.pdf"
````

#### 2️⃣ EXPORT AS WORD (DOCX)

#### ➤ Endpoint

`POST /api/reports/{report_id}/export/docx/`

#### ➤ WHAT IT DOES

- Calls preview logic
- Uses DOCX template
- Injects data
- Returns .docx

#### ➤ Response

````http
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="Acme_Report.docx"
````

### 🧠 WHY EXPORT IS POST (NOT GET)

Because:

- It triggers a processing action
- May take time
- May log export history later
- Cleaner REST semantics

#### 🔒 EXPORT VALIDATION (VERY IMPORTANT)

Before exporting, backend should validate:

- At least one finding exists
- Each finding has description & remediation
- Severity is set
- Evidence exists (optional but recommended)

If invalid:

````json
{
  "error": "Report is incomplete",
  "missing": ["Finding 2 has no evidence"]
}
````

#### 🔷 PART 3: AUTHENTICATION & AUTHORIZATION (JWT / OAUTH)

Now let’s design this cleanly, without breaking existing APIs.
#### 🧠 AUTH STRATEGY (RECOMMENDED)

**Phase 1 (Simple & Enough)**

> ✅ JWT Authentication

**Phase 2 (Later)**

> ➕ OAuth (Google, GitHub, Company SSO)

Your APIs will not change — only auth layer added.
🔐 AUTH APIs (JWT)
#### 1️⃣ Login

`POST /api/auth/login/`

````json
{
  "email": "user@company.com",
  "password": "password123"
}
````

##### Response

````json
{
  "access": "JWT_ACCESS_TOKEN",
  "refresh": "JWT_REFRESH_TOKEN"
}
````

#### 2️⃣ Refresh Token

`POST /api/auth/refresh/`

````json
{
  "refresh": "JWT_REFRESH_TOKEN"
}
````

#### 3️⃣ Logout (optional)

`POST /api/auth/logout/`

#### 🔐 USING JWT IN ALL APIs

Frontend sends:

````http
Authorization: Bearer <ACCESS_TOKEN>
````

Backend:

- Decodes JWT
- Identifies user
- Applies permissions

#### 🔑 AUTHORIZATION (WHO CAN DO WHAT)

#### USER ROLES (SIMPLE & REALISTIC)

````ngnix
Admin
Pentester
Viewer
````

### PERMISSION MAPPING

|Action|Admin|Pentester|Viewer|
|------|------|---------|------|
|Create Vulnerabilities|✅|❌|❌|
|Edit Knowledge Base|✅|❌|❌|
|Create Reports|✅|✅|❌|
|Edit Findings|✅|✅|❌|
|Export PDF / DOCX|✅|✅|👀|
|Delete Reports|✅|❌|❌|
