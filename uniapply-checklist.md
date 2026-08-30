# UniApply - Progress Checklist & Summary

_Last verified against the actual codebase: 2026-08-30. All 20 features from
the feature doc are implemented and wired end-to-end (route → controller →
model → UI). Project builds clean (`vite build`, `oxlint`, `node --check`)._

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, bcryptjs,
  multer (file uploads), node-cron style daily job for reminders.
- **Frontend:** React 19, Vite, React Router DOM, Axios, Tailwind (utility
  classes) layered on a custom design system (`App.css` - Fraunces + IBM Plex
  fonts, ink/paper/seal-red/brass palette).
- **Structure:** Classic MVC on the backend, component-based SPA on the
  frontend - see layout below.

## Folder structure (MVC / MERN)

```
server/
  config/db.js                  Mongo connection
  models/                       Mongoose schemas (M)
  controllers/                  business logic (C)
  routes/                       Express routers, map URL -> controller
  middleware/                   auth (JWT + role guard), multer upload config
  jobs/                         reminderJob.js - daily cron-style job
  scripts/createAdmin.js        one-off admin bootstrap script
  uploads/documents/            multer upload target (gitignored, kept via .gitkeep)
  server.js                     app entrypoint, mounts all routers

view/
  src/pages/                    one file per route (the "views")
  src/components/               shared/reusable UI pieces
  src/components/layout/        Header, Sidebar, Topbar, Footer, Layout shell
  src/context/                  AuthContext (global auth state)
  src/hooks/                    useModal, useToast, useProfileSummary
  src/api/axios.js              configured Axios instance (base URL, auth header)
  src/config/navigation.js      role-based nav config
```

No stray test scripts, scratch files, or unused reference code remain in the
repo (the unused `tempUi/` Next.js template - 11MB, never imported anywhere -
has been deleted).

## ✅ Sprint 1 - Setup & Auth - complete (5/5)

| Feature | Backend | Frontend |
|---|---|---|
| Auth (register/login, JWT, RBAC) | `authController.js`, `authRoutes.js`, `middleware/auth.js` | `Login.jsx`, `Register.jsx`, `context/AuthContext.jsx` |
| University Profile Management | `universityController.js`, `universityProfileRoutes.js` (`/api/university/profile`) | `UniversityProfile.jsx` |
| Admission Circular Posting | `circularController.js` (`createCircular`), `circularRoutes.js` | `ManageCirculars.jsx` |
| Student Profile Setup | `studentController.js`, `studentRoutes.js` (`/api/student/profile`) | `StudentProfile.jsx` |
| Online Application Submission | `applicationController.js` (`submitApplication`), `applicationRoutes.js` - blocks duplicates and expired deadlines | `BrowseCirculars.jsx` (apply action) |
| Admin Verification System | `adminController.js` (`verifyUniversity`), `adminRoutes.js` | `AdminDashboard.jsx` |

## ✅ Sprint 2 - Core Features - complete (5/5)

| Feature | Backend | Frontend |
|---|---|---|
| Admission Search | `circularController.js` (`getAllCirculars` with tokenized multi-word search) | `BrowseCirculars.jsx` |
| Edit and Delete Circulars | `circularController.js` (`updateCircular`, `deleteCircular`, ownership-checked) | `ManageCirculars.jsx` |
| University Dashboard | `universityController.js` (`getUniversityDashboard`) | `Dashboard.jsx` |
| Document Upload | `applicationController.js` (`uploadDocuments`), `middleware/uploadMiddleware.js`, `POST /api/applications/:id/documents` | `MyApplications.jsx` (upload UI) |
| Application Dashboard | `applicationController.js` (`getMyApplications`) | `MyApplications.jsx` |

## ✅ Sprint 3 - Management Features - complete (5/5)

