# Back Header Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce one reusable back header, migrate repository screens that currently hand-roll back navigation, and align picker labels with `ActionInput`.

**Architecture:** Add a `BackHeader` UI primitive with optional title, custom content, right actions, disabled state, and default `router.back()` behavior. Replace simple and custom screen headers with this primitive while leaving non-navigation modal headers and auth `BackButton` unchanged.

**Tech Stack:** React Native, Expo Router, TypeScript, NativeWind.

---

### Task 1: BackHeader Primitive

**Files:**
- Create: `components/ui/BackHeader.tsx`
- Modify: `components/ui/index.ts`

- [x] Add a static failing check that expects `BackHeader` and its export.
- [x] Implement optional `title`, children, `rightSlot`, `onBackPress`, and `disabled`.
- [x] Verify the static check and TypeScript.

### Task 2: Standard Screen Migration

**Files:**
- Modify: `app/edit-profile.tsx`
- Modify: `app/create-post.tsx`
- Modify: `app/notification.tsx`
- Modify: `app/post/[id].tsx`
- Modify: `app/blocked-users.tsx`
- Modify: `app/saved-posts.tsx`
- Modify: `app/hashtag/[tag].tsx`
- Modify: `app/profile/[id].tsx`
- Modify: `components/post/CommentModal.tsx`
- Modify: `components/profile/ProfileSettingsModal.tsx`
- Modify: `components/profile/ChangePasswordModal.tsx`

- [x] Replace hand-written back icon/title rows and `PageHeader` back usage with `BackHeader`.
- [x] Preserve each screen's existing title, right actions, close callback, and spacing.
- [x] Verify no migrated file still imports obsolete back icons or `PageHeader`.

### Task 3: Custom Header Migration

**Files:**
- Modify: `app/search.tsx`
- Modify: `app/chat/[id].tsx`

- [x] Use `BackHeader` children for the search input.
- [x] Use `BackHeader` children and `rightSlot` for chat avatar/title and call actions.
- [x] Preserve behavior and layout-specific callbacks.

### Task 4: Picker Label Typography

**Files:**
- Modify: `components/ui/ActionPicker.tsx`

- [x] Change select and date labels from `text-base` to `text-sm`.
- [x] Verify both labels match `ActionInput`.

### Task 5: Verification

**Files:**
- Verify all modified files.

- [x] Run static migration checks.
- [x] Run `npm run lint`.
- [x] Run `node_modules/.bin/tsc.cmd --noEmit`.
