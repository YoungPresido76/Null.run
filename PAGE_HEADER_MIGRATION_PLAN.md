# Chillverse — Unified Page Header Migration

**Goal:** every page shows its title + back button in the `Topbar` (top bar) only.
No page component renders its own title/back-button row.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Root cause

- `AppLayout.tsx` already centralizes the top bar via `<Topbar title showBack onBack>`,
  but the title comes from a **static** `ROUTE_TITLES` map keyed by `pathname`.
- Of the ~65 routes nested under `AppLayout`, only **16** are in `ROUTE_TITLES`.
  Every other route (`/notifications`, `/settings/theme`, `/wallet`, `/achievements`,
  `/clubs`, dynamic routes like `/profile/:userId`, etc.) silently falls back to
  the title `"Dashboard"`.
- To compensate, ~35 page components built **their own** title/back-button row
  (confirmed pattern in `FeedPage.tsx` "Community", `Notifications.tsx`,
  `AppTheme.tsx`, `CategoryPage.tsx` "VOID", etc.) — hence two header bars stacked
  on top of each other.
- A static map also can't handle **dynamic titles** (a club name, a player's
  display name, a game category label) or **in-page sub-views that don't change
  the URL** (e.g. `GamesZone.tsx` → `CategoryPage.tsx` drill-down, which is a
  client-state switch, not a route change).

## Proposed architecture

1. **`PageHeaderContext`** (new, `src/context/PageHeader.tsx`) — holds
   `{ title, showBack, onBack }` for the current page, plus a `setPageHeader()`
   setter and a `clearPageHeader()` reset.
2. **`usePageHeader(config)`** hook — a page calls this once (or with changing
   deps, e.g. when a club name loads or a category is selected) to register its
   header. It cleans up on unmount so the next page starts fresh.
3. **`AppLayout.tsx`** — `Topbar` reads `title`/`showBack`/`onBack` from
   `PageHeaderContext` **first**, falling back to the existing `ROUTE_TITLES` /
   `isTopLevel` logic only when a page hasn't migrated yet. This lets us migrate
   incrementally without breaking pages we haven't touched.
4. Each migrated page **deletes its own header JSX** (the `<ArrowLeft>` button +
   `<h1>` block) and calls `usePageHeader({ title: '...', onBack: ... })` instead.
5. `ROUTE_TITLES` is filled in for all static routes as a sane default/fallback
   even after migration (belt-and-suspenders for any page that forgets to call
   the hook).

### Known exceptions (leave as-is / handle separately)

- **`/clubs/:roomId`** (`ClubChat.tsx`) — `AppLayout` already deliberately hides
  the `Topbar` here (own chat header). No change.
- **`/watch`** (`Watch.tsx`) — lives *outside* `AppLayout` entirely (own protected
  route, no `Topbar` at all). Its own header is required, not a bug.
- **Fullscreen game routes** (`/play/chess`, `/play/ludo`, `/play/water-the-tree`,
  `/rooms/:roomId`) — need a case-by-case look: they may intentionally own the
  whole screen like `ClubChat` does. Will confirm per-file in Phase 5, not assumed.
- **Modals / drawers / in-component breadcrumbs** — `GameDetailModal.tsx`,
  `MinoModal.tsx`, `AdminDrawer.tsx`, the "All bundles / All items" breadcrumbs
  inside `AdminStoreSection.tsx`, and the room-list↔thread toggle inside
  `Chat.tsx` are **not** page-title duplicates — they're legitimate in-component
  navigation and are out of scope.
- **`Streak.tsx`** — `/streak` is a top-level dock route (no back button by
  design), yet the page renders its own back arrow anyway. Flagged as a genuine
  bug to fix in Phase 1, not just a duplication cleanup.
- **`settingsShared.tsx`** exports the shared "sub-page shell" (back header)
  used by *all* Settings sub-pages — fixing this one file fixes ~7 pages at once.

---

## Phases

