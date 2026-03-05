// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
  }
  
  // ─── API Response ──────────────────────────────────────────────────────────────
  
  export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
  }
  
  export interface ApiError {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, string[]>;
  }