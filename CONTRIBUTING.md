# Contributing to UniApply

This document is our team's Git workflow. Follow it consistently — it's part
of the grading rubric and it also just makes group work less painful.

## Branches

- `main` — always deployable. Protected. Only updated via PR from `develop`,
  ideally once per sprint.
- `develop` — integration branch. All feature branches merge here first.
- `feature/<sprint>-<short-name>` — one branch per feature.
  - Examples: `feature/s1-university-profile`, `feature/s2-admission-search`,
    `feature/s3-manage-users`, `feature/s4-analytics-dashboard`

Never commit directly to `main` or `develop`.

## Workflow

1. Pull latest `develop`: `git checkout develop && git pull`
2. Branch off: `git checkout -b feature/s1-university-profile`
3. Commit as you go (see commit convention below)
4. Push: `git push -u origin feature/s1-university-profile`
5. Open a Pull Request into `develop`
6. At least **one teammate reviews and approves** before merging
7. Delete the feature branch after merge

At the end of each sprint, open a PR from `develop` → `main`.

## Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short description>

[optional longer description]
```

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`

Examples:
```
feat: add university profile creation endpoint
fix: correct deadline validation on circular form
docs: update README with setup instructions
refactor: extract auth middleware into separate file
```

## Pull requests

- Title matches the feature (e.g. "Sprint 1: University Profile Management")
- Description: what changed, how to test it, and which feature # from the
  doc it covers
- Link the related GitHub Issue
- Keep PRs scoped to one feature — don't bundle unrelated changes

## Issues & project board

- Every feature from `docs/feature-doc.md` gets a GitHub Issue, labeled by
  sprint (`sprint-1` .. `sprint-4`) and assigned to the member in charge
- Track progress on the repo's GitHub Project board:
  `Backlog → In Progress → In Review → Done`

## Environment variables

Never commit `.env` files. Copy `.env.example` → `.env` locally and fill in
your own values.
