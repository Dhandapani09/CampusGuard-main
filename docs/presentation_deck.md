# CampusGuard VMS - E2E Presentation Deck Outline

This is a companion markdown slide outline for the generated PowerPoint presentation [CampusGuard_Demo.pptx](file:///d:/Source/Gravity/CampusGuard/docs/CampusGuard_Demo.pptx). It outlines E2E technical setups and functional workflows for testing, integrating high-fidelity screenshot assets.

---

## 🖥️ Slide 1: Cover Slide
- **Title**: CAMPUSGUARD
- **Subtitle**: Enterprise Visitor Management System
- **Footer**: E2E Technical & Functional Walkthrough Deck

---

## 🎯 Slide 2: System Vision & Objectives
### Operational Goals
- **Paperless Transition**: Replace manual paper logs with a high-speed digital secure portal.
- **Zero-Wait VIP Entry**: Drive immediate gate activation for pre-registered customers.
- **Asset Accountability**: Track accessories (e.g. Laptops, Mobiles, Cameras) with custom serial numbers.
- **Forgotten ID Tags Protocol**: Automatically email Managers/HR for temporary employee badge entries.
- **Muster Evacuations**: Real-time site active tracking and muster point safety check-offs.

### Key Architecture Principles
- **API & UI Decoupling**: Standalone services containerized and managed via Docker Compose.
- **Master Data Integrity**: Structured facility definitions (Sites, Buildings, Departments).
- **Chronological Auditing**: Capture active session times, checkout remarks, and exits.
- **Async Event Queues**: Parallel SMTP/SMS communication brokers via Kafka.
- **Granular RBAC**: Strict route validations in the frontend and role validation in the backend.

---

## 📊 Slide 3: Visual Showcase - Operational Analytics Dashboard
- **Visual Asset**: `docs/images/dashboard.png`
- **Dashboard Features**:
  - **Real-time Active Counter**: Tracks the head count of visitors currently in the building.
  - **Check-in Rate Graph**: Displays entry flow metrics over the past 24 hours.
  - **Quick Stats Cards**: Highlights pending requests, VIP arrivals, and overstay warnings.
  - **Global Site Selector**: Allows guards and administrators to switch site locations instantly.

---

## ⚙️ Slide 4: System Technical Architecture Stack
### 1. Frontend Shell
- **Core Framework**: ReactJS & Vite.
- **Styling**: Vanilla CSS, modular dark/light variables.
- **Icons**: Lucide React.
- **Global States**: AppContext (user session, theme) & VisitorContext (CRUD operations integration).
- **Interceptor**: Automatically appends user credentials to outbound requests.

### 2. Core Backend API
- **Core Framework**: FastAPI (Python 3.11).
- **Web Server**: Uvicorn ASGI.
- **ORM & DB Engine**: SQLAlchemy with PostgreSQL databases.
- **Validation**: Strict schema definitions using Pydantic.
- **Security**: Custom route authentication dependencies (`require_role`).

### 3. Utilities & Storage
- **Object Storage**: MinIO for storing visitor identity photos.
- **Message Broker**: Kafka and Zookeeper for queuing email alerts.
- **Orchestration**: Docker Compose coordinating database, storage, API, and frontend assets.

---

## 🔐 Slide 5: Role-Based Access Control (RBAC) Matrix
### Administrator (`Admin`)
- **UI Access**: Settings, Global HQ, Reports, and Gate Entry.
- **Configuration Scope**: Customise branding (tagline, company logo), notification thresholds, and create operator accounts.
- **API Permissions**: Unrestricted read/write privileges on all endpoints.

### Security Guard (`Guard`)
- **UI Access**: Gate Entry tabs (Check-in, Return check-in), Gate Exit, Local Feed, and Reports.
- **Restricted**: Settings and Global HQ are hidden.
- **API Permissions**: Allowed check-in activations, master data reads, blacklist queries. Blocked from database user accounts or branding modifications.

### Department Staff (`Host`)
- **UI Access**: Gate Entry Tab 4 (Pre-Register invites) and Reports (View-Only).
- **Restricted**: Blocked from checkins, exits, settings, dashboards. Hidden checkout forms and reprint buttons.
- **API Permissions**: Limited to creating requested invites under their own name, fetching own invites, and master data reads.

---

## 🚪 Slide 6: Gate Entry Check-In & Activation Flows
### New Registrations & Exits
- **Visitor Form**: Capture category, name, phone, host, building location, purpose, and ID number.
- **Accessory Logger**: Renders asset detail inputs for serialised items.
- **Live Webcam Snap**: Directly capture guest snapshot. Bypassed for VIP clients.
- **Pass Renders**: Visual A6 badge pass with category color banner, QR code, and timestamps.
- **Exit logs**: Scan QR pass code to timestamp checkout exits.

### Same-Screen Invite Activation
- **Invite List**: Guards view expected arrivals under Tab 2 (Invites).
- **Verify Click**: Click "Verify & Check In" on an invite.
- **Redirection**: Seamlessly switches to Tab 1 (New Registration) and pre-fills details.
- **Verification Alert**: Displays prominent Indigo verification notification banner.
- **Full Support**: Guard captures photo, inputs ID details, registers accessories, and issues a standard pass.

---

## 📸 Slide 7: Visual Showcase - Gate Entry & Pass Issuance Portal
- **Visual Asset**: `docs/images/checkin.png`
- **Check-In Workflow**:
  - **Dual-Panel Layout**: Forms on the left and digital pass preview with photo capture on the right.
  - **Dynamic Form Prefills**: Automatically fills fields when activating invitations, saving guard processing time.
  - **Digital Badge rendering**: Outputs printable visitor card including QR code and safety instructions.
  - **Accessory Serialized Logging**: Links accessories directly to visitor pass database records.

---

## 👥 Slide 8: Host Employee Portal & Anti-Spoofing
### Host Pre-Registration
- **Arrival Scheduler**: Adds expected arrival date-time when requesting a pass.
- **Locked Host Details**: Automatically defaults the host name field to the Host's profile name.
- **Read-Only Lock**: Renders the Host field input as disabled (read-only) for Host logins to prevent issuing passes on behalf of other employees.

### API Host-Spoofing Intercepts
- **Status Validation**: FastAPI backend checks and rejects creation payloads from Host logins if `status` is anything other than `'REQUESTED'`.
- **Identity Validation**: Cross-checks the request payload `host` value with the database name of the user ID passed in headers. Rejects if they do not match.
- **Boundary Protection**: Blocks malicious API injections.

---

## 📊 Slide 9: Visitor Auditing & Logs Reports
### Filtered View-Only Logs
- **Log Accessibility**: Host role is granted access to the Reports tab.
- **Backend Filter**: Endpoint `/visitors/history` checks user role headers. If role is Host, SQLAlchemy filters visitors to only return matching logs.
- **Frontend Filter**: Multi-layer grid filter matching `item.host === currentUser.name` for absolute data isolation.

### Logs Operations & Reprints
- **Checkout Form Block**: Hides the checkout remarks and confirm button in reports if role is Host.
- **Reprint Pass Block**: Hides the Reprint button in reports details for Hosts.
- **Force Checkout**: Guards can check out active visitors from reports.
- **Pass Reprint**: Guards can reprint active passes. Reprinting checked-out guest passes is disabled.

---

## 🚨 Slide 10: Smart Telemetry & Muster Evacuation
### AI Analytics & Warnings
- **Aggressive Purpose Flags**: Scans visitor purpose text and triggers immediate warnings to guards if suspicious keywords (e.g. fight, protest) are matched.
- **Overstay Telemetry Alerts**: Highlights active visitor sessions in red on feeds, local dashboards, and reports if their stay duration exceeds the `validUpto` time.

### Muster Evacuation (Panic Mode)
- **Local Dashboard Trigger**: Red Panic Button initiates Evacuation Mode.
- **Evac Roll-Call**: Compiles a real-time count of active visitors grouped by building zone.
- **Muster Check-Off**: Guards manually verify safety and check off individuals at assembly points. Exports Muster snapshot PDFs.

---

## 🚒 Slide 11: Visual Showcase - Muster Evacuation Console
- **Visual Asset**: `docs/images/evacuation.png`
- **Muster Protocol**:
  - **Emergency Evacuation Bar**: High-contrast red flashing indicator to announce panic state.
  - **Real-time Roll-Call**: Immediate checklist of all active visitors on-site, grouped by zone.
  - **Live Safety Mark**: Wardens check off visitors at assembly points to mark them as 'Safe'.
  - **Export Muster Log**: Generates instant PDF log files for incident post-mortems.

---

## 🧪 Slide 12: Automated E2E Verification
### Integration Test Scripts
- **Test Suite 1 (`scratch/test_api.py`)**: Tests pre-registrations, expected arrival schedules, same-screen activations with serialised accessories, and settings schemas.
- **Test Suite 2 (`scratch/test_rbac.py`)**: Tests route boundaries by injecting role/id headers.

### RBAC API Boundary Results
- **`GET /api/users` (Host)**: Rejected with `403 Forbidden` (User listing blocked).
- **`GET /api/users` (Admin)**: Allowed with `200 OK`.
- **`POST /api/visitors` (ACTIVE - Host)**: Rejected with `403 Forbidden` (Direct check-in blocked).
- **`POST /api/visitors` (REQUESTED - Host Spoof)**: Rejected with `403 Forbidden` (Host name spoofing blocked).
- **`POST /api/settings/branding` (Guard)**: Rejected with `403 Forbidden` (Branding configuration blocked).
- **`GET /api/visitors/history` (Host)**: Allowed with `200 OK` (Filtered to own hosted guests).
