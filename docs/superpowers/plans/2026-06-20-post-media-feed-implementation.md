# Post Media and Feed Pagination Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render post video reliably, preserve Explore page size 15, and use fixed list previews with original media proportions in detail.

**Architecture:** Normalize every backend media record in `PostService`; then use the same media utility in feed cards and post detail. Feed pagination remains FlatList based, with a pure guard and request ref to stop duplicate next-page requests.

**Tech Stack:** Expo Router, React Native, TypeScript, `expo-av`, Node test runner, Expo ESLint.

---

### Task 1: Normalize post media data

**Files:**
- Modify: `utils/post-media.ts`
- Modify: `utils/__tests__/post-media.test.ts`
- Modify: `services/post.service.ts`

- [ ] **Step 1: Write failing normalization tests**

```ts
import { normalizePostMedia } from "../post-media.ts";

test("normalizes API video type and file URL variants", () => {
  assert.deepEqual(
    normalizePostMedia({ id: "m1", type: "VIDEO", fileUrl: "https://cdn.test/video" }),
    { id: "m1", mediaType: "video", mediaUrl: "https://cdn.test/video", orderIndex: 0 }
  );
});
```

- [ ] **Step 2: Verify the test is red**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: FAIL because `normalizePostMedia` is not exported.

- [ ] **Step 3: Implement minimal media normalization**

```ts
function valueAsString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function valueAsNumber(value: unknown): number | undefined {
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : undefined;
}

export function normalizePostMedia(raw: unknown): PostMediaDto {
  const media = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const mediaUrl = valueAsString(media.mediaUrl) || valueAsString(media.fileUrl) || valueAsString(media.url);
  const rawType = valueAsString(media.mediaType) || valueAsString(media.type);
  const mediaType = rawType.toLowerCase() === "video" || isVideoPostMedia({ mediaType: "image", mediaUrl })
    ? "video"
    : "image";

  return {
    id: valueAsString(media.id) || valueAsString(media._id),
    mediaType,
    mediaUrl,
    thumbnailUrl: valueAsString(media.thumbnailUrl) || valueAsString(media.thumbnail) || undefined,
    width: valueAsNumber(media.width),
    height: valueAsNumber(media.height),
    duration: valueAsNumber(media.duration),
    fileSize: valueAsNumber(media.fileSize),
    orderIndex: Number.isFinite(Number(media.orderIndex)) ? Number(media.orderIndex) : 0,
  };
}
```

Replace the `media` property in `PostService.normalizePost` with:

```ts
media: (Array.isArray(raw?.media) ? raw.media : Array.isArray(raw?.mediaFiles) ? raw.mediaFiles : [])
  .map(normalizePostMedia),
```

- [ ] **Step 4: Verify the test is green**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: all media tests pass.

### Task 2: Render fixed previews and playable feed video

**Files:**
- Modify: `components/post/PostCard.tsx`
- Modify: `utils/post-media.ts`
- Modify: `utils/__tests__/post-media.test.ts`

- [ ] **Step 1: Write a failing fixed-preview-height test**

```ts
import { getPostMediaPreviewHeight } from "../post-media.ts";

test("uses one list preview height for landscape and portrait media", () => {
  assert.equal(getPostMediaPreviewHeight({ width: 320, height: 180 }), 320);
  assert.equal(getPostMediaPreviewHeight({ width: 1080, height: 1920 }), 320);
});
```

- [ ] **Step 2: Verify the test is red**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: FAIL because the helper does not exist.

- [ ] **Step 3: Implement the feed renderer**

```tsx
const height = getPostMediaPreviewHeight(media);

return isVideoPostMedia(media) ? (
  <Video source={{ uri: media.mediaUrl }} style={{ width: "100%", height }}
    useNativeControls resizeMode={ResizeMode.COVER}
    onError={(error) => console.warn("[PostCard] video load failed", { postId: post.id, mediaId: media.id, error })} />
) : (
  <Image source={{ uri: media.mediaUrl }} style={{ width: "100%", height }} resizeMode="cover" />
);
```

