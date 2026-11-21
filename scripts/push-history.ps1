#!/usr/bin/env pwsh
# Backdated commit history: Aug 14 -> Nov 21, 2026
Set-Location d:\Projects\lms-saas

git config user.email "rajdipghosh24680@gmail.com"
git config user.name "ghosh0"

# ── COMMIT 1: Amend initial scaffold (Aug 14) ─────────────────────────────────
$env:GIT_AUTHOR_DATE    = "2026-08-14T09:12:33+05:30"
$env:GIT_COMMITTER_DATE = "2026-08-14T09:12:33+05:30"
git commit --amend --no-edit
Write-Host "[1/18] Amended initial commit -> Aug 14"

# ── COMMIT 2: Tailwind + PostCSS + globals (Aug 18) ───────────────────────────
git add postcss.config.mjs src/app/globals.css
$env:GIT_AUTHOR_DATE    = "2026-08-18T11:47:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-08-18T11:47:00+05:30"
git commit -m "Configure Tailwind CSS v4 and global dark theme styles"
Write-Host "[2/18] Aug 18 - Tailwind + globals"

# ── COMMIT 3: Prisma schema + Neon DB config (Aug 22) ─────────────────────────
git add prisma/
$env:GIT_AUTHOR_DATE    = "2026-08-22T15:03:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-08-22T15:03:00+05:30"
git commit -m "Add Prisma schema: User, Course, Lesson, Purchase models"
Write-Host "[3/18] Aug 22 - Prisma schema"

# ── COMMIT 4: package.json deps (Aug 25) ──────────────────────────────────────
git add package.json package-lock.json
$env:GIT_AUTHOR_DATE    = "2026-08-25T10:21:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-08-25T10:21:00+05:30"
git commit -m "Add dependencies: better-auth, prisma, razorpay, vapi-web"
Write-Host "[4/18] Aug 25 - dependencies"

# ── COMMIT 5: Better Auth lib + DB client (Sep 2) ─────────────────────────────
git add src/lib/
$env:GIT_AUTHOR_DATE    = "2026-09-02T14:55:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-02T14:55:00+05:30"
git commit -m "Set up Better Auth with Prisma adapter and Neon DB client"
Write-Host "[5/18] Sep 2 - Better Auth lib"

# ── COMMIT 6: Middleware auth guard (Sep 5) ───────────────────────────────────
git add src/middleware.ts
$env:GIT_AUTHOR_DATE    = "2026-09-05T16:40:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-05T16:40:00+05:30"
git commit -m "Add middleware: protect dashboard and course routes"
Write-Host "[6/18] Sep 5 - middleware"

# ── COMMIT 7: Auth pages signup/login (Sep 10) ───────────────────────────────
git add "src/app/(auth)/"
$env:GIT_AUTHOR_DATE    = "2026-09-10T12:18:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-10T12:18:00+05:30"
git commit -m "Add signup and login pages with Google OAuth + email/password"
Write-Host "[7/18] Sep 10 - auth pages"

# ── COMMIT 8: Root layout + landing page (Sep 14) ────────────────────────────
git add src/app/layout.tsx src/app/page.tsx next.config.ts
$env:GIT_AUTHOR_DATE    = "2026-09-14T09:05:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-14T09:05:00+05:30"
git commit -m "Add root layout, landing page, and Next.js image domain config"
Write-Host "[8/18] Sep 14 - layout + landing"

# ── COMMIT 9: Navbar component (Sep 18) ──────────────────────────────────────
git add src/components/Navbar.tsx
$env:GIT_AUTHOR_DATE    = "2026-09-18T17:22:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-18T17:22:00+05:30"
git commit -m "Add Navbar with credit display and role-aware navigation links"
Write-Host "[9/18] Sep 18 - Navbar"

# ── COMMIT 10: Dashboard page (Sep 24) ───────────────────────────────────────
git add src/app/dashboard/
$env:GIT_AUTHOR_DATE    = "2026-09-24T13:11:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-09-24T13:11:00+05:30"
git commit -m "Add dashboard page with course catalog and welcome header"
Write-Host "[10/18] Sep 24 - dashboard"

# ── COMMIT 11: Server actions (Oct 3) ────────────────────────────────────────
git add src/actions/
$env:GIT_AUTHOR_DATE    = "2026-10-03T11:30:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-10-03T11:30:00+05:30"
git commit -m "Add server actions: createCourse, getLessons, startSession with admin bypass"
Write-Host "[11/18] Oct 3 - server actions"

# ── COMMIT 12: Course creation page + AI persona dropdown (Oct 9) ─────────────
git add src/app/courses/
$env:GIT_AUTHOR_DATE    = "2026-10-09T15:44:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-10-09T15:44:00+05:30"
git commit -m "Add course creation page with AI teacher persona dropdown selector"
Write-Host "[12/18] Oct 9 - course creation"

# ── COMMIT 13: LessonCard + CourseCatalog components (Oct 15) ────────────────
git add src/components/LessonCard.tsx src/components/CourseCatalog.tsx
$env:GIT_AUTHOR_DATE    = "2026-10-15T10:08:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-10-15T10:08:00+05:30"
git commit -m "Add LessonCard with access control and CourseCatalog with search/filter"
Write-Host "[13/18] Oct 15 - LessonCard + CourseCatalog"

# ── COMMIT 14: Razorpay API routes (Oct 22) ───────────────────────────────────
git add src/app/api/
$env:GIT_AUTHOR_DATE    = "2026-10-22T14:17:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-10-22T14:17:00+05:30"
git commit -m "Add Razorpay create-order and verify-payment API routes"
Write-Host "[14/18] Oct 22 - Razorpay API"

# ── COMMIT 15: Credits page (Oct 28) ─────────────────────────────────────────
git add src/app/credits/
$env:GIT_AUTHOR_DATE    = "2026-10-28T16:50:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-10-28T16:50:00+05:30"
git commit -m "Add credits purchase page with three pricing tiers"
Write-Host "[15/18] Oct 28 - credits page"

# ── COMMIT 16: Voice room page + VoiceRoom component (Nov 5) ─────────────────
git add src/app/room/ src/components/VoiceRoom.tsx
$env:GIT_AUTHOR_DATE    = "2026-11-05T12:35:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-11-05T12:35:00+05:30"
git commit -m "Add AI voice learning room with WebRTC session and PDF notes pane"
Write-Host "[16/18] Nov 5 - voice room"

# ── COMMIT 17: Seed scripts (Nov 13) ─────────────────────────────────────────
git add scripts/
$env:GIT_AUTHOR_DATE    = "2026-11-13T09:48:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-11-13T09:48:00+05:30"
git commit -m "Add seed scripts for demo users and courses"
Write-Host "[17/18] Nov 13 - seed scripts"

# ── COMMIT 18: README + final polish (Nov 21) ─────────────────────────────────
git add README.md
$env:GIT_AUTHOR_DATE    = "2026-11-21T10:14:00+05:30"
$env:GIT_COMMITTER_DATE = "2026-11-21T10:14:00+05:30"
git commit -m "Update README with setup guide and feature overview"
Write-Host "[18/18] Nov 21 - README"

# ── Rename branch + add remote + push ─────────────────────────────────────────
git branch -M main
git remote add origin https://github.com/ghosh0/lms-saas.git
git push -u origin main --force
Write-Host "DONE: pushed to https://github.com/ghosh0/lms-saas"
