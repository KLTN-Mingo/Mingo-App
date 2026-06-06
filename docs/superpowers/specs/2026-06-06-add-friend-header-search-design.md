# Add Friend Header And Search Design

## Goal

Update the phone-number friend search screen so it has the same back navigation
pattern as the auth screens and uses the shared search bar component.

## UI Design

- Add the existing `BackButton` at the top of `app/add-friend.tsx`.
- Replace the screen's custom search wrapper and `RNTextInput` with
  `SearchBarInput`.
- Keep the phone icon on the right side of the search bar as the search action.
- Disable the phone action while a search request is loading.
- Preserve the current phone keyboard, placeholder, empty state, error state,
  result card, and friend-request behavior.

## Component Design

Extend `SearchBarInput` with an optional `rightElement` prop. The element is
rendered after the text input inside the same rounded search surface. Existing
consumers do not pass this prop, so their layout and behavior remain unchanged.

The add-friend screen passes a `TouchableOpacity` containing `CallIcon` as the
right element. Pressing it calls the existing `handleSearchByPhone` function.

## Testing And Verification

The project does not currently include an automated test runner. Verification
will therefore use:

- TypeScript-aware Expo linting for changed files through the project lint
  command.
- Static inspection that `SearchBarInput` remains backward compatible.
- Static inspection that the back button uses the same exported component as
  the auth screens.

## Scope

No API, validation, navigation destination, search-result, localization, or
friend-request behavior changes are included.