*Ordered smallest/fastest → largest/most time-consuming.* Phase 0 stays first
regardless — every later phase depends on it, and it's also the smallest unit
of work on its own.

### Phase 0 — Foundation ✅ DONE
- [x] `src/context/PageHeader.tsx` — context + `usePageHeader` hook
- [x] Wire `PageHeaderProvider` into `AppLayout.tsx`
- [x] Topbar source-of-truth: `TopbarSlot` reads `PageHeaderContext` first,
      falls back to route-derived `title`/`showBack`/`onBack` second — so
      no page breaks until it's actually migrated
- [x] Filled in `ROUTE_TITLES` for every static route that was missing
      (settings sub-pages, `/wallet`, `/achievements`, `/notifications`,
      `/clubs`, `/admin/*`, etc.) as a fallback safety net

### Phase 1 — Economy ✅ DONE
*(3 files, simple static titles, no dynamic data)*
- [x] `Mall.tsx` — removed the extraneous back button on the top-level view
      (`/mall` is a dock destination; Topbar already correctly shows no back
      button there — this was a pure duplicate). Converted the `SubPage`
      wrapper (used by the Avatars/Profile Pics/Consumables/Banners in-page
      views) and the Battle Cards in-page view to `usePageHeader()` instead
      of drawing their own back row.
- [x] `BuyDiamonds.tsx` — replaced the inline back+title row with
      `usePageHeader({ title: 'Buy Diamonds', onBack: () => navigate('/mall') })`,
      preserving the custom "always back to Mall" behavior. Balance chip kept.
- [x] `Pro.tsx` — removed the standalone back button (title now comes from
      the Topbar via `usePageHeader({ title: 'Chillverse Premium' })`); the
      large centered "Chillverse Premium" hero heading further down the page
      is left alone — that's page content/branding, not header chrome.

### Phase 2 — Support tickets (under `SupportLayout`) ✅ REVIEWED — no changes needed
*(2 files, but starts with a quick check of whether `SupportLayout.tsx` needs
the same treatment as `AppLayout.tsx`)*
- [x] Confirmed `SupportLayout.tsx` does **not** need the same treatment.
      Unlike `AppLayout`, it has no per-page Topbar/back-button chrome at
      all — its `<header>` is a persistent public-site nav bar (logo, Help
      badge, Feedback/Submit-a-request links, theme toggle, sign-in button),
      the same on every support page, Discord-help-center style. There is
      nothing for a page's own back button to duplicate.
- [x] `MyTickets.tsx` — its "← Back to Help Center" link + `<h1>My Tickets</h1>`
      is legitimate, not a bug: it's the *only* way back, same exception
      class as `Watch.tsx` from Phase 0's findings (no Topbar exists to
      hand this off to). Left as-is.
- [x] `NewTicket.tsx` — same pattern ("← Back to Help Center" + own `<h1>`),
      same conclusion. Left as-is.

### Phase 3 — Settings ✅ DONE
*(highest leverage per file: one shared shell fixes ~7 pages)*
- [x] `settingsShared.tsx` — `SettingsShell` no longer draws its own back
      button + centered title row; it calls `usePageHeader({ title })`
      once at the top instead. Dropped the now-unused `ArrowLeft`,
      `useNavigate`, and `ripple` imports (all three were only used by the
      row that got removed).
- [x] `Settings.tsx` (root list) — removed its own floating back button,
      replaced with `usePageHeader({ title: 'Settings' })`. Flagged and
      resolved a latent mismatch: `/settings` was listed in
      `TOP_LEVEL_ROUTES` (no Topbar back arrow) even though it's actually
      reached as a sub-page from the "You" tab's submenu — the page was
      quietly compensating by drawing its own arrow. Once migrated,
      `usePageHeader` takes priority over `TOP_LEVEL_ROUTES` automatically
      (see `TopbarSlot` in `AppLayout.tsx`), so the back button now comes
      from the Topbar with no behavior change (`navigate(-1)`, same as
      before).
