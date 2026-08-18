# PRD: ClarityFlow — Personal Productivity Platform

---

## 1. Problem Statement

### Pain Points Saat Ini
| Masalah | Dampak |
|---------|--------|
| **Journaling tidak konsisten** | Ide dan refleksi pagi hilang, tidak ada rekam jejak perkembangan diri |
| **Task tersebar di banyak tempat** | Email, catatan, chat — tidak terkonsolidasi, sering lupa atau terlewat |
| **Ide hilang begitu saja** | Tidak ada "inbox" untuk menangkap ide yang muncul tiba-tiba |
| **Knowledge dari buku tidak terorganisir** | Insight dari bacaan cepat lupa, tidak bisa diintegrasikan ke workflow |
| **Distraksi saat bekerja** | Tidak ada sistem yang membantu deep work secara konsisten |
| **Tidak ada metrik produktivitas personal** | Tidak tahu apakah benar-benar lebih produktif 1% setiap hari |

### Kalimat Kunci Masalah
> *"Saya tahu saya harus lebih produktif, tapi tidak punya satu tempat yang terintegrasi untuk journaling, mengelola task, menyimpan ide, mendokumentasikan pembelajaran, dan memastikan saya benar-benar fokus saat bekerja."*

---

## 2. Product Vision & Goals

### Visi Produk
**ClarityFlow** adalah **all-in-one personal productivity hub** yang membantu pengguna membangun kebiasaan produktif secara incremental (minimal 1% per hari) melalui integrasi seamless antara:
- Morning journaling untuk intent setting
- Task management untuk eksekusi
- Idea capture untuk kreativitas
- Knowledge management untuk pembelajaran
- Focus timer untuk deep work

### North Star Metric
```
"Average daily active users yang menyelesaikan morning journal + minimal 1 task dalam mode focus"
```
**Target:** User meningkatkan self-reported productivity score minimal 5% per bulan (diukur via weekly reflection).

### Objetivos (Tujuan SMART)

| Tujuan | Metric | Timeline |
|--------|--------|----------|
| Habit formation | 70% users melakukan journaling 5x/minggu | 3 bulan setelah launch |
| Task completion | Rata-rata 3+ task selesai/hari | 2 bulan |
| Deep work sessions | Rata-rata 2+ jam focus time/hari | 4 bulan |
| Knowledge retention | User menambahkan 10+ notes/hari | 3 bulan |

---

## 3. Target Users

### Primary Persona

**Nama:** **Andi** (28 tahun, Software Engineer Remote)
```
Demografis:
├── Usia: 25-35 tahun
├── Profesi: Remote worker / Freelancer / WFH professional
├── Tech-savvy: Ya, familiar dengan productivity tools
├── Bahasa: Indonesia + English
└── Pendapatan: Middle-upper (mampu bayar subscription)

Goals:
├── Ingin lebih fokus dan produktif
├── Membangun morning routine yang konsisten
├── Menyimpan ide dan pengetahuan secara terstruktur
└── Mengukur progress produktivitas pribadi

Frustrations:
├── Terlalu banyak tools yang terpisah (Notion + Todoist + Calendar + dll)
├── Sulit konsisten dalam journaling
├── Sering terdistraksi saat working hours
└── Tidak punya sistem untuk "capture now, process later"

Behavior:
├── Aktif mencari content tentang productivity di YouTube/podcast
├── Pernah coba berbagai apps tapi tidak konsisten
├── Suka single source of truth
└── Menggunakan Pomodoro atau teknik time-blocking
```

### Secondary Personas

1. **Dewi (31)** — Content Creator
   - Need: Capture ide konten, manage content calendar, stay focused during creative hours
   - Pain: Idea scattered across notes, voice memos, Instagram DMs

2. **Budi (24)** — Fresh Graduate Job Seeker
   - Need: Build productive daily routine, track learning progress, stay motivated
   - Pain: Procrastination, no structure, overwhelmed with self-improvement content

---

## 4. User Stories

### Epik 1: Morning Journal

