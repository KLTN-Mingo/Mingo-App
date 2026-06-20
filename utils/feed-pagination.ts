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

export function appendUniqueById<T extends { id: string }>(
  currentItems: T[],
  nextItems: T[]
): T[] {
  const existingIds = new Set(currentItems.map((item) => item.id));
  const uniqueNextItems = nextItems.filter((item) => {
    if (existingIds.has(item.id)) {
      return false;
    }

    existingIds.add(item.id);
    return true;
  });

  return [...currentItems, ...uniqueNextItems];
}
