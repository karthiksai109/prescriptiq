# PrescriptiQ

> Intelligent Prescription Personalization Platform for Telehealth Weight Management

A full-stack application that helps healthcare providers make data-driven prescription decisions for weight-loss medications. The platform evaluates patient health profiles against a multi-factor scoring algorithm to recommend optimal medications, dosages, and monitoring plans.

Built with **Vue.js 3**, **Apollo Server (GraphQL)**, **Node.js**, **TypeScript**, and **SQLite**.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Personalization Engine](#personalization-engine)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [GraphQL API Reference](#graphql-api-reference)
- [Application Flow](#application-flow)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [License](#license)

---

## Overview

Over 40% of U.S. adults are classified as obese. Medications like Semaglutide (Wegovy), Tirzepatide (Mounjaro), and Liraglutide (Saxenda) have transformed treatment options — but prescribing them requires evaluating BMI thresholds, drug interactions, allergies, contraindications, and monitoring readiness simultaneously.

PrescriptiQ automates this process by scoring eligible medications on a **0–100 scale** across 7 weighted clinical factors, then recommending the best match with dosage guidance and safety warnings.

**Key capabilities:**

- Multi-factor prescription scoring engine
- Real-time drug interaction detection
- Patient health profile management with BMI tracking
- Weight progress monitoring with historical trends
- Medication catalog with contraindication filtering
- Role-based provider authentication (JWT)

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│                     Vue.js 3 + TypeScript                       │
│                                                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │ Vue Router │  │   Pinia    │  │   Apollo   │               │
│  │ (Auth      │  │  (State    │  │  Client    │               │
│  │  Guards)   │  │   Store)   │  │ (GraphQL)  │               │
│  └────────────┘  └────────────┘  └─────┬──────┘               │
│                                        │                       │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    View Components                     │    │
│  │  Login │ Dashboard │ Patients │ Prescriptions │ ...    │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP (GraphQL over POST)
                                 │ Authorization: Bearer <JWT>
┌────────────────────────────────┴────────────────────────────────┐
│                          BACKEND                                │
│                  Node.js + Express + Apollo Server               │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth        │  │  GraphQL     │  │  Personalization     │  │
│  │  Middleware  │──│  Resolvers   │──│  Engine               │  │
│  │  (JWT)       │  │              │  │  (7-factor scoring)   │  │
│  └──────────────┘  └──────┬───────┘  └──────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴─────────────────────────────────┐  │
│  │              Sequelize ORM (Models + Associations)        │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               │      SQLite Database    │
               │                         │
               │  patients               │
               │  providers              │
               │  prescriptions          │
               │  medications            │
               │  health_metrics         │
               │  interactions           │
               └─────────────────────────┘
```

### Data Flow

```
Provider Login
     │
     ▼
┌──────────┐    GraphQL Mutation     ┌──────────────┐
│  Login   │ ──────────────────────► │ authResolver  │
│  View    │ ◄────────────────────── │ (JWT issued)  │
└──────────┘    { token, provider }  └──────────────┘
     │
     ▼
┌──────────┐    GET_DASHBOARD_STATS  ┌──────────────┐
│Dashboard │ ──────────────────────► │ analytics    │
│  View    │ ◄────────────────────── │ Resolvers    │
└──────────┘    { stats, charts }    └──────────────┘
     │
     ├──► View Patients ──► Patient Detail ──► Weight History
     │
     ├──► View Prescriptions ──► Filter by Status
     │
     └──► Personalize ──┐
                        ▼
              ┌──────────────────┐
              │  Select Patient  │
              │  Select Target   │
              │  Condition       │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐    ┌─────────────────────┐
              │  PERSONALIZE     │───►│  PersonalizationEngine│
              │  PRESCRIPTION    │◄───│                       │
              │  (GraphQL Query) │    │  Evaluates 7 factors: │
              └────────┬─────────┘    │  1. BMI Match         │
                       │              │  2. Contraindications  │
                       ▼              │  3. Allergy Safety     │
              ┌──────────────────┐    │  4. Drug Interactions  │
              │  Results:        │    │  5. Side Effect Profile│
              │  - Top Match     │    │  6. Monitoring Ready   │
              │  - Score (0-100) │    │  7. Clinical Evidence  │
              │  - Factor Detail │    └─────────────────────┘
              │  - Warnings      │
              │  - Alternatives  │
              └──────────────────┘
```

---

## Personalization Engine

The core of PrescriptiQ is a scoring algorithm that evaluates each medication against a patient's profile:

| Factor | Weight | Description |
|---|---|---|
| BMI Appropriateness | 25% | Does the patient's BMI meet the medication's threshold? |
| Contraindication Check | 20% | Any conditions that conflict with the medication? |
| Allergy Safety | 15% | Patient allergy overlap with known sensitivities? |
| Drug Interaction Risk | 15% | Conflicts with current medications? |
| Side Effect Profile | 10% | Severity and likelihood of adverse effects |
| Monitoring Readiness | 10% | Can the patient support required lab work / follow-ups? |
| Clinical Evidence | 5% | Strength of published efficacy data for the patient's profile |

Each factor produces a **0–100 sub-score**, then the weighted sum gives a final **personalization score**. Medications scoring below 40 are flagged with warnings. Scores above 75 are recommended.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Vue.js 3 (Composition API) | UI framework |
| Routing | Vue Router 4 | SPA navigation with auth guards |
| State | Pinia | Global state management |
| API Client | Apollo Client | GraphQL queries and mutations |
| Bundler | Vite | Development server and build tool |
| Backend | Node.js + Express | HTTP server |
| API | Apollo Server 4 | GraphQL endpoint |
| ORM | Sequelize 6 | Database abstraction |
| Database | SQLite | Relational data storage |
| Auth | JWT + bcrypt | Token-based authentication |
| Language | TypeScript | Type safety across the stack |

---

## Project Structure

```
prescriptiq/
├── frontend/                    # Vue.js client application
│   ├── src/
│   │   ├── views/               # Page components
│   │   │   ├── LoginView.vue
│   │   │   ├── DashboardView.vue
│   │   │   ├── PatientsView.vue
│   │   │   ├── PatientDetailView.vue
│   │   │   ├── PrescriptionsView.vue
│   │   │   ├── PersonalizeView.vue
│   │   │   └── MedicationsView.vue
│   │   ├── graphql/
│   │   │   └── queries.ts       # All GraphQL operations
│   │   ├── router/
│   │   │   └── index.ts         # Route definitions + guards
│   │   ├── App.vue              # Root component with sidebar
│   │   └── main.ts              # Apollo Client setup + app init
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                     # Node.js + Apollo Server
│   ├── src/
│   │   ├── models/              # Sequelize model definitions
│   │   │   ├── index.ts         # DB connection + associations
│   │   │   ├── Patient.ts
│   │   │   ├── Provider.ts
│   │   │   ├── Medication.ts
│   │   │   ├── Prescription.ts
│   │   │   ├── HealthMetric.ts
│   │   │   └── Interaction.ts
│   │   ├── resolvers/           # GraphQL resolver functions
│   │   │   ├── index.ts         # Resolver composition
│   │   │   ├── authResolvers.ts
│   │   │   ├── patientResolvers.ts
│   │   │   ├── medicationResolvers.ts
│   │   │   ├── prescriptionResolvers.ts
│   │   │   ├── healthMetricResolvers.ts
│   │   │   └── analyticsResolvers.ts
│   │   ├── schema/
│   │   │   └── typeDefs.ts      # GraphQL type definitions
│   │   ├── services/
│   │   │   └── PersonalizationEngine.ts
│   │   ├── middleware/
│   │   │   └── auth.ts          # JWT verification
│   │   ├── seed/
│   │   │   └── seed.ts          # Demo data seeder
│   │   └── index.ts             # Server entry point
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/prescriptiq.git
cd prescriptiq
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your JWT_SECRET
```

### 3. Seed the database

```bash
npm run seed
```

This creates a SQLite database with:
- 1 demo provider (Dr. Sarah Mitchell)
- 5 patients with health profiles
- 6 weight-loss medications
- Drug interaction data
- Health metrics with weight tracking history

### 4. Start the backend

```bash
npm run dev
# Server runs at http://localhost:4000/graphql
```

### 5. Frontend setup (new terminal)

```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 6. Login

| Field | Value |
|---|---|
| Email | sarah@prescriptiq.com |
| Password | demo123 |

---

## GraphQL API Reference

### Queries

| Query | Description | Auth Required |
|---|---|---|
| `me` | Current authenticated provider | Yes |
| `patients` | List all patients | Yes |
| `patient(id)` | Single patient with metrics | Yes |
| `medications` | Medication catalog | Yes |
| `prescriptions` | All prescriptions with details | Yes |
| `dashboardStats` | Aggregate analytics | Yes |
| `personalizePrescription(patientId, condition)` | Run personalization engine | Yes |
| `weightProgressReport(patientId)` | Weight trend analysis | Yes |
| `checkInteractions(medicationIds)` | Drug interaction check | Yes |

### Mutations

| Mutation | Description | Auth Required |
|---|---|---|
| `login(email, password)` | Authenticate, returns JWT | No |
| `register(input)` | Create provider account | No |
| `createPatient(input)` | Add new patient | Yes |
| `updatePatient(id, input)` | Modify patient record | Yes |
| `createPrescription(input)` | New prescription (auto-scored) | Yes |
| `updatePrescriptionStatus(id, status)` | Change prescription status | Yes |
| `recordHealthMetric(input)` | Log a health measurement | Yes |
| `recordHealthMetrics(input)` | Batch log metrics | Yes |

### Example Query

```graphql
query PersonalizePrescription($patientId: Int!, $condition: String!) {
  personalizePrescription(patientId: $patientId, condition: $condition) {
    recommended {
      medication { name, genericName, brandName }
      score
      factors
      warnings
      dosageRecommendation
      monitoringPlan
    }
    alternatives {
      medication { name }
      score
    }
  }
}
```

---

## Application Flow

### Provider Workflow

```
1. LOGIN
   └──► Provider authenticates with email/password
        └──► JWT token stored in localStorage

2. DASHBOARD
   └──► View aggregate stats (total patients, active Rx, BMI breakdown)
        └──► Quick-action links to key sections

3. PATIENT MANAGEMENT
   └──► Search / filter patients
        └──► View patient detail
             ├──► Health profile (BMI, allergies, conditions)
             ├──► Weight tracking chart (historical trend)
             └──► Active prescriptions list

4. PRESCRIPTION PERSONALIZATION
   └──► Select patient + target condition
        └──► Engine evaluates all eligible medications
             └──► Returns ranked results with:
                  ├──► Recommended medication + score
                  ├──► Factor-by-factor breakdown
                  ├──► Safety warnings
                  ├──► Dosage recommendation
                  ├──► Monitoring plan
                  └──► Alternatives with scores

5. PRESCRIPTION MANAGEMENT
   └──► View all prescriptions (filter by status)
        └──► Update status (active → completed / paused / cancelled)

6. MEDICATION CATALOG
   └──► Browse all medications
        └──► View details: contraindications, side effects, dosage forms
```

---

## Deployment

### Backend (Render / Railway / Fly.io)

The backend runs as a standard Node.js application:

```bash
cd backend
npm run build
npm start
```

Environment variables required:
- `JWT_SECRET` — Secret key for JWT signing
- `PORT` — Server port (default: 4000)
- `NODE_ENV` — `production`

### Frontend (Netlify / Vercel)

The frontend builds as a static SPA:

```bash
cd frontend
npm run build
# Output: dist/
```

Update `vite.config.ts` proxy target to your deployed backend URL for production, or configure the Apollo Client HTTP link directly.

---

## License

MIT
