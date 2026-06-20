import assert from "node:assert/strict";
import test from "node:test";

import {
  canLoadNextFeedPage,
  getHasMoreFeedPages,
  isAtFeedEnd,
} from "../feed-pagination.ts";

test("only loads another feed page when one exists and no request is pending", () => {
  assert.equal(canLoadNextFeedPage({ hasMore: true, loading: false }), true);
  assert.equal(canLoadNextFeedPage({ hasMore: false, loading: false }), false);
  assert.equal(canLoadNextFeedPage({ hasMore: true, loading: true }), false);
});

test("uses total pages when the feed response does not include hasMore", () => {
  assert.equal(
    getHasMoreFeedPages({ page: 1, totalPages: 2 }),
    true
  );
  assert.equal(
    getHasMoreFeedPages({ page: 2, totalPages: 2 }),
    false
  );
});

test("uses a full page of posts when the API omits all pagination metadata", () => {
  assert.equal(
    getHasMoreFeedPages({
      page: 1,
      totalPages: 1,
      hasTotalPages: false,
      receivedItemCount: 15,
      pageLimit: 15,
    }),
    true
  );
  assert.equal(
    getHasMoreFeedPages({
      page: 2,
      totalPages: 1,
      hasTotalPages: false,
      receivedItemCount: 4,
      pageLimit: 15,
    }),
    false
  );
});

test("recognizes the actual end of the feed scroll", () => {
  assert.equal(
    isAtFeedEnd({ contentOffsetY: 750, viewportHeight: 600, contentHeight: 1500 }),
    true
  );
  assert.equal(
    isAtFeedEnd({ contentOffsetY: 700, viewportHeight: 600, contentHeight: 1500 }),
    false
  );
});
