# Theta Tau (Xi Epsilon) Website — Complete Developer & Webmaster Onboarding Guide

Welcome, new Webmaster! You’re likely stepping into this role at the change of officer terms. This comprehensive guide covers everything from initial repository setup and frontend state architecture with Jotai to daily admin workflows, Bid Night deliberations, DNS troubleshooting, and rush interview scheduling.

---

## 1. Project Overview & Architecture

The website is a modern TypeScript **monorepo** built with **React**, **Vite**, **Jotai (Atomic State Management)**, and **Tailwind CSS**, hosted on **Vercel** with DNS managed through **Porkbun**, and powered by **Google Firebase (Firestore, Auth, Storage, Cloud Functions)**.

```
Beach-Theta-Tau-Website/
├── apps/
│   ├── web/               # React + Vite frontend web application
│   │   ├── src/
│   │   │   ├── app/       # Routing, providers (Auth), layouts & guards
│   │   │   ├── modules/   # Business modules (admin, auth, deliberations, members, profile)
│   │   │   │   ├── <feature>/
│   │   │   │   │   ├── api/          # Firebase repositories & data mapping
│   │   │   │   │   ├── atoms/        # Jotai atomic global & derived state
│   │   │   │   │   ├── components/   # Feature UI components
│   │   │   │   │   ├── hooks/        # Subscription lifecycle & Jotai integration
│   │   │   │   │   ├── pages/        # Route page composition
│   │   │   │   │   └── utils/        # Feature-specific helpers & sorting
│   │   │   └── shared/    # UI kit, Firebase client instance, & bundled assets (Brothers photos)
│   │   └── public/        # Stable static public assets
│   └── functions/         # Firebase Cloud Functions (v2) for privileged backend tasks
├── packages/
│   └── contracts/         # Shared TypeScript contracts, roles, & position constants
├── firebase/              # Firestore indexes, security rules, and Storage rules
├── scripts/               # Migration, maintenance, and data import utilities
└── docs/                  # Architectural notes, data models, runbooks, & onboarding
```