- [x] `AppTheme.tsx` — same pattern: removed its own back+title row,
      replaced with `usePageHeader({ title: 'App Theme' })`.
- [x] `AccountSettings.tsx` — no changes needed; inherits the fix via
      `SettingsShell`.
- [x] `SocialSettings.tsx` / `BlockedAccounts.tsx` — no changes needed;
      inherit the fix via `SettingsShell`.
- [x] `PrivacySettings.tsx` — no changes needed; inherits the fix via
      `SettingsShell`.
- [x] `AppNotifications.tsx` / `OtherNotifications.tsx` — no changes
      needed; all views (`Hub`, `ChillverseSection`, `HighlightsSection`,
      `ActivitiesSection`) render through `SettingsShell` and inherit the
      fix. Also added the 3 missing `ROUTE_TITLES` fallback entries for
      these sub-routes (`/settings/other-notifications/chillverse`,
      `/highlights`, `/activities`) in `AppLayout.tsx`, matching Phase 0's
      belt-and-suspenders approach for real (URL-backed) routes.
- [x] `SubscriptionSettings.tsx` — no changes needed; inherits the fix via
      `SettingsShell`.

**Files touched:** `settingsShared.tsx`, `Settings.tsx`, `AppTheme.tsx`,
`AppLayout.tsx` (4 files). **Files fixed:** 10 (the 4 above plus
`AccountSettings.tsx`, `SocialSettings.tsx`, `BlockedAccounts.tsx`,
`PrivacySettings.tsx`, `AppNotifications.tsx`, `SubscriptionSettings.tsx`,
counting `OtherNotifications.tsx`'s 4 sub-views as one file).
**Verified:** `npx tsc --noEmit` passes clean across the whole project, no
errors, no unused-import warnings.

### Phase 4 — Dashboard-adjacent utility pages ✅ DONE
*(9 files, but a repetitive, simple pattern each)*
- [x] `Notifications.tsx` — removed its own back button + `<h1>Notifications</h1>`,
      replaced with `usePageHeader({ title: 'Notifications' })`. Kept the
      unread-count line and the "Clear all" button in the header row.
- [x] `Achievements.tsx` — no back-button row existed to remove; added
      `usePageHeader({ title: 'Achievements' })`. The in-page "Achievements"
      hero block (icon + unlocked count) is page content, not header chrome
      — left alone, same call as `Pro.tsx` in Phase 1. Its `ArrowLeft` usage
      inside `SubPageShell` (a portal drawer for Rewards/Stats/Full-list
      sub-views) is legitimate in-component navigation — out of scope.
- [x] `Artifacts.tsx` — same as Achievements: no removal needed, added
      `usePageHeader({ title: 'Artifacts' })`. The in-page "Artifacts" hero
      (icon + collected count) is page content, left alone.
- [x] `Wallet.tsx` — removed its own back button + `<h1>Wallet</h1>`,
      replaced with `usePageHeader({ title: 'Wallet', onBack: () =>
      navigate('/dashboard') })` — preserves the page's original "always
      back to Dashboard" behavior (it's reachable from several places,
      e.g. the Wallet row in Settings) rather than falling back to generic
      browser-back. Kept the subtitle text and the redeem-code button.
- [x] `Inventory.tsx` (economy) — same pattern in the dedicated
      `InventoryHeader` sub-component: removed the back button + `<h1>`,
      replaced with `usePageHeader({ title: 'Inventory' })` in the main
      `Inventory()` component. Kept the subtitle, Filter button, and the
      "More options" menu (Mall / Skill tree / Artifacts shortcuts).
- [x] `SkillTree.tsx` (pvp) — replaced the `<Link to="/dashboard">` back
      arrow with `usePageHeader({ title: 'Skill Tree', onBack: () =>
      navigate('/dashboard') })`, preserving the original fixed back
      destination. `Link` import kept — still used for in-page card CTAs.
