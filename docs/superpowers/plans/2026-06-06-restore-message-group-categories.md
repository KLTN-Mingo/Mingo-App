# Restore Message Group Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore category grouping and group management from commits `8d9f510`, `6d56bab`, and `1273156` in the current message UI.

**Architecture:** Group the existing conversation DTOs into category sections only for the Groups tab. Extend `InfoChat` with branch-equivalent member loading, admin actions, leave behavior, and category editing while retaining the current UI components. Notify the chat screen so conversation state updates immediately after category changes or leaving.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, Expo lint

---

### Task 1: Group Conversations By Category

**Files:**
- Modify: `app/chat/index.tsx`

- [ ] Confirm the Groups tab currently renders one flat list.
- [ ] Add ordered category labels and memoized category sections.
- [ ] Render category headers and their `ChatListItem` rows in the Groups tab.
- [ ] Keep All, Unread, refresh, search, and empty-state behavior unchanged.
- [ ] Run Expo lint for `app/chat/index.tsx`.

### Task 2: Restore Group Member Management

**Files:**
- Modify: `components/chat/InfoChat.tsx`

- [ ] Hide Profile for group conversations.
- [ ] Load and render group members with admin labels.
- [ ] Add the admin-only multi-select friend picker.
- [ ] Add promote, demote, and remove member actions for admins.
- [ ] Add leave-group confirmation for all members.
- [ ] Confirm the relevant service APIs are called and local member state refreshes.

### Task 3: Restore Admin Category Editing

**Files:**
- Modify: `components/chat/InfoChat.tsx`

- [ ] Load category and admin membership through the existing group-detail call.
- [ ] Add the admin-only Category action using `TagIcon`.
- [ ] Add a current-design-system modal for four category choices.
- [ ] Persist selection and deselection through `updateGroupCategory`.
- [ ] Notify the parent after a successful update and preserve state on failure.
- [ ] Run Expo lint for `components/chat/InfoChat.tsx`.

### Task 4: Synchronize Conversation State

**Files:**
- Modify: `app/chat/[id].tsx`

- [ ] Pass an `onCategoryChange` callback to `InfoChat`.
- [ ] Update matching entries in both conversations and filtered conversations.
- [ ] Remove the conversation from both arrays after leaving the group.
- [ ] Run Expo lint for all three changed files.
- [ ] Run `git diff --check` and inspect the final diff against commit `1273156`.
