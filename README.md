# PSM.Intern – Internship Certificate Verification Platform

> **"Verify Your Internship. Showcase Your Skills."**

PSM.Intern is an enterprise-grade full-stack web application designed for students, industry mentors, and host enterprises. It provides cryptographically verified internship credentialing, 5-dimensional mentor competency evaluations, capstone project reviews, and instant public verification with high-resolution QR codes and PDF certificates.

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Vite | Modular, type-safe, responsive component architecture |
| **Styling** | Tailwind CSS + Lucide Icons | Lavender theme (`#DDD6FE`, `#7C3AED`, `#5B21B6`), dark navy typography (`#0F172A`) |
| **Backend** | Python 3.10+ & FastAPI | Async REST APIs, typed Pydantic schemas, dependency injection |
| **Database** | PostgreSQL & SQLite Fallback | SQLAlchemy 2.0 ORM, Alembic migrations |
| **Authentication** | JWT Bearer Authentication | Bcrypt password hashing, role-based authorization guards |
| **Certificates** | ReportLab (Python) | Vector-crisp PDF certificates with decorative borders and embedded QR codes |
| **QR Engine** | Python `qrcode[pil]` | Unpredictable verification tokens pointing to live registry |
| **Testing** | Pytest (Backend) & Vitest (Frontend) | Automated unit, security, and component tests |

---

## 2. Directory Structure

```text
psm-intern-verification/
├── .env.example               # Root configuration template
├── README.md                  # Comprehensive setup & operations manual
├── backend/
│   ├── alembic.ini            # Alembic migration configuration
│   ├── requirements.txt       # Python dependencies
│   ├── migrations/            # Alembic schema version scripts
│   ├── storage/               # Generated PDFs and QR code images
│   ├── tests/                 # Automated Pytest test suite
│   └── app/
│       ├── main.py            # FastAPI entry point, lifespan, CORS & static mounts
│       ├── core/              # Config (pydantic-settings), JWT & bcrypt security
│       ├── db/                # SQLAlchemy session, Base, and init_db bootstrap
│       ├── models/            # SQLAlchemy models (User, Profile, Project, Evaluation, Certificate)
│       ├── schemas/           # Pydantic validation & response models
│       ├── services/          # ReportLab PDF generator & QRCode generator
│       └── api/               # API routers for auth, student, admin, and public verification
└── frontend/
    ├── package.json           # Node dependencies & build scripts
    ├── vite.config.ts         # Vite bundler, proxy configuration & Vitest setup
    ├── src/
    │   ├── App.tsx            # Main router & protected route guards
    │   ├── index.css          # Design tokens & Tailwind imports
    │   ├── types/             # Domain TypeScript interfaces
    │   ├── services/api.ts    # Centralized typed HTTP API service
    │   ├── context/           # React AuthContext
    │   ├── components/        # Navbar, Footer, StatusBadge, Modal, Layouts
    │   └── pages/             # Landing, Auth, Student Portal & Admin Console pages
```

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### A. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   - **Windows (PowerShell)**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize Database and Seed Demo Accounts**:
   ```bash
   python -m app.db.init_db
   ```
   *(This creates all tables, seeds the initial administrator, and creates sample student cohorts with issued and revoked certificates).*

5. **Run the Backend Server**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Docs: [http://127.0.0.1:8000/api/v1/docs](http://127.0.0.1:8000/api/v1/docs)
   - Health Check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### B. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be live at: **[http://localhost:5173/](http://localhost:5173/)**

---

## 4. Connecting to PostgreSQL

By default in development, SQLite is configured (`DATABASE_URL=sqlite:///./psm_intern.db`) for instant zero-config startup.

To connect to a **PostgreSQL** instance:

1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE psm_intern_db;
   CREATE USER psm_user WITH ENCRYPTED PASSWORD 'psm_password';
   GRANT ALL PRIVILEGES ON DATABASE psm_intern_db TO psm_user;
   ```

2. Update your `backend/.env` file:
   ```env
   DATABASE_URL=postgresql://psm_user:psm_password@localhost:5432/psm_intern_db
   ```

3. Run Alembic migrations to create tables in PostgreSQL:
   ```bash
   alembic upgrade head
   ```

4. Run the seed command to bootstrap admin and demo cohorts:
   ```bash
   python -m app.db.init_db
   ```

---

## 5. Pre-Configured Demonstration Accounts

| Role | Email Address | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@psmintern.com` | `AdminPSM@2026!` | Company administrator with full certification authority |
| **Student (Issued)** | `student@psmintern.com` | `Student@2026!` | Aarav Sharma (Full Stack Dev, **Issued** Certificate & QR) |
| **Student (Approved)** | `priya.patel@example.com` | `Intern@2026!` | Priya Patel (AI & ML, **Approved** - ready to issue) |
| **Student (Revoked)** | `marcus.vance@example.com` | `Intern@2026!` | Marcus Vance (Cybersecurity, **Revoked** with audited reason) |

*Both login screens feature one-click "Use Demo Intern" and "Use Initial Admin" buttons for immediate testing.*

---

## 6. Verification & User Walkthroughs

### 1. Public Certificate Verification (No Login Required)
- Open: `http://localhost:5173/`
- Enter `CERT-PSM-2026-987654` in the search bar or click **"Issued Certificate"**.
- View the emerald verified badge, intern details, host company, and authorized signatory.
- Click **"Revoked Certificate"** to view how revoked certificates immediately display a prominent red alert with mandatory revocation reasons and audit timestamps.

### 2. Student Portal Experience
1. Navigate to `/login` and sign in as `student@psmintern.com`.
2. Inspect the **Student Dashboard**: profile completion percentage, domain metrics, and certificate card.
3. Click **"Download Official PDF Certificate"** to download the vector-crisp PDF with embedded QR code.
4. Visit `/student/project` to update GitHub repository and live demo links.
5. Visit `/student/evaluation` to inspect the 5-criteria mentor evaluation matrix.

### 3. Administrator Console Experience
1. Navigate to `/admin/login` and sign in as `admin@psmintern.com`.
2. View the **Lavender Sidebar Console** and dashboard cards.
3. **Manage Interns**: Search, filter by domain, or click "Add New Intern".
4. **Manage Projects**: Review code submissions and update review statuses.
5. **Mentor Evaluations**: Grade candidates on Technical Skills, Problem Solving, Code Quality, Communication, and Teamwork with interactive star ratings.
6. **Certificate Operations**:
   - Approve pending requests.
   - Click **"Generate & Issue"** to bind a unique QR code and generate a PDF certificate.
   - Click **"Revoke"** to open the mandatory revocation reason modal. Once revoked, public verification updates immediately.
7. **QR Code Generator**: Preview and download PNG QR code images.
8. **Company Settings**: Update company name, contact email, website, and authorized signatory name & title.

---

## 7. Running Automated Tests

### Backend Tests (Pytest)
Runs 8 test suites validating authentication, RBAC, IDOR protection, certificate issuance, and public verification:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

### Frontend Tests (Vitest)
Runs React Testing Library component tests:
```bash
cd frontend
npm run test -- --run
# or
npx vitest run
```

### Production Build Validation
```bash
cd frontend
npm run build
```

---

## 8. External Services & Production Configuration

- **Email Delivery (SMTP)**: In development, password reset tokens are returned directly in the response and displayed in the UI. For production, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` in `.env`.
- **Cloud Storage**: In local development, PDFs and QR images are stored in `./storage/`. In cloud production, mount persistent volumes or configure S3/Cloud Storage.