```
SEBAGAI    user yang ingin memulai hari dengan intent yang jelas,
SAYA INGIN membuat journal entries di pagi hari dengan prompt yang membantu,
AGAR       saya memiliki arah dan fokus untuk hari itu.

Acceptance Criteria:
✓ User bisa memilih dari 3-5 daily prompts (gratitude, intention, affirmation, etc.)
✓ Journal entries tersimpan dengan timestamp otomatis
✓ User bisa melihat streak journaling
✓ entries bisa di-tag dengan mood/energy level
```

### Epik 2: Task Management

```
SEBAGAI    professional yang punya banyak task,
SAYA INGIN mencatat dan mengelola semua task di satu tempat,
AGAR       saya tidak kehilangan task dan bisa prioritization dengan mudah.

Acceptance Criteria:
✓ User bisa buat task dengan: title, description, due date, priority (P1-P4), tags
✓ Task bisa di-group berdasarkan: Today, This Week, Someday/Maybe
✓ Filter dan sort task by date, priority, tags
✓ Completed task masuk ke "completed log" dengan completion timestamp
✓ Task bisa di-archive
```

### Epik 3: Idea Capture (Quick Capture)

```
SEBAGAI    creative person yang sering mendapat ide di momen tidak terduga,
SAYA INGIN capture ide dengan cepat tanpa hambatan,
AGAR       ide tidak hilang dan bisa diproses nanti.

Acceptance Criteria:
✓ Quick capture via keyboard shortcut (global hotkey atau in-app)
✓ Capture box selalu accessible (floating button atau shortcut key)
✓ Ide langsung masuk ke "Inbox" collection
✓ User bisa convert idea ke task atau note
✓ Timestamp capture otomatis
```

### Epik 4: Knowledge Management

```
SEBAGAI    pembelajar aktif yang membaca banyak buku/artikel,
SAYA INGIN menyimpan knowledge dan insight dari bacaan,
AGAR       saya bisa review dan mengaplikasikannya dalam kehidupan.

Acceptance Criteria:
✓ User bisa buat notes dengan title, content (rich text), source (book/article title)
✓ Notes bisa di-tag dengan topics/categories
✓ Link notes satu sama lain (wiki-style linking)
✓ Quick search notes by title, content, tags
✓ Notes bisa di-export
```

### Epik 5: Focus Mode & Deep Work

```
SEBAGAI    knowledge worker yang butuh sustained focus,
SAYA INGIN timer yang membantu saya fokus dan istirahat dengan benar,
AGAR       saya bisa menghasilkan deep work berkualitas tinggi setiap hari.

Acceptance Criteria:
✓ Pomodoro timer dengan customizable durations (work: 25/50/90 min)
✓ Session counter untuk daily/weekly stats
✓ Mode "Deep Work" — full screen focus, block notifications indicator
✓ Auto-start next session option
✓ Break reminders (stretch, hydrate, eye rest)
✓ Session history dengan duration dan task association
```

### Epik 6: Dashboard & Analytics

```
SEBAGAI    user yang ingin mengukur progress produktivitas saya,
SAYA INGIN melihat visualisasi data produktivitas saya,
AGAR       saya bisa tahu apakah saya benar-benar improving 1% per hari.

Acceptance Criteria:
✓ Daily summary: tasks completed, focus time, journal streak
✓ Weekly review template dengan prompts
✓ Streak tracker untuk: journaling, daily task, focus sessions
✓ Simple charts: task completion trend, focus hours trend
✓ Insights/recommendations berdasarkan pattern (misal: "Kamu paling produktif jam 9-11")
```

### Epik 7: User Account & Data

```
SEBAGAI    user yang peduli dengan privacy dan data ownership,
SAYA INGIN data saya aman dan bisa di-export,
AGAR       saya tidak kehilangan data jika berhenti pakai app.

Acceptance Criteria:
✓ Sign up dengan email/password atau OAuth (Google)
✓ All data stored in database (cloud sync)
✓ Data export (JSON/CSV) anytime
✓ Basic data analytics (no data sold)
✓ Delete account dengan full data removal option
```