- [x] `Streak.tsx` — also fixed the stray back button on this top-level
      route, but the root cause wasn't what was assumed: its `onBack` prop
      was never actually passed by the router (`<Streak />` in `App.tsx`
      takes no props), so the button was **dead code that never rendered**
      — not a visible duplicate. The real bug: `/streak` is reached via the
      Topbar's streak-flame icon (see `Topbar.tsx`), not the BottomDock,
      but it was listed in `TOP_LEVEL_ROUTES`, so the Topbar showed no back
      arrow either — there was no way back except browser/device back.
      Fixed by removing the dead `StreakProps`/`onBack` plumbing and its
      sticky header block, and adding `usePageHeader({ title: 'Streak' })`,
      which takes priority over `TOP_LEVEL_ROUTES` automatically (same
      resolution as `Settings.tsx` in Phase 3) — no change needed to
      `TOP_LEVEL_ROUTES` itself.
- [x] `Ranks.tsx` — removed the standalone back-button block, added
      `usePageHeader({ title: 'Rank' })` (`useNavigate`/`navigate` also
      dropped — the removed button was its only use). The second
      `ArrowLeft` inside the full-screen leaderboard overlay
      (`showLeaderboard`, z-index 9999) was left as-is: that overlay covers
      the app Topbar entirely, so it's a separate surface, not a
      page-title duplicate — same exception class as a modal.
- [x] `BadgesDex.tsx` — removed its own back button + title row, replaced
      with `usePageHeader({ title: 'Badges' })`. **Note:** this component
      currently isn't imported or routed anywhere in the app (no
      `<BadgesDex />` usage found) — migrated for consistency with the
      rest of the phase, but flagging that it's presently dead/unrouted
      code, not a live user-facing page.

**Files touched:** all 9 listed above. **Verified:** `npx tsc --noEmit`
passes clean across the whole project.

### Phase 5 — Profile & Progression ✅ REVIEWED — no changes needed
*(4 files listed originally; turned out to be 5)*

All 5 files (`Profile.tsx`, `PlayerProfile.tsx`, `OfficialProfile.tsx`,
`ModeratorProfile.tsx`, `ModeratorSelfProfile.tsx`) are dead code — not
routed or imported anywhere live in the app. `/profile` and
`/profile/:userId` now resolve to `ProfileRedirect.tsx`, which opens the
Discord-style `ProfilePreviewModal` popup and immediately bounces back off
the URL; per its own comment, "Profile is no longer a standalone page —
it's the Discord-style popup." This also explains the original note about
`PlayerProfile.tsx` having "outstanding banner work from the nav
overhaul" — that work was abandoned when the popup replaced these pages.

Checked `App.tsx` (the only place `<Route>` is defined anywhere in the
codebase) — none of the 5 are lazily imported or routed. Checked for
cross-file imports of each — the only real link is `PlayerProfile.tsx`
importing `OfficialProfile.tsx` (the two dead files pointing at each
other); `ModeratorProfile.tsx` and `ModeratorSelfProfile.tsx` have zero
importers anywhere. Each file only exports its default component, so
there are no shared helpers/types/constants for live code to depend on
either. Confirmed deleting all 5 would have zero effect on the running
app today — no route, build, or behavior change.

Decision: leave the 5 files in place, untouched, no header migration
performed. Flagging in case another surface (a feature flag, a
branch-in-progress elsewhere) is planning to revive them — worth
double-checking with the team before deleting, even though nothing in
this codebase currently depends on them.

### Phase 6 — Admin & Moderation ✅ DONE
*(6 files listed originally; turned out to be 7 since HaloAI.tsx was
folded into this pass too — header fix is simple but the surrounding
admin UIs are dense, so verification took longer)*
- [x] `AdminDashboard.tsx` — removed its own back button + `<h1>Admin
      Dashboard</h1>`, replaced with `usePageHeader({ title: 'Admin
      Dashboard', onBack: () => navigate('/dashboard') })` — preserves the
      original fixed back destination rather than generic browser-back.
      Kept the "Updated {time}" subtitle and the refresh button.
