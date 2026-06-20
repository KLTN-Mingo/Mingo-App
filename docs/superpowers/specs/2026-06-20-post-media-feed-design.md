# Post media and feed pagination design

## Scope

- Keep the Explore feed page size at 15.
- Render video posts reliably in the feed and post detail screen.
- Keep image and video previews uniform in list cards.
- Open media into a detail view that preserves its original aspect ratio.

## Data flow

`postService` will normalize each media item from supported API field variants into
the existing `PostMediaDto` shape. The normalized object will expose a usable URL,
normalized media type, optional thumbnail, and optional dimensions. This keeps UI
components independent of backend naming variations.

## Presentation

A shared post-media renderer will select `Image` or `Video` from the normalized
media type. Feed cards use a fixed preview frame for a consistent scrolling layout.
Tapping a preview opens the post detail route, where the media uses its saved
dimensions to calculate the display aspect ratio. Video uses the native player and
reports a load error instead of silently showing an empty frame.

## Pagination

The Explore feed continues requesting `limit=15`. `onEndReached` requests exactly
the next page only when the current pagination response reports `hasMore`, and a
request lock prevents duplicate page calls while a page is already loading.

## Error handling

- Invalid or missing media URLs do not attempt playback.
- Video load failures are logged with post/media identifiers and show a visible
  fallback state rather than a blank player.
- A failed next-page request leaves existing posts visible and allows a later retry.

## Tests

- Test media normalization for API field variants and uppercase media types.
- Test video detection from normalized media.
- Test page-query construction and pagination guards where the current test setup
  can exercise them.
