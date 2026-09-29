# End-to-End (E2E) Testing Guide - CampusGuard

This document outlines manual step-by-step flows and automated validation scripts to test and verify the operational logic, Role-Based Access Controls (RBAC), and feature additions in the CampusGuard system.

---

## 👥 1. Role-Based Access Control (RBAC) Manual Flows

Testing RBAC requires logging in under three different role contexts to verify navigation, view restriction, and layout permissions.

### Flow A: Administrator User (`Admin`)
The Admin role has full configuration access. Use these steps to configure metadata and seed operator accounts:
1. **Login**: Go to [http://localhost:5173/login](http://localhost:5173/login) and log in with username **`admin`** and password **`admin123`**.
2. **Branding & Dashboard**:
   - Verify the top bar displays `System Administrator` and role `Admin`.
   - Confirm you can see the **Global HQ** and **Settings** sidebar links.
3. **Seeding Users**:
   - Navigate to **Settings** -> **Users & Roles** tab.
   - Observe the **Role Permissions Reference Card** detailing the scopes of each account type.
   - Create a Department Staff member:
     - Username: `jane_host`
     - Full Name: `Jane Host`
     - Password: `password123`
     - Role select: `Department Staff` (Host)
     - Click **Add User**.
   - Create a Security Guard:
     - Username: `guard_terminal_1`
     - Full Name: `Officer Guard`
     - Password: `password123`
     - Role select: `Security Guard` (Guard)
     - Click **Add User**.
4. **Log Out**: Click the **Log Out** button at the bottom of the sidebar.

### Flow B: Department Staff / Host User (`Host`)
The Host role represents internal employees who pre-register guests and audit their own visitor history:
1. **Login**: Log in with username **`jane_host`** and password **`password123`**.
2. **Navigation Restrictions**:
   - Verify the sidebar links are limited to **Gate Entry** and **Reports**.
   - Verify that dashboards (`/dashboard/local`, `/dashboard/global`) and settings (`/settings`) are invisible.
   - Attempt to manually enter `http://localhost:5173/settings` in the URL bar; verify that you are redirected back to `/gate/entry`.
3. **Pre-Registering Invites**:
   - In **Gate Entry**, verify that you only see the **Employee Pre-Registration Invite Portal** tab. The other registration tabs are hidden.
   - Verify that the **Host / Employee Name** field is auto-populated with **`Jane Host`** and is **disabled** (read-only) to prevent host spoofing.
   - Enter guest details (e.g. Visitor: "Alice Green", Phone: "+15550299", Expected Arrival: Tomorrow morning).
   - Click **Generate Pre-Invite**. Copy the generated Pass ID (e.g. `VIS-XXXXXX`) from the success modal.
4. **View-Only Reports**:
   - Go to **Reports**. Verify that *only* visitors hosted by "Jane Host" are visible in the logs table. Visitors created/hosted by other employees are filtered out.
   - Click "Alice Green" to open the details modal. Verify that the **Force Permanent Checkout** form and **Reprint ID Pass** buttons are completely hidden.
5. **Log Out**: Log out of the Host account.

### Flow C: Security Guard User (`Guard`)
The Guard role operates entry terminals, check-outs, returns, and prints badges:
1. **Login**: Log in with username **`guard_terminal_1`** and password **`password123`**.
2. **Navigation Restrictions**:
   - Verify you have access to **Gate Entry**, **Gate Exit**, **Local Feed** (Dashboard), and **Reports**.
   - Verify settings and global command dashboard are hidden.
3. **Activating Pre-Invites (Same-Screen Flow)**:
   - Select **Gate Entry** -> **Pre-Registered Invites** tab.
   - Locate the invite for "Alice Green" (Pass ID generated in Flow B).
   - Click **Verify & Check In**.
   - Observe that you are automatically redirected to the **New Registration** tab on the same screen, with all details pre-filled.
   - Observe the banner at the top showing **"Verifying Invite Pass: VIS-XXXXXX"**.
   - Add accessories (e.g., Laptop, Serial: LPT-5544) and government ID details.
   - Click **Generate Pass**.
   - Verify that the A6 printed pass dialog opens containing a QR code, visitor photo, and check-in time.
4. **Temporary Returns**:
   - Go to **Gate Exit** and check out "Alice Green" temporarily using the **Temporary Exit** button.
   - Go to **Gate Entry** -> **Temporary Returns** tab.
   - Click **Check In / Return** for "Alice Green".
   - Confirm that the return checks in instantly and shows a success alert without opening the print badge dialog.
5. **Reprinting Badge**:
   - Go to **Reports**. Verify you can see all visitors (including Alice Green).
   - Click Alice Green to view details.
   - Since Alice Green is currently active, confirm the **"Reprint ID Pass"** button is visible.
   - Click it, and check that the print preview opens correctly.
6. **Force Checkout**:
   - In the same details modal, enter remarks: *"Left keys on desk, exited premises"* and click **Confirm Checkout**.
   - Confirm that the visitor's status updates to **Checked Out** and the Reprint button disappears (reprinting checked-out guests is disabled).

---

## 🧯 2. Emergency Evacuation (Muster List) Flow

The Muster List flow provides security guards with an interactive roll-call during emergencies:
1. Log in as a **Guard** or **Admin**.
2. Go to **Local Feed** (Dashboard).
3. Click the red **Emergency Evacuation (Muster List)** panic button.
4. Observe the glassmorphic overlay listing all currently active visitors grouped by building/facility area.
5. Check off visitors manually as they are verified at assembly points.
6. Click **Download Muster List (PDF)** to export the snapshot report.
7. Click **Resume Operations** once the drill is complete.

---

## ⚙️ 3. Programmatic API Integration Tests

We have prepared two Python test scripts to verify backend logic and access boundary intercepts. Ensure your containers are active before running them.

### Running Test A: API Feature Flow Verification
This script tests pre-registration creations, arrival date-times, accessory additions, same-screen activations, and settings schema overrides.
```bash
python C:/Users/ashok/.gemini/antigravity/brain/9e3e42a7-f96f-4a4e-a5df-c32df44c5574/scratch/test_api.py
```
- **Expected Outcome**: All assertions on check-in, requested retrieval, user creation schema tolerances, and invite activation succeed with `"--- ALL BACKEND CHECKS PASSED SUCCESSFULLY ---"`.

### Running Test B: Role-Based Access Control Verification
This script tests header interception boundaries (`X-User-Role`, `X-User-Id`) and verifies role-based 403 blocks.
```bash
python C:/Users/ashok/.gemini/antigravity/brain/9e3e42a7-f96f-4a4e-a5df-c32df44c5574/scratch/test_rbac.py
```
- **Expected Outcome**:
  - GET `/api/users` as Host is rejected with `403 Forbidden`.
  - GET `/api/users` as Admin is allowed with `200 OK`.
  - POST `/api/visitors` (ACTIVE) as Host is rejected with `403 Forbidden`.
  - POST `/api/visitors` (REQUESTED) as Host with mismatched name is rejected with `403 Forbidden`.
  - POST `/api/settings/branding` as Guard is rejected with `403 Forbidden`.
  - GET `/api/visitors/history` as Host is allowed with `200 OK` and results are filtered.