---

## 5. Functional Requirements

### FR-001: Authentication
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001.1 | User registration dengan email + password | Must Have |
| FR-001.2 | Login dengan email + password | Must Have |
| FR-001.3 | Login dengan Google OAuth | Should Have |
| FR-001.4 | Password reset via email | Should Have |
| FR-001.5 | Session management (JWT dengan refresh token) | Must Have |

### FR-002: Morning Journal
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-002.1 | Daily journal template dengan 3-5 prompts | Must Have |
| FR-002.2 | Mood/energy level selector (emoji-based) | Must Have |
| FR-002.3 | Auto timestamp setiap entry | Must Have |
| FR-002.4 | View journal history by date | Must Have |
| FR-002.5 | Journal streak counter | Should Have |
| FR-002.6 | Entry edit dan delete | Must Have |

### FR-003: Task Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-003.1 | Create task: title (required), description, due date, priority, tags | Must Have |
| FR-003.2 | Task views: Today, This Week, Inbox (no date) | Must Have |
| FR-003.3 | Mark task as complete dengan timestamp | Must Have |
| FR-003.4 | Task editing dan deletion | Must Have |
| FR-003.5 | Filter task by priority, tags, completion status | Should Have |
| FR-003.6 | Bulk actions: complete multiple, delete multiple | Could Have |

### FR-004: Idea Capture
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-004.1 | Quick capture floating button | Must Have |
| FR-004.2 | Capture dengan keyboard shortcut (Ctrl/Cmd + K) | Must Have |
| FR-004.3 | Auto-create timestamp | Must Have |
| FR-004.4 | Inbox view untuk semua captured ideas | Must Have |
| FR-004.5 | Convert idea → Task atau Note | Should Have |
| FR-004.6 | Quick delete from inbox | Must Have |

### FR-005: Knowledge Notes
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-005.1 | Create note dengan title, rich content, source attribution | Must Have |
| FR-005.2 | Rich text editor (bold, italic, lists, headers) | Should Have |
| FR-005.3 | Tag-based organization | Must Have |
| FR-005.4 | Search notes by title, content, tags | Must Have |
| FR-005.5 | Wiki-style linking antar notes | Could Have |
| FR-005.6 | Notes export (markdown) | Could Have |

### FR-006: Focus Timer
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-006.1 | Timer dengan preset durations (25, 50, 90 min) | Must Have |
| FR-006.2 | Custom duration input | Should Have |
| FR-006.3 | Start, pause, stop, reset controls | Must Have |
| FR-006.4 | Sound notification saat session ends | Should Have |
| FR-006.5 | Associate session dengan task | Should Have |
| FR-006.6 | Session history log | Must Have |
| FR-006.7 | Daily/weekly focus time summary | Should Have |

### FR-007: Dashboard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-007.1 | Today's snapshot: pending tasks, focus time, streak | Must Have |
| FR-007.2 | Weekly progress chart (tasks completed per day) | Should Have |
| FR-007.3 | Focus time trend chart | Should Have |
| FR-007.4 | Quick action buttons: quick capture, start timer, new task | Must Have |
| FR-007.5 | Weekly review template (prompt-based) | Could Have |

### FR-008: Data Management
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-008.1 | Full data export (JSON) | Should Have |
| FR-008.2 | Data import dari JSON backup | Could Have |
| FR-008.3 | Account deletion dengan full data purge | Must Have |

---

## 6. Non-Functional Requirements

### NFR-001: Performance
| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Time to Interactive (TTI) | < 3s |
| Lighthouse Performance Score | > 90 |
| API response time (p95) | < 200ms |

### NFR-002: Security
| Requirement | Standard |
|-------------|----------|
| Password hashing | bcrypt dengan cost factor ≥ 12 |
| JWT expiration | Access token: 15 min, Refresh token: 7 days |
| HTTPS | Mandatory untuk semua komunikasi |
| Input sanitization | Semua user input di-sanitize |
| Rate limiting | API endpoints limited to 100 req/min |

