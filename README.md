# CampusGuard - Visitor Management System (VMS)

CampusGuard is an enterprise-grade, multi-site digital Visitor Management System (VMS) designed to replace outdated paper registries. It features role-based access control, asset tracking, live webcam capture, overstay telemetry, blacklist intercepts, and simulated AI analytics.

---

## 🛠️ Technical Stack

- **Frontend**: ReactJS, Vite, Vanilla CSS (harmonious dark/light theme options), Lucide Icons.
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Uvicorn.
- **Database**: PostgreSQL (relational master site and visitor registry database).
- **Storage**: MinIO (mocked/integrated object storage for live visitor photos).
- **Event Streaming**: Apache Kafka & ZooKeeper (asynchronous email/SMS notifications backend).
- **Deployment**: Docker & Docker Compose.

---

## 🚀 Quick Start Guide

### Prerequisites
Make sure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Run the Application
From the project root directory, compile and start all services:
```bash
docker-compose up -d --build
```

### Services & Connection Details Matrix
Once running, the following services are exposed on your host machine:

| Service Name | Container Name | Host Port | Container Port | Default Username | Default Password / Key | Details / Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend UI** | `campusguard-frontend` | `5173` | `80` | N/A | N/A | React Client App: [http://localhost:5173](http://localhost:5173) |
| **Core API** | `campusguard-api` | `8080` | `8080` | N/A | N/A | FastAPI Server: [http://localhost:8080](http://localhost:8080) (Docs: [http://localhost:8080/docs](http://localhost:8080/docs)) |
| **Database** | `campusguard-db` | `5477` | `5432` | `campus_admin` | `campus_password` | PostgreSQL (Database: `campusguard`) |
| **Object Storage API** | `campusguard-storage` | `9001` | `9000` | `admin` | `password123` | MinIO S3 API Endpoint |
| **Object Storage Console** | `campusguard-storage` | `9091` | `9090` | `admin` | `password123` | MinIO Console Web Portal: [http://localhost:9091](http://localhost:9091) |
| **Zookeeper** | `campusguard-zookeeper` | `2182` | `2181` | N/A | N/A | ZooKeeper Server Client Connection |
| **Kafka Broker** | `campusguard-kafka` | `9093` | `9092` | N/A | N/A | Kafka Message Broker: `localhost:9093` |

### Stop the Application
To stop all running services and preserve data volumes:
```bash
docker-compose down
```

---

## 🔐 Default User Accounts (Seeded)

Upon first startup, the database is auto-seeded with the following credentials:

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | **Admin** | Administrator with full read-write configuration access. |
| **`guard`** | `password123` | **Guard** | Front-desk Security Guard operator. |

*You can add custom accounts (including the **Host** role) via the **Settings -> Users & Roles** dashboard when logged in as an Administrator.*

---

## 👥 Roles & Permissions Matrix

CampusGuard enforces strict role-based access controls at both UI routing and API levels:

1. **Administrator (`Admin`)**:
   - Access to settings, branding customized values, SMTP notifications, and operator accounts creation.
   - Access to Global dashboards and reports with full reprint and checkout actions.
2. **Security Guard (`Guard`)**:
   - Access to Gate Entry check-ins (New registration, verifying invites, returns check-ins).
   - Access to Gate Exit, Local Live Feed, and Reports with full reprint/checkout actions.
   - Restricted from Global HQ dashboard and system settings.
3. **Department Staff (`Host`)**:
   - View of **reports page (view-only)**, filtered to only show visitors hosted by themselves.
   - Access only to **pre-registration invites** under Gate Entry. Host name is locked to their name to prevent host spoofing.
   - Restricted from check-ins, exits, settings, and dashboards.

---

## 📂 Directory Structure

```
CampusGuard/
├── backend/               # FastAPI application code
│   ├── main.py            # API routes and RBAC authentication dependencies
│   ├── models.py          # SQLAlchemy PostgreSQL database schemas
│   ├── database.py        # Database session engine connections
│   └── Dockerfile         # Python slim build context
├── frontend/              # Vite React UI code
│   ├── src/
│   │   ├── components/    # Layout, TopBar, Sidebar, and Gate components
│   │   ├── context/       # Global AppContext (currentUser) & VisitorContext
│   │   ├── pages/         # Page Views (Settings, Reports, Login, GateEntry)
│   │   └── services/      # apiClient (injects X-User-Role / X-User-Id)
│   └── Dockerfile         # Nginx static server build container
├── docs/                  # System documentation
│   └── e2e_testing.md     # E2E manual walkthrough instructions
├── docker-compose.yml     # Multi-container orchestration deployment config
└── README.md              # Project instructions entry point (this file)
```

---

## 📄 Documentation

For a detailed walkthrough of E2E verification flows, role test scripts, and manual check-in steps, refer to [e2e_testing.md](file:///d:/Source/Gravity/CampusGuard/docs/e2e_testing.md).