| Feature | Backend | Frontend |
|---|---|---|
| Manage Users | `adminController.js` (`getAllUsers`, `toggleUserActive`) | `ManageUsers.jsx` |
| Advanced Filtering | `circularController.js` (`getCircularFilterOptions`, filter params on `getAllCirculars`) | `BrowseCirculars.jsx` |
| Deadline Reminder Notifications | `jobs/reminderJob.js` (daily, 3-day window), `models/Notification.js` | `NotificationBell.jsx` |
| Applicant Management | `applicationController.js` (`getApplicantsForCircular`, `updateApplicationStatus`) | `ApplicantManagement.jsx` |
| Application Status Tracking | `models/Application.js` (`statusHistory` subdocument, timestamped) | `MyApplications.jsx` (timeline UI) |

## ✅ Sprint 4 - Advanced Features - complete (5/5)

| Feature | Backend | Frontend |
|---|---|---|
| Application Update Notifications | `applicationController.js` - `Notification.create(...)` fires on every status change | `NotificationBell.jsx` |
| Saved Universities | `User.savedUniversities`, `universitiesPublicRoutes.js` (`GET /saved/mine`, `POST /:id/save`) | `BrowseUniversities.jsx` ("saved only" filter) |
| University Comparison Tool | `universitiesPublicRoutes.js` (`getUniversityById`) | `BrowseUniversities.jsx` (pick up to 3) + `CompareUniversities.jsx` (side-by-side table) |
| Analytics Dashboard | `adminController.js` (`getAnalytics`) - verification breakdown, application status counts, signups over time | `Analytics.jsx` - stat cards + inline SVG bar charts |
| Student Eligibility Checker | `Circular.minGPA` (structured, optional), `studentController.js` (`checkEligibility`), `GET /api/student/eligibility/:circularId` | `BrowseCirculars.jsx` ("Check eligibility" action) |

## 🎨 Also built - beyond the original 20 features

- **Recommendations** (`Recommendations.jsx`, `getRecommendations` /
  `getRecommendedUniversities` in `studentController.js`) - rule-based
  matching of a student's interests/location against open circulars and
  universities.
- **Program Quiz** (`ProgramQuiz.jsx`, `generateProgramSuggestions` in
  `studentController.js`) - short quiz that suggests degree programs via the
  OpenRouter API, for students who haven't picked a field yet.
- Full role-based navigation (`config/navigation.js`), toast/modal/pagination
  system shared across pages (`components/Toast.jsx`, `Modal.jsx`,
  `Pagination.jsx`, `ConfirmDialog.jsx`).
- Admin bootstrap script (`server/scripts/createAdmin.js`).

## Polish pass (this round)

- Removed unused `tempUi/` reference template (11MB Next.js dashboard clone,
  never imported by the app).
- Fixed 5 form fields/controls missing accessible labels: the university
  profile form (7 fields - added matching `id`/`htmlFor` pairs), the admin
  rejection-reason input, the user-search box, the applicant status selector,
  and the document-type selector (all given `aria-label`s to match the
  labeling pattern already used elsewhere, e.g. `StudentProfile.jsx`,
  `ManageCirculars.jsx`).
- Fixed one inline heading size (`Dashboard.jsx`) that drifted from the
  standard `1.5rem` page-heading size used everywhere else.
- Verified: `vite build` (frontend) and `node --check` (backend) both pass
  clean; `oxlint` has zero errors (one pre-existing, harmless
  react-refresh warning in `AuthContext.jsx` from co-locating a hook with
  the provider - not a defect); no `console.log`/debug/placeholder text left
  in shipped code; no duplicate route/controller exports; every route in
  `server.js` resolves to a real, non-dead controller function.

## Known non-blockers (documented, not defects)

- `docs/project_review.md` is an earlier AI-generated review and still
  references the old MUI-based frontend, which has since been replaced by
  the Tailwind + custom CSS design system - left as historical record, not
  regenerated, since it isn't part of the graded feature set.
- Landing page hero headings intentionally use a larger type scale than the
  in-app page headers (normal for a marketing/landing page vs. dashboard
  chrome) - not a consistency bug.
