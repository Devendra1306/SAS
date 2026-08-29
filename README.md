# Student Attendance System (SAS)

**AI-powered real-time attendance using face recognition, anti-spoofing, and intelligent attendance analytics.**

---

## 🏗️ Architecture

```
SAS/
├── frontend/     React + TypeScript + Tailwind CSS + shadcn/ui
├── backend/      FastAPI + Motor (MongoDB) + InsightFace + Pinecone
├── ai/           AI model evaluation scripts
├── .env          Live credentials (DO NOT COMMIT)
├── .env.example  Template
└── docker-compose.yml
```

### Data Flow

```
Camera → YOLOv8/InsightFace Detection
       → Face Quality Check
       → Anti-Spoofing (liveness)
       → ArcFace Embedding (512-dim)
       → Pinecone Vector Search
       → Student ID Match
       → MongoDB Verification
       → Duplicate Check
       → Mark Attendance
       → WebSocket → Faculty Dashboard
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Pinecone account with index created

### 1. Clone & Configure

```bash
git clone <repo>
cd SAS
cp .env.example .env
# Edit .env with your real credentials
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Seed the database with demo data
python -m scripts.seed

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔐 Default Credentials (After Seeding)

| Role    | Username / ID | Password       |
|---------|--------------|----------------|
| Admin   | admin        | Admin@SAS2024  |
| Faculty | FAC001       | Faculty@123    |
| Faculty | FAC002       | Faculty@123    |
| Faculty | FAC003       | Faculty@123    |
| Student | 23A81A4301   | Student@123    |
| Student | 23A81A4302   | Student@123    |
| Student | (all 20)     | Student@123    |

---

## 🤖 AI Models

### Face Recognition
- **Model**: InsightFace `buffalo_l` (ArcFace, 512-dim)
- **Auto-download**: Yes, on first run
- **GPU**: Supported (CUDA). Falls back to CPU automatically.

### Face Detection
- **Built into InsightFace** (RetinaFace)

### Anti-Spoofing (Liveness)
- **Status**: Demo mode by default
- **To enable**: Place a compatible ONNX anti-spoofing model at `ANTISPOOF_MODEL_PATH`
- **Compatible model**: Silent-Face-Anti-Spoofing (ONNX export)
- The system runs **normally without liveness** (logs a warning)

---

## 🗃️ Database

### MongoDB Atlas
Collections: `users`, `students`, `faculty`, `subjects`, `attendance_sessions`, `attendance`, `face_enrollments`, `audit_logs`, `notifications`

### Pinecone
- Index: `sas` (already created at your provided host)
- Dimension: 512 (ArcFace)
- Metric: cosine
- Namespace: `college_students`

---

## 📡 API Reference

**Base URL**: `http://localhost:8000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Admin/Faculty login |
| POST | /auth/student-login | Student login |
| GET | /auth/me | Current user profile |
| GET | /students | List students (Admin) |
| POST | /students | Create student (Admin) |
| POST | /students/{id}/face-enrollment | Enroll face images |
| GET | /faculty | List faculty (Admin) |
| POST | /faculty | Create faculty (Admin) |
| GET | /subjects | List subjects |
| POST | /subjects | Create subject (Admin) |
| POST | /attendance/session | Start session (Faculty) |
| POST | /attendance/recognize | Process webcam frame (AI) |
| GET | /attendance/low | Students below threshold |
| GET | /attendance/high | Students above threshold |
| GET | /analytics/dashboard | Dashboard stats |
| GET | /reports/export?format=csv | Export CSV |

**WebSocket**: `ws://localhost:8000/ws/attendance/{session_id}?token={jwt}`

---

## 🚀 Face Enrollment

To enroll a student:
1. Log in as Admin
2. Go to **Students → Register Student**
3. Complete student info form
4. Upload 3-5 face photos OR use webcam capture
5. Click **Enroll Faces**

The system will:
- Detect faces in each image
- Check quality (blur, brightness)
- Generate ArcFace embeddings (512-dim)
- Store in Pinecone with student metadata
- Save enrollment metadata in MongoDB

---

## 🐳 Docker

```bash
# Build and run all services
docker-compose up --build

# Run seed script inside container
docker-compose exec backend python -m scripts.seed
```

---

## 🧪 Testing

```bash
cd backend
pytest tests/ -v
```

---

## ⚠️ Security Notes

- Never commit `.env` to version control
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- Rotate Pinecone API key if exposed
- Enable HTTPS in production

---

## 📊 Attendance Thresholds

| Setting | Default | Configurable |
|---------|---------|-------------|
| Low attendance | 50% | Yes |
| High attendance | 90% | Yes |
| Face match threshold | 0.45 (cosine) | Yes |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
| Backend | Python 3.11, FastAPI, Motor, Pydantic v2 |
| AI | InsightFace (ArcFace buffalo_l), ONNX anti-spoofing |
| Vector DB | Pinecone (cosine, 512-dim) |
| App DB | MongoDB Atlas |
| Auth | JWT (access + refresh), Argon2 hashing |
| Realtime | WebSocket (FastAPI) |
