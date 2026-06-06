# Add Friend Header And Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auth-style back navigation to the phone friend search screen and replace its custom search field with the shared search bar while preserving the phone search action.

**Architecture:** Extend `SearchBarInput` with one optional render slot for a trailing action, keeping all existing callers unchanged. Update `AddFriendScreen` to compose the existing `BackButton`, shared `SearchBarInput`, and phone action around the current search handler.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, Expo lint

---

### Task 1: Add A Trailing Element Slot To SearchBarInput

**Files:**
- Modify: `components/shared/ui/search-bar.tsx`

- [ ] **Step 1: Confirm the existing component has no trailing element API**

Run: `rg -n "rightElement" components/shared/ui/search-bar.tsx`

Expected: no matches.

- [ ] **Step 2: Add the optional prop**

Import `ReactNode` as a type, add `rightElement?: ReactNode` to
`SearchBarInputProps`, destructure it, and render `{rightElement}` after the
`TextInput`. Do not alter existing sizing or surface class changes already in
the worktree.

- [ ] **Step 3: Verify the shared component passes lint**

Run: `npx expo lint components/shared/ui/search-bar.tsx`

Expected: exit code 0 with no errors in the changed component.

### Task 2: Use Shared Navigation And Search UI

**Files:**
- Modify: `app/add-friend.tsx`

- [ ] **Step 1: Confirm the screen currently uses a custom input**

Run: `rg -n "RNTextInput|Search Bar|BackButton|SearchBarInput" app/add-friend.tsx`

Expected: matches for `RNTextInput` and the custom search bar, with no
`BackButton` or `SearchBarInput` usage.

- [ ] **Step 2: Replace the custom UI**

Remove the `RNTextInput` alias import. Import `SearchBarInput` and `BackButton`.
Render `BackButton` before the search bar. Pass the existing phone state,
change handler, placeholder, and `phone-pad` keyboard to `SearchBarInput`.
Pass a disabled `TouchableOpacity` containing `CallIcon` through
`rightElement`; its press handler remains `handleSearchByPhone`.

- [ ] **Step 3: Verify both changed files**

Run: `npx expo lint app/add-friend.tsx components/shared/ui/search-bar.tsx`

Expected: exit code 0 with no lint errors in either file.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff -- app/add-friend.tsx components/shared/ui/search-bar.tsx`

Expected: only the optional shared trailing slot, auth-style back button, and
shared search bar integration are introduced; pre-existing search bar styling
changes remain intact.