### NFR-003: Accessibility
| Standard | Target |
|----------|--------|
| WCAG 2.1 | Level AA compliance minimum |
| Keyboard navigation | Semua fitur accessible via keyboard |
| Screen reader support | Basic support untuk screen readers |
| Color contrast | Minimum 4.5:1 ratio |

### NFR-004: Compatibility
| Platform | Support |
|----------|---------|
| Desktop browsers | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Mobile browsers | Safari iOS, Chrome Android |
| Responsive breakpoints | Mobile: < 768px, Tablet: 768-1024px, Desktop: > 1024px |

### NFR-005: Scalability & Reliability
| Metric | Target |
|--------|--------|
| Uptime | 99.5% per month |
| Concurrent users | Support 1000+ concurrent sessions |
| Data retention | Unlimited for active users |
| Backup | Daily automated backup |

---

## 7. Tech Stack Recommendations

### 7.1 Backend Stack (Hono Framework)

#### Core
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **Hono** | Web framework | Lightweight, edge-ready, TypeScript native |
| **@hono/node-server** | Node.js adapter | Production deployment on Node |
| **@hono/zod-validator** | Request validation | Type-safe validation middleware |
| **@hono/cors** | CORS handling | Easy CORS configuration |

#### Database & ORM
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **Drizzle ORM** | ORM | Type-safe, lightweight, great with Hono. Alternative: Prisma (lebih mature tapi heavier) |
| **drizzle-kit** | Migration tool | CLI untuk database migrations |
| **PostgreSQL** | Database | Robust, relational, great for structured data. Alternative: SQLite untuk MVP simplicity |

#### Authentication
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **@node-rs/bcrypt** | Password hashing | Fast, secure bcrypt implementation |
| **jose** | JWT handling | Edge-compatible JWT library |

#### Utilities
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **zod** | Schema validation | Industry standard untuk TypeScript validation |
| **nanoid** | ID generation | Fast, URL-safe unique IDs |
| **date-fns** | Date manipulation | Lightweight alternative to moment/date-fns |

### 7.2 Frontend Stack (React)

#### Core
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **React 18+** | UI framework | Latest dengan concurrent features |
| **Vite** | Build tool | Fast HMR, great DX, Hono-compatible |
| **TypeScript** | Language | Type safety throughout |

#### State Management & Data Fetching
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **TanStack Query (React Query)** | Server state | Caching, background refetch, optimistic updates. **Strongly recommended** — eliminates complex useEffect/useState patterns |
| **Zustand** | Client state | Lightweight, minimal boilerplate. Alternative: Jotai (atomic) atau Redux Toolkit (enterprise scale) |
| **@tanstack/react-form** | Form handling | Type-safe, minimal re-renders |

#### UI Components & Styling
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **Tailwind CSS** | Utility-first CSS | Rapid development, consistent design system |
| **Radix UI** | Headless components | Accessible, unstyled primitives. Accordion, Dialog, Dropdown, etc. |
| **Lucide React** | Icons | Clean, consistent icon library |
| **clsx / tailwind-merge** | Class name utilities | Clean conditional classes |

#### Animations
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **Framer Motion** | Animations | Declarative, React-native feel. Alternative: CSS animations untuk simpler needs |
| **@react-spring/web** | Physics-based animations | Natural feel, great for micro-interactions |

#### Timer & Audio
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **react-use** | React hooks collection | useInterval, useKeyPress, useLocalStorage |
| **Howler.js** | Audio playback | Cross-browser audio untuk timer notifications |

#### Productivity-Specific
| Library | Purpose | Rationale |
|---------|---------|-----------|
| **TipTap** | Rich text editor | For knowledge notes. Headless, customizable |
| **recharts** | Charts | Lightweight, React-native charting |
| **date-fns** | Date formatting | Display-friendly dates |

### 7.3 Recommended Project Structure

