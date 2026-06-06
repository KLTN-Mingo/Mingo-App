# Restore Message Group Management Design

## Goal

Restore the group management behavior from commits `8d9f510`, `6d56bab`, and
`1273156` after the message screen refactor, while keeping the current
components and design system.

## Message List

- Keep `app/(tabs)/message.tsx` as a re-export of `app/chat/index.tsx`.
- In the Groups tab, divide group conversations into `Friends`, `Family`,
  `Work`, `Other`, and `Uncategorized` sections.
- Preserve the current order of conversations inside each section.
- Put missing, empty, or unsupported category values in `Uncategorized`.
- Keep the All and Unread tabs unchanged.

## Chat Info

- Hide the Profile action for group conversations.
- Show the complete group member list with admin labels.
- Show an Add action to admins. The picker loads the current user's friends,
  excludes existing members, supports selecting multiple people, and adds them
  through the existing member API.
- Let admins open actions for other members:
  - Promote a member to admin.
  - Remove admin permission from an admin.
  - Remove a member from the group.
- Follow the branch behavior that allows multiple admins.
- Let every group member leave the group after confirmation.
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

The existing group detail, add member, remove member, leave group, promote,
demote, category, icon, and DTO support remain in place. `InfoChat` updates its
member list after successful mutations and notifies the chat screen after a
category update or leave operation so shared conversation state remains
current.

## Scope

Group creation remains integrated through the current modal and continues to
default new groups to `other`. No message sending or socket behavior changes
are included.

## Verification

The project has no automated test runner. Verification uses Expo lint,
TypeScript-aware static checks, and inspection of the affected message list and
chat info flows.
