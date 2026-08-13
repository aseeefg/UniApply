# UniApply — Progress Checklist & Summary

## ✅ Completed & tested end-to-end

- [x] Auth system — register/login, JWT, role-based access (student/university/admin)
- [x] University Profile Management — create on register, view/edit via dashboard
- [x] Admission Circular Posting
- [x] Edit and Delete Circulars (ownership-checked)
- [x] Student Profile Setup — academic info (SSC, HSC, GPA, contact)
- [x] Online Application Submission — blocks duplicates and expired deadlines
- [x] Application Dashboard ("My Applications")
- [x] Admin Verification System — approve/reject universities, tested live

**That's Sprint 1, fully done: all 5 planned features plus the auth system
they all depend on.**

## 🎨 Also done — frontend & tooling (not in the original feature list, but part of the work)

- [x] Full GitHub repo set up with proper structure, README, CONTRIBUTING.md
- [x] MVC-structured codebase (`models/`, `controllers/`, `routes/`,
      `middleware/` on the backend; `view/` as the React frontend)
- [x] MongoDB Atlas connected and shared across the team
- [x] Admin account creation script (`server/scripts/createAdmin.js`)
- [x] Full MUI-based redesign: landing page, login, register — themed to a
      custom palette (ink/paper/seal-red/brass), Fraunces + IBM Plex fonts
- [x] Windows setup guide written for teammates to clone and run locally

## 🟡 Partially there (backend supports it, no dedicated UI yet)

- [ ] University Dashboard — currently just a circular list, doesn't yet show
      applicant counts (needs Applicant Management built first)
- [ ] Application Status Tracking UI — the data model already stores full
      timestamped status history, but no page displays that history yet

## ⬜ Not started (Sprints 2–4, per the feature doc)

- [ ] Admission Search
- [ ] Document Upload
- [ ] Advanced Filtering
- [ ] University Comparison Tool
- [ ] Saved Universities
- [ ] Student Eligibility Checker
- [ ] Applicant Management
- [ ] Manage Users
- [ ] Deadline Reminder Notifications
- [ ] Application Update Notifications
- [ ] Analytics Dashboard

## Summary of what's been worked on

Sprint 1 is complete and verified working end to end — not just built, but
actually tested through the full flow (register → profile → post circular →
apply → track status → admin approval). On top of the feature list itself,
significant time went into getting the engineering fundamentals right:
proper Git/GitHub workflow, a real MVC-structured codebase, a shared cloud
database, and a deliberate design system rather than default styling — since
those are graded alongside the features themselves.

## What to work on next

Agreed plan from last session:

1. **Add interest/preference fields to student profile setup** — degree
   level, subject interests, preferred location
2. **Personalized recommendations (rule-based)** — match a student's
   interests/location against open circulars, essentially a smarter,
   personalized version of Admission Search
3. **AI-generated "why this fits you" explanations** — layered on top,
   clearly framed as suggestions, not guarantees (explicitly NOT an
   admission-chance predictor — see below)

After that, the rest of Sprint 2 (Admission Search, Document Upload) and
Sprint 3 (Applicant Management, Manage Users, Deadline Reminders) are the
next logical targets, since they're still fully unbuilt.

**One thing intentionally left out:** an "admission chance %" predictor was
discussed and deliberately rejected — it would need historical outcome data
that doesn't exist, so any number produced would be fabricated confidence
rather than a real prediction. The Eligibility Checker (comparing GPA
against a circular's stated minimum) is the honest version of that idea.