Use a constant height for one item and half-height tiles for multi-media posts. Make the preview pressable and route to `/post/${post.id}`.

- [ ] **Step 4: Verify the tests are green**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: all media tests pass.

### Task 3: Render original proportions in post detail

**Files:**
- Modify: `app/post/[id].tsx`
- Modify: `utils/post-media.ts`
- Modify: `utils/__tests__/post-media.test.ts`

- [ ] **Step 1: Write a failing detail-height test**

```ts
import { getPostMediaDetailHeight } from "../post-media.ts";

test("uses original dimensions in post detail", () => {
  assert.equal(getPostMediaDetailHeight(328, { width: 1200, height: 800 }), 219);
  assert.equal(getPostMediaDetailHeight(328, { width: 800, height: 1200 }), 460);
});
```

- [ ] **Step 2: Verify the test is red**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: FAIL because the detail-height helper does not exist.

- [ ] **Step 3: Replace direct `Image` rendering with image/video detail rendering**

```tsx
const height = getPostMediaDetailHeight(mediaBaseWidth, media);

return isVideoPostMedia(media) ? (
  <Video source={{ uri: media.mediaUrl }} style={{ width: "100%", height }}
    useNativeControls resizeMode={ResizeMode.CONTAIN}
    onError={(error) => console.warn("[PostDetail] video load failed", { postId: post.id, mediaId: media.id, error })} />
) : (
  <Image source={{ uri: media.mediaUrl }} style={{ width: "100%", height }} resizeMode="contain" />
);
```

- [ ] **Step 4: Verify the test is green**

Run: `node --test utils/__tests__/post-media.test.ts`

Expected: all media tests pass.

### Task 4: Guard next-page loading without changing the 15-item limit

**Files:**
- Create: `utils/feed-pagination.ts`
- Create: `utils/__tests__/feed-pagination.test.ts`
- Modify: `app/(tabs)/home.tsx`

- [ ] **Step 1: Write a failing pagination-guard test**

```ts
import { canLoadNextFeedPage } from "../feed-pagination.ts";

test("only loads when another page exists and no request is pending", () => {
  assert.equal(canLoadNextFeedPage({ hasMore: true, loading: false }), true);
  assert.equal(canLoadNextFeedPage({ hasMore: false, loading: false }), false);
  assert.equal(canLoadNextFeedPage({ hasMore: true, loading: true }), false);
});
```

- [ ] **Step 2: Verify the test is red**

Run: `node --test utils/__tests__/feed-pagination.test.ts`

Expected: FAIL because `feed-pagination.ts` does not exist.

- [ ] **Step 3: Add the guard and a request ref in HomeScreen**

```ts
export function canLoadNextFeedPage({ hasMore, loading }: { hasMore?: boolean; loading: boolean }) {
  return Boolean(hasMore) && !loading;
}

const loadingNextPageRef = React.useRef(false);
```

Use the guard before requesting `pagination.page + 1`; reset the ref when the request settles. Keep `const EXPLORE_FEED_LIMIT = 15` unchanged.

- [ ] **Step 4: Verify focused tests are green**

Run: `node --test utils/__tests__/post-media.test.ts utils/__tests__/feed-pagination.test.ts`

Expected: all tests pass.

### Task 5: Final verification

**Files:**
- Verify: `services/post.service.ts`
- Verify: `components/post/PostCard.tsx`
- Verify: `app/post/[id].tsx`
- Verify: `app/(tabs)/home.tsx`

- [ ] **Step 1: Run focused regression tests**

Run: `node --test utils/__tests__/post-media.test.ts utils/__tests__/feed-pagination.test.ts`

Expected: all tests pass.

- [ ] **Step 2: Run the linter**

Run: `npm run lint`

Expected: exit code 0; report existing warnings separately.

- [ ] **Step 3: Check the final diff for whitespace errors**

Run: `git -c safe.directory=E:/HK8/KLTN/mingo-app diff --check`

Expected: no output and exit code 0.