```
clarityflow/
├── apps/
│   ├── api/                    # Hono Backend
│   │   ├── src/
│   │   │   ├── routes/        # API route handlers
│   │   │   ├── db/            # Drizzle schema & migrations
│   │   │   ├── services/      # Business logic
│   │   │   ├── middleware/     # Auth, validation, etc.
│   │   │   └── utils/         # Helpers
│   │   └── package.json
│   │
│   └──
```
│   │   └── web/                    # React Frontend
│   │       ├── src/
│   │       │   ├── components/    # Reusable UI components
│   │       │   ├── features/      # Feature-specific components
│   │       │   ├── hooks/         # Custom React hooks
│   │       │   ├── lib/           # Utilities, API client
│   │       │   ├── stores/        # Zustand stores
│   │       │   └── pages/         # Route pages
│   │       └── package.json
│   │
│   └── shared/                     # Shared types/schemas
│       └── types/
│
├── turbo.json                     # Monorepo config
└── package.json
```

#### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Turso** atau **Neon** | Serverless PostgreSQL (edge-ready) |
| **Cloudflare Pages** | Frontend deployment |
| **Cloudflare Workers** atau **Fly.io** | Backend deployment |

---

## 8. API Endpoints Design

### 8.1 Authentication Endpoints

```
POST   /api/auth/register     - Register new user
POST   /api/auth/login        - Login user
POST   /api/auth/refresh      - Refresh access token
POST   /api/auth/logout       - Invalidate refresh token
GET    /api/auth/me           - Get current user profile
```

### 8.2 Journal Endpoints

```
GET    /api/journals                    - List all journals (with date filters)
POST   /api/journals                    - Create journal entry
GET    /api/journals/:id                - Get single journal
PUT    /api/journals/:id                - Update journal
DELETE /api/journals/:id                - Delete journal
GET    /api/journals/streaks            - Get journaling streak data
GET    /api/journals/stats              - Get journal analytics
```

### 8.3 Task Endpoints

```
GET    /api/tasks                       - List tasks (with filters: status, priority, date range)
POST   /api/tasks                       - Create task
GET    /api/tasks/:id                   - Get single task
PUT    /api/tasks/:id                   - Update task
DELETE /api/tasks/:id                   - Delete task
PATCH  /api/tasks/:id/complete          - Mark task as complete
PATCH  /api/tasks/:id/uncomplete        - Unmark task
GET    /api/tasks/stats                 - Get task completion stats
```

### 8.4 Ideas Endpoints

```
GET    /api/ideas                       - List ideas (inbox)
POST   /api/ideas                       - Quick capture idea
PUT    /api/ideas/:id                   - Update idea
DELETE /api/ideas/:id                   - Delete idea
POST   /api/ideas/:id/convert-to-task   - Convert to task
POST   /api/ideas/:id/convert-to-note   - Convert to note
```

### 8.5 Notes Endpoints

```
GET    /api/notes                       - List notes (with tag filters, search)
POST   /api/notes                       - Create note
GET    /api/notes/:id                   - Get single note
PUT    /api/notes/:id                   - Update note
DELETE /api/notes/:id                   - Delete note
GET    /api/notes/search?q=             - Full-text search
```

### 8.6 Focus Sessions Endpoints

```
GET    /api/sessions                    - List sessions (with date filters)
POST   /api/sessions                    - Start new session
PATCH  /api/sessions/:id                - Update session (mark complete)
GET    /api/sessions/stats              - Get focus time analytics
GET    /api/sessions/today              - Get today's session summary
```

### 8.7 Dashboard Endpoints

```
GET    /api/dashboard                   - Get all dashboard data in one call
GET    /api/dashboard/today             - Today's summary
GET    /api/dashboard/weekly            - Weekly overview
```

---

## 9. Data Models (Schema Overview)

### 9.1 Users Table
```typescript
users {
  id:          uuid (PK)
  email:       string (unique, indexed)
  passwordHash: string
  name:        string
  createdAt:   timestamp
  updatedAt:   timestamp
}
```

### 9.2 Journals Table
```typescript
journals {
  id:        uuid (PK)
  userId:    uuid (FK → users)
  date:      date (indexed)
  mood:      enum (great, good, okay, low, bad)
  energy:    integer (1-5)
  prompts:   jsonb  // { gratitude: "...", intention: "...", etc. }
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 9.3 Tasks Table
```typescript
tasks {
  id:          uuid (PK)
  userId:      uuid (FK → users)
  title:       string
  description: text (nullable)
  dueDate:     date (nullable, indexed)
  priority:    enum (P1, P2, P3, P4)
  status:      enum (todo, in_progress, completed)
  tags:        string[] (indexed)
  completedAt: timestamp (nullable)
  createdAt:   timestamp
  updatedAt:   timestamp
}
```

### 9.4 Ideas Table
```typescript
ideas {
  id:        uuid (PK)
  userId:    uuid (FK → users)
  content:   text
  status:    enum (inbox, converted, archived)
  createdAt: timestamp
}
```

### 9.5 Notes Table
```typescript
notes {
  id:        uuid (PK)
  userId:    uuid (FK → users)
  title:     string
  content:   text (markdown)
  source:    string (nullable)  // book title, article URL, etc.
  tags:      string[] (indexed)
  linkedNotes: uuid[] (FK → notes)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### 9.6 Focus Sessions Table
```typescript
focusSessions {
  id:        uuid (PK)
  userId:    uuid (FK → users)
  taskId:    uuid (FK → tasks, nullable)
  duration:  integer (minutes)
  startedAt: timestamp
  endedAt:   timestamp (nullable)
  status:    enum (active, completed, cancelled)
  createdAt: timestamp
}
```

---

## 10. Scope Boundaries

### 10.1 In Scope (MVP — Phase 1)

| Feature | Detail |
|---------|--------|
| **Auth** | Email/password register & login, JWT-based session |
| **Morning Journal** | 3 daily prompts, mood selection, history view, streak counter |
| **Task Management** | CRUD tasks, Today/Week/Someday views, basic filters |
| **Idea Capture** | Quick capture widget, inbox view, convert to task/note |
| **Focus Timer** | Pomodoro (25/50/90 min), session tracking, basic sound alert |
| **Dashboard** | Today's snapshot, quick actions, basic stats |
| **Data Export** | Full JSON export |

### 10.2 Out of Scope (Phase 2+)

| Feature | Reason |
|---------|--------|
| **Google OAuth** | Can be added later, MVP cukup email/password |
| **Team/Collaboration** | B2C product, personal use first |
| **Mobile Native App** | Responsive web dulu |
| **AI-powered insights** | Nice-to-have, add setelah retention terbukti |
| **Social features** | Share progress, community challenges |
| **Integrations** | Notion, Calendar sync — terlalu kompleks untuk MVP |
| **Subscription/Paywall** | Free tier unlimited untuk personal use |
| **Offline mode** | PWA bisa tapi offline fullsync kompleks |
| **Wiki linking** | Nice-to-have untuk knowledge base |
| **Weekly review template** | Bisa jadi simple checklist dulu |

### 10.3 Out of Scope (Forever / Anti-Feature Creep)

- Email/chat features
- File attachments beyond basic avatars
- Advanced reporting/BI dashboards
- Multi-workspace/teams
- White-labeling

---

## 11. User Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ENTRY POINT                             │
│                    (Landing / Auth Check)                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   ┌─────────────┐         ┌─────────────┐
   │   LOGGED IN  │         │  NOT LOGGED  │
   └──────┬──────┘         └──────┬──────┘
          │                       │
          ▼                       ▼
   ┌─────────────┐         ┌─────────────┐
   │  DASHBOARD   │         │    LOGIN/    │
   │   (TODAY)    │         │   REGISTER   │
   └──────┬──────┘         └─────────────┘
          │
          ├─────────────────────────────────────────┐
          │                                         │
          ▼                                         ▼
   ┌─────────────┐                         ┌─────────────┐
   │   JOURNAL   │                         │   TASKS     │
   │   (Morning) │                         │   (Daily)   │
   └──────┬──────┘                         └──────┬──────┘
          │                                         │
          └─────────────────┬───────────────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  FOCUS MODE  │
                    │   (Timer)    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   CAPTURE    │
                    │   (Ideas)    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   KNOWLEDGE  │
                    │   (Notes)    │
                    └─────────────┘
```

---

## 12. Success Metrics & KPIs

### 12.1 Product Metrics (North Star)
| Metric | Baseline | Week 4 Target | Week 12 Target |
|--------|----------|---------------|----------------|
| DAU/MAU ratio | N/A | 40% | 50% |
| Avg. sessions per user per week | N/A | 3 | 5 |
| Morning journal completion rate | N/A | 30% | 50% |
| Tasks completed per user per day | N/A | 1.5 | 3 |

### 12.2 Engagement Metrics
| Metric | Definition |
|--------|------------|
| **Day 1 Retention** | Users who return day after signup |
| **Day 7 Retention** | Users who return 7 days after signup |
| **Day 30 Retention** | Users who return 30 days after signup |
| **Weekly Active Users** | Unique users with ≥1 action per week |
| **Feature Adoption** | % users who use each feature at least once |

### 12.3 Technical Metrics
| Metric | Target |
|--------|--------|
| API error rate | < 0.1% |
| Average page load time | < 2s |
| Lighthouse score | > 90 |
| Uptime | 99.5% |

---

## 13. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Scope creep** | High | High | Strict MVP boundary, defer all nice-to-haves |
| **User doesn't form habits** | Medium | High | Onboarding flow, streak system, reminders |
| **Performance issues** | Medium | Medium | Optimize queries, lazy loading, caching |
| **Data loss** | Low | Critical | Daily backups, export feature, clear data policy |
| **Low engagement** | Medium | High | User feedback loop, iterate based on usage data |
| **Security breach** | Low | Critical | JWT + refresh tokens, input sanitization, HTTPS |

---

## 14. MVP Release Checklist

### Must Have Before Launch
- [ ] User registration & login flow works
- [ ] Morning journal with 3 prompts functional
- [ ] Task CRUD with Today view works
- [ ] Idea capture accessible
- [ ] Focus timer counts down correctly
- [ ] Dashboard shows today's data
- [ ] All data persists in database
- [ ] Password hashing implemented
- [ ] Error handling for all edge cases
- [ ] Mobile-responsive layout
- [ ] Basic smoke tests passing

### Nice to Have Before Launch
- [ ] Google OAuth
- [ ] Sound notifications for timer
- [ ] Journal streak display
- [ ] Task priority indicators
- [ ] Basic animations

---

## 15. Future Roadmap (Post-MVP)

### Phase 2 (Months 2-3)
- Google OAuth integration
- Sound notification for timer
- Weekly review template
- Data export/import feature
- PWA support (installable)

### Phase 3 (Months 4-6)
- AI-powered daily briefing
- "Productivity insights" based on patterns
- Book/library management for knowledge notes
- Notification/reminder system

### Phase 4 (Months 7+)
- Optional: Simple subscription for premium features
- Optional: Basic social features (share daily wins)

---

## 16. Definitions & Glossary

| Term | Definition |
|------|------------|
| **Deep Work** | Focused, uninterrupted work that pushes cognitive capabilities to the limit |
| **1% Rule** | Concept from Atomic Habits — improve 1% every day for compounding results |
| **Quick Capture** | Ability to capture thoughts/ideas instantly without context switching |
| **Morning Journal** | Daily journaling practice to set intentions and reflect |
| **Focus Session** | Timed work block (Pomodoro/Deep Work) with start/end tracking |
| **Inbox** | Temporary collection area for captured ideas before processing |
| **Streak** | Consecutive days of completing a habit (journaling, tasks, etc.) |

---

**Document Version:** 1.0  
**Last Updated:** August 2026  
**Author:** [Your Name]  
**Status:** Draft — Ready for Review

---

PRD ini sudah cukup komprehensif untuk jadi acuan development. Dari sini kamu bisa langsung masuk ke fase **UI/UX wireframing** atau langsung **sprint planning** untuk MVP. Mau saya bantu breakdown lebih detail di bagian tertentu, atau mulai dengan technical architecture yang lebih deep?