- [x] `AdminUserDetail.tsx` — same pattern, with a dynamic title:
      `usePageHeader({ title: detail ? (detail.display_name ||
      detail.username) : 'User detail', onBack: () => navigate('/admin')
      })`. `usePageHeader` re-registers automatically once `detail` loads
      and the real name is known, same as the old inline `<h1>` did. Kept
      the `@username` subtitle and the refresh button.
- [x] `AdminFlashSalePage.tsx` — removed its own back button + `<h1>`,
      replaced with `usePageHeader({ title: 'Flash Sale Schedule' })`
      (default back matches the original generic `navigate(-1)`, so no
      `onBack` override needed). Dropped the now-fully-unused
      `useNavigate` import.
- [x] `AdminRedeemCodesPage.tsx` — same pattern, `usePageHeader({ title:
      'Redeem Code Manager' })`, also dropped the now-unused `useNavigate`.
- [x] `Lab.tsx` — removed its own back button + `<h1>` (which had a
      `Monitor` icon inline before the text — dropped, since the shared
      Topbar only renders plain-text titles, same tradeoff as every prior
      icon+title row in this migration), replaced with
      `usePageHeader({ title: 'Lab', onBack: () => navigate('/feed') })`
      — preserves the original fixed back destination. Kept the subtitle.
- [x] `CollabPage.tsx` — same pattern: dropped the `Flag` icon from the
      title (the `Flag` import itself stays — still used two other places
      in the file), `usePageHeader({ title: 'Collab', onBack: () =>
      navigate('/lab') })`. Kept the collab-count subtitle and refresh
      button.
- [x] `HaloAI.tsx` — removed just the back button from its sticky header
      row (this row also carries the subscriber-tier badge and the two
      Halo Moments icons — Today's Challenge / Daily Mystery Box — which
      aren't header chrome and stay put, now laid out with
      `justify-content: space-between` instead of relying on the removed
      title's `flex: 1` for spacing). Added `usePageHeader({ title: 'Halo
      AI' })` (default back matches the original `navigate(-1)`). Dropped
      the now-fully-unused `useNavigate`/`navigate`; kept `Link` — still
      used for the "Upgrade your Version" and staff-tools links elsewhere
      in the file.

**Files touched:** all 7 listed above. **Verified:** `npx tsc --noEmit`
passes clean across the whole project.

### Phase 7 — Social / Community
*(8 files, several with dynamic titles — club names, post authors — pulled
from live data instead of a static string)*
- [ ] `FeedPage.tsx` ("Community" — the page from your screenshots)
- [ ] `SinglePostPage.tsx`
- [ ] `HighlightsPage.tsx`
- [ ] `SearchPage.tsx`
- [ ] `Referral.tsx`
- [ ] `ClubsList.tsx`
- [ ] `ClubInfo.tsx` / `ClubSettings.tsx`
- [ ] `QotdThread.tsx`

### Phase 8 — Games & Play
*(largest: in-page client-state drill-downs that need a dynamic header, plus
fullscreen game routes that need individual behavior confirmation before
touching)*
- [ ] `GamesZone.tsx` (route root)
- [ ] `CategoryPage.tsx` (in-page drill-down — dynamic title e.g. "VOID")
- [ ] `ActivityGoals.tsx`
- [ ] `GroveStageDetail.tsx`
- [ ] `Multiplayer.tsx` / `Rooms.tsx` / `Room.tsx`
- [ ] Fullscreen games — confirm intended behavior first: `play/ArrowDash.tsx`,
      `play/Ludo.tsx`, `play/WaterTheTree.tsx`

---

## Working agreement

- Each phase = one review-and-approve round: I'll show the diff plan for that
  phase's files, we confirm, I implement, verify, then check the boxes above
  before starting the next phase.
- This file gets updated (boxes checked) at the end of every completed phase.
