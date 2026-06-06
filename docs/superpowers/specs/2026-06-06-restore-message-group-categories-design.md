# Restore Message Group Categories Design

## Goal

Restore the group category behavior introduced by commit `1273156` after the
message screen refactor, while keeping the current components and design system.

## Message List

- Keep `app/(tabs)/message.tsx` as a re-export of `app/chat/index.tsx`.
- In the Groups tab, divide group conversations into `Friends`, `Family`,
  `Work`, `Other`, and `Uncategorized` sections.
- Preserve the current order of conversations inside each section.
- Put missing, empty, or unsupported category values in `Uncategorized`.
- Keep the All and Unread tabs unchanged.

## Chat Info

- Load the group category from the existing group detail response when opening
  `InfoChat`.
- Show a Category action only when the current user is a group admin.
- Display the selected category label on the action.
- Open a modal using the current app styling with choices for `Friends`,
  `Family`, `Work`, and `Other`.
- Selecting the active category again clears it, matching commit `1273156`.
- Persist changes through `messageService.updateGroupCategory`.
- Report API failures with an alert and retain the previous category.

## Data Flow

The existing `ChatConversationDto.category`, group-detail category mapping,
`TagIcon`, `updateGroupCategory`, and `getGroupCategory` support remain in
place. `InfoChat` receives an optional callback that lets the chat screen
refetch the conversation list after a successful category update, so the group
moves to the correct section without requiring an app restart.

## Scope

Group creation remains integrated through the current modal and continues to
default new groups to `other`. No message sending, socket, membership, or
navigation behavior changes are included.

## Verification

The project has no automated test runner. Verification uses Expo lint,
TypeScript-aware static checks, and inspection of the affected message list and
chat info flows.