### Key Services & Infrastructure
- **Web App**: React 18, Vite, TypeScript, Jotai, Tailwind CSS
- **Hosting**: [Vercel](https://vercel.com) (Deployment URL: `https://beach-theta-tau-website-git-main-beachs-projects-7a89237b.vercel.app/` / Custom Domain: `beachthetatau.com`)
- **Domain & DNS**: [Porkbun](https://porkbun.com)
- **Backend**: Firebase Project `beachthetatauwebsite` (Firestore, Authentication, Cloud Functions v2)

---

## 2. Frontend State Management with Jotai

The web application uses **[Jotai](https://jotai.org/)** for client-side state management. Jotai provides a minimalist, atomic approach to state that avoids monolithic stores, eliminates prop drilling, and ensures fine-grained React re-renders.

### Why Jotai?
1. **Atomic Architecture**: State is split into granular, independent units called *atoms*. Components re-render **only** when the specific atoms they subscribe to change.
2. **Zero Provider Boilerplate**: Primitive atoms can be accessed globally across routes and components without wrapping the component tree in deeply nested context providers.
3. **Seamless Firebase Integration**: Real-time Firestore subscriptions (`onSnapshot`) pipe data directly into Jotai atoms through custom hooks. UI components simply consume atoms reactively.
4. **Derived Computations**: Derived (read-only) atoms compute transformed values (such as search filters, officer partitioning, or active vote states) with automatic dependency tracking, eliminating redundant `useMemo` calls across components.

---

### Core Atom Patterns in the Codebase

#### 1. Primitive Atoms
Hold raw values and serve as the source of truth for a feature.
```typescript
import { atom } from "jotai";
import type { MemberProfile } from "@beach-theta-tau/contracts";

/** Full list of verified active members */
export const allMembersAtom = atom<MemberProfile[]>([]);

/** Currently selected member for modal inspection */
export const selectedMemberModalAtom = atom<MemberProfile | null>(null);

/** Search query string for member directory */
export const memberSearchQueryAtom = atom<string>("");
```

#### 2. Derived (Computed) Read-Only Atoms
Created by passing a getter function `(get) => ...`. These recompute automatically whenever any atom accessed via `get(...)` changes.
```typescript
import { atom } from "jotai";
import { allMembersAtom, memberSearchQueryAtom, memberClassFilterAtom } from "./members.atoms";

/** Derived: Filtered members based on search query and class filter */
export const filteredMembersAtom = atom<MemberProfile[]>((get) => {
  const members = get(allMembersAtom);
  const query = get(memberSearchQueryAtom).toLowerCase().trim();
  const classFilter = get(memberClassFilterAtom);

  return members.filter((member) => {
    const matchesClass =
      classFilter === "all" ||
      !classFilter ||
      member.class?.toLowerCase() === classFilter.toLowerCase();

    if (!matchesClass) return false;
    if (!query) return true;

    return (
      member.name.toLowerCase().includes(query) ||
      (member.major && member.major.toLowerCase().includes(query)) ||
      (member.position && member.position.toLowerCase().includes(query)) ||
      (member.class && member.class.toLowerCase().includes(query))
    );
  });
});
```

#### 3. Real-Time Firebase Subscriptions + Jotai Hooks
Custom hooks in `hooks/` manage Firestore listener lifecycles and write directly into atoms using `useSetAtom` or `useAtom`.

```typescript
// apps/web/src/modules/deliberations/hooks/useActiveCandidate.ts
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { subscribeActiveCandidateId } from "../api/deliberations.repository";
import { activeCandidateIdAtom } from "../atoms/deliberations.atoms";

export function useActiveCandidate() {
  const [candidateId, setCandidateId] = useAtom(activeCandidateIdAtom);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () =>
      subscribeActiveCandidateId(
        (nextId) => {
          setCandidateId(nextId);
          setLoading(false);
        },
        (nextError) => {
          setError(nextError.message);
          setLoading(false);
        },
      ),
    [setCandidateId],
  );

  return { candidateId, loading, error };
}
```

#### 4. Optimistic UI Updates
In high-concurrency flows like Bid Night voting (`useBallot.ts`), Jotai state updates optimistically on the client first, rolls back if Firebase writes fail, and propagates instantly to dependent derived atoms.

```typescript
// Snippet from apps/web/src/modules/deliberations/hooks/useBallot.ts
const vote = async (choice: VoteChoice) => {
  if (!account || !active.candidateId) return;
  const candidateId = active.candidateId;
  const previousVote = currentVote;
  const nextVote = previousVote === choice ? null : choice;

  // 1. Optimistically update Jotai atoms
  setVotes((current) => {
    const next = { ...current };
    if (nextVote) next[candidateId] = nextVote;
    else delete next[candidateId];
    return next;
  });

  setSaving(true);
  try {
    // 2. Persist to Firestore
    await castVote(candidateId, nextVote);
  } catch (nextError) {
    // 3. Rollback on failure
    setVotes((current) => {
      const next = { ...current };
      if (previousVote) next[candidateId] = previousVote;
      else delete next[candidateId];
      return next;
    });
    setError(nextError instanceof Error ? nextError.message : "Unable to save your vote.");
  } finally {
    setSaving(false);
  }
};
```

---

### Existing Atom Store Reference

#### 📁 Members Module (`apps/web/src/modules/members/atoms/members.atoms.ts`)

| Atom | Type | Description |
| :--- | :--- | :--- |
| `allMembersAtom` | `Primitive<MemberProfile[]>` | Full array of verified active member profiles loaded from Firestore. |
| `selectedMemberModalAtom` | `Primitive<MemberProfile \| null>` | Member profile currently being inspected in the detail modal. |
| `showingOfficersAtom` | `Primitive<boolean>` | View toggle (`true` = Executive Board & Chairs, `false` = Class grid). |
| `memberSearchQueryAtom` | `Primitive<string>` | Active text query for filtering members by name, major, position, or class. |
| `memberClassFilterAtom` | `Primitive<string>` | Selected pledge class filter tab (e.g. `"Alpha"`, `"Beta"`, `"all"`). |
| `executiveBoardMembersAtom` | `Derived<MemberProfile[]>` | Filtered list containing only Executive Board officers (`Regent`, `Vice-Regent`, etc.). |
| `chairMembersAtom` | `Derived<MemberProfile[]>` | Filtered list containing Committee Chairs & Directors. |
| `filteredMembersAtom` | `Derived<MemberProfile[]>` | Dynamically computed list reflecting both `memberSearchQueryAtom` and `memberClassFilterAtom`. |

#### 📁 Deliberations Module (`apps/web/src/modules/deliberations/atoms/deliberations.atoms.ts`)

| Atom | Type | Description |
| :--- | :--- | :--- |
| `delibsSessionActiveAtom` | `Primitive<boolean>` | Global status indicating whether the deliberation session is currently open. |
| `activeCandidateIdAtom` | `Primitive<string \| null>` | ID of the candidate currently broadcasted by the admin to all members. |
| `allCandidatesAtom` | `Primitive<DeliberationCandidate[]>` | Array of all imported rushee candidates for deliberation. |
| `activeCandidateAtom` | `Derived<DeliberationCandidate \| null>` | Full candidate object resolved from `allCandidatesAtom` matching `activeCandidateIdAtom`. |
| `sortedCandidatesAtom` | `Derived<DeliberationCandidate[]>` | Alphabetically sorted list of all candidates for directory and grid views. |
| `memberVotesAtom` | `Primitive<Record<string, VoteChoice>>` | Map of candidate IDs to the current authenticated member's cast vote (`Yes`/`No`/`Abstain`). |
| `currentActiveVoteAtom` | `Derived<VoteChoice \| null>` | The current member's vote specifically for the actively broadcasted candidate. |
| `liveVoteTotalsByCandidateAtom` | `Primitive<Record<string, VoteTotals>>` | Real-time aggregated vote tallies by candidate ID. |
| `adminSelectedCandidateAtom` | `Primitive<DeliberationCandidate \| null>` | Candidate currently selected in the admin dashboard panel. |

---

### Jotai Best Practices for Webmasters & Developers

1. **Pick the Right Hook for Performance**:
   - `useAtomValue(myAtom)`: When the component only needs to **read** state. Prevents re-renders caused by dispatch handler identity changes.
   - `useSetAtom(myAtom)`: When the component only needs to **write** or dispatch updates (e.g., buttons, reset triggers). The component will **not** re-render when the atom's value changes!
   - `useAtom(myAtom)`: When the component needs **both** read and write capabilities (similar to `useState`).
2. **Keep Atoms Pure and Synchronous**:
   - Define atom definitions in `atoms/<feature>.atoms.ts`.
   - Avoid executing asynchronous network calls inside basic atom definitions. Handle asynchronous side-effects, Firebase listeners, and API mutations inside `hooks/` or `api/` repositories.
3. **When to use Jotai vs. Local State**:
   - **Use Jotai**: Cross-component shared state, modal active items, global search/filter bars, real-time Firestore sync caches, user draft selections.
   - **Use Local `useState`**: Component-internal UI state that is never shared (e.g. accordion collapse state, dropdown open/close toggle, input field focus).
   - **Use URL Search Params**: Page navigation parameters, deep-linkable filters, and pagination where state should survive a browser refresh.

---

## 3. Local Environment Setup

### Required Tools
- **Node.js**: `v20` or newer
- **npm**: `v10` or newer
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git**

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/BeachThetaTau/Beach-Theta-Tau-Website.git
   cd Beach-Theta-Tau-Website
   ```

2. **Install all dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   In the `apps/web/` directory, create a local environment file named `.env.local`:
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```
   Add the following Firebase configuration keys to `apps/web/.env.local`:
   ```env
   # Firebase Web Configuration
   VITE_FIREBASE_API_KEY=AIzaSyB4W_9ppafyjjJGZEHzEN19Q4fCJPyCJQE
   VITE_FIREBASE_AUTH_DOMAIN=beachthetatauwebsite-ed87e.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=beachthetatauwebsite-ed87e
   VITE_FIREBASE_STORAGE_BUCKET=beachthetatauwebsite-ed87e.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=645295520688
   VITE_FIREBASE_APP_ID=1:645295520688:web:f130932c47b6608dcd7475
   VITE_FIREBASE_MEASUREMENT_ID=G-FHJC4NB1DQ

   # Local Emulators (set true to use offline emulators, false for live Firebase)
   VITE_USE_FIREBASE_EMULATORS=false

   # Admin Fallback
   VITE_LEGACY_ADMIN_UIDS=AyYsNpskhxPOR40EMmJdMRAbqRj1
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 4. Environment Variables Reference & Deployment

All frontend environment variables in Vite must begin with the `VITE_` prefix to be exposed to the client bundle.

| Environment Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Public Firebase Web API Key | `AIzaSyB4W_...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Authentication domain | `beachthetatauwebsite-ed87e.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Google Cloud / Firebase project ID | `beachthetatauwebsite-ed87e` |
| `VITE_FIREBASE_STORAGE_BUCKET`| Cloud Storage bucket name | `beachthetatauwebsite-ed87e.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Cloud Messaging sender ID | `645295520688` |
| `VITE_FIREBASE_APP_ID` | Firebase Web App instance ID | `1:645295520688:web:...` |
| `VITE_FIREBASE_MEASUREMENT_ID`| Google Analytics measurement ID | `G-FHJC4NB1DQ` |
| `VITE_USE_FIREBASE_EMULATORS` | Switch to local emulator suite | `false` (set `true` for offline dev) |
| `VITE_LEGACY_ADMIN_UIDS` | Fallback admin UIDs during rollout | `AyYsNpskhxPOR40EMmJdMRAbqRj1` |

### Setting Environment Variables in Production (Vercel)
1. Go to your [Vercel Dashboard](https://vercel.com/) and select the project.
2. Navigate to **Settings → Environment Variables**.
3. Add each `VITE_FIREBASE_*` variable under the **Production**, **Preview**, and **Development** environments.
4. Trigger a redeploy if adding or updating keys.

> ⚠️ **Note:** If you see a **blank/white screen** or errors in your browser console (`console.log(import.meta.env)`), ensure `apps/web/.env.local` exists and contains valid Firebase credentials.

---

## 5. Working with Firebase Emulators (Offline Development)

To develop locally without affecting production Firestore data:

1. Enable the emulator in `apps/web/.env.local`:
   ```ini
   VITE_USE_FIREBASE_EMULATORS=true
   ```

2. Start the Firebase emulators:
   ```bash
   npm run emulators
   ```

3. (Optional) Seed the emulator with sample members and candidate data:
   ```bash
   npm run seed:emulator
   ```

---

## 6. Webmaster Semester Checklist

When starting a new semester as Webmaster, follow these steps:

### 1. Update Rush & Recruitment Info
- **Timeline & Dates**: Open `apps/web/src/modules/marketing/` (or `Timeline.tsx` / `Apply.tsx`) and update event dates, locations, and rush themes.
- **Recruitment Heading**: Update the header to reflect the current semester (e.g. *Fall 2026 Recruitment*).
- **Application Links**: Update the Google Form / application links for the new rush class.

### 2. Update Officer & Committee Positions
You can update positions directly in the **Admin Panel** (`/admin`) or in Firebase Console without needing a code deployment:
1. Log in with an admin account and open `/admin`.
2. Find the member, click **Edit**, and select their new position from the **Chapter Position** dropdown:
   - **Executive Board**: *Regent, Vice-Regent, Treasurer, Scribe, Corresponding Secretary, Marshal*
   - **Committee Chairs**: *Alumni Relations Chair, Engineering Chair, Fundraising Chair, Professionalism Chair, Recruitment Chair, S.H.I.E.L.D Chair, Social Media Chair, Webmaster*
3. Save changes. Position updates reflect **instantly** on the public `/brothers` page via `executiveBoardMembersAtom` and `chairMembersAtom`.

### 3. Add New Members & Profile Pictures
1. When new brothers sign up, go to `/admin` and click **Verify** to activate their account.
2. Obtain a high-resolution headshot for the member.
3. Convert the photo to `.webp` format and save under `apps/web/src/shared/assets/Brothers/`.
   - **Naming convention:** Member name, lowercase with all non-alphabetic characters removed.
   - *Example:* `"John Doe"` → `johndoe.webp`.
   - *Example:* `"Alizah Gabrielle Villamin Laggui"` → `alizahgabriellevillaminlaggui.webp`.

### 4. Graduate Alumni Members
At the end of each academic year:
- Open the `/admin` panel, select graduating seniors, and click **Graduate**.
- The system atomically migrates their document from `users/{uid}` to `Alumni/{uid}` and records their graduation timestamp.
- Graduated members automatically appear on the Alumni list and are archived from active deliberation rosters.

---

## 7. Bid Night Deliberations Guide

The deliberation software automates live voting, candidate presentation, and bid assignment during Bid Night using real-time Firebase listeners synchronized with Jotai atoms.

### Setup & Candidate Import
1. **Prepare Rush Check-in CSV**:
   - Collect candidate check-in data from Google Forms.
   - Required fields: `Email`, `First Name`, `Last Name`, `Events Attended`, `Major`, `Grad Year`, `Photo/Image URL`.
2. **Import Candidates**:
   - Use the CSV import tool or CLI script:
     ```bash
     npm exec tsx scripts/migrate-deliberations.ts -- candidates.csv --apply
     ```
   - Candidates will populate the `delibs/{candidateId}` collection in Firestore and load into `allCandidatesAtom`.

### Running Live Deliberations
1. **Admin / Master View (`/admin/deliberations`)**:
   - Log in with your admin account.
   - Click a candidate card to set them as active (`setActiveCandidate(id)`).
   - This writes to Firestore and instantly broadcasts `activeCandidateIdAtom` to every active brother's device in real time.
   - Monitor live vote counts (`Yes`, `No`, `Abstain`) populated in `liveVoteTotalsByCandidateAtom`.
   - Click **Give Bid** to record bid status (Green = Bid Granted, Grey = No Bid).
2. **Member Voting View (`/deliberations`)**:
   - Verified active brothers log in and automatically see the active candidate card resolved via `activeCandidateAtom`.
   - Brothers cast their single vote per candidate (`Yes` / `No` / `Abstain`).
   - The UI optimistically updates `memberVotesAtom` and `currentActiveVoteAtom` for instant tactile response.
3. **Exporting Results**:
   - When voting concludes, click **Download Results** in the admin deliberations panel.
   - A CSV export with Candidate Name, Email, Vote Breakdown, and Bid Decision is generated for chapter records via `candidatesToCsv(candidates)`.

---

## 8. Rushee Interview Scheduling Tool

To automatically match rushees with active brothers based on mutual availability, use the scheduling script below (Python 3.9+):

```python
# Save as schedule_interviews.py and run: python3 schedule_interviews.py
from __future__ import annotations
import csv
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Mapping, Sequence, Set, Tuple

Email = str

@dataclass(frozen=True, order=True)
class Slot:
    label: str      # e.g., "Monday"
    time: str       # e.g., "6:00PM - 6:30PM"
    mode: str = "In-Person"

def schedule_groups(
    rushees_avail: Mapping[Email, Set[Slot]],
    actives_avail: Mapping[Email, Set[Slot]],
    target_per_rushee: int = 2,
    min_per_active: int = 2,
) -> Tuple[Dict[Slot, List[Tuple[Email, List[Email]]]], Dict[Email, int], Set[Email]]:
    """
    Greedy assignment with active backfilling to ensure fair coverage.
    """
    slots_to_rushees = defaultdict(list)
    slots_to_actives = defaultdict(list)

    for r, slots in rushees_avail.items():
        for s in slots:
            slots_to_rushees[s].append(r)
    for a, slots in actives_avail.items():
        for s in slots:
            slots_to_actives[s].append(a)

    active_use_count = defaultdict(int)
    rushee_assigned_once = set()
    assignments_per_slot = defaultdict(list)
    slot_taken_actives = defaultdict(set)

    # Pass 1: Assign rushees to available actives
    for slot in sorted(slots_to_rushees.keys()):
        rushees_here = [r for r in slots_to_rushees[slot] if r not in rushee_assigned_once]
        actives_here = slots_to_actives.get(slot, [])
        if not rushees_here or not actives_here:
            continue

        free_actives = [a for a in actives_here if a not in slot_taken_actives[slot]]
        for r in rushees_here:
            if len(free_actives) < target_per_rushee:
                break
            free_actives.sort(key=lambda a: active_use_count[a])
            pick = free_actives[:target_per_rushee]
            assignments_per_slot[slot].append((r, list(pick)))
            for a in pick:
                active_use_count[a] += 1
                slot_taken_actives[slot].add(a)
            rushee_assigned_once.add(r)
            free_actives = [a for a in free_actives if a not in pick]

    return assignments_per_slot, dict(active_use_count), rushee_assigned_once
```

---

## 9. Git Workflow & Commits

Always use descriptive, conventional commit messages and create pull requests for review:

```bash
# 1. Check changed files
git status

# 2. Stage specific files (avoid blanket `git add .` where possible)
git add apps/web/src/modules/...

# 3. Commit with standard tags (feat, fix, docs, refactor, chore)
git commit -m "feat(members): update spring 2026 executive board positions"

# 4. Push branch and open a Pull Request on GitHub
git push origin your-feature-branch
```

---

## 10. Troubleshooting & Disaster Recovery

If the website goes down or displays errors, follow this checklist:

### 🚨 Step 1: Check DNS (Porkbun)
- Visit the direct Vercel deployment URL:  
  `https://beach-theta-tau-website-git-main-beachs-projects-7a89237b.vercel.app/`
- **If the direct Vercel link works but `beachthetatau.com` does not:**
  - The issue is in **Porkbun DNS** (domain renewal or DNS record misconfiguration).
  - Log in to [Porkbun](https://porkbun.com) → **Domain Management → Details → DNS Records**.
  - Verify the **A Record** points to Vercel IP (`76.76.21.21`) with host `@` and TTL `600`.
  - Check that the domain has not expired.

### 🚨 Step 2: Check Vercel Hosting & Deployment Logs
- Open the [Vercel Status Page](https://www.vercel-status.com/) and your Vercel project dashboard.
- Check if the latest build on `main` failed.
- Run `vercel logs` or inspect build logs in the Vercel UI for syntax or TypeScript errors.

### 🚨 Step 3: Clear Local / DNS Cache
- If changes aren't appearing or SSL errors occur:
  - **macOS**: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`
  - **Windows**: `ipconfig /flushdns`
  - Test in an **Incognito Window**.

### 🚨 Step 4: White Screen / Client Errors
- Open **Inspect Element → Console** in Google Chrome to view React or Firebase errors.
- Confirm all required environment variables exist in `apps/web/.env.local` or Vercel Environment Variables dashboard.

---

## 11. Cheat Sheet Commands

| Task | Command |
| :--- | :--- |
| **Start Local Dev Server** | `npm run dev` |
| **Build Monorepo (Web + Functions)** | `npm run build` |
| **Run Unit Tests** | `npm test` |
| **Lint Codebase** | `npm run lint` |
| **Run Playwright E2E Tests** | `npm run test:e2e` |
| **Start Firebase Emulators** | `npm run emulators` |
| **Seed Emulator Data** | `npm run seed:emulator` |
| **Deploy to Firebase** | `firebase deploy` |

---

## 12. Contacts & Resources

- **GitHub Organization**: [Beach Theta Tau](https://github.com/BeachThetaTau)
- **Firebase Console**: [Firebase Console `beachthetatauwebsite`](https://console.firebase.google.com/)
- **Vercel Dashboard**: [Vercel Project Dashboard](https://vercel.com/)
- **Porkbun Domain Management**: [Porkbun Console](https://porkbun.com/)


