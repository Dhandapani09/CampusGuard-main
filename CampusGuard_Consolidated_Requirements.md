# CampusGuard - Consolidated Product Requirements Document

This document consolidates the original product requirements with the finalized frontend architecture, styling guidelines, and approved functional addons.

---

## 1. Project Vision
**CampusGuard** is an enterprise-grade, multi-site Visitor Management System (VMS) designed to replace paper visitor logs with a secure, high-speed, AI-enhanced digital workflow.
* **Goal**: Ensure a "Zero-Wait" check-in experience for VIP customers while enforcing strict accountability and automated alerts for employees and contractors.

---

## 2. Technical Stack & Deployment

### 2.1 Core Stack
* **Frontend**: ReactJS + Vite
  * *Build Tool*: Vite (for fast hot-module reloading and optimized production bundles).
  * *Styling Options*: Vanilla CSS (highly modular variables) or Tailwind CSS (for rapid utility-first UI development).
* **Backend (as per V2 PRD specifications)**:
  * *Framework*: FastAPI (Python 3.x, async, high performance).
  * *Database*: PostgreSQL (for relational master data, visitor sessions, and system audit logs).
  * *Storage*: MinIO (Object storage for live visitor photos).
  * *Messaging/Queue*: Kafka & Zookeeper (for async notifications, email alerts, and background jobs).
* **Deployment**: Docker & Docker Compose (Containerized multi-site edge/cloud distribution).

---

## 3. Master Data & Settings Setup

### 3.1 Site & Operations Masters
* **Site Master**: ID, Name (e.g., Plant A), Location, Timezone.
* **Department Master**: Name, Department Head Name, Email ID (Target for automated reporting/alerts).
* **Building/Area Master**: Specific zones (e.g., Server Room, Production Line).
* **Gate Master**: Specific entry/exit points (e.g., Main Gate, VIP Gate).

### 3.2 Visitor Types & Color Coding
The system dynamically styles UI components and badges according to the visitor type:
* **Customer**: **RED BANNER** - VIP path, skip-able photo capture.
* **Vendor/Contractor**: **BLUE BANNER** - Supports multi-entry/long-term passes.
* **General Guest**: **GREEN BANNER** - Standard entry workflow.
* **Temp Employee**: **YELLOW BANNER** - Used for forgotten ID tracking; triggers protocol alerts.

### 3.3 Notification & Global Settings
* **Notification Config**: SMTP (Email), SMS Gateway, WhatsApp Business API.
* **UI Customization**: Company Logo, Dark/Light theme toggle, Multilingual support (English, Tamil, etc.).

---

## 4. Core Gate Interface (Desktop & Tablet)

A single web application with responsive layouts tailored for:
* **Tablet View**: Optimized for touch inputs at security desks.
* **Desktop View**: Optimized for mouse/keyboard inputs and peripheral accessories (e.g., webcam capture, A6 printing).

### 4.1 Entry Workflow
1. **Visitor Info**: Name, Phone, "Coming From" (Organization/City), Purpose of Visit, and Meet With (interactive staff search).
2. **Identity Capture**: Manual entry of ID Type (e.g., Driver's License, Govt ID) and ID Number (no document uploads required).
3. **Asset/Accessory Tracking**: Capture of item descriptions (Laptops, Cameras, Tools) and Serial Numbers.
4. **Logistics**: Vehicle Type and Registration Number capture (if applicable).
5. **Live Photo Capture**: Captured via webcam/tablet; skipped for pre-registered Customers.

### 4.2 Exit Workflow
* Quick check-out interface.
* Security can search by visitor name, phone, or scan the pass QR code to log the exit timestamp.

---

## 5. Security & Reporting

* **Forgotten ID Protocol**: When a Temp Employee badge (Yellow) is generated, the system triggers automatic emails to the Department Head and Security Manager.
* **Anti-Passback Guard**: Prevents duplicate entry flags for active sessions across different gates.
* **Double Dashboard Control**:
  * **Global Dashboard**: Company-wide visitor counts, cross-site blacklists, and historical audit logs.
  * **Local Dashboard**: Site-specific live visitor feed, countdowns for active sessions, and overstay alerts.

---

## 6. AI Features (Simulated on Frontend)

Real-time analysis run dynamically on inputs:
* **Sentiment Analysis**: Evaluates the "Purpose of Visit" text input. Flags aggressive, suspicious, or erratic statements (e.g., "fight", "damage", "protest") to alert security.
* **Intent-Based Routing**: Auto-notifies additional departments (e.g., Maintenance if purpose mentions "repair" or "leak").
* **Predictive Overstay**: Predicts visit duration based on visitor category and purpose, triggering visual warnings if the session goes over the predicted time.
* **Fuzzy Blacklist Matching**: Checks names and phones against a blacklist database, catching minor spelling variations (e.g., "Jhon" vs "John").

---

## 7. Approved Frontend Addons (Must-Haves Included)

To provide a fully complete, interactive prototype, the following features will be built directly into the React frontend:

1. **Live QR Code Scanner Simulator**:
   * Uses webcam stream (or custom sandbox file upload) to scan a pre-registration QR code.
   * Instantly auto-fills check-in details for the visitor.
2. **Dynamic Pass/Badge Builder & Print Preview**:
   * Generates a realistic, visually polished A6 Gate Pass.
   * Displays the pass with the appropriate visitor type color banner, visitor photo, QR code, and check-in timestamp.
   * Includes a styled "Print Pass" modal allowing a print-to-PDF or simulated print receipt.
3. **Emergency Evacuation ("Muster List") Mode**:
   * An emergency "Panic Button" on the Local Dashboard.
   * Compiles an instant roll-call of all currently checked-in visitors, grouped by building/area, with checking-off capabilities for emergency drills.

---

## 8. Backlog Addons (Good-to-Have / Nice-to-Have)

* **Interactive NDA/Agreement Pad**: Touch signature pad for guest agreements.
* **Host Notification Simulator**: Split-screen dashboard simulating a host receiving a Slack/WhatsApp alert and clicking "Approve/Reject".
* **Frictionless Face Match Simulator**: Compares live webcam snap to historical check-ins to suggest automatic auto-filling for returning guests.
* **Interactive SVG Site Map**: Visual layout of the campus showing path routing.
* **Branding Customizer**: Settings page for custom themes, colors, and logos.
