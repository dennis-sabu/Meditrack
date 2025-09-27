# MediTrack — Hackathon Project

A secure health-management and personalized medicine tracking platform built during a hackathon.  
It helps users, doctors, and administrators manage prescriptions, medication schedules, and patient history.  

---

## 🚀 Project Summary
MediTrack improves treatment adherence by providing a centralized platform for medication history, reminders, and doctor-patient communication. It also includes an **admin portal** for management and analytics.  

---

## 🎯 Goals and Target Users
**Goals**
- Provide a simple interface for patients to record and follow medication schedules.  
- Allow doctors to prescribe and monitor patients remotely.  
- Enable administrators to oversee user management and analytics.  

**Target Users**
- Patients  
- Doctors / Health Practitioners  
- Hospital / Admin Staff  

---

## ✨ Core Features
**For Patients (Public Site):**
- Signup / Login (email or phone)  
- Manage personal profile & medical history  
- Add medications and schedule doses  
- Track upcoming and missed doses  
- Mark medication as taken / skipped / postponed  
- Medication history with CSV export  
- Notifications via push, email, or SMS  

**For Doctors/Admins (Admin Portal):**
- Secure admin login  
- Dashboard with quick stats  
- Patient management (view history, prescriptions)  
- Create & update prescriptions with notes  
- Role management (patients, doctors, admins)  
- Logs & audit trails  

---

## 🛠 Suggested Tech Stack
- **Frontend:** Next.js (React) + Tailwind CSS  
- **Backend/API:** Node.js + Express (or Next.js API routes) / Python FastAPI  
- **Database:** PostgreSQL  
- **Auth:** JWT sessions / NextAuth  
- **Notifications:** Firebase Cloud Messaging, Twilio (SMS), SendGrid (email)  
- **Hosting:** VPS (with TLS via Let’s Encrypt)  

---

## 🏗 High-Level Architecture
1. Frontend communicates with Backend API via HTTPS.  
2. Backend authenticates requests and interacts with the database.  
3. Notification services (FCM/Twilio) triggered by schedulers or event hooks.  
4. Scheduler/Worker manages reminders (cron, BullMQ, or serverless).  

---

## 📡 API Endpoints (Example)
**Auth**
- `POST /api/auth/register` – Register a new user  
- `POST /api/auth/login` – Login (returns access token)  
- `POST /api/auth/refresh` – Refresh token  
- `POST /api/auth/forgot-password` – Password reset  

**Patients & Users**
- `GET /api/users/:id` – Get user profile  
- `PUT /api/users/:id` – Update profile  
- `GET /api/patients` – (Admin) List patients  

**Medications & Prescriptions**
- `POST /api/patients/:id/medications` – Add medication  
- `GET /api/patients/:id/medications` – List medications  
- `PUT /api/medications/:medId` – Update medication  
- `DELETE /api/medications/:medId` – Delete medication  
- `POST /api/patients/:id/prescriptions` – Create prescription  

**Reminders & Logs**
- `GET /api/patients/:id/reminders` – List reminders  
- `POST /api/reminders/:remId/ack` – Mark taken  
- `GET /api/logs` – (Admin) Fetch system logs  

---

## 🗄 Database Schema (Simplified)
- **users** (id, name, email, password_hash, role, created_at)  
- **patients** (id, user_id, dob, gender, notes)  
- **medications** (id, patient_id, name, dose, frequency, times_json, start_date, end_date)  
- **prescriptions** (id, doctor_id, patient_id, medication_ids, notes, created_at)  
- **reminders** (id, medication_id, scheduled_at, status, delivered_at)  
- **audit_logs** (id, user_id, action, meta_json, created_at)  

---

## ⚙️ Installation & Local Setup
```bash
# Clone repo
git clone <repo-url>

# Frontend setup
cd frontend
npm install

# Backend setup
cd backend
npm install

# Run DB migrations
npx prisma migrate deploy

# Start dev servers
npm run dev