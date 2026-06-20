export function canLoadNextFeedPage({
  hasMore,
  loading,
}: {
  hasMore?: boolean;
  loading: boolean;
}): boolean {
  return Boolean(hasMore) && !loading;
}

export function getHasMoreFeedPages({
  page,
  totalPages,
  hasMore,
  hasTotalPages = true,
  receivedItemCount,
  pageLimit,
}: {
  page: number;
  totalPages: number;
  hasMore?: unknown;
  hasTotalPages?: boolean;
  receivedItemCount?: number;
  pageLimit?: number;
}): boolean {
  if (typeof hasMore === "boolean") {
    return hasMore;
  }

  if (hasTotalPages) {
    return page < totalPages;
  }

  return Boolean(
    pageLimit && receivedItemCount != null && receivedItemCount >= pageLimit
  );
}

export function isAtFeedEnd({
  contentOffsetY,
  viewportHeight,
  contentHeight,
}: {
  contentOffsetY: number;
  viewportHeight: number;
  contentHeight: number;
}): boolean {
  const endThreshold = 160;
  return contentOffsetY + viewportHeight >= contentHeight - endThreshold;
}
